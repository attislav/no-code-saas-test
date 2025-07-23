"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { LoadingSpinner } from "@/common/loading-spinner"
import { BookOpen, Search, Download, Copy, CheckCircle } from "lucide-react"
import { supabase, Story } from "@/lib/supabase"

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([])
  const [filteredStories, setFilteredStories] = useState<Story[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadStories()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredStories(stories)
    } else {
      const filtered = stories.filter(story => 
        story.character.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.story_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (story.story && story.story.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setFilteredStories(filtered)
    }
  }, [searchTerm, stories])

  const loadStories = async () => {
    try {
      console.log('Loading all stories from Supabase...')
      const { data: storiesData, error } = await supabase
        .from('stories')
        .select('*')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Supabase error loading stories:', error)
        setError(`Fehler beim Laden der Geschichten: ${error.message}`)
        return
      }
      
      console.log('Loaded stories:', storiesData)
      setStories(storiesData || [])
      setFilteredStories(storiesData || [])
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

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="mx-auto max-w-4xl">
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Alle Geschichten
          </h1>
          <p className="mt-2 text-muted-foreground">
            Durchsuchen Sie alle erstellten Kindergeschichten
          </p>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Geschichten durchsuchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

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
        {filteredStories.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {searchTerm ? 'Keine Geschichten gefunden für Ihre Suche.' : 'Noch keine Geschichten vorhanden.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredStories.map((story) => (
              <Card key={story.id} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">
                        {story.character} - {story.story_type}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Fertig
                        </span>
                        <span>Zielgruppe: {story.age_group}</span>
                        <span>{new Date(story.created_at).toLocaleDateString()}</span>
                      </div>
                      {story.extra_wishes && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Extrawünsche: {story.extra_wishes}
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
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed bg-muted/30 p-4 rounded-lg">
                      {story.story}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}