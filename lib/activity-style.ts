// Centralized activity style mapping
// Provides label, color classes, optional icon name (string for now)

export interface ActivityStyle {
  label: string;
  badgeBg: string; // Tailwind bg classes
  text?: string;
  icon?: string; // Could map to lucide icon keys later
}

// Map of activity type -> style
export const activityTypeStyles: Record<string, ActivityStyle> = {
  blog: { label: 'Blog', badgeBg: 'bg-accent', text: 'text-white' },
  project: { label: 'Project', badgeBg: 'bg-primary', text: 'text-white' },
  skill: { label: 'Skill', badgeBg: 'bg-secondary', text: 'text-white' },
  experience: { label: 'Experience', badgeBg: 'bg-lime-500', text: 'text-white' },
  contact: { label: 'Contact', badgeBg: 'bg-amber-500', text: 'text-white' },
  education: { label: 'Education', badgeBg: 'bg-purple-500', text: 'text-white' },
  profile: { label: 'Profile', badgeBg: 'bg-blue-500', text: 'text-white' },
  view: { label: 'View', badgeBg: 'bg-gray-500', text: 'text-white' },
};

export function getActivityStyle(type?: string): ActivityStyle {
  if (!type) return { label: 'Other', badgeBg: 'bg-gray-500', text: 'text-white' };
  return activityTypeStyles[type] || { label: type, badgeBg: 'bg-gray-500', text: 'text-white' };
}
