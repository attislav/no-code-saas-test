"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSpinner } from "@/common/loading-spinner"
import { ArrowLeft, Copy, Download, Clock, Calendar } from "lucide-react"
import { supabase, Story } from "@/lib/supabase"
import { generateCategorySlug } from "@/lib/slug"
import Link from "next/link"

interface StoryPageProps {
  params: Promise<{
    category: string
    slug: string
  }>
}

export default function StoryPage({ params }: StoryPageProps) {
  const [story, setStory] = useState<Story | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [, setDecodedCategory] = useState<string>('')
  const [, setDecodedSlug] = useState<string>('')

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params
      const category = decodeURIComponent(resolvedParams.category)
      const slug = decodeURIComponent(resolvedParams.slug)
      setDecodedCategory(category)
      setDecodedSlug(slug)
      loadStory(category, slug)
    }
    loadParams()
  }, [params])

  const loadStory = async (category: string, slug: string) => {
    try {
      console.log('Loading story:', { category, slug })
      
      // First try to find by slug
      const { data: storyData, error } = await supabase
        .from('stories')
        .select('*')
        .eq('slug', slug)
        .single()
      
      let finalStoryData = storyData
      
      // If not found by slug, try to find by category and fallback to ID-based lookup
      if (!finalStoryData && slug.includes('-')) {
        const potentialId = slug.split('-').pop()
        if (potentialId && potentialId.length > 10) {
          const { data: fallbackStory } = await supabase
            .from('stories')
            .select('*')
            .eq('id', potentialId)
            .single()
          
          if (fallbackStory) {
            finalStoryData = fallbackStory
          }
        }
      }
      
      if (error && error.code !== 'PGRST116') {
        console.error('Supabase error loading story:', error)
        setError(`Fehler beim Laden der Geschichte: ${error.message}`)
        return
      }
      
      if (!finalStoryData) {
        setError('Geschichte nicht gefunden')
        return
      }
      
      // Verify category matches story type
      const expectedCategory = generateCategorySlug(finalStoryData.story_type)
      if (expectedCategory !== category.toLowerCase()) {
        console.warn('Category mismatch:', { expected: expectedCategory, actual: category })
      }
      
      console.log('Loaded story:', finalStoryData)
      setStory(finalStoryData)
    } catch (err) {
      console.error('Error loading story:', err)
      setError(`Fehler beim Laden der Geschichte: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // Could add toast notification here
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const downloadStory = (story: Story) => {
    const element = document.createElement('a')
    const file = new Blob([story.story || ''], {type: 'text/plain'})
    element.href = URL.createObjectURL(file)
    element.download = `${story.character}_${story.story_type}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  // Function to format story text with chapter headings
  const formatStoryText = (text: string) => {
    if (!text) return null
    
    // Split by common chapter patterns
    const parts = text.split(/(\n\n|\n)(?=Kapitel \d+|Chapter \d+|Teil \d+|\d+\. Kapitel|\d+\. Teil|### |## |# )/g)
    
    return parts.map((part, index) => {
      // Check if this part looks like a chapter heading
      const isChapterHeading = /^(Kapitel \d+|Chapter \d+|Teil \d+|\d+\. Kapitel|\d+\. Teil|###? |#+ )/.test(part.trim())
      
      if (isChapterHeading) {
        return (
          <h3 key={index} className="text-xl font-bold text-primary mt-8 mb-4 first:mt-0">
            {part.trim().replace(/^#+\s*/, '')}
          </h3>
        )
      } else if (part.trim()) {
        return (
          <p key={index} className="whitespace-pre-wrap text-base leading-relaxed mb-4">
            {part.trim()}
          </p>
        )
      }
      return null
    }).filter(Boolean)
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="mx-auto max-w-4xl">
          <Card>
            <CardContent className="text-center py-8">
              <LoadingSpinner className="w-6 h-6 mx-auto mb-2" />
              <p className="text-muted-foreground">Geschichte wird geladen...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error || !story) {
    return (
      <div className="container py-8">
        <div className="mx-auto max-w-4xl">
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-red-600">{error || 'Geschichte nicht gefunden'}</p>
              <Link href="/stories" className="mt-4 inline-block">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Zurück zu allen Geschichten
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-4xl">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/stories">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück zu allen Geschichten
            </Button>
          </Link>
        </div>

        {/* Story Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-4">
                  {story.title || `${story.character} - ${story.story_type}`}
                </CardTitle>
                
                {/* Title Image */}
                {story.image_url && (
                  <div className="mb-6">
                    <img 
                      src={story.image_url} 
                      alt={story.title || 'Titelbild der Geschichte'}
                      className="w-full max-w-md rounded-lg shadow-md mx-auto"
                      onError={(e) => {
                        console.error('Failed to load image:', story.image_url)
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                )}
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(story.created_at).toLocaleString('de-DE')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    ca. {Math.ceil((story.story?.length || 0) / 1000)} Min. Lesezeit
                  </div>
                </div>
                <div className="flex gap-2 mb-4">
                  <Link 
                    href={`/alter/${encodeURIComponent(story.age_group)}`}
                    className="inline-flex items-center px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
                  >
                    {story.age_group}
                  </Link>
                  <Link 
                    href={`/kategorie/${encodeURIComponent(story.story_type)}`}
                    className="inline-flex items-center px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition-colors"
                  >
                    {story.story_type}
                  </Link>
                </div>
                {story.extra_wishes && (
                  <p className="text-sm text-muted-foreground">
                    <strong>Extrawünsche:</strong> {story.extra_wishes}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(story.story || '')}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Kopieren
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadStory(story)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-lg max-w-none">
              <div className="story-content">
                {formatStoryText(story.story || '')}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}