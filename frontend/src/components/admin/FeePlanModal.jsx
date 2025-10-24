import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, BookOpen, Calendar, DollarSign, ArrowLeft } from 'lucide-react'
import { formatCurrency } from '../../lib/utils'
import { getCourseOptions, getAcademicYearOptions } from '../../services/dataService'

const FeePlanModal = ({ feePlan, onClose, onSave, viewMode = false }) => {
  const [formData, setFormData] = useState({
    course: '',
    academicYear: '',
    tuition: '',
    hostel: '',
    library: '',
    lab: '',
    sports: ''
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const courseOptions = getCourseOptions()
  const academicYearOptions = getAcademicYearOptions()

  useEffect(() => {
    if (feePlan) {
      setFormData({
        course: feePlan.course || '',
        academicYear: feePlan.academicYear || '',
        tuition: feePlan.tuition?.toString() || '',
        hostel: feePlan.hostel?.toString() || '',
        library: feePlan.library?.toString() || '',
        lab: feePlan.lab?.toString() || '',
        sports: feePlan.sports?.toString() || ''
      })
    }
  }, [feePlan])

  const calculateTotal = () => {
    const tuition = parseFloat(formData.tuition) || 0
    const hostel = parseFloat(formData.hostel) || 0
    const library = parseFloat(formData.library) || 0
    const lab = parseFloat(formData.lab) || 0
    const sports = parseFloat(formData.sports) || 0
    return tuition + hostel + library + lab + sports
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.course.trim()) {
      newErrors.course = 'Course is required'
    }
    
    if (!formData.academicYear.trim()) {
      newErrors.academicYear = 'Academic year is required'
    }
    
    if (!formData.tuition || parseFloat(formData.tuition) <= 0) {
      newErrors.tuition = 'Tuition fee must be greater than 0'
    }
    
    if (!formData.hostel || parseFloat(formData.hostel) < 0) {
      newErrors.hostel = 'Hostel fee cannot be negative'
    }
    
    if (!formData.library || parseFloat(formData.library) < 0) {
      newErrors.library = 'Library fee cannot be negative'
    }
    
    if (!formData.lab || parseFloat(formData.lab) < 0) {
      newErrors.lab = 'Lab fee cannot be negative'
    }
    
    if (!formData.sports || parseFloat(formData.sports) < 0) {
      newErrors.sports = 'Sports fee cannot be negative'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const feePlanData = {
        ...formData,
        tuition: parseFloat(formData.tuition),
        hostel: parseFloat(formData.hostel),
        library: parseFloat(formData.library),
        lab: parseFloat(formData.lab),
        sports: parseFloat(formData.sports),
        total: calculateTotal()
      }
      await onSave(feePlanData)
    } catch (error) {
      console.error('Error saving fee plan:', error)
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
          className="modal-container fee-plan-modal"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-card">
            <div className="modal-header">
              <div className="modal-header-content">
                <button className="back-button" onClick={onClose} title="Back">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h2 className="modal-title">
                    {viewMode ? 'View Fee Plan' : feePlan ? 'Edit Fee Plan' : 'Create Fee Plan'}
                  </h2>
                  <p className="modal-description">
                    {viewMode ? 'View fee structure details' : feePlan ? 'Update fee structure' : 'Define fee structure for a course and academic year'}
                  </p>
                </div>
              </div>
              <button className="modal-close-button" onClick={onClose}>
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="modal-content">
              <form onSubmit={handleSubmit} className="fee-plan-form">
                {/* Basic Information */}
                <div className="form-row">
                  <div className="form-field">
                    <label className="form-label">
                      <BookOpen className="w-4 h-4 inline mr-1" />
                      Course *
                    </label>
                    <select
                      value={formData.course}
                      onChange={(e) => handleChange('course', e.target.value)}
                      className={`form-select ${errors.course ? 'form-error' : ''}`}
                      disabled={viewMode}
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
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Academic Year *
                    </label>
                    <select
                      value={formData.academicYear}
                      onChange={(e) => handleChange('academicYear', e.target.value)}
                      className={`form-select ${errors.academicYear ? 'form-error' : ''}`}
                      disabled={viewMode}
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
                </div>

                {/* Fee Structure */}
                <div className="fee-structure-section">
                  <h3 className="fee-structure-title">Fee Structure</h3>
                  <div className="fee-grid">
                    <div className="form-field">
                      <label className="form-label">
                        <DollarSign className="w-4 h-4 inline mr-1" />
                        Tuition Fee *
                      </label>
                      <input
                        type="number"
                        value={formData.tuition}
                        onChange={(e) => handleChange('tuition', e.target.value)}
                        className={`form-input ${errors.tuition ? 'form-error' : ''}`}
                        placeholder="Enter tuition fee"
                        min="0"
                        disabled={viewMode}
                      />
                      {errors.tuition && (
                        <span className="form-error">{errors.tuition}</span>
                      )}
                    </div>
                    
                    <div className="form-field">
                      <label className="form-label">
                        <DollarSign className="w-4 h-4 inline mr-1" />
                        Hostel Fee
                      </label>
                      <input
                        type="number"
                        value={formData.hostel}
                        onChange={(e) => handleChange('hostel', e.target.value)}
                        className={`form-input ${errors.hostel ? 'form-error' : ''}`}
                        placeholder="Enter hostel fee"
                        min="0"
                        disabled={viewMode}
                      />
                      {errors.hostel && (
                        <span className="form-error">{errors.hostel}</span>
                      )}
                    </div>
                    
                    <div className="form-field">
                      <label className="form-label">
                        <DollarSign className="w-4 h-4 inline mr-1" />
                        Library Fee
                      </label>
                      <input
                        type="number"
                        value={formData.library}
                        onChange={(e) => handleChange('library', e.target.value)}
                        className={`form-input ${errors.library ? 'form-error' : ''}`}
                        placeholder="Enter library fee"
                        min="0"
                        disabled={viewMode}
                      />
                      {errors.library && (
                        <span className="form-error">{errors.library}</span>
                      )}
                    </div>
                    
                    <div className="form-field">
                      <label className="form-label">
                        <DollarSign className="w-4 h-4 inline mr-1" />
                        Lab Fee
                      </label>
                      <input
                        type="number"
                        value={formData.lab}
                        onChange={(e) => handleChange('lab', e.target.value)}
                        className={`form-input ${errors.lab ? 'form-error' : ''}`}
                        placeholder="Enter lab fee"
                        min="0"
                        disabled={viewMode}
                      />
                      {errors.lab && (
                        <span className="form-error">{errors.lab}</span>
                      )}
                    </div>
                    
                    <div className="form-field">
                      <label className="form-label">
                        <DollarSign className="w-4 h-4 inline mr-1" />
                        Sports Fee
                      </label>
                      <input
                        type="number"
                        value={formData.sports}
                        onChange={(e) => handleChange('sports', e.target.value)}
                        className={`form-input ${errors.sports ? 'form-error' : ''}`}
                        placeholder="Enter sports fee"
                        min="0"
                        disabled={viewMode}
                      />
                      {errors.sports && (
                        <span className="form-error">{errors.sports}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Total Calculation */}
                <div className="total-calculation">
                  <div className="total-row">
                    <span className="total-label">Total Fee:</span>
                    <span className="total-amount">
                      {formatCurrency(calculateTotal())}
                    </span>
                  </div>
                </div>

                {!viewMode && (
                  <div className="form-actions">
                    <button type="button" className="btn secondary" onClick={onClose}>
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn primary"
                      disabled={isSubmitting}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isSubmitting ? 'Saving...' : (feePlan ? 'Update Fee Plan' : 'Create Fee Plan')}
                    </button>
                  </div>
                )}
                {viewMode && (
                  <div className="form-actions">
                    <button type="button" className="btn primary" onClick={onClose}>
                      Close
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default FeePlanModal