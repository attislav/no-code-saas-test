# StoryMagic Roadmap

## ✅ Abgeschlossene Features

### Authentifizierung & Nutzerprofile
- [x] Benutzeranmeldung/-registrierung mit Supabase
- [x] E-Mail-Bestätigung und Callback-Handling
- [x] Benutzerprofile mit Anzeigename, Benutzername und Bio
- [x] Soft Delete für Account-Löschung (Geschichten bleiben erhalten)
- [x] Account-Einstellungsseite

### Story-Autor Integration
- [x] author_id Spalte zu stories Tabelle hinzugefügt
- [x] Geschichten werden automatisch dem eingeloggten Benutzer zugeordnet
- [x] Autor-Anzeige auf allen Story-Seiten
- [x] Behandlung von gelöschten Benutzern und anonymen Autoren

### Benutzerprofile
- [x] Dynamische Profilseiten unter `/profile/[username]`
- [x] Anzeige von Benutzerinfo (Avatar, Bio, Mitglied seit)
- [x] Auflistung aller veröffentlichten Geschichten des Benutzers
- [x] Klickbare Autor-Links in der gesamten App
- [x] Profil-Vorschau-Link in Account-Einstellungen

## 🔄 Nächste Features (Priorität: Mittel)

### Profilbild-Upload
- [ ] Upload-Funktionalität für Profilbilder
- [ ] Integration mit Supabase Storage
- [ ] Bildgrößenanpassung und Komprimierung
- [ ] Avatar-Anzeige in allen Komponenten

### Bewertungssystem
- [ ] Sterne-Bewertungssystem für Geschichten (1-5 Sterne)
- [ ] Durchschnittsbewertung pro Geschichte
- [ ] Benutzer können nur einmal pro Geschichte bewerten
- [ ] Anzeige der Bewertungen auf Story-Cards und Detail-Seiten

### Sammlungen-System
- [ ] Benutzer können Geschichten in Sammlungen speichern
- [ ] Private/öffentliche Sammlungen
- [ ] Sammlung erstellen/bearbeiten/löschen
- [ ] "Zu Sammlung hinzufügen" Button auf Story-Seiten
- [ ] Sammlungsübersicht auf Profilseiten

### Kommentar-System
- [ ] Kommentare für Geschichten
- [ ] Verschachtelte Antworten (1 Ebene)
- [ ] Moderation von Kommentaren
- [ ] E-Mail-Benachrichtigungen für Autoren

## 🔄 Zukünftige Features (Priorität: Niedrig)

### Sortierung & Filter
- [ ] Sortierung nach Bewertung und Popularität
- [ ] Erweiterte Filteroptionen
- [ ] "Trending" Geschichten
- [ ] "Empfohlen für Sie" basierend auf Lesegewohnheiten

### Social Features
- [ ] Benutzer folgen/entfolgen
- [ ] Activity Feed für gefolgte Benutzer
- [ ] Benachrichtigungssystem
- [ ] Teilen von Geschichten auf sozialen Medien

### Erweiterte Story Features
- [ ] Story-Serien (mehrteilige Geschichten)
- [ ] Kapitel-Navigation
- [ ] Lesezeichen für längere Geschichten
- [ ] PDF-Export mit besserem Styling

### Analytics & Insights
- [ ] Story-Aufrufe und Statistiken für Autoren
- [ ] Beliebteste Charaktere/Themen
- [ ] Lesezeit-Tracking
- [ ] Dashboard für Content-Ersteller

### Content Management
- [ ] Story-Entwürfe speichern
- [ ] Story bearbeiten nach Veröffentlichung
- [ ] Bulk-Operationen für Autoren
- [ ] Content-Moderation Tools

## 🛠 Technische Verbesserungen

### Performance
- [ ] Image Lazy Loading optimieren
- [ ] Bundle Size Reduzierung
- [ ] Caching Strategien
- [ ] SEO Optimierungen

### Mobile Experience
- [ ] PWA Support
- [ ] Offline-Modus für gespeicherte Geschichten
- [ ] Mobile-spezifische UI Verbesserungen
- [ ] Touch Gesten für Navigation

### Accessibility
- [ ] Screen Reader Optimierungen
- [ ] Keyboard Navigation
- [ ] High Contrast Modus
- [ ] Font Size Controls

## 📝 Notizen

### Datenbank Schema Erweiterungen
Für zukünftige Features werden folgende Tabellen benötigt:

```sql
-- Bewertungen
CREATE TABLE story_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(story_id, user_id)
);

-- Sammlungen
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE collection_stories (
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (collection_id, story_id)
);

-- Kommentare
CREATE TABLE story_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES story_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_moderated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Follows
CREATE TABLE user_follows (
  follower_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);
```

### Story-Autor Integration Status
Die Story-Autor Integration ist vollständig implementiert:
- ✅ Alle Story-Abfragen laden Autor-Informationen via JOIN
- ✅ `getAuthorDisplay()` Utility-Funktion behandelt alle Zustände
- ✅ Anonyme Autoren: "Anonymer Autor"
- ✅ Gelöschte Benutzer: "Gelöschter Nutzer" 
- ✅ Aktive Benutzer: Anzeigename mit klickbarem Profil-Link
- ✅ Story-Generator ordnet Stories automatisch eingeloggten Benutzern zu