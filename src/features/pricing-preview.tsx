import Link from "next/link"
import { Check, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PRICING_PLANS } from "@/lib/constants"
import { formatCurrency } from "@/lib/utils"

export function PricingPreview() {
  return (
    <section className="py-20 sm:py-32">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Einfache, transparente Preise
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Wählen Sie den Plan, der am besten zu Ihren Bedürfnissen passt. 
            Sie können jederzeit upgraden oder downgraden.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-6">
          {PRICING_PLANS.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                plan.popular 
                  ? 'border-primary shadow-lg scale-105' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="inline-flex items-center rounded-full bg-primary px-4 py-1 text-xs font-medium text-primary-foreground">
                    <Star className="mr-1 h-3 w-3 fill-current" />
                    Beliebt
                  </div>
                </div>
              )}

              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-base">
                  {plan.description}
                </CardDescription>
                <div className="mt-6">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-foreground">
                      {plan.price === 0 ? 'Kostenlos' : formatCurrency(plan.price)}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-muted-foreground ml-1">/Monat</span>
                    )}
                  </div>
                  {plan.price > 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Jährlich zahlen und 20% sparen
                    </p>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Enthält:</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature.id} className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button 
                  className={`w-full ${plan.popular ? '' : 'variant-outline'}`}
                  asChild
                >
                  <Link href={plan.price === 0 ? '/register' : '/pricing'}>
                    {plan.price === 0 ? 'Kostenlos starten' : 'Plan wählen'}
                  </Link>
                </Button>

                {plan.price > 0 && (
                  <p className="text-xs text-center text-muted-foreground">
                    14 Tage kostenlos testen • Keine Kreditkarte erforderlich
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <div className="mx-auto max-w-3xl">
            <h3 className="text-2xl font-bold text-center text-foreground mb-12">
              Häufig gestellte Fragen
            </h3>
            
            <div className="grid gap-6 md:grid-cols-2">
              {[
                {
                  question: "Kann ich meinen Plan jederzeit ändern?",
                  answer: "Ja, Sie können Ihren Plan jederzeit upgraden oder downgraden. Änderungen werden sofort wirksam."
                },
                {
                  question: "Gibt es versteckte Kosten?",
                  answer: "Nein, alle Preise sind transparent und es gibt keine versteckten Gebühren oder Setup-Kosten."
                },
                {
                  question: "Was passiert nach der Testphase?",
                  answer: "Nach 14 Tagen können Sie sich für einen kostenpflichtigen Plan entscheiden oder Ihr Konto wird pausiert."
                },
                {
                  question: "Bieten Sie Support an?",
                  answer: "Ja, alle Pläne beinhalten E-Mail-Support. Pro und Enterprise Pläne erhalten zusätzlich Chat-Support."
                }
              ].map((faq, index) => (
                <div key={index} className="space-y-2">
                  <h4 className="font-semibold text-foreground">{faq.question}</h4>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="mx-auto max-w-2xl">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Bereit zu starten?
            </h3>
            <p className="text-muted-foreground mb-8">
              Erstellen Sie Ihr kostenloses Konto und beginnen Sie noch heute.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/register">
                  Kostenlos starten
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/contact">
                  Kontakt aufnehmen
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 