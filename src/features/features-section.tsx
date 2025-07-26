import { BookOpen, Palette, Brain, Zap, Users, Heart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

const features = [
  {
    icon: Brain,
    title: "KI-powered Storytelling",
    description: "Unsere fortschrittliche KI erstellt einzigartige, kindgerechte Geschichten.",
    benefits: ["OpenAI Integration", "Intelligente Charaktere", "Kreative Handlungen"],
    gradient: "from-indigo-500 to-purple-600",
    color: "indigo"
  },
  {
    icon: Palette,
    title: "Automatische Illustrationen",
    description: "Jede Geschichte erhält ein passendes, KI-generiertes Titelbild.",
    benefits: ["Hochwertige Bilder", "Thematisch passend", "Sofort verfügbar"],
    gradient: "from-pink-500 to-rose-600",
    color: "pink"
  },
  {
    icon: BookOpen,
    title: "Vielfältige Genres",
    description: "Von Abenteuer bis Gute-Nacht-Geschichte - für jeden Geschmack.",
    benefits: ["6 Kategorien", "Alle Altersgruppen", "Pädagogisch wertvoll"],
    gradient: "from-blue-500 to-cyan-600",
    color: "blue"
  },
  {
    icon: Zap,
    title: "Zufallsgeschichten",
    description: "Lassen Sie sich überraschen - der Würfel entscheidet!",
    benefits: ["Überraschungseffekt", "Neue Entdeckungen", "Spontaner Spaß"],
    gradient: "from-yellow-500 to-orange-600",
    color: "yellow"
  },
  {
    icon: Users,
    title: "Für die ganze Familie",
    description: "Geschichten die Kinder begeistern und Eltern beruhigt vorlesen können.",
    benefits: ["Sichere Inhalte", "Lehrreiche Botschaften", "Gemeinsame Zeit"],
    gradient: "from-emerald-500 to-teal-600",
    color: "emerald"
  },
  {
    icon: Heart,
    title: "Mit Liebe gemacht",
    description: "Jede Geschichte wird mit Sorgfalt und Aufmerksamkeit erstellt.",
    benefits: ["Qualitätskontrolle", "Durchdachte Handlungen", "Positive Werte"],
    gradient: "from-red-500 to-pink-600",
    color: "red"
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
            <Card key={index} className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-6 w-6 text-white" />
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
                      <div className={`mr-3 h-2 w-2 rounded-full bg-gradient-to-r ${feature.gradient} flex-shrink-0`} />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </CardContent>
              {/* Subtle gradient overlay */}
              <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl ${feature.gradient} opacity-5 rounded-bl-full`} />
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