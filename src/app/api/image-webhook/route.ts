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
    console.log('Downloading image from:', imageUrl)
    
    // Download the image
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    if (!response.ok) {
      console.error(`Failed to download image: ${response.status} ${response.statusText}`)
      return null
    }
    
    const arrayBuffer = await response.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)
    console.log(`Downloaded image size: ${buffer.length} bytes`)
    
    // Get file extension from URL or content-type
    let extension = 'jpg'
    const contentType = response.headers.get('content-type')
    if (contentType?.includes('png')) extension = 'png'
    else if (contentType?.includes('webp')) extension = 'webp'
    else if (contentType?.includes('gif')) extension = 'gif'
    
    const fileName = `story-${storyId}-${Date.now()}.${extension}`
    console.log(`Uploading to Supabase Storage as: ${fileName}`)
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('story-images')
      .upload(fileName, buffer, {
        contentType: contentType || 'image/jpeg',
        upsert: false
      })
    
    if (error) {
      console.error('Supabase storage upload error:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      
      // Try to get more details about the bucket
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
      console.log('Available buckets:', buckets?.map(b => ({ name: b.name, public: b.public })))
      if (bucketsError) console.error('Buckets error:', bucketsError)
      
      // Check if bucket exists and try to create it
      const storyImagesBucket = buckets?.find(bucket => bucket.name === 'story-images')
      if (!storyImagesBucket) {
        console.log('story-images bucket not found, trying to create...')
        const { data: createData, error: createError } = await supabase.storage.createBucket('story-images', {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
          fileSizeLimit: 10485760 // 10MB
        })
        console.log('Bucket creation result:', createData)
        if (createError) console.error('Bucket creation error:', createError)
        
        // Retry upload after bucket creation
        if (!createError) {
          const { data: retryData, error: retryError } = await supabase.storage
            .from('story-images')
            .upload(fileName, buffer, {
              contentType: contentType || 'image/jpeg',
              upsert: false
            })
          
          if (retryError) {
            console.error('Retry upload failed:', retryError)
            return null
          } else {
            console.log('Retry upload successful:', retryData)
          }
        }
      }
      
      if (error) return null
    }
    
    console.log('Upload successful, data:', data)
    
    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('story-images')
      .getPublicUrl(fileName)
    
    const finalUrl = publicUrlData.publicUrl
    console.log('Image stored successfully at:', finalUrl)
    return finalUrl
    
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
      console.log('========================================')
      console.log('DOWNLOADING AND STORING IMAGE')
      console.log('Story ID:', body.id)
      console.log('Original URL:', body.image_url)
      console.log('========================================')
      
      const storedImageUrl = await downloadAndStoreImage(body.image_url, body.id)
      if (storedImageUrl) {
        finalImageUrl = storedImageUrl
        console.log('✅ SUCCESS: Image successfully stored')
        console.log('New URL:', storedImageUrl)
      } else {
        console.error('❌ FAILED: Could not store image, using original URL as fallback')
        console.log('Fallback URL:', body.image_url)
        // Keep original URL as fallback
      }
      console.log('========================================')
    } else {
      console.log('Skipping image download - Status:', body.image_status, 'Has URL:', !!body.image_url)
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