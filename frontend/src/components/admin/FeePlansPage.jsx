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
      {/* Header */}
      <div className="fee-plans-header">
        <div className="fee-plans-title-section">
          {onBack && (
            <button 
              className="back-button"
              onClick={onBack}
              title="Back to Dashboard"
            >
              Back to Dashboard
            </button>
          )}
          <h2 className="fee-plans-title">Fee Plans</h2>
          <p className="fee-plans-subtitle">Manage fee structures for different courses and academic years</p>
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
      <div className="filters-card">
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
              <div className="fee-plan-header">
                <div className="fee-plan-info">
                  <div className="fee-plan-title-section">
                    <h3 className="fee-plan-title">
                      {plan.course}
                    </h3>
                    <div className="fee-plan-year">
                      <Calendar className="w-4 h-4" />
                      {plan.academicYear}
                    </div>
                  </div>
                  <div className="fee-plan-total">
                    <div className="fee-plan-total-amount">
                      {formatCurrency(plan.total)}
                    </div>
                    <div className="fee-plan-total-label">Total Fee</div>
                  </div>
                </div>
              </div>

              <div className="fee-breakdown">
                <div className="fee-item">
                  <div className="fee-item-label">Tuition</div>
                  <div className="fee-item-amount">
                    {formatCurrency(plan.tuition)}
                  </div>
                </div>
                <div className="fee-item">
                  <div className="fee-item-label">Hostel</div>
                  <div className="fee-item-amount">
                    {formatCurrency(plan.hostel)}
                  </div>
                </div>
                <div className="fee-item">
                  <div className="fee-item-label">Library</div>
                  <div className="fee-item-amount">
                    {formatCurrency(plan.library)}
                  </div>
                </div>
                <div className="fee-item">
                  <div className="fee-item-label">Lab</div>
                  <div className="fee-item-amount">
                    {formatCurrency(plan.lab)}
                  </div>
                </div>
                <div className="fee-item">
                  <div className="fee-item-label">Sports</div>
                  <div className="fee-item-amount">
                    {formatCurrency(plan.sports)}
                  </div>
                </div>
              </div>

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