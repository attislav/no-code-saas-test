"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSpinner } from "@/common/loading-spinner"
import { BookOpen, ArrowLeft, CheckCircle, Copy, Download, ArrowRight } from "lucide-react"
import { supabase, Story } from "@/lib/supabase"
import Link from "next/link"

interface TypeFilterPageProps {
  params: {
    type: string
  }
}

export default function TypeFilterPage({ params }: TypeFilterPageProps) {
  const [stories, setStories] = useState<Story[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Decode URL parameter
  const decodedType = decodeURIComponent(params.type)

  useEffect(() => {
    loadStories()
  }, [params.type])

  const loadStories = async () => {
    try {
      console.log('Loading stories for type:', decodedType)
      const { data: storiesData, error } = await supabase
        .from('stories')
        .select('*')
        .eq('status', 'completed')
        .eq('story_type', decodedType)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Supabase error loading stories:', error)
        setError(`Fehler beim Laden der Geschichten: ${error.message}`)
        return
      }
      
      console.log('Loaded stories:', storiesData)
      setStories(storiesData || [])
    } catch (err) {
      console.error('Error loading stories:', err)
      setError(`Fehler beim Laden der Geschichten: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (story: string) => {
    try {
      await navigator.clipboard.writeText(story)
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

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="mx-auto max-w-6xl">
          <Card>
            <CardContent className="text-center py-8">
              <LoadingSpinner className="w-6 h-6 mx-auto mb-2" />
              <p className="text-muted-foreground">Geschichten werden geladen...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-6xl">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/stories">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück zu allen Geschichten
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {decodedType}-Geschichten
          </h1>
          <p className="mt-2 text-muted-foreground">
            Alle Geschichten der Kategorie {decodedType}
          </p>
        </div>

        {error && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stories Grid */}
        {stories.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Noch keine {decodedType}-Geschichten vorhanden.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {stories.map((story) => (
              <Card key={story.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <Link href={`/story/${story.id}`} className="block">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2 hover:text-primary transition-colors">
                          {story.title || `${story.character} - ${story.story_type}`}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            Fertig
                          </span>
                          <span>{new Date(story.created_at).toLocaleDateString()}</span>
                          <span>ca. {Math.ceil((story.story?.length || 0) / 1000)} Min. Lesezeit</span>
                        </div>
                        {story.extra_wishes && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Extrawünsche: {story.extra_wishes}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2" onClick={(e) => e.preventDefault()}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.preventDefault()
                            copyToClipboard(story.story || '')
                          }}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Kopieren
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.preventDefault()
                            downloadStory(story)
                          }}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      <div className="text-sm leading-relaxed text-muted-foreground mb-4">
                        {story.story ? 
                          story.story.substring(0, 200) + (story.story.length > 200 ? '...' : '') 
                          : 'Keine Vorschau verfügbar'
                        }
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          <Link 
                            href={`/alter/${encodeURIComponent(story.age_group)}`}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {story.age_group}
                          </Link>
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            {story.story_type}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-primary hover:text-primary/80 transition-colors">
                          Geschichte lesen
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}