import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Calendar, DollarSign, ExternalLink, FileText, Star } from 'lucide-react'
import { AnimatedCard } from './ui/AnimatedCard'
import { GlowButton } from './ui/GlowButton'
import { JobListing } from '../lib/apis/ioNet'
import { formatDate } from '../lib/utils'

interface JobCardProps {
  job: JobListing
  onGenerateCoverLetter: (job: JobListing) => void
  onApply: (job: JobListing) => void
  isGeneratingCoverLetter: boolean
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  onGenerateCoverLetter,
  onApply,
  isGeneratingCoverLetter
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const relevanceColor = 
    job.relevanceScore >= 80 ? 'text-green-400' :
    job.relevanceScore >= 60 ? 'text-yellow-400' :
    'text-orange-400'

  return (
    <AnimatedCard className="h-full">
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-1">{job.title}</h3>
            <p className="text-cyan-400 font-semibold">{job.company}</p>
          </div>
          <div className="flex items-center space-x-1">
            <Star className={`w-4 h-4 ${relevanceColor}`} />
            <span className={`font-bold ${relevanceColor}`}>
              {job.relevanceScore}%
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-400">
          <div className="flex items-center space-x-1">
            <MapPin className="w-4 h-4" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(new Date(job.postedDate))}</span>
          </div>
          {job.salary && (
            <div className="flex items-center space-x-1">
              <DollarSign className="w-4 h-4" />
              <span>{job.salary}</span>
            </div>
          )}
        </div>

        <div className="flex-1 mb-4">
          <p className="text-gray-300 text-sm leading-relaxed">
            {isExpanded ? job.description : `${job.description.substring(0, 200)}...`}
          </p>
          {job.description.length > 200 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-cyan-400 hover:text-cyan-300 text-sm mt-2 transition-colors"
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-auto">
          <GlowButton
            onClick={() => onGenerateCoverLetter(job)}
            disabled={isGeneratingCoverLetter}
            variant="secondary"
            size="sm"
            className="flex items-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Cover Letter</span>
          </GlowButton>
          
          <GlowButton
            onClick={() => onApply(job)}
            variant="primary"
            size="sm"
            className="flex items-center space-x-2"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Apply Now</span>
          </GlowButton>
        </div>
      </div>
    </AnimatedCard>
  )
}