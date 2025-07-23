"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/common/loading-spinner"
import { BookOpen, Sparkles, Clock, CheckCircle } from "lucide-react"

interface StoryGeneration {
  id: string
  character: string
  ageGroup: string
  extraWishes: string
  storyType: string
  status: 'generating' | 'completed' | 'failed'
  story?: string
  createdAt: Date
}

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
  const [generations, setGenerations] = useState<StoryGeneration[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!character.trim() || !ageGroup || !storyType) {
      setError("Bitte füllen Sie alle Pflichtfelder aus")
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/generate-story', {
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
      
      // Add new generation to list
      const newGeneration: StoryGeneration = {
        id: result.id,
        character: character.trim(),
        ageGroup,
        extraWishes: extraWishes.trim(),
        storyType,
        status: 'generating',
        createdAt: new Date()
      }
      
      setGenerations(prev => [newGeneration, ...prev])
      
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
        
        const response = await fetch(`/api/story-complete?id=${storyId}`)
        
        if (!response.ok) {
          console.error(`Polling failed with status ${response.status}:`, response.statusText)
          return
        }

        const status = await response.json()
        console.log(`Story ${storyId} status:`, status)
        
        setGenerations(prev => 
          prev.map(gen => 
            gen.id === storyId 
              ? { ...gen, status: status.status, story: status.story }
              : gen
          )
        )

        if (status.status === 'completed' || status.status === 'failed') {
          console.log(`Story ${storyId} finished with status: ${status.status}`)
          return // Stop polling
        }

        attempts++
        if (attempts < maxAttempts) {
          console.log(`Scheduling next poll in 30 seconds for story ${storyId}`)
          setTimeout(poll, 30000) // Poll every 30 seconds
        } else {
          console.log(`Max polling attempts reached for story ${storyId}`)
          // Mark as failed if we can't get status
          setGenerations(prev => 
            prev.map(gen => 
              gen.id === storyId 
                ? { ...gen, status: 'failed' }
                : gen
            )
          )
        }
      } catch (err) {
        console.error(`Polling error for story ${storyId}:`, err)
      }
    }

    // Start polling immediately
    console.log(`Starting polling for story ${storyId}`)
    setTimeout(poll, 10000) // Wait 10 seconds before first poll
  }

  const getStatusBadge = (status: StoryGeneration['status']) => {
    switch (status) {
      case 'generating':
        return <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
          <LoadingSpinner className="w-3 h-3 mr-1" />
          Wird erstellt...
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Kindergeschichten Generator
          </h1>
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
                <Label htmlFor="character">Hauptcharakter *</Label>
                <Input
                  id="character"
                  placeholder="z.B. Ein mutiger kleiner Drache"
                  value={character}
                  onChange={(e) => setCharacter(e.target.value)}
                  disabled={isGenerating}
                />
              </div>
              <div>
                <Label htmlFor="ageGroup">Alter Zielgruppe *</Label>
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
                <Label htmlFor="storyType">Art der Geschichte *</Label>
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
                <Label htmlFor="extraWishes">Extrawünsche</Label>
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

            <Button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full"
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
          </CardContent>
        </Card>

        {/* Generations List */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Ihre Geschichten</h2>
          {generations.length === 0 ? (
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
                            {generation.createdAt.toLocaleString()}
                          </span>
                        </div>
                        <h3 className="font-semibold mb-2">
                          {generation.character} - {generation.storyType}
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">Zielgruppe:</span> {generation.ageGroup}
                          </div>
                          {generation.extraWishes && (
                            <div>
                              <span className="font-medium">Extrawünsche:</span> {generation.extraWishes}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {generation.status === 'completed' && generation.story && (
                      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold mb-2">Die Geschichte:</h4>
                        <div className="prose prose-sm max-w-none">
                          <div className="whitespace-pre-wrap">{generation.story}</div>
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