import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const storyTypes = [
  "Abenteuer",
  "Märchen", 
  "Lerngeschichte",
  "Gute-Nacht-Geschichte",
  "Freundschaftsgeschichte",
  "Tiergeschichte"
]

const ageGroups = [
  "3-4 Jahre",
  "4-6 Jahre", 
  "6-8 Jahre",
  "8-10 Jahre",
  "10-12 Jahre"
]

export async function POST(request: NextRequest) {
  try {
    console.log('Generating random story data...')
    
    // Check API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not configured')
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    // Randomly select age group and story type
    const randomAgeGroup = ageGroups[Math.floor(Math.random() * ageGroups.length)]
    const randomStoryType = storyTypes[Math.floor(Math.random() * storyTypes.length)]
    
    console.log('Random selections:', { randomAgeGroup, randomStoryType })

    // Generate creative character and extra wishes using OpenAI
    const prompt = `Erstelle für eine Kindergeschichte:

1. Einen interessanten Hauptcharakter (1-2 Sätze, kreativ und kindgerecht für ${randomAgeGroup})
2. Einen passenden Extrawunsch/Lernziel (1 Satz, passend für ${randomStoryType})

WICHTIG: Verwende vielfältige und originelle Charaktere! Vermeide häufige Namen wie Luna, Max, Emma. 
Sei kreativ mit Tieren, Fantasiewesen, Robotern, oder ungewöhnlichen Charakteren.

Format:
CHARAKTER: [Beschreibung]
EXTRAWUNSCH: [Wunsch]

Kreative Beispiele:
CHARAKTER: Ein sprechender Pingpongball namens Hüpfi
CHARAKTER: Ein schüchterner Riese, der gerne winzige Blumen züchtet  
CHARAKTER: Eine Katze, die nur rückwärts laufen kann
CHARAKTER: Ein Roboter, der ständig seine Farbe wechselt`

    // Add random seed to make each request more unique
    const randomSeed = Math.floor(Math.random() * 1000000)
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Du bist ein kreativer Assistent für Kindergeschichten. Erstelle kindgerechte, positive und fantasievolle Charaktere und Lernziele. Sei besonders originell und vermeide häufige Namen oder Klischees. Zufallszahl: ${randomSeed}`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 1.2, // Maximum creativity
      top_p: 0.9, // Add more randomness
      frequency_penalty: 0.8, // Avoid repetitive content
      presence_penalty: 0.6, // Encourage new topics
    })

    const aiResponse = completion.choices[0]?.message?.content || ''
    console.log('OpenAI response:', aiResponse)

    // Parse the AI response
    const characterMatch = aiResponse.match(/CHARAKTER:\s*(.+?)(?=\nEXTRAWUNSCH:|$)/s)
    const extraWishMatch = aiResponse.match(/EXTRAWUNSCH:\s*(.+?)$/s)

    const character = characterMatch?.[1]?.trim() || "Ein mutiger kleiner Held"
    const extraWishes = extraWishMatch?.[1]?.trim() || "Soll eine wichtige Lebenslehre enthalten"

    const randomData = {
      character,
      ageGroup: randomAgeGroup,
      storyType: randomStoryType,
      extraWishes
    }

    console.log('Generated random story data:', randomData)

    return NextResponse.json({
      success: true,
      data: randomData
    })

  } catch (error) {
    console.error('Error generating random story data:', error)
    
    // Fallback data if OpenAI fails
    const fallbackData = {
      character: "Ein mutiger kleiner Abenteurer",
      ageGroup: ageGroups[Math.floor(Math.random() * ageGroups.length)],
      storyType: storyTypes[Math.floor(Math.random() * storyTypes.length)],
      extraWishes: "Soll eine wichtige Lebenslehre enthalten"
    }

    return NextResponse.json({
      success: true,
      data: fallbackData,
      fallback: true
    })
  }
}