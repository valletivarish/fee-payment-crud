import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, Shield, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { studentAPI } from '../services/api'
import axios from 'axios'
import { API_BASE_URL } from '../config'

const LandingPage = () => {
  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [environmentMode, setEnvironmentMode] = useState('')
  const [demoMode, setDemoMode] = useState(false)
  const [appInfoLoading, setAppInfoLoading] = useState(true)
  const [appInfoError, setAppInfoError] = useState('')

  const activeDemoMode = appInfoLoading ? false : demoMode

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  }

  useEffect(() => {
    const fetchAppInfo = async () => {
      try {
        setAppInfoLoading(true)
        const response = await axios.get(`${API_BASE_URL}/config/app-info`)
        const { environmentMode: mode, demoMode: isDemo } = response.data || {}
        const normalizedMode = (mode || '').toString().toUpperCase()
        setEnvironmentMode(normalizedMode)
        setDemoMode(Boolean(isDemo))
      } catch (err) {
        console.error('Error fetching app info:', err)
        setAppInfoError('Unable to determine deployment mode.')
        setEnvironmentMode('DEMO MODE')
        setDemoMode(true)
      } finally {
        setAppInfoLoading(false)
      }
    }

    fetchAppInfo()
  }, [])

  useEffect(() => {
    if (demoMode) {
      fetchStudents()
    } else {
      setStudents([])
      setLoading(false)
      setError('')
    }
  }, [demoMode])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const response = await studentAPI.getAll()
      setStudents(response.data || [])
    } catch (err) {
      setError('Failed to load students')
      console.error('Error fetching students:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAdminAction = () => {
    if (activeDemoMode) {
      navigate('/admin')
    } else {
      navigate('/login/admin')
    }
  }

  const handleAdminKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleAdminAction()
    }
  }

  const handleStudentLogin = () => {
    navigate('/login/student')
  }

  useEffect(() => {
    const baseTitle = 'Fee Management System'
    const modeLabel = demoMode ? 'Demo' : 'Production'
    document.title = `${baseTitle} - ${modeLabel}`
  }, [demoMode])


  return (
    <div className="landing-page" role="main" aria-label="Fee Management System Landing Page">
      <div className="landing-content">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="landing-container"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="landing-header">
            <h1 className="landing-title">
              Fee Management System
            </h1>
            <p className="landing-subtitle">
              Professional fee collection and student management platform
            </p>
            {!appInfoLoading && (
              <p className="landing-subtitle" aria-live="polite">
                {environmentMode === 'PRODUCTION MODE'
                  ? 'Production environment'
                  : environmentMode === 'DEMO MODE'
                    ? 'Demo environment'
                    : 'Connecting...'}
              </p>
            )}
          </motion.div>


          {/* Role Selection Cards */}
          <motion.div variants={itemVariants} className="role-selection">
            <div className="role-cards">
              {/* Admin Card */}
              <div
                className="role-card-wrapper"
                onClick={handleAdminAction}
                role="button"
                tabIndex={0}
                aria-label="Continue as Administrator"
                onKeyDown={handleAdminKeyDown}
              >
                <Card className="role-card admin-card">
                  <CardContent className="role-card-content">
                    <div className="role-icon admin-icon">
                      <Shield className="role-icon-svg" />
                    </div>
                    <h3 className="role-title">Administrator</h3>
                    <p className="role-description">
                      Manage students, create fee plans, assign fees, and track payments across the institution.
                    </p>
                    <Button 
                      variant="primary" 
                      size="lg"
                      className="role-button"
                    >
                      {activeDemoMode ? 'Continue as Admin' : 'Admin Login'}
                      <ArrowRight className="button-arrow" />
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Student Card */}
              <div className="role-card-wrapper">
                <Card className="role-card student-card">
                  <CardContent className="role-card-content">
                    <div className="role-icon student-icon">
                      <Users className="role-icon-svg" />
                    </div>
                    <h3 className="role-title">Student</h3>
                    <p className="role-description">
                      View your fees, make payments, and track your payment history.
                    </p>
                    
                    {error && activeDemoMode && (
                      <div className="error-message">
                        {error}
                      </div>
                    )}
                    
                    {activeDemoMode ? (
                      loading ? (
                      <div className="loading-container" role="status" aria-label="Loading students">
                        <div className="loading-spinner"></div>
                        <p className="loading-text">Loading students...</p>
                      </div>
                    ) : students.length > 0 ? (
                      <div className="student-selection">
                        <label className="student-label" htmlFor="student-select">Select Student:</label>
                        <select 
                          id="student-select"
                          className="student-select"
                          onChange={(e) => {
                            const studentId = e.target.value
                            if (studentId) {
                              navigate(`/student/${studentId}`)
                            }
                          }}
                          defaultValue=""
                          aria-label="Choose a student to continue"
                        >
                          <option value="">Choose a student...</option>
                          {students.map(student => (
                            <option key={student.id} value={student.id}>
                              {student.firstName} {student.lastName} - {student.course}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="no-students" role="status" aria-label="No students available">
                        <p className="no-students-text">No students found</p>
                        </div>
                      )
                    ) : (
                      <div className="student-selection" role="group" aria-label="Student Login">
                        <Button 
                          variant="primary" 
                          size="lg"
                          className="role-button"
                          onClick={handleStudentLogin}
                        >
                          Student Login
                          <ArrowRight className="button-arrow" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </div>
  )
}

export default LandingPage