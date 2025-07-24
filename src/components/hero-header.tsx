"use client"

import { useState, useEffect } from "react"
import { supabase, Story } from "@/lib/supabase"
import { BookOpen } from "lucide-react"

interface HeroHeaderProps {
  showText?: boolean
  height?: 'sm' | 'md' | 'lg'
}

export default function HeroHeader({ showText = true, height = 'md' }: HeroHeaderProps) {
  const [heroImage, setHeroImage] = useState<string | null>(null)
  const [heroStory, setHeroStory] = useState<Story | null>(null)

  useEffect(() => {
    loadRandomHeroImage()
  }, [])

  const loadRandomHeroImage = async () => {
    try {
      console.log('Loading random hero image...')
      
      // Get all completed stories with images
      const { data: stories, error } = await supabase
        .from('stories')
        .select('*')
        .eq('status', 'completed')
        .not('image_url', 'is', null)
        .order('created_at', { ascending: false })
        .limit(50) // Get recent stories for better image quality
      
      if (error) {
        console.error('Error loading stories for hero:', error)
        return
      }
      
      if (stories && stories.length > 0) {
        // Pick a random story with image
        const randomIndex = Math.floor(Math.random() * stories.length)
        const selectedStory = stories[randomIndex]
        
        setHeroImage(selectedStory.image_url)
        setHeroStory(selectedStory)
        console.log('Selected hero story:', selectedStory.title)
      }
      
    } catch (err) {
      console.error('Error loading random hero image:', err)
    }
  }

  const heightClasses = {
    sm: 'h-48 md:h-64',
    md: 'h-64 md:h-80', 
    lg: 'h-80 md:h-96'
  }

  return (
    <div className={`relative ${heightClasses[height]} mb-8 rounded-xl overflow-hidden`}>
      {/* Background Image */}
      <div className="absolute inset-0">
        {heroImage ? (
          <img 
            src={heroImage} 
            alt="Hero Bild"
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Hero image failed to load:', heroImage)
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center">
            <BookOpen className="w-24 h-24 text-white opacity-50" />
          </div>
        )}
      </div>
      
      {/* Overlay - lighter for text version, darker for image-only */}
      <div className={`absolute inset-0 ${showText ? 'bg-black/40' : 'bg-black/20'}`} />
      
      {/* Content - only show if showText is true */}
      {showText && (
        <div className="relative h-full flex items-center justify-center text-center px-4">
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
            {heroStory && (
              <p className="text-sm text-white/60 mt-4">
                Bildquelle: "{heroStory.title || heroStory.character}"
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}