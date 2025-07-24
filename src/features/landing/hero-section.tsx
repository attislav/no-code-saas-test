import Link from "next/link"
import { ArrowRight, CheckCircle, BookOpen } from "lucide-react"

import { Button } from "@/components/ui/button"
import { APP_DESCRIPTION } from "@/lib/constants"
import HeroCarousel from "@/components/hero-carousel"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background py-20 sm:py-32">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
      
      <div className="relative container">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center rounded-full border bg-background px-4 py-2 text-sm font-medium shadow-sm mb-8">
            <BookOpen className="mr-2 h-4 w-4 text-primary" />
            <span>Bereits über 1.000+ Geschichten erstellt</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            {APP_DESCRIPTION}
          </h1>
          
          {/* Subtitle */}
          <p className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl max-w-2xl mx-auto">
            Erstellen Sie personalisierte Kindergeschichten mit künstlicher Intelligenz. 
            Einzigartige Geschichten für jedes Kind, angepasst an Alter und Interessen.
          </p>

          {/* Hero Carousel */}
          <div className="mt-12 mb-8">
            <HeroCarousel 
              showText={false} 
              showNavigation={true}
              showTitle={true}
              aspectRatio="16:9"
              height="lg" 
            />
          </div>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <Button size="lg" asChild className="text-base px-8 py-6">
              <Link href="/story-generator">
                Geschichte erstellen
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="text-base px-8 py-6">
              <Link href="/stories">
                Geschichten ansehen
              </Link>
            </Button>
          </div>

          {/* Features */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-4">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Personalisiert</h3>
              <p className="text-sm text-muted-foreground">
                Jede Geschichte wird individuell für Ihr Kind erstellt - mit Lieblingscharakteren und passenden Lernzielen.
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Altersgerecht</h3>
              <p className="text-sm text-muted-foreground">
                Von 3-12 Jahren - unsere KI passt Sprache, Komplexität und Themen perfekt an das Alter Ihres Kindes an.
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-4">
                <ArrowRight className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Sofort verfügbar</h3>
              <p className="text-sm text-muted-foreground">
                In wenigen Minuten zur fertigen Geschichte - komplett mit Titelbildern und professioneller Formatierung.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-20 right-10 h-40 w-40 rounded-full bg-secondary/10 blur-3xl" />
    </section>
  )
} 