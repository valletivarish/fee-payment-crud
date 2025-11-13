import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, Users, Calendar, DollarSign } from 'lucide-react'
import { formatCurrency, formatDate } from '../../lib/utils'
import { studentAPI, feePlanAPI } from '../../services/api'

const AssignmentModal = ({ assignment, onClose, onSave }) => {
  const [minDueDate] = useState(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tzOffset = today.getTimezoneOffset()
    const localMidnight = new Date(today.getTime() - tzOffset * 60 * 1000)
    return localMidnight.toISOString().split('T')[0]
  })
  const [formData, setFormData] = useState({
    studentId: '',
    feePlanId: '',
    dueDate: minDueDate
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionError, setSubmissionError] = useState('')

  // Fetch students from API
  const [students, setStudents] = useState([])
  const [loadingStudents, setLoadingStudents] = useState(false)

  useEffect(() => {
    const fetchStudents = async () => {
      setLoadingStudents(true)
      try {
        const response = await studentAPI.getAll()
        setStudents(response.data)
      } catch (error) {
        console.error('Failed to fetch students:', error)
        setStudents([])
      } finally {
        setLoadingStudents(false)
      }
    }
    fetchStudents()
  }, [])

  // Fetch fee plans from API
  const [feePlans, setFeePlans] = useState([])
  const [loadingFeePlans, setLoadingFeePlans] = useState(false)

  useEffect(() => {
    const fetchFeePlans = async () => {
      setLoadingFeePlans(true)
      try {
        const response = await feePlanAPI.getAll()
        setFeePlans(response.data)
      } catch (error) {
        console.error('Failed to fetch fee plans:', error)
        setFeePlans([])
      } finally {
        setLoadingFeePlans(false)
      }
    }
    fetchFeePlans()
  }, [])

  useEffect(() => {
    if (assignment) {
      setFormData({
        studentId: assignment.studentId || '',
        feePlanId: assignment.feePlanId || '',
        dueDate: assignment.dueDate || minDueDate
      })
    } else {
      setFormData(prev => ({
        ...prev,
        dueDate: minDueDate
      }))
    }
  }, [assignment, minDueDate])

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.studentId) {
      newErrors.studentId = 'Student is required'
    }
    
    if (!formData.feePlanId) {
      newErrors.feePlanId = 'Fee plan is required'
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required'
    } else {
      const selectedDate = new Date(formData.dueDate)
      const today = new Date(minDueDate)
      if (selectedDate < today) {
        newErrors.dueDate = 'Due date cannot be in the past'
      }
    }

    const selectedStudent = students.find(s => s.id === formData.studentId)
    const selectedFeePlan = feePlans.find(f => f.id === formData.feePlanId)

    if (selectedStudent && selectedFeePlan) {
      const studentCourses = extractCourses(selectedStudent)
      if (!studentCourses.length) {
        newErrors.feePlanId = 'Student does not have a valid course enrollment'
      } else if (selectedFeePlan.academicYear) {
        const parts = selectedFeePlan.academicYear.split('-')
        if (parts.length === 2) {
          const planStart = parseInt(parts[0], 10)
          const planEnd = parseInt(parts[1], 10)
          if (!Number.isNaN(planStart) && !Number.isNaN(planEnd)) {
            const matchesCourse = studentCourses.some(course => {
              if (course.startYear == null || course.endYear == null) return false
              const courseStart = Number(course.startYear)
              const courseEnd = Number(course.endYear)
              return planStart >= courseStart && planEnd <= courseEnd
            })

            if (!matchesCourse) {
              const ranges = studentCourses
                .map(course => `${course.courseName} (${course.startYear}-${course.endYear})`)
                .join(', ')
              newErrors.feePlanId = `Fee plan year must fall within the student's course duration: ${ranges}`
            }
          }
        }
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    setSubmissionError('')
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const selectedStudent = students.find(s => s.id === formData.studentId)
      const selectedFeePlan = feePlans.find(f => f.id === formData.feePlanId)
      const studentCourses = extractCourses(selectedStudent)

      let matchedCourse = null
      if (selectedFeePlan?.academicYear) {
        const parts = selectedFeePlan.academicYear.split('-')
        if (parts.length === 2) {
          const planStart = parseInt(parts[0], 10)
          const planEnd = parseInt(parts[1], 10)
          matchedCourse = studentCourses.find(course => {
            if (course.startYear == null || course.endYear == null) return false
            const courseStart = Number(course.startYear)
            const courseEnd = Number(course.endYear)
            return planStart >= courseStart && planEnd <= courseEnd
          }) || studentCourses[0]
        }
      }

      matchedCourse = matchedCourse || studentCourses[0]
      
      const assignmentData = {
        ...formData,
        studentName: selectedStudent?.firstName + ' ' + selectedStudent?.lastName,
        studentEmail: selectedStudent?.email,
        course: matchedCourse?.courseName || selectedStudent?.course,
        feePlanName: selectedFeePlan?.course + ' - ' + selectedFeePlan?.academicYear,
        totalAmount: selectedFeePlan?.total
      }
      
      await onSave(assignmentData)
    } catch (error) {
      console.error('Error saving assignment:', error)
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Unable to assign fee plan'
      setSubmissionError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const selectedStudent = students.find(s => s.id === formData.studentId)
  const selectedFeePlan = feePlans.find(f => f.id === formData.feePlanId)

  const extractCourses = (studentRecord) => {
    if (!studentRecord) return []
    if (Array.isArray(studentRecord.courses) && studentRecord.courses.length) {
      return studentRecord.courses
    }
    if (studentRecord?.course && studentRecord?.academicYear) {
      const parts = studentRecord.academicYear.split('-')
      if (parts.length === 2) {
        const start = parseInt(parts[0], 10)
        const end = parseInt(parts[1], 10)
        if (!Number.isNaN(start) && !Number.isNaN(end)) {
          return [{
            courseName: studentRecord.course,
            startYear: start,
            endYear: end,
            primary: true
          }]
        }
      }
    }
    return []
  }

  const studentCourses = selectedStudent ? extractCourses(selectedStudent) : []
  const studentPrimaryCourse = studentCourses.find(course => course.primary) || studentCourses[0] || null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="modal-overlay"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="modal-container"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-card">
            <div className="modal-header">
              <div>
                <h2 className="modal-title">
                  {assignment ? 'Edit Assignment' : 'Assign Fee Plan'}
                </h2>
                <p className="modal-description">
                  {assignment ? 'Update fee plan assignment' : 'Assign a fee plan to a student'}
                </p>
              </div>
              <button className="modal-close-button" onClick={onClose}>
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="modal-content">
              <form onSubmit={handleSubmit} className="assignment-form">
                {/* Student Selection */}
                <div className="form-field">
                  <label className="form-label">
                    <Users className="w-4 h-4" />
                    Select Student *
                  </label>
                  <select
                    value={formData.studentId}
                    onChange={(e) => handleChange('studentId', e.target.value)}
                    className={`form-select ${errors.studentId ? 'form-error' : ''}`}
                  >
                    <option value="">Choose a student</option>
                    {students.map(student => {
                      const courses = extractCourses(student)
                      const primary = courses.find(course => course.primary) || courses[0]
                      const courseLabel = primary
                        ? `${primary.courseName} (${primary.startYear}-${primary.endYear})`
                        : 'No course'
                      return (
                      <option key={student.id} value={student.id}>
                          {student.firstName} {student.lastName} - {courseLabel}
                      </option>
                      )
                    })}
                  </select>
                  {errors.studentId && (
                    <p className="form-error-message">{errors.studentId}</p>
                  )}
                </div>

                {/* Fee Plan Selection */}
                <div className="form-field">
                  <label className="form-label">
                    <DollarSign className="w-4 h-4" />
                    Select Fee Plan *
                  </label>
                  <select
                    value={formData.feePlanId}
                    onChange={(e) => handleChange('feePlanId', e.target.value)}
                    className={`form-select ${errors.feePlanId ? 'form-error' : ''}`}
                  >
                    <option value="">Choose a fee plan</option>
                    {feePlans.map(plan => (
                      <option key={plan.id} value={plan.id}>
                        {plan.course} - {plan.academicYear} - {formatCurrency(plan.total)}
                      </option>
                    ))}
                  </select>
                  {errors.feePlanId && (
                    <p className="form-error-message">{errors.feePlanId}</p>
                  )}
                </div>

                {/* Due Date */}
                <div className="form-field">
                  <label className="form-label">
                    <Calendar className="w-4 h-4" />
                    Due Date *
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => handleChange('dueDate', e.target.value)}
                    className={`form-input ${errors.dueDate ? 'form-error' : ''}`}
                    min={minDueDate}
                  />
                  {errors.dueDate && (
                    <p className="form-error-message">{errors.dueDate}</p>
                  )}
                </div>

                {/* Assignment Summary */}
                {(selectedStudent && selectedFeePlan) && (
                  <div className="assignment-summary">
                    <h4 className="assignment-summary-title">Assignment Summary</h4>
                    <div className="assignment-summary-content">
                      <div className="assignment-summary-row">
                        <span className="assignment-summary-label">Student:</span>
                        <span className="assignment-summary-value">{selectedStudent.firstName} {selectedStudent.lastName}</span>
                      </div>
                      <div className="assignment-summary-row">
                        <span className="assignment-summary-label">Course:</span>
                        <span className="assignment-summary-value">
                          {studentPrimaryCourse
                            ? `${studentPrimaryCourse.courseName} (${studentPrimaryCourse.startYear}-${studentPrimaryCourse.endYear})`
                            : 'N/A'}
                        </span>
                      </div>
                      {studentCourses.length > 1 && (
                        <div className="assignment-summary-row">
                          <span className="assignment-summary-label">Additional Courses:</span>
                          <span className="assignment-summary-value">
                            {studentCourses
                              .filter(course => !course.primary)
                              .map(course => `${course.courseName} (${course.startYear}-${course.endYear})`)
                              .join(', ')}
                          </span>
                        </div>
                      )}
                      <div className="assignment-summary-row">
                        <span className="assignment-summary-label">Fee Plan:</span>
                        <span className="assignment-summary-value">{selectedFeePlan.course} - {selectedFeePlan.academicYear}</span>
                      </div>
                      <div className="assignment-summary-row">
                        <span className="assignment-summary-label">Total Amount:</span>
                        <span className="assignment-summary-amount">
                          {formatCurrency(selectedFeePlan.total)}
                        </span>
                      </div>
                      <div className="assignment-summary-row">
                        <span className="assignment-summary-label">Due Date:</span>
                        <span className="assignment-summary-value">
                          {formData.dueDate ? formatDate(formData.dueDate) : 'Not set'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {submissionError && (
                  <div className="form-submit-error" role="alert">
                    {submissionError}
                  </div>
                )}

                <div className="form-actions">
                  <button type="button" className="btn secondary" onClick={onClose}>
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn primary"
                    disabled={isSubmitting}
                  >
                    <Save className="w-4 h-4" />
                    {isSubmitting ? 'Saving...' : (assignment ? 'Update Assignment' : 'Assign Fee Plan')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default AssignmentModal
