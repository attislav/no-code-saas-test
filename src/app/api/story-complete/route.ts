import { NextRequest, NextResponse } from 'next/server'

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

// In-memory storage for demo (in production, use a database)
const storyStorage = new Map<string, StoryCompleteRequest>()

export async function POST(request: NextRequest) {
  try {
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

    // Store the completed story
    storyStorage.set(body.id, body)
    
    console.log(`Story ${body.id} ${body.status}. Storage size:`, storyStorage.size)
    
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

    const storyData = storyStorage.get(storyId)
    
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
      error: storyData.error
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