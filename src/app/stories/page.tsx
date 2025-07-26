"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { LoadingSpinner } from "@/common/loading-spinner"
import { BookOpen, Search, CheckCircle, ArrowRight, Filter, Grid, List, Plus } from "lucide-react"
import { supabase, Story } from "@/lib/supabase"
import { generateCategorySlug } from "@/lib/slug"
import { getAuthorDisplay } from "@/lib/user-utils"
import Link from "next/link"

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([])
  const [filteredStories, setFilteredStories] = useState<Story[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedReadingTime, setSelectedReadingTime] = useState("all")
  const [selectedAuthor, setSelectedAuthor] = useState("all")
  const [showOnlyWithImages, setShowOnlyWithImages] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uniqueAuthors, setUniqueAuthors] = useState<Array<{username: string, display_name: string}>>([])

  useEffect(() => {
    loadStories()
  }, [])

  // Extract unique authors when stories change
  useEffect(() => {
    const authors = stories
      .filter(story => story.author && !story.author.is_deleted && story.author.username)
      .reduce((acc, story) => {
        const key = story.author!.username!
        if (!acc[key]) {
          acc[key] = {
            username: story.author!.username!,
            display_name: story.author!.display_name || story.author!.username!
          }
        }
        return acc
      }, {} as Record<string, {username: string, display_name: string}>)
    
    setUniqueAuthors(Object.values(authors).sort((a, b) => a.display_name.localeCompare(b.display_name)))
  }, [stories])

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
    
    // Filter by reading time (based on story length)
    if (selectedReadingTime !== "all") {
      filtered = filtered.filter(story => {
        const readingTimeMinutes = Math.ceil((story.story?.length || 0) / 1000)
        switch (selectedReadingTime) {
          case "short": // 1-3 minutes
            return readingTimeMinutes <= 3
          case "medium": // 4-7 minutes
            return readingTimeMinutes >= 4 && readingTimeMinutes <= 7
          case "long": // 8+ minutes
            return readingTimeMinutes >= 8
          default:
            return true
        }
      })
    }
    
    // Filter by author
    if (selectedAuthor !== "all") {
      filtered = filtered.filter(story => {
        if (selectedAuthor === "anonymous") {
          return !story.author || story.author.is_deleted
        }
        return story.author?.username === selectedAuthor
      })
    }
    
    // Filter by images
    if (showOnlyWithImages) {
      filtered = filtered.filter(story => story.image_url)
    }
    
    // Sort stories
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case "title":
          const titleA = a.title || `${a.character} - ${a.story_type}`
          const titleB = b.title || `${b.character} - ${b.story_type}`
          return titleA.localeCompare(titleB)
        case "category":
          return a.story_type.localeCompare(b.story_type)
        case "readingTime":
          const timeA = Math.ceil((a.story?.length || 0) / 1000)
          const timeB = Math.ceil((b.story?.length || 0) / 1000)
          return timeA - timeB
        case "popular": // Placeholder for future popularity metric
          return 0
        default:
          return 0
      }
    })
    
    setFilteredStories(filtered)
  }, [searchTerm, selectedCategory, selectedAgeGroup, selectedReadingTime, selectedAuthor, showOnlyWithImages, sortBy, stories])

  const loadStories = async () => {
    try {
      console.log('Loading all stories from Supabase...')
      const { data: storiesData, error } = await supabase
        .from('stories')
        .select(`
          *,
          author:user_profiles!author_id(*)
        `)
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Alle Geschichten
              </h1>
              <p className="mt-2 text-muted-foreground">
                Durchsuchen Sie alle erstellten Kindergeschichten ({filteredStories.length} Geschichten)
              </p>
            </div>
            <Button asChild>
              <Link href="/story-generator">
                <Plus className="w-4 h-4 mr-2" />
                Geschichte erstellen
              </Link>
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Top Row: Search and View Controls */}
              <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Geschichten durchsuchen..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 border rounded-md p-1">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="h-8 w-8 p-0"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="h-8 w-8 p-0"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Bottom Row: Filters and Sort */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
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
                  <option value="Traumreise">Traumreise</option>
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
                
                {/* Reading Time Filter */}
                <select
                  value={selectedReadingTime}
                  onChange={(e) => setSelectedReadingTime(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="all">Alle Längen</option>
                  <option value="short">Kurz (1-3 Min.)</option>
                  <option value="medium">Mittel (4-7 Min.)</option>
                  <option value="long">Lang (8+ Min.)</option>
                </select>
                
                {/* Author Filter */}
                <select
                  value={selectedAuthor}
                  onChange={(e) => setSelectedAuthor(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="all">Alle Autoren</option>
                  <option value="anonymous">Anonyme Autoren</option>
                  {uniqueAuthors.map(author => (
                    <option key={author.username} value={author.username}>
                      {author.display_name}
                    </option>
                  ))}
                </select>
                
                {/* Sort Options */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="newest">Neueste zuerst</option>
                  <option value="oldest">Älteste zuerst</option>
                  <option value="title">Nach Titel</option>
                  <option value="category">Nach Kategorie</option>
                  <option value="readingTime">Nach Lesezeit</option>
                  <option value="popular">Beliebteste</option>
                </select>
                
                {/* Clear Filters Button */}
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={showOnlyWithImages}
                      onChange={(e) => setShowOnlyWithImages(e.target.checked)}
                      className="rounded border-input"
                    />
                    Nur mit Bildern
                  </label>
                </div>
              </div>

              {/* Clear All Filters Button */}
              {(selectedCategory !== "all" || selectedAgeGroup !== "all" || selectedReadingTime !== "all" || selectedAuthor !== "all" || showOnlyWithImages || searchTerm || sortBy !== "newest") && (
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedCategory("all")
                      setSelectedAgeGroup("all")
                      setSelectedReadingTime("all")
                      setSelectedAuthor("all")
                      setShowOnlyWithImages(false)
                      setSearchTerm("")
                      setSortBy("newest")
                    }}
                    className="flex items-center gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    Alle Filter zurücksetzen
                  </Button>
                </div>
              )}
            </div>
            
            {/* Active Filters Display */}
            {(selectedCategory !== "all" || selectedAgeGroup !== "all" || selectedReadingTime !== "all" || selectedAuthor !== "all" || showOnlyWithImages || searchTerm) && (
              <div className="flex flex-wrap gap-2 mt-4">
                {searchTerm && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    Suche: &quot;{searchTerm}&quot;
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
                {selectedReadingTime !== "all" && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Lesezeit: {selectedReadingTime === 'short' ? 'Kurz' : selectedReadingTime === 'medium' ? 'Mittel' : 'Lang'}
                    <button 
                      onClick={() => setSelectedReadingTime("all")}
                      className="ml-1 hover:text-purple-600"
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedAuthor !== "all" && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    Autor: {selectedAuthor === 'anonymous' ? 'Anonym' : uniqueAuthors.find(a => a.username === selectedAuthor)?.display_name || selectedAuthor}
                    <button 
                      onClick={() => setSelectedAuthor("all")}
                      className="ml-1 hover:text-orange-600"
                    >
                      ×
                    </button>
                  </span>
                )}
                {showOnlyWithImages && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                    Nur mit Bildern
                    <button 
                      onClick={() => setShowOnlyWithImages(false)}
                      className="ml-1 hover:text-teal-600"
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
          <div className={viewMode === "grid" ? "grid gap-6 md:grid-cols-2 xl:grid-cols-2" : "space-y-4"}>
            {filteredStories.map((story) => {
              const categorySlug = generateCategorySlug(story.story_type)
              const storyUrl = story.slug 
                ? `/${categorySlug}/${story.slug}` 
                : `/story/${story.id}` // Fallback for stories without slug
              
              if (viewMode === "list") {
                return (
                  <Card key={story.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                    <Link href={storyUrl} className="block">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          {/* Compact Thumbnail */}
                          <div className="flex-shrink-0">
                            {story.image_url ? (
                              <img 
                                src={story.image_url} 
                                alt={story.title || 'Titelbild'}
                                className="w-16 h-16 object-cover rounded-lg shadow-sm"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                }}
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          
                          {/* Story Info - Horizontal Layout */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-semibold mb-1 hover:text-primary transition-colors leading-tight">
                                  {story.title || `${story.character} - ${story.story_type}`}
                                </h3>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                                  <span className="flex items-center gap-1">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    Fertig
                                  </span>
                                  <span>{new Date(story.created_at).toLocaleDateString('de-DE')}</span>
                                  <span>ca. {Math.ceil((story.story?.length || 0) / 1000)} Min.</span>
                                  <span>
                                    von {story.author && story.author.username && !story.author.is_deleted ? (
                                      <Link 
                                        href={`/profile/${story.author.username}`}
                                        className="hover:text-primary transition-colors"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        {getAuthorDisplay(story.author)}
                                      </Link>
                                    ) : (
                                      getAuthorDisplay(story.author)
                                    )}
                                  </span>
                                </div>
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
                              </div>
                              <div className="flex items-center text-sm text-primary hover:text-primary/80 transition-colors ml-4">
                                Geschichte lesen
                                <ArrowRight className="w-4 h-4 ml-1" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                )
              }
              
              // Grid view (existing layout)
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
                        <div className="text-sm text-muted-foreground mb-2">
                          von {story.author && story.author.username && !story.author.is_deleted ? (
                            <Link 
                              href={`/profile/${story.author.username}`}
                              className="hover:text-primary transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {getAuthorDisplay(story.author)}
                            </Link>
                          ) : (
                            getAuthorDisplay(story.author)
                          )}
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