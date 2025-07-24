import { supabase } from "@/lib/supabase"
import { Metadata } from 'next'
import AgeFilterContent from './age-filter-content'

interface AgeFilterPageProps {
  params: Promise<{
    age: string
  }>
}

// Generate metadata for SEO
export async function generateMetadata({ params }: AgeFilterPageProps): Promise<Metadata> {
  const resolvedParams = await params
  const age = decodeURIComponent(resolvedParams.age)
  
  try {
    // Count stories for this age group
    const { count } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')
      .eq('age_group', age)
    
    const storyCount = count || 0
    const title = `Geschichten für ${age} - StoryMagic`
    const description = `Entdecken Sie ${storyCount} magische Kindergeschichten für ${age}. KI-generierte, altersgerechte Geschichten speziell für diese Altersgruppe.`
    
    const canonicalUrl = `https://no-code-saas-test.onrender.com/alter/${encodeURIComponent(age)}`
    
    return {
      title,
      description,
      keywords: [
        'Kindergeschichte',
        age,
        'KI-generiert',
        'Märchen',
        'Kinderbuch',
        'altersgerechte Geschichten',
        'Geschichten für Kinder'
      ].join(', '),
      authors: [{ name: 'StoryMagic KI' }],
      category: 'Kindergeschichten',
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        siteName: 'StoryMagic',
        type: 'website',
        images: [{
          url: 'https://no-code-saas-test.onrender.com/og-default.jpg',
          width: 1200,
          height: 630,
          alt: `Geschichten für ${age} - StoryMagic`,
        }],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: ['https://no-code-saas-test.onrender.com/twitter-default.jpg'],
      },
      alternates: {
        canonical: canonicalUrl,
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: `Geschichten für ${age} - StoryMagic`,
      description: `Magische Kindergeschichten für ${age} von StoryMagic.`
    }
  }
}

export default function AgeFilterPage({ params }: AgeFilterPageProps) {
  return <AgeFilterContent params={params} />
}