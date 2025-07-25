# Supabase Email Template Setup

## 1. URL Konfiguration (WICHTIG)

**Supabase Dashboard → Authentication → URL Configuration:**

- **Site URL**: `https://yourdomain.com`
- **Redirect URLs**: `https://yourdomain.com/auth/callback`

## 2. Email Templates anpassen

**Supabase Dashboard → Authentication → Templates:**

### Confirm signup Template:

```html
<h2>Willkommen bei StoryMagic! 🎪</h2>

<p>Hallo!</p>

<p>Vielen Dank für Ihre Registrierung bei <strong>StoryMagic</strong> - Ihrer KI-powered Geschichten-Platform!</p>

<p>Bitte bestätigen Sie Ihre E-Mail-Adresse, um mit dem Erstellen magischer Kindergeschichten zu beginnen:</p>

<p><a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #3B82F6; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">E-Mail bestätigen</a></p>

<p>Oder kopieren Sie diesen Link in Ihren Browser:</p>
<p><a href="{{ .ConfirmationURL }}">{{ .ConfirmationURL }}</a></p>

<hr>

<p><small>Diese E-Mail wurde automatisch gesendet. Bitte antworten Sie nicht darauf.</small></p>

<p><small>Falls Sie sich nicht bei StoryMagic registriert haben, können Sie diese E-Mail ignorieren.</small></p>
```

### Magic Link Template:

```html
<h2>Anmeldung bei StoryMagic 🎪</h2>

<p>Hallo!</p>

<p>Klicken Sie auf den folgenden Link, um sich bei <strong>StoryMagic</strong> anzumelden:</p>

<p><a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #3B82F6; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Bei StoryMagic anmelden</a></p>

<p>Oder kopieren Sie diesen Link in Ihren Browser:</p>
<p><a href="{{ .ConfirmationURL }}">{{ .ConfirmationURL }}</a></p>

<hr>

<p><small>Diese E-Mail wurde automatisch gesendet. Bitte antworten Sie nicht darauf.</small></p>

<p><small>Falls Sie diese Anmeldung nicht angefordert haben, können Sie diese E-Mail ignorieren.</small></p>
```

### Recovery/Reset Password Template:

```html
<h2>Passwort zurücksetzen - StoryMagic 🎪</h2>

<p>Hallo!</p>

<p>Sie haben eine Passwort-Zurücksetzung für Ihr <strong>StoryMagic</strong> Konto angefordert.</p>

<p>Klicken Sie auf den folgenden Link, um ein neues Passwort zu erstellen:</p>

<p><a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #3B82F6; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Neues Passwort erstellen</a></p>

<p>Oder kopieren Sie diesen Link in Ihren Browser:</p>
<p><a href="{{ .ConfirmationURL }}">{{ .ConfirmationURL }}</a></p>

<p><strong>Wichtig:</strong> Dieser Link ist nur 24 Stunden gültig.</p>

<hr>

<p><small>Diese E-Mail wurde automatisch gesendet. Bitte antworten Sie nicht darauf.</small></p>

<p><small>Falls Sie diese Passwort-Zurücksetzung nicht angefordert haben, können Sie diese E-Mail ignorieren.</small></p>
```

## 3. Email Settings

**Subject Lines anpassen:**

- **Confirm signup**: "Willkommen bei StoryMagic - E-Mail bestätigen"
- **Magic Link**: "Ihr StoryMagic Anmeldungs-Link"
- **Recovery**: "StoryMagic - Passwort zurücksetzen"

## 4. Absender konfigurieren

**SMTP Settings (Optional für Custom Domain):**

Falls Sie eine eigene Domain verwenden möchten:
- **From Email**: `noreply@yourdomain.com` 
- **From Name**: `StoryMagic Team`

## 5. Testing

Nach der Konfiguration:
1. Neue Registrierung testen
2. Email-Bestätigung testen
3. Redirect zur `/auth/callback` überprüfen