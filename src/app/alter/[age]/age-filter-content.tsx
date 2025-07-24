"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSpinner } from "@/common/loading-spinner"
import { BookOpen, ArrowLeft, CheckCircle, ArrowRight } from "lucide-react"
import { supabase, Story } from "@/lib/supabase"
import { generateCategorySlug } from "@/lib/slug"
import Link from "next/link"

interface AgeFilterContentProps {
  params: Promise<{
    age: string
  }>
}

export default function AgeFilterContent({ params }: AgeFilterContentProps) {
  const [stories, setStories] = useState<Story[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [decodedAge, setDecodedAge] = useState<string>('')

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params
      const age = decodeURIComponent(resolvedParams.age)
      setDecodedAge(age)
      loadStories(age)
    }
    loadParams()
  }, [params])

  const loadStories = async (ageGroup: string) => {
    try {
      console.log('Loading stories for age group:', ageGroup)
      const { data: storiesData, error } = await supabase
        .from('stories')
        .select('*')
        .eq('status', 'completed')
        .eq('age_group', ageGroup)
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
            Geschichten für {decodedAge || 'Altersgruppe'}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Alle Geschichten für die Altersgruppe {decodedAge || 'diese Altersgruppe'}
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
                Noch keine Geschichten für die Altersgruppe {decodedAge || 'diese Altersgruppe'} vorhanden.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
            {stories.map((story) => {
              const categorySlug = generateCategorySlug(story.story_type)
              const storyUrl = story.slug 
                ? `/${categorySlug}/${story.slug}` 
                : `/story/${story.id}` // Fallback for stories without slug
              
              return (
                <Card key={story.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <Link href={storyUrl} className="block">
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      {/* Titelbild Thumbnail */}
                      <div className="flex-shrink-0">
                        {story.image_url ? (
                          <img 
                            src={story.image_url} 
                            alt={story.title || 'Titelbild'}
                            className="w-24 h-24 object-cover rounded-lg shadow-sm"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      
                      {/* Story Info */}
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg mb-2 hover:text-primary transition-colors leading-tight">
                          {story.title || `${story.character} - ${story.story_type}`}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            Fertig
                          </span>
                          <span>{new Date(story.created_at).toLocaleString('de-DE')}</span>
                          <span>ca. {Math.ceil((story.story?.length || 0) / 1000)} Min. Lesezeit</span>
                        </div>
                        {/* Story Preview Text */}
                        {story.story && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {story.story.replace(/<[^>]*>/g, '').substring(0, 150)}...
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex gap-2">
                        <Link 
                          href={`/alter/${encodeURIComponent(story.age_group)}`}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {story.age_group}
                        </Link>
                        <Link 
                          href={`/kategorie/${encodeURIComponent(story.story_type)}`}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {story.story_type}
                        </Link>
                      </div>
                      <div className="flex items-center text-sm text-primary hover:text-primary/80 transition-colors">
                        Geschichte lesen
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}