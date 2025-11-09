import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, User, Mail, BookOpen, Calendar, ArrowLeft, Plus, Minus, Star } from 'lucide-react'
import { validateStudent } from '../../lib/validation'
import { getCourseOptions, getDegreeOptions } from '../../services/dataService'

const createEmptyCourse = (overrides = {}) => ({
  courseName: '',
  startYear: '',
  endYear: '',
  primary: false,
  ...overrides,
})

const buildLegacyCourses = (student) => {
  if (student?.courses?.length) {
    return student.courses.map(course => ({
      courseName: course.courseName || '',
      startYear: course.startYear ?? '',
      endYear: course.endYear ?? '',
      primary: Boolean(course.primary),
    }))
  }

  if (student?.course && student?.academicYear) {
    const parts = student.academicYear.split('-')
    if (parts.length === 2) {
      return [createEmptyCourse({
        courseName: student.course,
        startYear: parts[0],
        endYear: parts[1],
        primary: true,
      })]
    }
  }

  return [createEmptyCourse({ primary: true })]
}

const StudentModal = ({ student, onClose, onSave }) => {
  const degreeOptions = useMemo(() => getDegreeOptions(), [])
  const courseOptions = useMemo(() => getCourseOptions(), [])

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    degreeType: degreeOptions[0]?.value || '',
    degreeDurationYears: degreeOptions[0]?.durationYears || '',
    courses: [createEmptyCourse({ primary: true })],
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionError, setSubmissionError] = useState('')

  useEffect(() => {
    setSubmissionError('')
    if (student) {
      const courses = buildLegacyCourses(student)
      if (!courses.some(course => course.primary)) {
        courses[0].primary = true
      }

      setFormData({
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        email: student.email || '',
        degreeType: student.degreeType || (degreeOptions[0]?.value ?? ''),
        degreeDurationYears: student.degreeDurationYears ?? (degreeOptions[0]?.durationYears ?? ''),
        courses,
      })
    } else {
      setFormData(prev => ({
        ...prev,
        degreeType: degreeOptions[0]?.value ?? '',
        degreeDurationYears: degreeOptions[0]?.durationYears ?? '',
        courses: [createEmptyCourse({ primary: true })],
      }))
    }
  }, [student, degreeOptions])

  const validateForm = () => {
    const validation = validateStudent(formData)
    setErrors(validation.errors)
    return validation.isValid
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setSubmissionError('')

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        ...formData,
        degreeDurationYears: formData.degreeDurationYears
          ? Number(formData.degreeDurationYears)
          : undefined,
        courses: formData.courses.map((course, index) => ({
          courseName: course.courseName,
          startYear: Number(course.startYear),
          endYear: Number(course.endYear),
          primary: course.primary || index === 0,
        })),
      }

      await onSave(payload)
    } catch (error) {
      console.error('Error saving student:', error)
      const apiMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Unable to save student. Please try again.'
      setSubmissionError(apiMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleDegreeChange = (value) => {
    const selectedDegree = degreeOptions.find(option => option.value === value)
    setFormData(prev => ({
      ...prev,
      degreeType: value,
      degreeDurationYears: selectedDegree?.durationYears ?? '',
      courses: value === 'DUAL'
        ? prev.courses
        : [prev.courses[0] || createEmptyCourse({ primary: true })],
    }))
    if (errors.degreeType) {
      setErrors(prev => ({ ...prev, degreeType: '' }))
    }
    if (errors.courses) {
      setErrors(prev => ({ ...prev, courses: undefined }))
    }
  }

  const handleCourseChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      courses: prev.courses.map((course, courseIndex) =>
        courseIndex === index ? { ...course, [field]: value } : course
      ),
    }))

    if (errors.courses?.[index]?.[field]) {
      setErrors(prev => {
        const updated = { ...prev }
        updated.courses = updated.courses?.map((errorEntry, errorIndex) => {
          if (errorIndex !== index) return errorEntry
          const { [field]: _removed, ...rest } = errorEntry || {}
          return rest
        })
        return updated
      })
    }
  }

  const setPrimaryCourse = (index) => {
    setFormData(prev => ({
      ...prev,
      courses: prev.courses.map((course, courseIndex) => ({
        ...course,
        primary: courseIndex === index,
      })),
    }))

    if (errors.courses) {
      setErrors(prev => {
        const updated = { ...prev }
        updated.courses = prev.courses?.map((errorEntry, errorIndex) => {
          if (errorIndex === index) {
            const { primary: _removed, ...rest } = errorEntry || {}
            return rest
          }
          return errorEntry
        })
        return updated
      })
    }
  }

  const addCourse = () => {
    if (formData.degreeType !== 'DUAL') return
    setFormData(prev => ({
      ...prev,
      courses: [...prev.courses, createEmptyCourse()],
    }))
  }

  const removeCourse = (index) => {
    if (formData.degreeType !== 'DUAL') return
    setFormData(prev => {
      if (prev.courses.length === 1) {
        return prev
      }

      const updatedCourses = prev.courses.filter((_, courseIndex) => courseIndex !== index)
      if (!updatedCourses.some(course => course.primary)) {
        updatedCourses[0].primary = true
      }

      return { ...prev, courses: updatedCourses }
    })

    if (errors.courses) {
      setErrors(prev => {
        const updated = { ...prev }
        updated.courses = prev.courses
          ?.filter((_, errorIndex) => errorIndex !== index)
          ?.map((entry, entryIndex) => {
            if (entryIndex === 0 && entry?.primary) {
              const { primary: _removed, ...rest } = entry
              return rest
            }
            return entry
          })
        return updated
      })
    }
  }

  const renderCourseError = (courseIndex, field) => {
    if (!errors.courses || !errors.courses[courseIndex]) return null
    return errors.courses[courseIndex][field]
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
          transition={{ type: 'spring', duration: 0.3 }}
          className="modal-container"
          onClick={(event) => event.stopPropagation()}
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
                      onChange={(event) => handleFieldChange('firstName', event.target.value)}
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
                      onChange={(event) => handleFieldChange('lastName', event.target.value)}
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
                    onChange={(event) => handleFieldChange('email', event.target.value)}
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    placeholder="Enter email address"
                  />
                  {errors.email && (
                    <span className="form-error">{errors.email}</span>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <label className="form-label">
                      <BookOpen className="w-4 h-4" />
                      Degree *
                    </label>
                    <select
                      value={formData.degreeType}
                      onChange={(event) => handleDegreeChange(event.target.value)}
                      className={`form-select ${errors.degreeType ? 'error' : ''}`}
                    >
                      {degreeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.degreeType && (
                      <span className="form-error">{errors.degreeType}</span>
                    )}
                  </div>

                  <div className="form-field">
                    <label className="form-label">
                      <Calendar className="w-4 h-4" />
                      Degree Duration (years)
                    </label>
                    <input
                      type="number"
                      value={formData.degreeDurationYears}
                      onChange={(event) => handleFieldChange('degreeDurationYears', event.target.value)}
                      className={`form-input ${errors.degreeDurationYears ? 'error' : ''}`}
                      min="1"
                      max="10"
                      placeholder="e.g. 4"
                    />
                    {errors.degreeDurationYears && (
                      <span className="form-error">{errors.degreeDurationYears}</span>
                    )}
                  </div>
                </div>

                <div className="form-section">
                  <div className="form-section-header">
                    <h4 className="form-section-title">Courses</h4>
                    {formData.degreeType === 'DUAL' && (
                      <button type="button" className="btn btn-secondary" onClick={addCourse}>
                        <Plus className="w-4 h-4" />
                        Add Course
                      </button>
                    )}
                  </div>

                  {Array.isArray(formData.courses) && formData.courses.map((course, index) => (
                    <div key={index} className="course-entry">
                      <div className="course-entry-header">
                        <span className="course-entry-title">Course {index + 1}</span>
                        {formData.degreeType === 'DUAL' && formData.courses.length > 1 && (
                          <button
                            type="button"
                            className="icon-button"
                            onClick={() => removeCourse(index)}
                            title="Remove course"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="form-row">
                        <div className="form-field">
                          <label className="form-label">Course Name *</label>
                          <input
                            type="text"
                            value={course.courseName}
                            onChange={(event) => handleCourseChange(index, 'courseName', event.target.value)}
                            className={`form-input ${renderCourseError(index, 'courseName') ? 'error' : ''}`}
                            list="course-options"
                            placeholder="Enter course name"
                          />
                          {renderCourseError(index, 'courseName') && (
                            <span className="form-error">{renderCourseError(index, 'courseName')}</span>
                          )}
                        </div>
                        <div className="form-field">
                          <label className="form-label">Start Year *</label>
                          <input
                            type="number"
                            value={course.startYear}
                            onChange={(event) => handleCourseChange(index, 'startYear', event.target.value)}
                            className={`form-input ${renderCourseError(index, 'startYear') ? 'error' : ''}`}
                            min="1900"
                            max="3000"
                          />
                          {renderCourseError(index, 'startYear') && (
                            <span className="form-error">{renderCourseError(index, 'startYear')}</span>
                          )}
                        </div>
                        <div className="form-field">
                          <label className="form-label">End Year *</label>
                          <input
                            type="number"
                            value={course.endYear}
                            onChange={(event) => handleCourseChange(index, 'endYear', event.target.value)}
                            className={`form-input ${renderCourseError(index, 'endYear') ? 'error' : ''}`}
                            min="1900"
                            max="3000"
                          />
                          {renderCourseError(index, 'endYear') && (
                            <span className="form-error">{renderCourseError(index, 'endYear')}</span>
                          )}
                        </div>
                      </div>

                      {formData.degreeType === 'DUAL' && (
                        <button
                          type="button"
                          className={`course-primary-toggle ${course.primary ? 'active' : ''}`}
                          onClick={() => setPrimaryCourse(index)}
                          title="Set as primary course"
                        >
                          <Star className="w-4 h-4" />
                          {course.primary ? 'Primary course' : 'Mark as primary'}
                        </button>
                      )}
                      {renderCourseError(index, 'primary') && (
                        <span className="form-error">{renderCourseError(index, 'primary')}</span>
                      )}
                    </div>
                  ))}

                  <datalist id="course-options">
                    {courseOptions.map(option => (
                      <option key={option} value={option} />
                    ))}
                  </datalist>
                </div>

                {submissionError && (
                  <div className="form-submit-error" role="alert">
                    {submissionError}
                  </div>
                )}

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
