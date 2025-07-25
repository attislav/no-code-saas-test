import Link from "next/link"

import { APP_NAME, COMPANY_NAME, FOOTER_NAVIGATION } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface FooterProps {
  className?: string
}

export function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear()

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
              Magische Kindergeschichten mit künstlicher Intelligenz erstellen. 
              Personalisiert, altersgerecht und voller Fantasie.
            </p>
            <div className="flex space-x-4">
              <span className="text-sm text-muted-foreground">
                🎪 Wo Fantasie auf Technologie trifft
              </span>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Geschichten</h3>
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
              <span>Made with ❤️ in Köln</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 