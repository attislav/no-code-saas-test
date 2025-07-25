"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function AuthCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          setStatus('error')
          setMessage('Fehler bei der E-Mail-Bestätigung. Bitte versuchen Sie es erneut.')
          return
        }

        if (data.session) {
          setStatus('success')
          setMessage('E-Mail erfolgreich bestätigt! Sie werden weitergeleitet...')
          
          // Redirect to homepage after success
          setTimeout(() => {
            router.push('/')
          }, 2000)
        } else {
          setStatus('error')
          setMessage('Bestätigungslink ist ungültig oder abgelaufen.')
        }
      } catch (err) {
        console.error('Unexpected error:', err)
        setStatus('error')
        setMessage('Ein unerwarteter Fehler ist aufgetreten.')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="container py-16">
      <div className="mx-auto max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              {status === 'loading' && <Loader2 className="h-5 w-5 animate-spin" />}
              {status === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
              {status === 'error' && <AlertCircle className="h-5 w-5 text-red-600" />}
              
              {status === 'loading' && 'E-Mail wird bestätigt...'}
              {status === 'success' && 'Bestätigt!'}
              {status === 'error' && 'Fehler'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className={`${
              status === 'success' ? 'text-green-600' : 
              status === 'error' ? 'text-red-600' : 
              'text-muted-foreground'
            }`}>
              {message}
            </p>
            
            {status === 'error' && (
              <div className="space-y-2">
                <Button asChild className="w-full">
                  <Link href="/">Zur Startseite</Link>
                </Button>
                <p className="text-sm text-muted-foreground">
                  Haben Sie Probleme? <Link href="/story-generator" className="text-primary hover:underline">Probieren Sie es erneut</Link>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}