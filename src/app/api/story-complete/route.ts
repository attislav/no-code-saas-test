import { NextRequest, NextResponse } from 'next/server'

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
      return NextResponse.json(
        { error: 'Story ID ist erforderlich' },
        { status: 400 }
      )
    }

    if (!body.status || !['completed', 'failed'].includes(body.status)) {
      console.error('Invalid status in webhook:', body.status)
      return NextResponse.json(
        { error: 'Gültiger Status ist erforderlich (completed oder failed)' },
        { status: 400 }
      )
    }

    // Store the completed story
    storyStorage.set(body.id, body)
    
    console.log(`Story ${body.id} ${body.status}. Storage size:`, storyStorage.size)
    
    return NextResponse.json({
      success: true,
      message: `Geschichte ${body.status === 'completed' ? 'erfolgreich empfangen' : 'als fehlgeschlagen markiert'}`
    })

  } catch (error) {
    console.error('Story complete webhook error:', error)
    return NextResponse.json(
      { error: `Interner Server-Fehler: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}

// GET endpoint to check story status (called by frontend)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const storyId = searchParams.get('id')
    
    if (!storyId) {
      return NextResponse.json(
        { error: 'Story ID ist erforderlich' },
        { status: 400 }
      )
    }

    const storyData = storyStorage.get(storyId)
    
    if (!storyData) {
      return NextResponse.json({
        id: storyId,
        status: 'generating',
        message: 'Geschichte wird noch erstellt...'
      })
    }

    return NextResponse.json({
      id: storyData.id,
      status: storyData.status,
      story: storyData.story,
      error: storyData.error
    })

  } catch (error) {
    console.error('Story status check error:', error)
    return NextResponse.json(
      { error: `Interner Server-Fehler: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}