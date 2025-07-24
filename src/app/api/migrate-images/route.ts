import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create server-side Supabase client with service_role key for full access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

// Function to download and store image in Supabase Storage
async function downloadAndStoreImage(imageUrl: string, storyId: string): Promise<string | null> {
  try {
    console.log(`Migrating image for story ${storyId}:`, imageUrl)
    
    // Skip if already a Supabase Storage URL
    if (imageUrl.includes('supabase.co/storage/')) {
      console.log('Image already in Supabase Storage, skipping')
      return imageUrl
    }
    
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
    
    const fileName = `migrated-story-${storyId}-${Date.now()}.${extension}`
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
      return null
    }
    
    console.log('Upload successful, data:', data)
    
    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('story-images')
      .getPublicUrl(fileName)
    
    const finalUrl = publicUrlData.publicUrl
    console.log('Image migrated successfully to:', finalUrl)
    return finalUrl
    
  } catch (error) {
    console.error('Error migrating image:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { dryRun = true, batchSize = 10 } = body
    
    console.log('Starting image migration...', { dryRun, batchSize })
    
    // Get all stories with external image URLs
    const { data: stories, error } = await supabase
      .from('stories')
      .select('id, title, image_url, image_status')
      .eq('image_status', 'completed')
      .not('image_url', 'is', null)
      .limit(batchSize)
    
    if (error) {
      console.error('Error fetching stories:', error)
      return NextResponse.json(
        { error: 'Failed to fetch stories' },
        { status: 500 }
      )
    }
    
    if (!stories || stories.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No stories found for migration',
        migrated: 0,
        total: 0
      })
    }
    
    // Filter out stories that already have Supabase URLs
    const storiesToMigrate = stories.filter(story => 
      story.image_url && !story.image_url.includes('supabase.co/storage/')
    )
    
    console.log(`Found ${storiesToMigrate.length} stories to migrate out of ${stories.length} total`)
    
    if (dryRun) {
      return NextResponse.json({
        success: true,
        message: 'Dry run completed',
        storiesToMigrate: storiesToMigrate.map(s => ({
          id: s.id,
          title: s.title,
          currentUrl: s.image_url
        })),
        total: storiesToMigrate.length
      })
    }
    
    // Migrate images
    const results = []
    let successCount = 0
    let errorCount = 0
    
    for (const story of storiesToMigrate) {
      try {
        console.log(`\n=== Migrating story ${story.id}: ${story.title} ===`)
        
        const newImageUrl = await downloadAndStoreImage(story.image_url!, story.id)
        
        if (newImageUrl) {
          // Update story with new image URL
          const { error: updateError } = await supabase
            .from('stories')
            .update({ 
              image_url: newImageUrl,
              updated_at: new Date().toISOString()
            })
            .eq('id', story.id)
          
          if (updateError) {
            console.error(`Failed to update story ${story.id}:`, updateError)
            results.push({ 
              id: story.id, 
              title: story.title, 
              status: 'error', 
              error: updateError.message 
            })
            errorCount++
          } else {
            console.log(`✅ Successfully migrated story ${story.id}`)
            results.push({ 
              id: story.id, 
              title: story.title, 
              status: 'success', 
              oldUrl: story.image_url,
              newUrl: newImageUrl 
            })
            successCount++
          }
        } else {
          console.error(`❌ Failed to migrate image for story ${story.id}`)
          results.push({ 
            id: story.id, 
            title: story.title, 
            status: 'error', 
            error: 'Failed to download/upload image' 
          })
          errorCount++
        }
        
        // Small delay to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 1000))
        
      } catch (error) {
        console.error(`Error processing story ${story.id}:`, error)
        results.push({ 
          id: story.id, 
          title: story.title, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        })
        errorCount++
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Migration completed: ${successCount} successful, ${errorCount} errors`,
      results,
      stats: {
        total: storiesToMigrate.length,
        successful: successCount,
        errors: errorCount
      }
    })

  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { error: `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Get migration status/stats
    const { data: allStories, error: allError } = await supabase
      .from('stories')
      .select('id, image_url, image_status')
      .eq('image_status', 'completed')
      .not('image_url', 'is', null)
    
    if (allError) {
      throw allError
    }
    
    const totalStories = allStories?.length || 0
    const migratedStories = allStories?.filter(s => 
      s.image_url && s.image_url.includes('supabase.co/storage/')
    ).length || 0
    const pendingMigration = totalStories - migratedStories
    
    return NextResponse.json({
      stats: {
        total: totalStories,
        migrated: migratedStories,
        pending: pendingMigration,
        percentage: totalStories > 0 ? Math.round((migratedStories / totalStories) * 100) : 0
      },
      ready: pendingMigration > 0
    })
    
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json(
      { error: `Failed to get stats: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}