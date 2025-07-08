import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Bot, Rocket, Star } from 'lucide-react'
import { FloatingPlanets } from './components/ui/FloatingPlanets'
import { ResumeUploader } from './components/ResumeUploader'
import { JobSearchPanel } from './components/JobSearchPanel'
import { AgentTimeline } from './components/AgentTimeline'
import { JobResults } from './components/JobResults'
import { CoverLetterModal } from './components/CoverLetterModal'
import { ApplicationTracker } from './components/ApplicationTracker'
import { ParsedResume, parseResume, generateCoverLetter, searchJobs, JobListing, AgentStep } from './lib/apis/ioNet'
import { supabase } from './lib/supabase'

function App() {
  const [resumeData, setResumeData] = useState<ParsedResume | null>(null)
  const [jobs, setJobs] = useState<JobListing[]>([])
  const [agentSteps, setAgentSteps] = useState<AgentStep[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false)
  const [coverLetterModal, setCoverLetterModal] = useState<{
    isOpen: boolean
    job: JobListing | null
    coverLetter: string
  }>({
    isOpen: false,
    job: null,
    coverLetter: ''
  })
  const [activeTab, setActiveTab] = useState<'search' | 'tracker'>('search')

  const handleResumeUploaded = (resume: ParsedResume) => {
    setResumeData(resume)
  }

  const handleJobSearch = async (query: string, location: string) => {
    if (!resumeData) return

    setIsSearching(true)
    setJobs([])
    setAgentSteps([])

    try {
      const foundJobs = await searchJobs(
        query,
        location,
        resumeData.skills,
        (step) => {
          setAgentSteps(prev => {
            const existing = prev.find(s => s.id === step.id)
            if (existing) {
              return prev.map(s => s.id === step.id ? step : s)
            }
            return [...prev, step]
          })
        }
      )

      setJobs(foundJobs)
    } catch (error) {
      console.error('Job search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleGenerateCoverLetter = async (job: JobListing) => {
    if (!resumeData) return

    setIsGeneratingCoverLetter(true)

    try {
      const coverLetter = await generateCoverLetter(
        job.description,
        resumeData,
        { tone: 'formal', language: 'english' }
      )

      setCoverLetterModal({
        isOpen: true,
        job,
        coverLetter
      })
    } catch (error) {
      console.error('Cover letter generation failed:', error)
    } finally {
      setIsGeneratingCoverLetter(false)
    }
  }

  const handleRegenerateCoverLetter = async (options: { tone: 'formal' | 'friendly', language: 'english' | 'french' }) => {
    if (!resumeData || !coverLetterModal.job) return

    setIsGeneratingCoverLetter(true)

    try {
      const coverLetter = await generateCoverLetter(
        coverLetterModal.job.description,
        resumeData,
        options
      )

      setCoverLetterModal(prev => ({
        ...prev,
        coverLetter
      }))
    } catch (error) {
      console.error('Cover letter regeneration failed:', error)
    } finally {
      setIsGeneratingCoverLetter(false)
    }
  }

  const handleApplyToJob = async (job: JobListing) => {
    try {
      await supabase
        .from('applications')
        .insert([
          {
            job_title: job.title,
            company: job.company,
            applied_date: new Date().toISOString(),
            status: 'applied',
            job_url: job.url
          }
        ])

      // Open job URL in new tab
      window.open(job.url, '_blank')
    } catch (error) {
      console.error('Error tracking application:', error)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <FloatingPlanets />
      
      <div className="relative z-10">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container mx-auto px-4 py-8"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Bot className="w-10 h-10 text-cyan-400" />
                <motion.div
                  className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Smart Job Agent
                </h1>
                <p className="text-gray-400 text-sm">AI-Powered Job Hunting Assistant</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveTab('search')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'search' 
                    ? 'bg-cyan-500 text-black' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Job Search
              </button>
              <button
                onClick={() => setActiveTab('tracker')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'tracker' 
                    ? 'bg-cyan-500 text-black' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Applications
              </button>
            </div>
          </div>

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Rocket className="w-8 h-8 text-cyan-400" />
              <h2 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Launch IO Hackathon
              </h2>
              <Star className="w-8 h-8 text-yellow-400" />
            </div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experience the future of job hunting with our AI-powered agent that scans resumes, 
              finds relevant jobs, generates custom cover letters, and tracks your applications.
            </p>
          </motion.div>
        </motion.header>

        {/* Main Content */}
        <main className="container mx-auto px-4 space-y-12">
          {activeTab === 'search' ? (
            <>
              {/* Resume Upload */}
              {!resumeData && (
                <ResumeUploader onResumeUploaded={handleResumeUploaded} />
              )}

              {/* Job Search */}
              {resumeData && (
                <JobSearchPanel
                  onSearch={handleJobSearch}
                  isLoading={isSearching}
                />
              )}

              {/* Agent Timeline */}
              {agentSteps.length > 0 && (
                <AgentTimeline steps={agentSteps} />
              )}

              {/* Job Results */}
              {jobs.length > 0 && (
                <JobResults
                  jobs={jobs}
                  onGenerateCoverLetter={handleGenerateCoverLetter}
                  onApply={handleApplyToJob}
                  isGeneratingCoverLetter={isGeneratingCoverLetter}
                />
              )}
            </>
          ) : (
            <ApplicationTracker />
          )}
        </main>

        {/* Cover Letter Modal */}
        <CoverLetterModal
          isOpen={coverLetterModal.isOpen}
          onClose={() => setCoverLetterModal(prev => ({ ...prev, isOpen: false }))}
          job={coverLetterModal.job}
          coverLetter={coverLetterModal.coverLetter}
          onRegenerateCoverLetter={handleRegenerateCoverLetter}
        />

        {/* Footer */}
        <footer className="container mx-auto px-4 py-12 mt-20">
          <div className="text-center text-gray-500">
            <p>Powered by IO Intelligence API • Built for Launch IO Hackathon</p>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default App