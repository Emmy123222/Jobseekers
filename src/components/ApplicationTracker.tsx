import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Clock, Eye, Send } from 'lucide-react'
import { AnimatedCard } from './ui/AnimatedCard'
import { formatDate } from '../lib/utils'
import { supabase } from '../lib/supabase'

interface Application {
  id: string
  job_title: string
  company: string
  applied_date: string
  status: 'applied' | 'cover_letter_generated' | 'company_viewed' | 'interviewed' | 'rejected' | 'accepted'
  job_url: string
}

export const ApplicationTracker: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('applied_date', { ascending: false })

      if (error) throw error
      setApplications(data || [])
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const statusIcons = {
    applied: Send,
    cover_letter_generated: CheckCircle,
    company_viewed: Eye,
    interviewed: CheckCircle,
    rejected: CheckCircle,
    accepted: CheckCircle
  }

  const statusColors = {
    applied: 'text-blue-400',
    cover_letter_generated: 'text-cyan-400',
    company_viewed: 'text-purple-400',
    interviewed: 'text-yellow-400',
    rejected: 'text-red-400',
    accepted: 'text-green-400'
  }

  const statusLabels = {
    applied: 'Applied',
    cover_letter_generated: 'Cover Letter Generated',
    company_viewed: 'Company Viewed',
    interviewed: 'Interviewed',
    rejected: 'Rejected',
    accepted: 'Accepted'
  }

  if (loading) {
    return (
      <AnimatedCard className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full"
          />
        </div>
      </AnimatedCard>
    )
  }

  return (
    <AnimatedCard className="max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Application Tracker</h2>
        <p className="text-gray-400">Track your job applications and their progress</p>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">No applications yet. Start applying to jobs!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app, index) => {
            const StatusIcon = statusIcons[app.status]
            return (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-4 p-4 bg-gray-800/30 rounded-lg border border-gray-700/50 hover:border-cyan-500/20 transition-colors"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gray-700/50`}>
                  <StatusIcon className={`w-5 h-5 ${statusColors[app.status]}`} />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{app.job_title}</h3>
                  <p className="text-sm text-gray-400">{app.company}</p>
                </div>
                
                <div className="text-right">
                  <p className={`text-sm font-semibold ${statusColors[app.status]}`}>
                    {statusLabels[app.status]}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(new Date(app.applied_date))}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </AnimatedCard>
  )
}