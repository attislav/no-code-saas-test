"use client"

import { useState, useEffect } from 'react'

interface TypewriterProps {
  text: string
  speed?: number
  className?: string
  onComplete?: () => void
}

export function Typewriter({ text, speed = 30, className = "", onComplete }: TypewriterProps) {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, speed)

      return () => clearTimeout(timer)
    } else if (onComplete && currentIndex === text.length && text.length > 0) {
      onComplete()
    }
  }, [currentIndex, text, speed, onComplete])

  // Reset when text changes
  useEffect(() => {
    setDisplayedText("")
    setCurrentIndex(0)
  }, [text])

  return (
    <div className={className}>
      <span className="whitespace-pre-wrap">{displayedText}</span>
      {currentIndex < text.length && (
        <span className="animate-pulse border-r-2 border-foreground ml-1 inline-block h-5 w-0.5" />
      )}
    </div>
  )
}