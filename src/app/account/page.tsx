"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Save, Trash2, User, ArrowLeft } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import Link from 'next/link'

export default function AccountPage() {
  const { user, profile, updateProfile, deleteAccount, isLoading } = useAuth()
  const router = useRouter()
  
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/')
      return
    }

    if (profile) {
      setDisplayName(profile.display_name || '')
      setUsername(profile.username || '')
      setBio(profile.bio || '')
    }
  }, [user, profile, isLoading, router])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsSaving(true)

    if (!displayName.trim()) {
      setError('Anzeigename ist erforderlich')
      setIsSaving(false)
      return
    }

    try {
      const { error } = await updateProfile({
        display_name: displayName.trim(),
        username: username.trim() || undefined,
        bio: bio.trim() || undefined
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess('Profil erfolgreich aktualisiert!')
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (err) {
      setError('Ein unerwarteter Fehler ist aufgetreten')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    setError(null)

    try {
      const { error } = await deleteAccount()
      
      if (error) {
        setError(error.message)
      } else {
        router.push('/')
      }
    } catch (err) {
      setError('Fehler beim Löschen des Accounts')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardContent className="text-center py-8">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-muted rounded w-1/4 mx-auto"></div>
                <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
                <div className="h-4 bg-muted rounded w-1/3 mx-auto"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-2xl">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück zur Startseite
            </Button>
          </Link>
        </div>

        {/* Profile Link */}
        {profile && profile.username && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Ihr öffentliches Profil</h3>
                  <p className="text-sm text-muted-foreground">
                    Sehen Sie, wie andere Ihr Profil und Ihre Geschichten sehen
                  </p>
                </div>
                <Link href={`/profile/${profile.username}`}>
                  <Button variant="outline">
                    Profil ansehen
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Account-Einstellungen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail-Adresse</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-sm text-muted-foreground">
                  Die E-Mail-Adresse kann nicht geändert werden.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Anzeigename *</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Wie sollen andere Sie sehen?"
                  required
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Benutzername</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                  placeholder="eindeutiger-name"
                  disabled={isSaving}
                />
                <p className="text-sm text-muted-foreground">
                  Nur Kleinbuchstaben und Zahlen erlaubt. Wird für Ihr Profil verwendet.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Über mich</Label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Erzählen Sie etwas über sich..."
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm resize-none"
                  rows={3}
                  maxLength={500}
                  disabled={isSaving}
                />
                <p className="text-sm text-muted-foreground">
                  {bio.length}/500 Zeichen
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-md dark:bg-red-950 dark:text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md dark:bg-green-950 dark:text-green-400">
                  {success}
                </div>
              )}

              <Button type="submit" disabled={isSaving} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Speichern...' : 'Profil speichern'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="mt-8 border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">Gefahrenbereich</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                <strong>Wichtig:</strong> Ihr Profil wird anonymisiert, aber Ihre Geschichten bleiben online und werden als &quot;Gelöschter Nutzer&quot; angezeigt. Dies kann nicht rückgängig gemacht werden.
              </p>
              <div className="bg-orange-50 dark:bg-orange-950 p-3 rounded-md">
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  ℹ️ Ihre Geschichten bleiben für die Community verfügbar - nur Ihr Profil wird entfernt.
                </p>
              </div>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Account löschen
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Account wirklich löschen?</DialogTitle>
                    <DialogDescription>
                      Ihr Profil wird anonymisiert und kann nicht wiederhergestellt werden. 
                      Ihre Geschichten bleiben aber online und werden als &quot;Gelöschter Nutzer&quot; angezeigt.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="flex gap-3 justify-end">
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        Abbrechen
                      </Button>
                    </DialogTrigger>
                    <Button 
                      variant="destructive" 
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Lösche...' : 'Endgültig löschen'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}