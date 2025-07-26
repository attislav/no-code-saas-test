import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create server-side Supabase client with service_role key for full access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

interface GenerateStoryRequest {
  character: string
  ageGroup: string
  extraWishes: string
  storyType: string
  readingTime: string
  authorId?: string | null
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateStoryRequest = await request.json()
    
    console.log('Generate story request:', {
      character: body.character?.substring(0, 50) + '...',
      ageGroup: body.ageGroup,
      storyType: body.storyType,
      readingTime: body.readingTime,
      extraWishes: body.extraWishes?.substring(0, 50) + '...'
    })
    
    if (!body.character || !body.ageGroup || !body.storyType || !body.readingTime) {
      console.error('Missing required fields:', { 
        character: !!body.character, 
        ageGroup: !!body.ageGroup, 
        storyType: !!body.storyType,
        readingTime: !!body.readingTime
      })
      return NextResponse.json(
        { error: 'Charakter, Alter Zielgruppe, Art der Geschichte und Geschichtenlänge sind erforderlich' },
        { status: 400 }
      )
    }

    // Create story record in Supabase
    const { data: newStory, error: insertError } = await supabase
      .from('stories')
      .insert({
        character: body.character,
        age_group: body.ageGroup,
        story_type: body.storyType,
        extra_wishes: body.extraWishes || null,
        author_id: body.authorId || null,
        status: 'generating'
      })
      .select()
      .single()
    
    if (insertError || !newStory) {
      console.error('Error creating story in Supabase:', insertError)
      return NextResponse.json(
        { error: 'Fehler beim Erstellen der Geschichte' },
        { status: 500 }
      )
    }
    
    const storyId = newStory.id

    // Prepare webhook payload
    const webhookPayload = {
      id: storyId,
      character: body.character,
      ageGroup: body.ageGroup,
      extraWishes: body.extraWishes || '',
      storyType: body.storyType,
      readingTime: body.readingTime,
      timestamp: new Date().toISOString()
    }

    console.log('Sending to Make.com webhook:', webhookPayload)

    // Send to Make.com webhook
    const webhookResponse = await fetch('https://hook.eu2.make.com/wmyxb5dkavglxbsc2e2pzp7ytjmvv2ga', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    })

    console.log('Make.com webhook response status:', webhookResponse.status)

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text()
      console.error('Make.com webhook error:', {
        status: webhookResponse.status,
        statusText: webhookResponse.statusText,
        body: errorText
      })
      
      return NextResponse.json(
        { error: `Webhook-Fehler (${webhookResponse.status}): ${errorText}` },
        { status: 500 }
      )
    }

    const result = await webhookResponse.json().catch(() => ({ success: true }))
    console.log('Make.com webhook success response:', result)
    
    return NextResponse.json({
      id: storyId,
      status: 'generating',
      message: 'Geschichte wird erstellt...'
    })

  } catch (error) {
    console.error('Story generation error:', error)
    return NextResponse.json(
      { error: `Interner Server-Fehler: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}