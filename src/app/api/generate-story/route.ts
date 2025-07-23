import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create server-side Supabase client with explicit values
const supabase = createClient(
  'https://cngwfskwxtafyizccbtm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuZ3dmc2t3eHRhZnlpemNjYnRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMDQzNDgsImV4cCI6MjA2ODg4MDM0OH0.mgYRg7kzc9i2kzLM2kZaL2pcRBeKObLfu-JL7ShoDyo'
)

interface GenerateStoryRequest {
  character: string
  ageGroup: string
  extraWishes: string
  storyType: string
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateStoryRequest = await request.json()
    
    console.log('Generate story request:', {
      character: body.character?.substring(0, 50) + '...',
      ageGroup: body.ageGroup,
      storyType: body.storyType,
      extraWishes: body.extraWishes?.substring(0, 50) + '...'
    })
    
    if (!body.character || !body.ageGroup || !body.storyType) {
      console.error('Missing required fields:', { 
        character: !!body.character, 
        ageGroup: !!body.ageGroup, 
        storyType: !!body.storyType 
      })
      return NextResponse.json(
        { error: 'Charakter, Alter Zielgruppe und Art der Geschichte sind erforderlich' },
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