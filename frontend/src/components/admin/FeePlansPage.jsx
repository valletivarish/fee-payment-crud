import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  BookOpen,
  Calendar
} from 'lucide-react'
import { formatCurrency } from '../../lib/utils'
import FeePlanModal from './FeePlanModal'
import { feePlanAPI } from '../../services/api'

const FeePlansPage = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingFeePlan, setEditingFeePlan] = useState(null)
  const [viewingFeePlan, setViewingFeePlan] = useState(null)
  const [feePlans, setFeePlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Filter states
  const [filterCourse, setFilterCourse] = useState('')
  const [filterAcademicYear, setFilterAcademicYear] = useState('')

  useEffect(() => {
    fetchFeePlans()
  }, [])

  // Refetch when filters change
  useEffect(() => {
    fetchFeePlans()
  }, [filterCourse, filterAcademicYear])

  const fetchFeePlans = async () => {
    try {
      setLoading(true)
      const response = await feePlanAPI.getAll(
        filterCourse || undefined, 
        filterAcademicYear || undefined
      )
      setFeePlans(response.data)
    } catch (err) {
      setError('Failed to fetch fee plans: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  const handleSaveFeePlan = async (feePlanData) => {
    try {
      if (editingFeePlan) {
        await feePlanAPI.update(editingFeePlan.id, feePlanData)
      } else {
        await feePlanAPI.create(feePlanData)
      }
      await fetchFeePlans()
      setShowModal(false)
      setEditingFeePlan(null)
    } catch (err) {
      setError('Failed to save fee plan: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleDeleteFeePlan = async (feePlanId) => {
    if (window.confirm('Are you sure you want to delete this fee plan?')) {
      try {
        await feePlanAPI.delete(feePlanId)
        await fetchFeePlans()
      } catch (err) {
        setError('Failed to delete fee plan: ' + (err.response?.data?.message || err.message))
      }
    }
  }

  // Get unique courses from fee plans
  const courses = [...new Set(feePlans.map(plan => plan.course))]
  const academicYears = [...new Set(feePlans.map(plan => plan.academicYear))]

  // Since we're using backend filtering, we only need client-side search filtering
  const filteredFeePlans = feePlans.filter(plan => {
    const matchesSearch = plan.course?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.academicYear?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading fee plans...</p>
      </div>
    )
  }

  return (
    <div className="fee-plans-page">
      <div className="fee-plans-summary-card">
        <div className="fee-plans-summary">
          
          <p className="section-description">Manage and review fee plan structures by course and academic year.</p>
        </div>
        <div className="fee-plans-actions">
          <button 
            className="action-button primary"
            onClick={() => setShowModal(true)}
          >
            <Plus className="w-4 h-4" />
            Create Fee Plan
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="fee-plans-filters-card">
        <div className="filters-content">
          <div className="search-section">
            <div className="search-input-container">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search fee plans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          <div className="filter-controls">
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="filter-select"
            >
              <option value="">All Courses</option>
              {courses.map(course => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
            <select
              value={filterAcademicYear}
              onChange={(e) => setFilterAcademicYear(e.target.value)}
              className="filter-select"
            >
              <option value="">All Academic Years</option>
              {academicYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <button 
              className="filter-button"
              onClick={() => {
                setFilterCourse('')
                setFilterAcademicYear('')
              }}
            >
              <Filter className="w-4 h-4" />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Fee Plans Grid */}
      <div className="fee-plans-grid">
        {filteredFeePlans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="fee-plan-card"
          >
            <div className="fee-plan-card-content">
              <div className="fee-plan-top">
                <div className="fee-plan-heading">
                  <h3 className="fee-plan-title">{plan.course}</h3>
                    <div className="fee-plan-year">
                      <Calendar className="w-4 h-4" />
                    <span>{plan.academicYear}</span>
                  </div>
                </div>
                <div className="fee-plan-total">
                  <span className="fee-plan-total-amount">{formatCurrency(plan.total)}</span>
                  <span className="fee-plan-total-label">Total Fee</span>
                </div>
                <div className="fee-plan-top-placeholder" aria-hidden="true"></div>
              </div>

              <div className="fee-plan-breakdown">
                <div className="fee-plan-breakdown-item">
                  <span className="fee-plan-breakdown-label">Tuition</span>
                  <span className="fee-plan-breakdown-amount">{formatCurrency(plan.tuition)}</span>
                </div>
                <div className="fee-plan-breakdown-item">
                  <span className="fee-plan-breakdown-label">Hostel</span>
                  <span className="fee-plan-breakdown-amount">{formatCurrency(plan.hostel)}</span>
                </div>
                <div className="fee-plan-breakdown-item">
                  <span className="fee-plan-breakdown-label">Library</span>
                  <span className="fee-plan-breakdown-amount">{formatCurrency(plan.library)}</span>
                </div>
                <div className="fee-plan-breakdown-item">
                  <span className="fee-plan-breakdown-label">Lab</span>
                  <span className="fee-plan-breakdown-amount">{formatCurrency(plan.lab)}</span>
                </div>
                <div className="fee-plan-breakdown-item">
                  <span className="fee-plan-breakdown-label">Sports</span>
                  <span className="fee-plan-breakdown-amount">{formatCurrency(plan.sports)}</span>
                </div>
              </div>

              <div className="fee-plan-footer">
              <div className="fee-plan-actions">
                <button 
                  className="action-btn view"
                  onClick={() => {
                    setViewingFeePlan(plan)
                    setShowModal(true)
                  }}
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button 
                  className="action-btn edit"
                  onClick={() => {
                    setEditingFeePlan(plan)
                    setShowModal(true)
                  }}
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  className="action-btn delete"
                  onClick={() => handleDeleteFeePlan(plan.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Fee Plan Modal */}
      {showModal && (
        <FeePlanModal
          feePlan={editingFeePlan || viewingFeePlan}
          onClose={() => {
            setShowModal(false)
            setEditingFeePlan(null)
            setViewingFeePlan(null)
          }}
          onSave={handleSaveFeePlan}
          viewMode={!!viewingFeePlan}
        />
      )}
    </div>
  )
}

export default FeePlansPage