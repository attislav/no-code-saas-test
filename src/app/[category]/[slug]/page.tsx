import { supabase, Story } from "@/lib/supabase"
import { generateCategorySlug } from "@/lib/slug"
import { Metadata } from 'next'
import StoryContent from './story-content'

interface StoryPageProps {
  params: Promise<{
    category: string
    slug: string
  }>
}

// Generate metadata for SEO
export async function generateMetadata({ params }: StoryPageProps): Promise<Metadata> {
  const resolvedParams = await params
  const category = decodeURIComponent(resolvedParams.category)
  const slug = decodeURIComponent(resolvedParams.slug)
  
  try {
    // Fetch story data for meta tags
    const { data: story } = await supabase
      .from('stories')
      .select('*')
      .eq('slug', slug)
      .single()
    
    if (!story) {
      return {
        title: 'Geschichte nicht gefunden - StoryMagic',
        description: 'Die gewünschte Geschichte konnte nicht gefunden werden.'
      }
    }
    
    const title = story.title || `${story.character} - ${story.story_type}`
    const description = story.story 
      ? story.story.replace(/<[^>]*>/g, '').substring(0, 160) + '...'
      : `Eine ${story.story_type} für ${story.age_group} über ${story.character}`
    
    const canonicalUrl = `https://no-code-saas-test.onrender.com/${encodeURIComponent(category)}/${slug}`
    
    return {
      title: `${title} - StoryMagic`,
      description,
      keywords: [
        'Kindergeschichte',
        story.story_type,
        story.age_group,
        'KI-generiert',
        'Märchen',
        'Kinderbuch',
        story.character
      ].join(', '),
      authors: [{ name: 'StoryMagic KI' }],
      category: story.story_type,
      openGraph: {
        title: `${title} - StoryMagic`,
        description,
        url: canonicalUrl,
        siteName: 'StoryMagic',
        type: 'article',
        images: story.image_url ? [
          {
            url: story.image_url,
            width: 1200,
            height: 630,
            alt: title,
          }
        ] : [
          {
            url: 'https://no-code-saas-test.onrender.com/og-default.jpg',
            width: 1200,
            height: 630,
            alt: 'StoryMagic - Magische Kindergeschichten',
          }
        ],
        publishedTime: story.created_at,
        modifiedTime: story.updated_at,
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title} - StoryMagic`,
        description,
        images: story.image_url ? [story.image_url] : ['https://no-code-saas-test.onrender.com/twitter-default.jpg'],
      },
      alternates: {
        canonical: canonicalUrl,
      },
      other: {
        'article:author': 'StoryMagic KI',
        'article:section': story.story_type,
        'article:tag': [story.story_type, story.age_group, story.character].join(','),
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'StoryMagic - Magische Kindergeschichten',
      description: 'Entdecken Sie magische KI-generierte Kindergeschichten für alle Altersgruppen.'
    }
  }
}

export default function StoryPage({ params }: StoryPageProps) {
  return <StoryContent params={params} />
}