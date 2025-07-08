import React from 'react'
import { motion } from 'framer-motion'
import { Briefcase, TrendingUp, MapPin } from 'lucide-react'
import { JobCard } from './JobCard'
import { JobListing } from '../lib/apis/ioNet'

interface JobResultsProps {
  jobs: JobListing[]
  onGenerateCoverLetter: (job: JobListing) => void
  onApply: (job: JobListing) => void
  isGeneratingCoverLetter: boolean
}

export const JobResults: React.FC<JobResultsProps> = ({
  jobs,
  onGenerateCoverLetter,
  onApply,
  isGeneratingCoverLetter
}) => {
  if (jobs.length === 0) return null

  const avgRelevance = Math.round(jobs.reduce((sum, job) => sum + job.relevanceScore, 0) / jobs.length)
  const topJobs = jobs.filter(job => job.relevanceScore >= 80).length
  const locations = [...new Set(jobs.map(job => job.location))].length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">Job Search Results</h2>
        <div className="flex flex-wrap justify-center gap-8 text-sm">
          <div className="flex items-center space-x-2">
            <Briefcase className="w-5 h-5 text-cyan-400" />
            <span className="text-gray-400">
              <span className="text-white font-semibold">{jobs.length}</span> jobs found
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className="text-gray-400">
              <span className="text-white font-semibold">{avgRelevance}%</span> avg relevance
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-purple-400" />
            <span className="text-gray-400">
              <span className="text-white font-semibold">{locations}</span> locations
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job, index) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <JobCard
              job={job}
              onGenerateCoverLetter={onGenerateCoverLetter}
              onApply={onApply}
              isGeneratingCoverLetter={isGeneratingCoverLetter}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}