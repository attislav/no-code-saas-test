import { UserProfile } from './supabase'

// Helper function to get display name for user (handles deleted users)
export function getDisplayName(profile: UserProfile | null | undefined): string {
  if (!profile) return 'Unbekannter Nutzer'
  if (profile.is_deleted) return 'Gelöschter Nutzer'
  return profile.display_name || 'Unbekannter Nutzer'
}

// Helper function to get username for URLs (handles deleted users)
export function getUsername(profile: UserProfile | null | undefined): string | null {
  if (!profile || profile.is_deleted) return null
  return profile.username || null
}

// Helper function to check if user profile is active
export function isActiveUser(profile: UserProfile | null | undefined): boolean {
  return profile !== null && profile !== undefined && !profile.is_deleted
}

// Helper function to get safe avatar URL (handles deleted users)
export function getAvatarUrl(profile: UserProfile | null | undefined): string | null {
  if (!profile || profile.is_deleted) return null
  return profile.avatar_url || null
}

// Helper function to get safe bio (handles deleted users)
export function getBio(profile: UserProfile | null | undefined): string | null {
  if (!profile || profile.is_deleted) return null
  return profile.bio || null
}

// Helper function to get author display for stories
export function getAuthorDisplay(profile: UserProfile | null | undefined): string {
  if (!profile) return 'Anonymer Autor'
  if (profile.is_deleted) return 'Gelöschter Nutzer'
  return profile.display_name || 'Unbekannter Autor'
}