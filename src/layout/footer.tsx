import Link from "next/link"
import { Github, Linkedin, Twitter, Youtube } from "lucide-react"

import { APP_NAME, COMPANY_NAME, SOCIAL_LINKS, FOOTER_NAVIGATION } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface FooterProps {
  className?: string
}

export function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    { name: "Twitter", href: SOCIAL_LINKS.twitter, icon: Twitter },
    { name: "LinkedIn", href: SOCIAL_LINKS.linkedin, icon: Linkedin },
    { name: "GitHub", href: SOCIAL_LINKS.github, icon: Github },
    { name: "YouTube", href: SOCIAL_LINKS.youtube, icon: Youtube },
  ]

  return (
    <footer className={cn("border-t bg-background", className)}>
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-bold text-xl">{APP_NAME}</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              SaaS schneller bauen. Die moderne Plattform für Ihre SaaS-Anwendung.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <social.icon className="h-5 w-5" />
                  <span className="sr-only">{social.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Produkt</h3>
            <ul className="space-y-2">
              {FOOTER_NAVIGATION.product.map((item) => (
                <li key={item.title}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Unternehmen</h3>
            <ul className="space-y-2">
              {FOOTER_NAVIGATION.company.map((item) => (
                <li key={item.title}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Support</h3>
            <ul className="space-y-2">
              {FOOTER_NAVIGATION.support.map((item) => (
                <li key={item.title}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
              <p className="text-sm text-muted-foreground">
                © {currentYear} {COMPANY_NAME}. Alle Rechte vorbehalten.
              </p>
              <div className="flex space-x-4">
                {FOOTER_NAVIGATION.legal.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>Made with ❤️ in Berlin</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 