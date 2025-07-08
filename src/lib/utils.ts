import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

export function calculateRelevanceScore(jobDescription: string, resumeSkills: string[]): number {
  const jobWords = jobDescription.toLowerCase().split(/\W+/)
  const skillMatches = resumeSkills.filter(skill => 
    jobWords.some(word => word.includes(skill.toLowerCase()))
  )
  return Math.min(Math.round((skillMatches.length / resumeSkills.length) * 100), 100)
}