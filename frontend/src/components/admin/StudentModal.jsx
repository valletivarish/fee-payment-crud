import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, User, Mail, BookOpen, Calendar, ArrowLeft } from 'lucide-react'
// Removed UI component imports to use custom CSS classes
import { validateStudent } from '../../lib/validation'
import { getCourseOptions, getAcademicYearOptions } from '../../services/dataService'

const StudentModal = ({ student, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    course: '',
    academicYear: ''
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const courseOptions = getCourseOptions()
  const academicYearOptions = getAcademicYearOptions()

  useEffect(() => {
    if (student) {
      setFormData({
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        email: student.email || '',
        course: student.course || '',
        academicYear: student.academicYear || ''
      })
    }
  }, [student])

  const validateForm = () => {
    const validation = validateStudent(formData)
    setErrors(validation.errors)
    return validation.isValid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      await onSave(formData)
    } catch (error) {
      console.error('Error saving student:', error)
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
              <div className="modal-header-content">
                <button className="back-button" onClick={onClose} title="Back">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h3 className="modal-title">
                    {student ? 'Edit Student' : 'Add New Student'}
                  </h3>
                  <p className="modal-description">
                    {student ? 'Update student information' : 'Enter student details to create a new record'}
                  </p>
                </div>
              </div>
              <button className="modal-close-button" onClick={onClose}>
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="modal-content">
              <form onSubmit={handleSubmit} className="student-form">
                <div className="form-row">
                  <div className="form-field">
                    <label className="form-label">
                      <User className="w-4 h-4" />
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      className={`form-input ${errors.firstName ? 'error' : ''}`}
                      placeholder="Enter first name"
                    />
                    {errors.firstName && (
                      <span className="form-error">{errors.firstName}</span>
                    )}
                  </div>
                  
                  <div className="form-field">
                    <label className="form-label">
                      <User className="w-4 h-4" />
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                      className={`form-input ${errors.lastName ? 'error' : ''}`}
                      placeholder="Enter last name"
                    />
                    {errors.lastName && (
                      <span className="form-error">{errors.lastName}</span>
                    )}
                  </div>
                </div>

                <div className="form-field">
                  <label className="form-label">
                    <Mail className="w-4 h-4" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    placeholder="Enter email address"
                  />
                  {errors.email && (
                    <span className="form-error">{errors.email}</span>
                  )}
                </div>

                <div className="form-field">
                  <label className="form-label">
                    <BookOpen className="w-4 h-4" />
                    Course *
                  </label>
                  <select
                    value={formData.course}
                    onChange={(e) => handleChange('course', e.target.value)}
                    className={`form-select ${errors.course ? 'error' : ''}`}
                  >
                    <option value="">Select a course</option>
                    {courseOptions.map(course => (
                      <option key={course} value={course}>
                        {course}
                      </option>
                    ))}
                  </select>
                  {errors.course && (
                    <span className="form-error">{errors.course}</span>
                  )}
                </div>

                <div className="form-field">
                  <label className="form-label">
                    <Calendar className="w-4 h-4" />
                    Academic Year *
                  </label>
                  <select
                    value={formData.academicYear}
                    onChange={(e) => handleChange('academicYear', e.target.value)}
                    className={`form-select ${errors.academicYear ? 'error' : ''}`}
                  >
                    <option value="">Select academic year</option>
                    {academicYearOptions.map(year => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  {errors.academicYear && (
                    <span className="form-error">{errors.academicYear}</span>
                  )}
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-outline" onClick={onClose}>
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    <Save className="w-4 h-4" />
                    {isSubmitting ? 'Saving...' : (student ? 'Update Student' : 'Add Student')}
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

export default StudentModal
