import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Add CORS headers to response
function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

// Handle preflight OPTIONS request
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 })
  return addCorsHeaders(response)
}

interface StoryCompleteRequest {
  id: string
  story: string
  status: 'completed' | 'failed'
  error?: string
}

// Using Supabase for persistent storage

export async function POST(request: NextRequest) {
  try {
    // Check API key authorization via query parameter (works around Vercel SSO)
    const { searchParams } = new URL(request.url)
    const queryApiKey = searchParams.get('key')
    const expectedApiKey = process.env.WEBHOOK_API_KEY
    
    if (!expectedApiKey || queryApiKey !== expectedApiKey) {
      console.error('Unauthorized webhook access attempt', { providedKey: queryApiKey })
      const response = NextResponse.json(
        { error: 'Unauthorized - Invalid API key' },
        { status: 401 }
      )
      return addCorsHeaders(response)
    }
    
    const body: StoryCompleteRequest = await request.json()
    
    console.log('Story complete webhook received:', {
      id: body.id,
      status: body.status,
      hasStory: !!body.story,
      error: body.error
    })
    
    if (!body.id) {
      console.error('Missing story ID in webhook')
      const response = NextResponse.json(
        { error: 'Story ID ist erforderlich' },
        { status: 400 }
      )
      return addCorsHeaders(response)
    }

    if (!body.status || !['completed', 'failed'].includes(body.status)) {
      console.error('Invalid status in webhook:', body.status)
      const response = NextResponse.json(
        { error: 'Gültiger Status ist erforderlich (completed oder failed)' },
        { status: 400 }
      )
      return addCorsHeaders(response)
    }

    // Store the completed story in Supabase
    const { error: updateError } = await supabase
      .from('stories')
      .update({
        story: body.story,
        status: body.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', body.id)
    
    if (updateError) {
      console.error('Error updating story in Supabase:', updateError)
      const response = NextResponse.json(
        { error: 'Fehler beim Speichern der Geschichte' },
        { status: 500 }
      )
      return addCorsHeaders(response)
    }
    
    console.log(`Story ${body.id} ${body.status} saved to Supabase`)
    
    const response = NextResponse.json({
      success: true,
      message: `Geschichte ${body.status === 'completed' ? 'erfolgreich empfangen' : 'als fehlgeschlagen markiert'}`
    })
    
    return addCorsHeaders(response)

  } catch (error) {
    console.error('Story complete webhook error:', error)
    const response = NextResponse.json(
      { error: `Interner Server-Fehler: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
    return addCorsHeaders(response)
  }
}

// GET endpoint to check story status (called by frontend)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const storyId = searchParams.get('id')
    
    if (!storyId) {
      const response = NextResponse.json(
        { error: 'Story ID ist erforderlich' },
        { status: 400 }
      )
      return addCorsHeaders(response)
    }

    // Get story from Supabase
    const { data: storyData, error: fetchError } = await supabase
      .from('stories')
      .select('*')
      .eq('id', storyId)
      .single()
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching story from Supabase:', fetchError)
      const response = NextResponse.json(
        { error: 'Fehler beim Laden der Geschichte' },
        { status: 500 }
      )
      return addCorsHeaders(response)
    }
    
    if (!storyData) {
      const response = NextResponse.json({
        id: storyId,
        status: 'generating',
        message: 'Geschichte wird noch erstellt...'
      })
      return addCorsHeaders(response)
    }

    const response = NextResponse.json({
      id: storyData.id,
      status: storyData.status,
      story: storyData.story,
      error: null
    })
    return addCorsHeaders(response)

  } catch (error) {
    console.error('Story status check error:', error)
    const response = NextResponse.json(
      { error: `Interner Server-Fehler: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
    return addCorsHeaders(response)
  }
}