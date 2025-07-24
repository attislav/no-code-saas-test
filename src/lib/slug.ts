/**
 * Generate a URL-friendly slug from a story title and character
 */
export function generateStorySlug(title: string, character: string, storyType: string): string {
  // Use title if available, otherwise create from character and story type
  const baseText = title || `${character} ${storyType}`
  
  return baseText
    .toLowerCase()
    // Replace German umlauts
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    // Remove special characters and replace spaces with hyphens
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .replace(/^-+|-+$/g, '')
    // Limit length
    .substring(0, 80)
}

/**
 * Generate category slug from story type
 */
export function generateCategorySlug(storyType: string): string {
  return storyType
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .replace(/^-+|-+$/g, '')
}

/**
 * Make slug unique by adding a number suffix if needed
 */
export function makeSlugUnique(baseSlug: string, existingSlugs: string[]): string {
  let slug = baseSlug
  let counter = 1
  
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`
    counter++
  }
  
  return slug
}