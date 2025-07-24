# SaaSify - Next.js 14+ SaaS Boilerplate

Ein vollständiges, produktionsreifes SaaS-Boilerplate mit Next.js 14+, TypeScript, Tailwind CSS und shadcn/ui.

## 🚀 Features

### 🛠️ Technologie-Stack
- **Framework**: Next.js 14+ mit App Router
- **Sprache**: TypeScript
- **Styling**: Tailwind CSS mit benutzerdefinierten Design-Tokens
- **UI-Komponenten**: shadcn/ui
- **Theme**: Dark/Light Mode mit next-themes
- **Icons**: Lucide React
- **Formulare**: React Hook Form + Zod Validation

### 🎯 SaaS-Features
- **Authentifizierung**: Vorbereitet für NextAuth.js
- **Abonnements**: Stripe-Integration vorbereitet
- **Analytics**: PostHog-Integration vorbereitet
- **E-Mail**: Resend/SendGrid-Integration vorbereitet
- **Datei-Upload**: AWS S3/Cloudflare R2 vorbereitet
- **API**: RESTful API-Struktur
- **Rate Limiting**: Vorbereitet
- **Webhooks**: Event-System vorbereitet

### 🎨 Design & UX
- **Responsive Design**: Mobile-First Ansatz
- **Accessibility**: ARIA-Labels und semantisches HTML
- **Performance**: Optimiert für Core Web Vitals
- **SEO**: Meta-Tags und Open Graph
- **Loading States**: Elegante Loading-Animationen
- **Error Handling**: Benutzerfreundliche Fehlermeldungen

## 📁 Projektstruktur

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Globale Styles
│   ├── layout.tsx         # Root Layout
│   └── page.tsx           # Homepage
├── components/            # Wiederverwendbare Komponenten
│   └── ui/               # shadcn/ui Komponenten
├── layout/               # Layout-Komponenten
│   ├── header.tsx        # Header mit Navigation
│   └── footer.tsx        # Footer
├── features/             # Feature-basierte Komponenten
│   ├── landing/          # Landing Page Features
│   │   └── hero-section.tsx
│   ├── features-section.tsx
│   └── pricing-preview.tsx
├── common/               # Gemeinsame Komponenten
│   ├── loading-spinner.tsx
│   └── theme-toggle.tsx
├── lib/                  # Utilities und Konfiguration
│   ├── utils.ts          # Hilfsfunktionen
│   ├── constants.ts      # App-Konstanten
│   └── types.ts          # TypeScript-Typen
├── styles/               # Zusätzliche Styles
└── types/                # Spezifische Typen
    ├── auth.ts           # Auth-Typen
    └── subscription.ts   # Subscription-Typen
```

## 🚀 Schnellstart

### Voraussetzungen
- Node.js 18+ 
- npm oder yarn
- Git

### Installation

1. **Repository klonen**
   ```bash
   git clone https://github.com/saasify/saas-framework.git
   cd saas-framework
   ```

2. **Abhängigkeiten installieren**
   ```bash
   npm install
   ```

3. **Umgebungsvariablen konfigurieren**
   ```bash
   cp env.example .env.local
   ```
   
   Bearbeiten Sie `.env.local` und fügen Sie Ihre API-Keys hinzu.

4. **Entwicklungsserver starten**
   ```bash
   npm run dev
   ```

5. **Browser öffnen**
   ```
   http://localhost:3000
   ```

## 🛠️ Entwicklung

### Verfügbare Scripts

```bash
# Entwicklung
npm run dev              # Startet den Entwicklungsserver
npm run build            # Produktions-Build
npm run start            # Startet den Produktionsserver

# Code-Qualität
npm run lint             # ESLint ausführen
npm run lint:fix         # ESLint-Fehler automatisch beheben
npm run type-check       # TypeScript-Typen prüfen
npm run format           # Prettier formatieren
npm run format:check     # Prettier-Formatierung prüfen

# Wartung
npm run clean            # Build-Ordner löschen
npm run analyze          # Bundle-Analyse
```

### Code-Konventionen

- **TypeScript**: Strikte Typisierung für alle Dateien
- **ESLint**: Konfiguriert für Next.js und TypeScript
- **Prettier**: Automatische Code-Formatierung
- **Tailwind**: Klassennamen werden automatisch sortiert
- **Imports**: Absolute Imports mit `@/` Alias

### Komponenten-Entwicklung

```typescript
// Beispiel für eine neue Komponente
import { cn } from "@/lib/utils"

