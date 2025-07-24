import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create server-side Supabase client with service_role key for full access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    console.log('Testing Supabase Storage configuration...')
    
    // Test 1: List all buckets
    console.log('Step 1: Listing buckets...')
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    console.log('Buckets:', buckets)
    console.log('Buckets error:', bucketsError)
    
    // Test 2: Check if story-images bucket exists
    const storyImagesBucket = buckets?.find(bucket => bucket.name === 'story-images')
    console.log('Story-images bucket found:', !!storyImagesBucket)
    
    // Test 3: Try to create bucket if it doesn't exist
    if (!storyImagesBucket) {
      console.log('Step 2: Creating story-images bucket...')
      const { data: createData, error: createError } = await supabase.storage.createBucket('story-images', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        fileSizeLimit: 10485760 // 10MB
      })
      console.log('Create bucket result:', createData)
      console.log('Create bucket error:', createError)
    }
    
    // Test 4: List files in bucket
    console.log('Step 3: Listing files in story-images bucket...')
    const { data: files, error: filesError } = await supabase.storage
      .from('story-images')
      .list('', { limit: 10 })
    console.log('Files in bucket:', files)
    console.log('Files error:', filesError)
    
    // Test 5: Upload a test image
    console.log('Step 4: Testing upload...')
    const testBuffer = Buffer.from('test-image-data', 'utf8')
    const testFileName = `test-${Date.now()}.txt`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('story-images')
      .upload(testFileName, testBuffer, {
        contentType: 'text/plain',
        upsert: false
      })
    
    console.log('Upload result:', uploadData)
    console.log('Upload error:', uploadError)
    
    // Test 6: Get public URL for test file
    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage
        .from('story-images')
        .getPublicUrl(testFileName)
      console.log('Public URL:', publicUrlData.publicUrl)
    }
    
    return NextResponse.json({
      success: true,
      results: {
        buckets: buckets?.map(b => ({ name: b.name, public: b.public })),
        storyImagesBucketExists: !!storyImagesBucket,
        filesInBucket: files?.length || 0,
        uploadTest: uploadError ? { error: uploadError.message } : { success: true },
        logs: 'Check server console for detailed logs'
      }
    })
    
  } catch (error) {
    console.error('Storage test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      logs: 'Check server console for detailed logs'
    }, { status: 500 })
  }
}