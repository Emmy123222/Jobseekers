import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Download, Copy, CheckCircle } from 'lucide-react'
import { GlowButton } from './ui/GlowButton'
import { JobListing } from '../lib/apis/ioNet'

interface CoverLetterModalProps {
  isOpen: boolean
  onClose: () => void
  job: JobListing | null
  coverLetter: string
  onRegenerateCoverLetter: (options: { tone: 'formal' | 'friendly', language: 'english' | 'french' }) => void
}

export const CoverLetterModal: React.FC<CoverLetterModalProps> = ({
  isOpen,
  onClose,
  job,
  coverLetter,
  onRegenerateCoverLetter
}) => {
  const [tone, setTone] = useState<'formal' | 'friendly'>('formal')
  const [language, setLanguage] = useState<'english' | 'french'>('english')
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(coverLetter)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([coverLetter], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cover-letter-${job?.company}-${job?.title}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!isOpen || !job) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[90vh] bg-gray-900 rounded-xl border border-cyan-500/20 overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">Cover Letter Generated</h2>
            <p className="text-gray-400">{job.title} at {job.company}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-semibold text-gray-300">Tone:</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as 'formal' | 'friendly')}
                className="px-3 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm"
              >
                <option value="formal">Formal</option>
                <option value="friendly">Friendly</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm font-semibold text-gray-300">Language:</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'english' | 'french')}
                className="px-3 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm"
              >
                <option value="english">English</option>
                <option value="french">French</option>
              </select>
            </div>
            
            <GlowButton
              onClick={() => onRegenerateCoverLetter({ tone, language })}
              variant="secondary"
              size="sm"
            >
              Regenerate
            </GlowButton>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-6 mb-6">
            <pre className="whitespace-pre-wrap text-gray-300 font-mono text-sm leading-relaxed">
              {coverLetter}
            </pre>
          </div>
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-700">
          <div className="flex space-x-3">
            <GlowButton
              onClick={handleCopy}
              variant={copied ? 'success' : 'secondary'}
              size="sm"
              className="flex items-center space-x-2"
            >
              {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </GlowButton>
            
            <GlowButton
              onClick={handleDownload}
              variant="primary"
              size="sm"
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </GlowButton>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}