interface MyComponentProps {
  className?: string
  children: React.ReactNode
}

export function MyComponent({ className, children }: MyComponentProps) {
  return (
    <div className={cn("base-styles", className)}>
      {children}
    </div>
  )
}
```

## 🎨 Anpassung

### Farben und Theme

Die Farben sind in `tailwind.config.ts` definiert:

```typescript
colors: {
  primary: {
    DEFAULT: "hsl(var(--primary))",
    foreground: "hsl(var(--primary-foreground))",
  },
  // ... weitere Farben
}
```

### CSS-Variablen

Globale CSS-Variablen in `src/app/globals.css`:

```css
:root {
  --primary: 222.2 84% 4.9%;
  --primary-foreground: 210 40% 98%;
  /* ... weitere Variablen */
}
```

### Konstanten

App-Konstanten in `src/lib/constants.ts`:

```typescript
export const APP_NAME = 'SaaSify'
export const APP_DESCRIPTION = 'SaaS schneller bauen'
// ... weitere Konstanten
```

## 🔧 Konfiguration

### Datenbank
Das Projekt ist vorbereitet für:
- **PostgreSQL** mit Prisma
- **Supabase** (PostgreSQL + Auth)
- **PlanetScale** (MySQL)

### Authentifizierung
Vorbereitet für:
- **NextAuth.js** mit verschiedenen Providern
- **Supabase Auth**
- **Clerk**

### Zahlungen
Vorbereitet für:
- **Stripe** (Hauptempfehlung)
- **Paddle**
- **LemonSqueezy**

## 📦 Deployment

### Vercel (Empfohlen)
1. Repository zu Vercel verbinden
2. Umgebungsvariablen in Vercel-Dashboard setzen
3. Automatisches Deployment bei Push

### Andere Plattformen
- **Netlify**: `npm run build` → `out/` Ordner
- **Railway**: Direkte Git-Integration
- **Docker**: Dockerfile bereitstellen

## 🔒 Sicherheit

- **Security Headers**: In `next.config.ts` konfiguriert
- **CORS**: Für API-Routen konfiguriert
- **Rate Limiting**: Vorbereitet für API-Schutz
- **Input Validation**: Zod-Schemas für alle Formulare
- **XSS Protection**: CSP-Headers vorbereitet

## 📊 Performance

- **Bundle-Analyse**: `npm run analyze`
- **Image-Optimierung**: Next.js Image-Komponente
- **Code-Splitting**: Automatisch durch Next.js
- **Caching**: Statische Assets und API-Responses
- **Core Web Vitals**: Optimiert für LCP, FID, CLS

## 🧪 Testing

```bash
npm run test              # Tests ausführen
npm run test:watch        # Tests im Watch-Modus
npm run test:coverage     # Test-Coverage
```

## 📚 Nächste Schritte

### Authentifizierung hinzufügen
1. NextAuth.js installieren
2. Provider konfigurieren (Google, GitHub, etc.)
3. Auth-Komponenten erstellen
4. Protected Routes implementieren

### Datenbank einrichten
1. Prisma installieren und konfigurieren
2. Datenbankschema definieren
3. Migrations ausführen
4. API-Routen erstellen

### Zahlungen integrieren
1. Stripe installieren
2. Webhook-Endpoints erstellen
3. Subscription-Logik implementieren
4. Payment-UI erstellen

## 🤝 Beitragen

1. Fork erstellen
2. Feature-Branch erstellen (`git checkout -b feature/amazing-feature`)
3. Änderungen committen (`git commit -m 'Add amazing feature'`)
4. Branch pushen (`git push origin feature/amazing-feature`)
5. Pull Request erstellen

## 📄 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert - siehe [LICENSE](LICENSE) Datei für Details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/saasify/saas-framework/issues)
- **Discussions**: [GitHub Discussions](https://github.com/saasify/saas-framework/discussions)
- **Email**: hello@saasify.com

## 🙏 Danksagungen

- [Next.js](https://nextjs.org/) für das großartige Framework
- [shadcn/ui](https://ui.shadcn.com/) für die UI-Komponenten
- [Tailwind CSS](https://tailwindcss.com/) für das CSS-Framework
- [Vercel](https://vercel.com/) für das Hosting

---

**Viel Erfolg mit Ihrem SaaS-Projekt! 🚀**
