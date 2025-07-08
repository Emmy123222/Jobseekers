import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, MapPin, Briefcase } from 'lucide-react'
import { AnimatedCard } from './ui/AnimatedCard'
import { GlowButton } from './ui/GlowButton'

interface JobSearchPanelProps {
  onSearch: (query: string, location: string) => void
  isLoading: boolean
}

export const JobSearchPanel: React.FC<JobSearchPanelProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query.trim(), location.trim())
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <AnimatedCard className="max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Find Your Perfect Job</h2>
        <p className="text-gray-400">Let our AI agent search and rank jobs based on your resume</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 mt-6 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Job title, skills, or company..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
          />
        </div>
        
        <div className="flex-1 relative">
          <MapPin className="absolute left-3 mt-6 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Location (optional)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
          />
        </div>
        
        <GlowButton
          onClick={handleSearch}
          disabled={!query.trim() || isLoading}
          className="flex items-center space-x-2"
        >
          <Briefcase className="w-5 h-5" />
          <span>{isLoading ? 'Searching...' : 'Search Jobs'}</span>
        </GlowButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="flex items-center space-x-2 text-gray-400">
          <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
          <span>AI-powered job matching</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-400">
          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          <span>Relevance scoring</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-400">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Multiple job sources</span>
        </div>
      </div>
    </AnimatedCard>
  )
}