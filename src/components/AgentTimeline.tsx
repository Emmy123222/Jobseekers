import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Clock, AlertCircle, Brain } from 'lucide-react'
import { AnimatedCard } from './ui/AnimatedCard'
import { AgentStep } from '../lib/apis/ioNet'

interface AgentTimelineProps {
  steps: AgentStep[]
}

const statusIcons = {
  pending: Clock,
  in_progress: Brain,
  completed: CheckCircle,
  failed: AlertCircle
}

const statusColors = {
  pending: 'text-gray-400',
  in_progress: 'text-cyan-400',
  completed: 'text-green-400',
  failed: 'text-red-400'
}

export const AgentTimeline: React.FC<AgentTimelineProps> = ({ steps }) => {
  if (steps.length === 0) return null

  return (
    <AnimatedCard className="max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">AI Agent Process</h2>
        <p className="text-gray-400">Watch how our intelligent agent processes your request</p>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const Icon = statusIcons[step.status]
          const isActive = step.status === 'in_progress'
          
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-4 p-4 bg-gray-800/30 rounded-lg border border-gray-700/50"
            >
              <div className="relative">
                <motion.div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step.status === 'completed' ? 'bg-green-500/20' :
                    step.status === 'in_progress' ? 'bg-cyan-500/20' :
                    step.status === 'failed' ? 'bg-red-500/20' :
                    'bg-gray-500/20'
                  }`}
                  animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Icon className={`w-5 h-5 ${statusColors[step.status]}`} />
                </motion.div>
                
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-cyan-400"
                    animate={{ scale: [1, 1.5], opacity: [1, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-white">{step.description}</h3>
                <p className="text-sm text-gray-400">
                  {step.timestamp.toLocaleTimeString()}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                {step.status === 'completed' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 bg-green-500 rounded-full"
                  />
                )}
                {step.status === 'in_progress' && (
                  <motion.div
                    className="w-2 h-2 bg-cyan-500 rounded-full"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </AnimatedCard>
  )
}