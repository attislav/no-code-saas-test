"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSpinner } from "@/common/loading-spinner"
import { ArrowLeft, Clock, Calendar, BookOpen } from "lucide-react"
import { supabase, Story } from "@/lib/supabase"
import { generateCategorySlug } from "@/lib/slug"
import Link from "next/link"

interface StoryContentProps {
  params: Promise<{
    category: string
    slug: string
  }>
}

export default function StoryContent({ params }: StoryContentProps) {
  const [story, setStory] = useState<Story | null>(null)
  const [relatedStories, setRelatedStories] = useState<Story[]>([])
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
      
      // If not found by slug, try to find by category and construct expected slug
      if (!storyData) {
        console.log('Story not found by slug, trying to find by category...')
        const { data: storiesByCategory, error: categoryError } = await supabase
          .from('stories')
          .select('*')
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
        
        if (!categoryError && storiesByCategory) {
          // Try to find a story that would match this slug pattern
          finalStoryData = storiesByCategory.find(s => {
            const expectedSlug = generateCategorySlug(s.story_type)
            return expectedSlug === category
          }) || null
        }
      }
      
      if (error && error.code !== 'PGRST116') {
        console.error('Supabase error loading story:', error)
        setError(`Fehler beim Laden der Geschichte: ${error.message}`)
        return
      }
      
      if (!finalStoryData) {
        console.log('No story found')
        setError('Geschichte nicht gefunden')
        return
      }
      
      console.log('Story loaded successfully:', finalStoryData.title)
      setStory(finalStoryData)
      setError(null)
      
      // Load related stories
      loadRelatedStories(finalStoryData)
      
    } catch (err) {
      console.error('Error in loadStory:', err)
      setError('Ein unerwarteter Fehler ist aufgetreten')
    } finally {
      setIsLoading(false)
    }
  }

  const loadRelatedStories = async (currentStory: Story) => {
    try {
      console.log('Loading related stories for:', currentStory.title)
      
      // Get stories of same age group or same story type, excluding current story
      const { data: stories, error } = await supabase
        .from('stories')
        .select('*')
        .eq('status', 'completed')
        .neq('id', currentStory.id)
        .or(`age_group.eq.${currentStory.age_group},story_type.eq.${currentStory.story_type}`)
        .order('created_at', { ascending: false })
        .limit(20) // Get more to have options for randomization
      
      if (error) {
        console.error('Error loading related stories:', error)
        return
      }
      
      if (stories && stories.length > 0) {
        // Randomize and limit to 6 stories
        const shuffled = stories.sort(() => 0.5 - Math.random())
        const selectedStories = shuffled.slice(0, 6)
        setRelatedStories(selectedStories)
        console.log('Loaded related stories:', selectedStories.length)
      }
      
    } catch (err) {
      console.error('Error loading related stories:', err)
    }
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

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
  // Generate structured data for SEO
  const structuredData = story ? {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": story.title || `${story.character} - ${story.story_type}`,
    "description": story.story 
      ? story.story.replace(/<[^>]*>/g, '').substring(0, 200) + '...'
      : `Eine ${story.story_type} für ${story.age_group} über ${story.character}`,
    "image": story.image_url || `${baseUrl}/og-default.jpg`,
    "author": {
      "@type": "Organization",
      "name": "StoryMagic KI"
    },
    "publisher": {
      "@type": "Organization",
      "name": "StoryMagic",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logo.png`
      }
    },
    "datePublished": story.created_at,
    "dateModified": story.updated_at,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${baseUrl}/${generateCategorySlug(story.story_type)}/${story.slug}`
    },
    "genre": story.story_type,
    "audience": {
      "@type": "PeopleAudience",
      "suggestedMinAge": story.age_group.split('-')[0],
      "suggestedMaxAge": story.age_group.split('-')[1]?.replace(' Jahre', '') || story.age_group.split('-')[0]
    },
    "keywords": [story.story_type, story.age_group, story.character, "Kindergeschichte", "KI-generiert"].join(', ')
  } : null

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
      )}
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
              <div className="text-center">
                <CardTitle className="text-3xl mb-6">
                  {story.title || `${story.character} - ${story.story_type}`}
                </CardTitle>
                
                {/* Title Image - Full Width */}
                {story.image_url && (
                  <div className="mb-6">
                    <img 
                      src={story.image_url} 
                      alt={story.title || 'Titelbild der Geschichte'}
                      className="w-full rounded-lg shadow-lg mx-auto"
                      onError={(e) => {
                        console.error('Failed to load image:', story.image_url)
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                )}
                
                <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(story.created_at).toLocaleString('de-DE')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    ca. {Math.ceil((story.story?.length || 0) / 1000)} Min. Lesezeit
                  </div>
                </div>
                
                <div className="flex justify-center gap-2 mb-4">
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
                
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-w-none">
                <div 
                  className="story-content"
                  dangerouslySetInnerHTML={{ __html: story.story || '' }}
                  style={{
                    lineHeight: '1.8',
                    fontSize: '1.1rem'
                  }}
                />
                <style dangerouslySetInnerHTML={{
                  __html: `
                    .story-content h2 {
                      font-size: 1.75rem !important;
                      font-weight: bold !important;
                      color: var(--foreground) !important;
                      margin-top: 2rem !important;
                      margin-bottom: 1rem !important;
                      padding-bottom: 0.5rem !important;
                      border-bottom: 2px solid var(--border) !important;
                    }
                    .story-content p {
                      margin-bottom: 1.5rem !important;
                      line-height: 1.8 !important;
                    }
                    .story-content p:last-child {
                      margin-bottom: 0 !important;
                    }
                  `
                }} />
              </div>
            </CardContent>
          </Card>

          {/* Related Stories Section */}
          {relatedStories.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6 text-center">Entdecke weitere Geschichten</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {relatedStories.map((relatedStory) => {
                  const categorySlug = generateCategorySlug(relatedStory.story_type)
                  const storyUrl = relatedStory.slug 
                    ? `/${categorySlug}/${relatedStory.slug}` 
                    : `/story/${relatedStory.id}`
                  
                  return (
                    <Card key={relatedStory.id} className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                      <Link href={storyUrl}>
                        <div className="aspect-[4/3] relative cursor-pointer">
                          {relatedStory.image_url ? (
                            <img 
                              src={relatedStory.image_url} 
                              alt={relatedStory.title || 'Titelbild'}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                              <BookOpen className="w-12 h-12 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </Link>
                      <CardContent className="p-4">
                        <Link href={storyUrl}>
                          <h3 className="font-semibold text-sm leading-tight hover:text-primary transition-colors line-clamp-2 cursor-pointer">
                            {relatedStory.title || `${relatedStory.character} - ${relatedStory.story_type}`}
                          </h3>
                        </Link>
                        <div className="flex gap-1 mt-2">
                          <Link 
                            href={`/alter/${encodeURIComponent(relatedStory.age_group)}`}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
                          >
                            {relatedStory.age_group}
                          </Link>
                          <Link 
                            href={`/kategorie/${encodeURIComponent(relatedStory.story_type)}`}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition-colors"
                          >
                            {relatedStory.story_type}
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}