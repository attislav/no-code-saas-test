"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/common/loading-spinner"
import { BookOpen, Sparkles, Clock, CheckCircle, Dice6 } from "lucide-react"
import { supabase, Story } from "@/lib/supabase"
import { Typewriter } from "@/components/typewriter"
import { generateCategorySlug } from "@/lib/slug"
import { useRouter } from "next/navigation"
import HeroCarousel from "@/components/hero-carousel"


const storyTypes = [
  "Abenteuer",
  "Märchen", 
  "Lerngeschichte",
  "Gute-Nacht-Geschichte",
  "Freundschaftsgeschichte",
  "Tiergeschichte"
]

const ageGroups = [
  "3-4 Jahre",
  "4-6 Jahre", 
  "6-8 Jahre",
  "8-10 Jahre",
  "10-12 Jahre"
]

export default function StoryGeneratorPage() {
  const [character, setCharacter] = useState("")
  const [ageGroup, setAgeGroup] = useState("")
  const [extraWishes, setExtraWishes] = useState("")
  const [storyType, setStoryType] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generations, setGenerations] = useState<Story[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGeneratingRandom, setIsGeneratingRandom] = useState(false)
  const router = useRouter()
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

  // Don't load any old stories on mount - only show newly generated ones
  useEffect(() => {
    setIsLoading(false)
  }, [])

  const loadStories = async () => {
    // Only load stories that were generated in this session
    // This function is called after generating a new story
    try {
      console.log('Loading current session story from Supabase...')
      // Only load the most recent story that's currently being generated or just completed
      const { data: stories, error } = await supabase
        .from('stories')
        .select('*')
        .in('status', ['generating', 'partial'])
        .order('created_at', { ascending: false })
        .limit(1)
      
      if (error) {
        console.error('Supabase error loading stories:', error)
        setError(`Fehler beim Laden der Geschichten: ${error.message}`)
        return
      }
      
      console.log('Loaded current session story:', stories)
      setGenerations(stories || [])
    } catch (err) {
      console.error('Error loading stories:', err)
      setError(`Fehler beim Laden der Geschichten: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const handleGenerate = async () => {
    if (!character.trim() || !ageGroup || !storyType) {
      setError("Bitte füllen Sie alle Pflichtfelder aus")
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch(`${baseUrl}/api/generate-story`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          character: character.trim(),
          ageGroup,
          extraWishes: extraWishes.trim(),
          storyType,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(`Fehler bei der Geschichte-Generierung: ${errorData.error || response.statusText}`)
      }

      const result = await response.json()
      
      // Reload stories from Supabase to get the new one
      await loadStories()
      
      // Start polling for story completion
      pollStoryStatus(result.id)
      
      // Reset form
      setCharacter("")
      setAgeGroup("")
      setExtraWishes("")
      setStoryType("")
      
    } catch (err) {
      console.error('Story generation error:', err)
      setError(err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten')
    } finally {
      setIsGenerating(false)
    }
  }

  const pollStoryStatus = async (storyId: string) => {
    const maxAttempts = 60 // 30 minutes with 30-second intervals
    let attempts = 0

    const poll = async () => {
      try {
        console.log(`Polling attempt ${attempts + 1}/${maxAttempts} for story ${storyId}`)
        
        const response = await fetch(`${baseUrl}/api/webhook?id=${storyId}`)
        
        if (!response.ok) {
          console.error(`Polling failed with status ${response.status}:`, response.statusText)
          return
        }

        const status = await response.json()
        console.log(`Story ${storyId} status:`, status)
        
        // Update stories on any status change
        await loadStories()

        if (status.status === 'completed') {
          console.log(`Story ${storyId} completed successfully`)
          
          // Get the completed story from database to get slug
          const { data: completedStory } = await supabase
            .from('stories')
            .select('*')
            .eq('id', storyId)
            .single()
          
          if (completedStory && completedStory.slug) {
            // Navigate to the completed story
            const categorySlug = generateCategorySlug(completedStory.story_type)
            router.push(`/${categorySlug}/${completedStory.slug}`)
          } else {
            // Fallback to story ID if no slug
            router.push(`/story/${storyId}`)
          }
          return // Stop polling
        }
        
        if (status.status === 'failed') {
          console.log(`Story ${storyId} failed`)
          setError('Die Geschichte konnte nicht erstellt werden. Versuchen Sie es erneut.')
          return // Stop polling
        }

        attempts++
        if (attempts < maxAttempts) {
          console.log(`Scheduling next poll in 30 seconds for story ${storyId}`)
          setTimeout(poll, 30000) // Poll every 30 seconds
        } else {
          console.log(`Max polling attempts reached for story ${storyId}`)
        }
      } catch (err) {
        console.error(`Polling error for story ${storyId}:`, err)
      }
    }

    // Start polling immediately
    console.log(`Starting polling for story ${storyId}`)
    setTimeout(poll, 10000) // Wait 10 seconds before first poll
  }

  const handleRandomStory = async () => {
    setIsGeneratingRandom(true)
    setError(null)

    try {
      console.log('Fetching random story data...')
      const response = await fetch('/api/random-story-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Fehler bei der Zufallsdaten-Generierung: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        // Fill form with random data
        setCharacter(result.data.character)
        setAgeGroup(result.data.ageGroup)
        setStoryType(result.data.storyType)
        setExtraWishes(result.data.extraWishes)
        
        console.log('Random story data filled:', result.data)
      } else {
        throw new Error('Keine Zufallsdaten erhalten')
      }
      
    } catch (err) {
      console.error('Random story error:', err)
      setError(err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten')
    } finally {
      setIsGeneratingRandom(false)
    }
  }

  const getStatusBadge = (status: Story['status']) => {
    switch (status) {
      case 'generating':
        return <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
          <LoadingSpinner className="w-3 h-3 mr-1" />
          Wird erstellt...
        </span>
      case 'partial':
        return <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
          <LoadingSpinner className="w-3 h-3 mr-1" />
          Erstes Kapitel
        </span>
      case 'completed':
        return <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
          <CheckCircle className="w-3 h-3 mr-1" />
          Fertig
        </span>
      case 'failed':
        return <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
          Fehlgeschlagen
        </span>
    }
  }

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-4xl">
        {/* Hero Carousel - simple version for generator */}
        <HeroCarousel 
          showText={false} 
          showNavigation={false}
          showTitle={false}
          aspectRatio="16:9"
          height="sm"
          clickable={false}
        />
        
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Geschichte erstellen
          </h2>
          <p className="mt-2 text-muted-foreground">
            Erstellen Sie personalisierte Kindergeschichten mit KI
          </p>
        </div>

        {/* Generation Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              Neue Geschichte erstellen
            </CardTitle>
            <CardDescription>
              Beschreiben Sie Ihre Wunschgeschichte und lassen Sie sie von KI erstellen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="character" className="text-lg font-bold text-foreground mb-3 block">Hauptcharakter *</Label>
                <Input
                  id="character"
                  placeholder="z.B. Ein mutiger kleiner Drache"
                  value={character}
                  onChange={(e) => setCharacter(e.target.value)}
                  disabled={isGenerating}
                />
              </div>
              <div>
                <Label htmlFor="ageGroup" className="text-lg font-bold text-foreground mb-3 block">Alter Zielgruppe *</Label>
                <select
                  id="ageGroup"
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                  disabled={isGenerating}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Wählen Sie das Alter...</option>
                  {ageGroups.map(age => (
                    <option key={age} value={age}>{age}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="storyType" className="text-lg font-bold text-foreground mb-3 block">Art der Geschichte *</Label>
                <select
                  id="storyType"
                  value={storyType}
                  onChange={(e) => setStoryType(e.target.value)}
                  disabled={isGenerating}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Wählen Sie die Art...</option>
                  {storyTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="extraWishes" className="text-lg font-bold text-foreground mb-3 block">Extrawünsche</Label>
                <Input
                  id="extraWishes"
                  placeholder="z.B. Soll eine Lehre enthalten"
                  value={extraWishes}
                  onChange={(e) => setExtraWishes(e.target.value)}
                  disabled={isGenerating}
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button 
                onClick={handleGenerate}
                disabled={isGenerating || isGeneratingRandom}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
              >
                {isGenerating ? (
                  <>
                    <LoadingSpinner className="w-4 h-4 mr-2" />
                    Geschichte wird erstellt...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Geschichte erstellen
                  </>
                )}
              </Button>
              
              <Button 
                onClick={handleRandomStory}
                disabled={isGenerating || isGeneratingRandom}
                className="px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold border-0"
              >
                {isGeneratingRandom ? (
                  <>
                    <LoadingSpinner className="w-4 h-4 mr-2" />
                    Zufallsgeschichte...
                  </>
                ) : (
                  <>
                    <Dice6 className="w-4 h-4 mr-2" />
                    Zufallsgeschichte
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Generations List */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Ihre Geschichten</h2>
          {isLoading ? (
            <Card>
              <CardContent className="text-center py-8">
                <LoadingSpinner className="w-6 h-6 mx-auto mb-2" />
                <p className="text-muted-foreground">Geschichten werden geladen...</p>
              </CardContent>
            </Card>
          ) : generations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  Noch keine Geschichten erstellt. Erstellen Sie Ihre erste Geschichte oben!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {generations.map((generation) => (
                <Card key={generation.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusBadge(generation.status)}
                          <span className="text-sm text-muted-foreground">
                            {new Date(generation.created_at).toLocaleString()}
                          </span>
                        </div>
                        <h3 className="font-semibold mb-2">
                          {generation.title || `${generation.character} - ${generation.story_type}`}
                        </h3>
                        
                        {/* Title Image Display */}
                        {generation.image_url && (
                          <div className="mb-4">
                            <img 
                              src={generation.image_url} 
                              alt={generation.title || 'Titelbild der Geschichte'}
                              className="w-full max-w-md rounded-lg shadow-md"
                              onError={(e) => {
                                console.error('Failed to load image:', generation.image_url)
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          </div>
                        )}
                        {generation.image_status === 'generating' && (
                          <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <div className="flex items-center">
                              <LoadingSpinner className="w-4 h-4 mr-2" />
                              <span className="text-sm text-yellow-700">Titelbild wird erstellt...</span>
                            </div>
                          </div>
                        )}
                        {generation.image_status === 'failed' && (
                          <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                            <span className="text-sm text-red-700">Titelbild konnte nicht erstellt werden</span>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">Zielgruppe:</span> {generation.age_group}
                          </div>
                          {generation.extra_wishes && (
                            <div>
                              <span className="font-medium">Extrawünsche:</span> {generation.extra_wishes}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Partial Story Display */}
                    {generation.status === 'partial' && generation.partial_story && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-blue-800">Erstes Kapitel:</h4>
                          <span className="text-xs text-blue-600">Der Rest wird noch erstellt...</span>
                        </div>
                        <div className="prose prose-sm max-w-none">
                          <Typewriter 
                            text={generation.partial_story}
                            speed={25}
                            className="text-sm leading-relaxed text-blue-900"
                          />
                        </div>
                      </div>
                    )}

                    {/* Complete Story Display */}
                    {generation.status === 'completed' && generation.story && (
                      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">Die komplette Geschichte:</h4>
                        </div>
                        <div className="prose prose-sm max-w-none">
                          <div className="text-sm leading-relaxed whitespace-pre-wrap">
                            {generation.story}
                          </div>
                        </div>
                      </div>
                    )}

                    {generation.status === 'generating' && (
                      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="w-4 h-4 mr-2" />
                          Ihre Geschichte wird erstellt... Dies kann einige Minuten dauern.
                        </div>
                      </div>
                    )}

                    {generation.status === 'failed' && (
                      <div className="mt-4 p-4 bg-red-50 rounded-lg">
                        <p className="text-sm text-red-600">
                          Die Geschichten-Erstellung ist fehlgeschlagen. Bitte versuchen Sie es erneut.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}