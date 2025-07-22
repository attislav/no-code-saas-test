import Link from "next/link"
import { ArrowRight, CheckCircle, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { APP_DESCRIPTION } from "@/lib/constants"

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
            <Star className="mr-2 h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>Vertraut von über 10.000+ Entwicklern</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            {APP_DESCRIPTION}
          </h1>
          
          {/* Subtitle */}
          <p className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl max-w-2xl mx-auto">
            Bauen Sie Ihre SaaS-Anwendung in Rekordzeit. Mit unserer modernen Plattform 
            erhalten Sie alles, was Sie für den Start und Wachstum benötigen.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <Button size="lg" asChild className="text-base px-8 py-6">
              <Link href="/register">
                Kostenlos starten
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="text-base px-8 py-6">
              <Link href="/demo">
                Demo ansehen
              </Link>
            </Button>
          </div>

          {/* Social Proof */}
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>14 Tage kostenlos testen</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Keine Kreditkarte erforderlich</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Jederzeit kündbar</span>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16">
            <p className="text-sm text-muted-foreground mb-6">
              Vertraut von führenden Unternehmen
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
              {/* Placeholder logos - replace with actual company logos */}
              <div className="h-8 w-24 bg-muted rounded animate-pulse" />
              <div className="h-8 w-20 bg-muted rounded animate-pulse" />
              <div className="h-8 w-28 bg-muted rounded animate-pulse" />
              <div className="h-8 w-16 bg-muted rounded animate-pulse" />
              <div className="h-8 w-22 bg-muted rounded animate-pulse" />
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