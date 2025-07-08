import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import { AnimatedCard } from './ui/AnimatedCard'
import { GlowButton } from './ui/GlowButton'
import { parseResume, ParsedResume } from '../lib/apis/ioNet'

interface ResumeUploaderProps {
  onResumeUploaded: (resume: ParsedResume) => void
}

export const ResumeUploader: React.FC<ResumeUploaderProps> = ({ onResumeUploaded }) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    // Early validation for file size
    if (file.size > 1048576) { // 1MB
      setError('File size exceeds 1MB. Please upload a smaller file or shorten the resume to under 300,000 characters.');
      return;
    }

    setUploadedFile(file)
    setIsProcessing(true)
    setError(null)

    try {
      // Read file content
      const text = await readFileContent(file)

      // Early validation for character count
      if (text.length > 300000) {
        throw new Error('Resume text exceeds 300,000 characters. Please shorten the resume or use a text-based format.');
      }
      
      // Parse resume using IO Models API
      const parsedResume = await parseResume(text)
      
      onResumeUploaded(parsedResume)
    } catch (err) {
      console.error('Resume upload error:', err)
      if (err instanceof Error && (err.message.includes('Total tokens') || err.message.includes('Bad Request'))) {
        setError(
          'Your resume is too large. Please shorten it to under 300,000 characters or use a text-based format (TXT) for best results.'
        )
      } else {
        setError('Failed to process resume. Please ensure the file is a valid PDF, DOCX, or TXT (preferably TXT) and try again.')
      }
    } finally {
      setIsProcessing(false)
    }
  }, [onResumeUploaded])

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string)
        } else {
          reject(new Error('Failed to read file'))
        }
      }
      reader.onerror = () => reject(new Error('Error reading file'))
      reader.readAsText(file)
    })
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
    maxSize: 1048576, // 1MB limit
    disabled: isProcessing
  })

  return (
    <AnimatedCard className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Upload Your Resume</h2>
        <p className="text-gray-400">Upload your resume (max 1MB, preferably TXT) to get started with AI-powered job matching</p>
      </div>

      <motion.div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300
          ${isDragActive ? 'border-cyan-400 bg-cyan-500/10' : 'border-gray-600 hover:border-cyan-500/50'}
          ${isProcessing ? 'pointer-events-none opacity-50' : ''}
        `}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-4">
          {isProcessing ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full"
            />
          ) : uploadedFile ? (
            <CheckCircle className="w-16 h-16 text-green-500" />
          ) : (
            <Upload className="w-16 h-16 text-gray-400" />
          )}
          
          <div>
            {isProcessing ? (
              <p className="text-lg font-semibold text-cyan-400">Processing resume...</p>
            ) : uploadedFile ? (
              <div>
                <p className="text-lg font-semibold text-green-400">Resume uploaded successfully!</p>
                <p className="text-sm text-gray-400 mt-1">{uploadedFile.name}</p>
              </div>
            ) : (
              <div>
                <p className="text-lg font-semibold text-white">
                  {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume here'}
                </p>
                <p className="text-sm text-gray-400 mt-1">or click to browse (max 1MB, TXT preferred)</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-center space-x-2 text-sm text-gray-400">
          <FileText className="w-4 h-4" />
          <span>Supports PDF, DOCX, and TXT files (TXT preferred)</span>
        </div>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-2"
        >
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="text-red-400">{error}</span>
        </motion.div>
      )}

      {uploadedFile && !error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 flex justify-center"
        >
          <GlowButton onClick={() => setUploadedFile(null)} variant="secondary" size="sm">
            Upload Different Resume
          </GlowButton>
        </motion.div>
      )}
    </AnimatedCard>
  )
}