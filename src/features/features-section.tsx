import { BookOpen, Palette, Brain, Zap, Users, Heart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

const features = [
  {
    icon: Brain,
    title: "KI-powered Storytelling",
    description: "Unsere fortschrittliche KI erstellt einzigartige, kindgerechte Geschichten.",
    benefits: ["OpenAI Integration", "Intelligente Charaktere", "Kreative Handlungen"]
  },
  {
    icon: Palette,
    title: "Automatische Illustrationen",
    description: "Jede Geschichte erhält ein passendes, KI-generiertes Titelbild.",
    benefits: ["Hochwertige Bilder", "Thematisch passend", "Sofort verfügbar"]
  },
  {
    icon: BookOpen,
    title: "Vielfältige Genres",
    description: "Von Abenteuer bis Gute-Nacht-Geschichte - für jeden Geschmack.",
    benefits: ["6 Kategorien", "Alle Altersgruppen", "Pädagogisch wertvoll"]
  },
  {
    icon: Zap,
    title: "Zufallsgeschichten",
    description: "Lassen Sie sich überraschen - der Würfel entscheidet!",
    benefits: ["Überraschungseffekt", "Neue Entdeckungen", "Spontaner Spaß"]
  },
  {
    icon: Users,
    title: "Für die ganze Familie",
    description: "Geschichten die Kinder begeistern und Eltern beruhigt vorlesen können.",
    benefits: ["Sichere Inhalte", "Lehrreiche Botschaften", "Gemeinsame Zeit"]
  },
  {
    icon: Heart,
    title: "Mit Liebe gemacht",
    description: "Jede Geschichte wird mit Sorgfalt und Aufmerksamkeit erstellt.",
    benefits: ["Qualitätskontrolle", "Durchdachte Handlungen", "Positive Werte"]
  }
]

export function FeaturesSection() {
  return (
    <section className="py-20 sm:py-32 bg-muted/30">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Warum StoryMagic?
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Entdecken Sie, was unsere KI-Geschichten so besonders macht und warum Kinder sie lieben.
          </p>
        </div>
        
        <div className="grid gap-8 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="relative overflow-hidden group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
                <CardDescription className="text-sm">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-center text-sm">
                      <div className="mr-2 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Button size="lg" className="px-8" asChild>
            <Link href="/story-generator">
              Jetzt Geschichte erstellen
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}