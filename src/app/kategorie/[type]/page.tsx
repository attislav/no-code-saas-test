import { supabase } from "@/lib/supabase"
import { Metadata } from 'next'
import TypeFilterContent from './type-filter-content'

interface TypeFilterPageProps {
  params: Promise<{
    type: string
  }>
}

// Generate metadata for SEO
export async function generateMetadata({ params }: TypeFilterPageProps): Promise<Metadata> {
  const resolvedParams = await params
  const type = decodeURIComponent(resolvedParams.type)
  
  try {
    // Count stories for this type
    const { count } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')
      .eq('story_type', type)
    
    const storyCount = count || 0
    const title = `${type}-Geschichten - StoryMagic`
    const description = `Entdecken Sie ${storyCount} magische ${type}-Geschichten für Kinder. KI-generierte Kindergeschichten in der Kategorie ${type}.`
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    const canonicalUrl = `${baseUrl}/kategorie/${encodeURIComponent(type)}`;
    
    return {
      title,
      description,
      keywords: [
        'Kindergeschichte',
        type,
        'KI-generiert',
        'Märchen',
        'Kinderbuch',
        'Geschichten für Kinder'
      ].join(', '),
      authors: [{ name: 'StoryMagic KI' }],
      category: type,
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        siteName: 'StoryMagic',
        type: 'website',
        images: [{
          url: `${baseUrl}/og-default.jpg`,
          width: 1200,
          height: 630,
          alt: `${type}-Geschichten - StoryMagic`,
        }],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [`${baseUrl}/twitter-default.jpg`],
      },
      alternates: {
        canonical: canonicalUrl,
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: `${type}-Geschichten - StoryMagic`,
      description: `Magische ${type}-Geschichten für Kinder von StoryMagic.`
    }
  }
}

export default function TypeFilterPage({ params }: TypeFilterPageProps) {
  return <TypeFilterContent params={params} />
}