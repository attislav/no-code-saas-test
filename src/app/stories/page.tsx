"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { LoadingSpinner } from "@/common/loading-spinner"
import { BookOpen, Search, Download, CheckCircle, ArrowRight } from "lucide-react"
import { supabase, Story } from "@/lib/supabase"
import { generateCategorySlug } from "@/lib/slug"
import Link from "next/link"

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([])
  const [filteredStories, setFilteredStories] = useState<Story[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("all")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadStories()
  }, [])

  useEffect(() => {
    let filtered = [...stories]
    
    // Filter by search term
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(story => 
        story.character.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.story_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (story.story && story.story.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (story.title && story.title.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }
    
    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(story => story.story_type === selectedCategory)
    }
    
    // Filter by age group
    if (selectedAgeGroup !== "all") {
      filtered = filtered.filter(story => story.age_group === selectedAgeGroup)
    }
    
    setFilteredStories(filtered)
  }, [searchTerm, selectedCategory, selectedAgeGroup, stories])

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

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Geschichten durchsuchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="all">Alle Kategorien</option>
                <option value="Abenteuer">Abenteuer</option>
                <option value="Märchen">Märchen</option>
                <option value="Lerngeschichte">Lerngeschichte</option>
                <option value="Gute-Nacht-Geschichte">Gute-Nacht-Geschichte</option>
                <option value="Freundschaftsgeschichte">Freundschaftsgeschichte</option>
                <option value="Tiergeschichte">Tiergeschichte</option>
              </select>
              
              {/* Age Group Filter */}
              <select
                value={selectedAgeGroup}
                onChange={(e) => setSelectedAgeGroup(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="all">Alle Altersgruppen</option>
                <option value="3-4 Jahre">3-4 Jahre</option>
                <option value="4-6 Jahre">4-6 Jahre</option>
                <option value="6-8 Jahre">6-8 Jahre</option>
                <option value="8-10 Jahre">8-10 Jahre</option>
                <option value="10-12 Jahre">10-12 Jahre</option>
              </select>
            </div>
            
            {/* Active Filters Display */}
            {(selectedCategory !== "all" || selectedAgeGroup !== "all" || searchTerm) && (
              <div className="flex flex-wrap gap-2 mt-4">
                {searchTerm && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    Suche: "{searchTerm}"
                    <button 
                      onClick={() => setSearchTerm("")}
                      className="ml-1 hover:text-primary/80"
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedCategory !== "all" && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Kategorie: {selectedCategory}
                    <button 
                      onClick={() => setSelectedCategory("all")}
                      className="ml-1 hover:text-blue-600"
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedAgeGroup !== "all" && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Alter: {selectedAgeGroup}
                    <button 
                      onClick={() => setSelectedAgeGroup("all")}
                      className="ml-1 hover:text-green-600"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            )}
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
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
            {filteredStories.map((story) => {
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
                            {story.story.substring(0, 150)}...
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2" onClick={(e) => e.preventDefault()}>
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