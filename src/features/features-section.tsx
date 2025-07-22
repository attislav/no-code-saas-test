import { BarChart3, Code, CreditCard, Shield } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FEATURES } from "@/lib/constants"

const featureIcons = {
  Shield: Shield,
  CreditCard: CreditCard,
  BarChart3: BarChart3,
  Code: Code,
}

export function FeaturesSection() {
  return (
    <section className="py-20 sm:py-32 bg-muted/30">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Alles, was Sie für Ihre SaaS benötigen
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Von der Authentifizierung bis zur API - wir haben alle wichtigen Features 
            für moderne SaaS-Anwendungen abgedeckt.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => {
            const IconComponent = featureIcons[feature.icon as keyof typeof featureIcons]
            
            return (
              <Card key={feature.id} className="relative overflow-hidden border-0 shadow-lg bg-background hover:shadow-xl transition-all duration-300 group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <CardHeader className="relative">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{feature.name}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="relative">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Ab {feature.tier_required === 'free' ? 'Kostenlos' : 
                          feature.tier_required === 'pro' ? 'Pro Plan' : 'Enterprise'}
                    </span>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-xs text-muted-foreground">Aktiv</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Additional Features Grid */}
        <div className="mt-20">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h3 className="text-2xl font-bold tracking-tight text-foreground">
              Und noch viel mehr...
            </h3>
            <p className="mt-4 text-muted-foreground">
              Entdecken Sie alle Features, die Ihre SaaS-Anwendung zum Erfolg führen.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Team Management",
                description: "Verwalten Sie Benutzer, Rollen und Berechtigungen einfach und sicher.",
                icon: "👥"
              },
              {
                title: "Webhooks",
                description: "Integrieren Sie sich nahtlos mit Ihren bestehenden Systemen.",
                icon: "🔗"
              },
              {
                title: "Analytics",
                description: "Detaillierte Einblicke in die Nutzung und Performance Ihrer App.",
                icon: "📊"
              },
              {
                title: "Multi-Tenant",
                description: "Unterstützung für mehrere Organisationen und Workspaces.",
                icon: "🏢"
              },
              {
                title: "Rate Limiting",
                description: "Schützen Sie Ihre API vor Missbrauch und Überlastung.",
                icon: "🛡️"
              },
              {
                title: "SSO Integration",
                description: "Single Sign-On mit SAML, OAuth und anderen Standards.",
                icon: "🔐"
              }
            ].map((feature, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 rounded-lg border bg-background hover:bg-muted/50 transition-colors duration-200">
                <div className="text-2xl">{feature.icon}</div>
                <div>
                  <h4 className="font-semibold text-foreground">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
} 