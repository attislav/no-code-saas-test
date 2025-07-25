"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSpinner } from "@/common/loading-spinner"
import { ArrowLeft, BookOpen, Calendar, User } from "lucide-react"
import { supabase, Story, UserProfile } from "@/lib/supabase"
import { generateCategorySlug } from "@/lib/slug"
import { getDisplayName, getAvatarUrl, getBio, isActiveUser } from "@/lib/user-utils"
import Link from "next/link"

interface ProfilePageProps {
  params: Promise<{
    username: string
  }>
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stories, setStories] = useState<Story[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params
      const decodedUsername = decodeURIComponent(resolvedParams.username)
      loadProfile(decodedUsername)
    }
    loadParams()
  }, [params])

  const loadProfile = async (username: string) => {
    try {
      console.log('Loading profile for username:', username)
      
      // Load user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('username', username)
        .single()
      
      if (profileError) {
        console.error('Error loading profile:', profileError)
        setError('Benutzerprofil nicht gefunden')
        return
      }

      if (!profileData || !isActiveUser(profileData)) {
        setError('Benutzerprofil nicht verfügbar')
        return
      }
      
      setProfile(profileData)
      
      // Load user's stories
      const { data: storiesData, error: storiesError } = await supabase
        .from('stories')
        .select(`
          *,
          author:user_profiles!author_id(*)
        `)
        .eq('author_id', profileData.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
      
      if (storiesError) {
        console.error('Error loading stories:', storiesError)
        setError('Fehler beim Laden der Geschichten')
        return
      }
      
      setStories(storiesData || [])
      
    } catch (err) {
      console.error('Error in loadProfile:', err)
      setError('Ein unerwarteter Fehler ist aufgetreten')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="mx-auto max-w-4xl">
          <Card>
            <CardContent className="text-center py-8">
              <LoadingSpinner className="w-6 h-6 mx-auto mb-2" />
              <p className="text-muted-foreground">Profil wird geladen...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="container py-8">
        <div className="mx-auto max-w-4xl">
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-red-600">{error || 'Profil nicht gefunden'}</p>
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

        {/* Profile Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {getAvatarUrl(profile) ? (
                  <img 
                    src={getAvatarUrl(profile)!} 
                    alt={getDisplayName(profile)}
                    className="w-24 h-24 rounded-full object-cover shadow-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center shadow-lg">
                    <User className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              
              {/* Profile Info */}
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">
                  {getDisplayName(profile)}
                </CardTitle>
                <p className="text-muted-foreground mb-3">
                  @{profile.username}
                </p>
                {getBio(profile) && (
                  <p className="text-muted-foreground mb-4">
                    {getBio(profile)}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Mitglied seit {new Date(profile.created_at).toLocaleDateString('de-DE')}
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {stories.length} {stories.length === 1 ? 'Geschichte' : 'Geschichten'}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stories Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">
            Geschichten von {getDisplayName(profile)}
          </h2>
          
          {stories.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {getDisplayName(profile)} hat noch keine Geschichten veröffentlicht.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
              {stories.map((story) => {
                const categorySlug = generateCategorySlug(story.story_type)
                const storyUrl = story.slug 
                  ? `/${categorySlug}/${story.slug}` 
                  : `/story/${story.id}`
                
                return (
                  <Card key={story.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                    <Link href={storyUrl} className="block">
                      <CardHeader className="pb-4">
                        <div className="flex items-start gap-4">
                          {/* Story Thumbnail */}
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
                              <span>{new Date(story.created_at).toLocaleDateString('de-DE')}</span>
                              <span>ca. {Math.ceil((story.story?.length || 0) / 1000)} Min. Lesezeit</span>
                            </div>
                            {/* Story Preview */}
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
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                              {story.age_group}
                            </span>
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              {story.story_type}
                            </span>
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
    </div>
  )
}