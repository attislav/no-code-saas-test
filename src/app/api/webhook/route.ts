import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateStorySlug } from '@/lib/slug'

// Create server-side Supabase client with service_role key for full access
const supabase = createClient(
  'https://cngwfskwxtafyizccbtm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuZ3dmc2t3eHRhZnlpemNjYnRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzMwNDM0OCwiZXhwIjoyMDY4ODgwMzQ4fQ.ByC8CfSFwHEEQD-HWo5_NNr3SmsS6hcWinzO2o1pSh0'
)

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
  title?: string
  slug?: string
  story?: string
  partial_story?: string
  status: 'partial' | 'completed' | 'failed'
  is_partial?: boolean
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

    if (!body.status || !['partial', 'completed', 'failed'].includes(body.status)) {
      console.error('Invalid status in webhook:', body.status)
      const response = NextResponse.json(
        { error: 'Gültiger Status ist erforderlich (partial, completed oder failed)' },
        { status: 400 }
      )
      return addCorsHeaders(response)
    }

    // Get current story data to generate slug if needed
    const { data: currentStory } = await supabase
      .from('stories')
      .select('character, story_type, slug')
      .eq('id', body.id)
      .single()

    // Store the story (partial or complete) in Supabase
    const updateData: {
      status: string
      updated_at: string
      title?: string
      slug?: string
      story?: string
      partial_story?: string
      is_partial?: boolean
    } = {
      status: body.status,
      updated_at: new Date().toISOString()
    }

    if (body.title) updateData.title = body.title
    if (body.story) updateData.story = body.story
    if (body.partial_story) updateData.partial_story = body.partial_story
    if (body.is_partial !== undefined) updateData.is_partial = body.is_partial

    // Generate slug if we have a title and don't have a slug yet
    if (body.title && currentStory && !currentStory.slug) {
      const generatedSlug = generateStorySlug(body.title, currentStory.character, currentStory.story_type)
      
      // Check if slug exists already
      const { data: existingStory } = await supabase
        .from('stories')
        .select('slug')
        .eq('slug', generatedSlug)
        .single()
      
      if (!existingStory) {
        updateData.slug = generatedSlug
      } else {
        // Generate unique slug with number suffix
        let counter = 1
        let uniqueSlug = `${generatedSlug}-${counter}`
        
        while (true) {
          const { data: conflictingStory } = await supabase
            .from('stories')
            .select('slug')
            .eq('slug', uniqueSlug)
            .single()
          
          if (!conflictingStory) {
            updateData.slug = uniqueSlug
            break
          }
          
          counter++
          uniqueSlug = `${generatedSlug}-${counter}`
        }
      }
    }
    
    // Use provided slug if available
    if (body.slug) updateData.slug = body.slug

    const { error: updateError } = await supabase
      .from('stories')
      .update(updateData)
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
      title: storyData.title,
      story: storyData.story,
      partial_story: storyData.partial_story,
      is_partial: storyData.is_partial,
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