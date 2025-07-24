"use client"

import { useState, useEffect } from "react"
import { supabase, Story } from "@/lib/supabase"
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react"
import { generateCategorySlug } from "@/lib/slug"
import Link from "next/link"

interface HeroCarouselProps {
  showText?: boolean
  showNavigation?: boolean
  showTitle?: boolean
  aspectRatio?: '4:3' | '16:9'
  height?: 'sm' | 'md' | 'lg'
  clickable?: boolean
}

export default function HeroCarousel({ 
  showText = true, 
  showNavigation = false,
  showTitle = false,
  aspectRatio = '4:3',
  height = 'md',
  clickable = true
}: HeroCarouselProps) {
  const [stories, setStories] = useState<Story[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadHeroStories()
  }, [])

  const loadHeroStories = async () => {
    try {
      console.log('Loading hero stories...')
      
      // Get latest 10 completed stories with images
      const { data: storiesData, error } = await supabase
        .from('stories')
        .select('*')
        .eq('status', 'completed')
        .not('image_url', 'is', null)
        .order('created_at', { ascending: false })
        .limit(10) // Only latest 10 for performance
      
      if (error) {
        console.error('Error loading hero stories:', error)
        return
      }
      
      if (storiesData && storiesData.length > 0) {
        setStories(storiesData)
        console.log(`Loaded ${storiesData.length} hero stories`)
      }
      
    } catch (err) {
      console.error('Error loading hero stories:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const nextStory = () => {
    setCurrentIndex((prev) => (prev + 1) % stories.length)
  }

  const prevStory = () => {
    setCurrentIndex((prev) => (prev - 1 + stories.length) % stories.length)
  }

  const currentStory = stories[currentIndex]

  const heightClasses = {
    sm: aspectRatio === '16:9' ? 'h-48 md:h-64' : 'h-48 md:h-64',
    md: aspectRatio === '16:9' ? 'h-64 md:h-80 lg:h-[400px]' : 'h-64 md:h-80', 
    lg: aspectRatio === '16:9' ? 'h-80 md:h-96 lg:h-[500px]' : 'h-80 md:h-96'
  }

  const aspectClasses = aspectRatio === '16:9' ? 'aspect-video' : 'aspect-[4/3]'

  if (isLoading) {
    return (
      <div className={`relative ${heightClasses[height]} mb-8 rounded-xl overflow-hidden`}>
        <div className="w-full h-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center">
          <BookOpen className="w-24 h-24 text-white opacity-50 animate-pulse" />
        </div>
      </div>
    )
  }

  if (stories.length === 0) {
    return (
      <div className={`relative ${heightClasses[height]} mb-8 rounded-xl overflow-hidden`}>
        <div className="w-full h-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center">
          <BookOpen className="w-24 h-24 text-white opacity-50" />
        </div>
      </div>
    )
  }

  const categorySlug = generateCategorySlug(currentStory.story_type)
  const storyUrl = currentStory.slug 
    ? `/${categorySlug}/${currentStory.slug}` 
    : `/story/${currentStory.id}`

  return (
    <div className={`relative ${heightClasses[height]} mb-8 rounded-xl overflow-hidden ${clickable ? 'group' : ''}`}>
      {/* Background Image */}
      {clickable ? (
        <Link href={storyUrl} className="block w-full h-full">
          <div className="absolute inset-0">
            {currentStory.image_url ? (
              <img 
                src={currentStory.image_url} 
                alt={currentStory.title || 'Hero Bild'}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  console.error('Hero image failed to load:', currentStory.image_url)
                  e.currentTarget.style.display = 'none'
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center">
                <BookOpen className="w-24 h-24 text-white opacity-50" />
              </div>
            )}
          </div>
          
          {/* Overlay */}
          <div className={`absolute inset-0 ${showText || showTitle ? 'bg-black/40' : 'bg-black/20'} transition-colors duration-300 group-hover:bg-black/50`} />
        </Link>
      ) : (
        <>
          <div className="absolute inset-0">
            {currentStory.image_url ? (
              <img 
                src={currentStory.image_url} 
                alt={currentStory.title || 'Hero Bild'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Hero image failed to load:', currentStory.image_url)
                  e.currentTarget.style.display = 'none'
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center">
                <BookOpen className="w-24 h-24 text-white opacity-50" />
              </div>
            )}
          </div>
          
          {/* Overlay */}
          <div className={`absolute inset-0 ${showText || showTitle ? 'bg-black/40' : 'bg-black/20'}`} />
        </>
      )}

      {/* Story Title Overlay */}
      {showTitle && currentStory && (
        <Link href={storyUrl}>
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-white text-xl md:text-2xl font-bold mb-2 line-clamp-2">
              {currentStory.title || `${currentStory.character} - ${currentStory.story_type}`}
            </h3>
            <div className="flex gap-2">
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-white/20 text-white rounded-full backdrop-blur-sm">
                {currentStory.age_group}
              </span>
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-white/20 text-white rounded-full backdrop-blur-sm">
                {currentStory.story_type}
              </span>
            </div>
          </div>
        </Link>
      )}
      
      {/* Main Content - only show if showText is true */}
      {showText && (
        <Link href={storyUrl}>
          <div className="absolute inset-0 flex items-center justify-center text-center px-4">
            <div className="max-w-4xl">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                StoryMagic
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-6">
                Magische KI-Geschichten für Kinder
              </p>
              <p className="text-lg text-white/80">
                Erstelle personalisierte Abenteuer, Märchen und Lerngeschichten
              </p>
            </div>
          </div>
        </Link>
      )}

      {/* Navigation arrows - only show if showNavigation and multiple stories */}
      {showNavigation && stories.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault()
              prevStory()
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors backdrop-blur-sm opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={(e) => {
              e.preventDefault()
              nextStory()
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors backdrop-blur-sm opacity-0 group-hover:opacity-100"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dots indicator - only show if showNavigation and multiple stories */}
      {showNavigation && stories.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {stories.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.preventDefault()
                setCurrentIndex(index)
              }}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex 
                  ? 'bg-white' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}