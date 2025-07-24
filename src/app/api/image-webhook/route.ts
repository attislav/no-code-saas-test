import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create server-side Supabase client with service_role key for full access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
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

interface ImageWebhookRequest {
  id: string // Story ID
  image_url?: string
  image_status: 'generating' | 'completed' | 'failed'
  error?: string
}

// Function to download and store image in Supabase Storage
async function downloadAndStoreImage(imageUrl: string, storyId: string): Promise<string | null> {
  try {
    console.log('Downloading image:', imageUrl)
    
    // Download the image
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`)
    }
    
    const arrayBuffer = await response.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)
    
    // Get file extension from URL or default to jpg
    const urlParts = imageUrl.split('.')
    const extension = urlParts.length > 1 ? urlParts.pop()?.toLowerCase() || 'jpg' : 'jpg'
    const fileName = `story-${storyId}-${Date.now()}.${extension}`
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('story-images')
      .upload(fileName, buffer, {
        contentType: `image/${extension === 'jpg' ? 'jpeg' : extension}`,
        upsert: false
      })
    
    if (error) {
      console.error('Supabase storage upload error:', error)
      return null
    }
    
    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('story-images')
      .getPublicUrl(fileName)
    
    console.log('Image stored successfully:', publicUrlData.publicUrl)
    return publicUrlData.publicUrl
    
  } catch (error) {
    console.error('Error downloading/storing image:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check API key authorization via query parameter
    const { searchParams } = new URL(request.url)
    const queryApiKey = searchParams.get('key')
    const expectedApiKey = process.env.WEBHOOK_API_KEY
    
    if (!expectedApiKey || queryApiKey !== expectedApiKey) {
      console.error('Unauthorized image webhook access attempt', { providedKey: queryApiKey })
      const response = NextResponse.json(
        { error: 'Unauthorized - Invalid API key' },
        { status: 401 }
      )
      return addCorsHeaders(response)
    }
    
    const body: ImageWebhookRequest = await request.json()
    
    console.log('Image webhook received:', {
      id: body.id,
      image_status: body.image_status,
      hasImageUrl: !!body.image_url,
      error: body.error
    })
    
    if (!body.id) {
      console.error('Missing story ID in image webhook')
      const response = NextResponse.json(
        { error: 'Story ID ist erforderlich' },
        { status: 400 }
      )
      return addCorsHeaders(response)
    }

    if (!body.image_status || !['generating', 'completed', 'failed'].includes(body.image_status)) {
      console.error('Invalid image status in webhook:', body.image_status)
      const response = NextResponse.json(
        { error: 'Gültiger Image-Status ist erforderlich (generating, completed oder failed)' },
        { status: 400 }
      )
      return addCorsHeaders(response)
    }

    // Download and store image if URL provided and status is completed
    let finalImageUrl = body.image_url
    if (body.image_url && body.image_status === 'completed') {
      console.log('Downloading and storing image for story:', body.id)
      const storedImageUrl = await downloadAndStoreImage(body.image_url, body.id)
      if (storedImageUrl) {
        finalImageUrl = storedImageUrl
        console.log('Image successfully stored, using stored URL')
      } else {
        console.error('Failed to store image, using original URL as fallback')
        // Keep original URL as fallback
      }
    }

    // Update story with image information
    const updateData: {
      image_status: string
      updated_at: string
      image_url?: string
    } = {
      image_status: body.image_status,
      updated_at: new Date().toISOString()
    }

    if (finalImageUrl) {
      updateData.image_url = finalImageUrl
    }

    const { error: updateError } = await supabase
      .from('stories')
      .update(updateData)
      .eq('id', body.id)
    
    if (updateError) {
      console.error('Error updating story image in Supabase:', updateError)
      const response = NextResponse.json(
        { error: 'Fehler beim Speichern des Bildes' },
        { status: 500 }
      )
      return addCorsHeaders(response)
    }
    
    console.log(`Story ${body.id} image ${body.image_status} saved to Supabase`)
    
    const response = NextResponse.json({
      success: true,
      message: `Bild ${body.image_status === 'completed' ? 'erfolgreich empfangen' : 'als fehlgeschlagen markiert'}`
    })
    
    return addCorsHeaders(response)

  } catch (error) {
    console.error('Image webhook error:', error)
    const response = NextResponse.json(
      { error: `Interner Server-Fehler: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
    return addCorsHeaders(response)
  }
}