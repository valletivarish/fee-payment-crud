import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  CreditCard
} from 'lucide-react'
// Removed UI component imports to use custom CSS classes
import { formatCurrency, formatDate } from '../../lib/utils'
import StudentModal from './StudentModal'
import StudentPaymentsModal from './StudentPaymentsModal'
import AssignmentModal from './AssignmentModal'
import { studentAPI, studentFeeAPI } from '../../services/api'

const StudentsPage = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showPaymentsModal, setShowPaymentsModal] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState(null)
  const [selectedStudentName, setSelectedStudentName] = useState('')
  const [showAssignmentModal, setShowAssignmentModal] = useState(false)
  const [assigningStudent, setAssigningStudent] = useState(null)

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const [studentsResponse, studentFeesResponse] = await Promise.all([
        studentAPI.getAll(),
        studentFeeAPI.getAll()
      ])
      
      // Enrich students with fee information
      const enrichedStudents = studentsResponse.data.map(student => {
        const studentFees = studentFeesResponse.data.filter(sf => sf.studentId === student.id)
        const totalFees = studentFees.reduce((sum, sf) => sum + (sf.amountAssigned || 0), 0)
        const totalPaid = studentFees.reduce((sum, sf) => sum + (sf.amountPaid || 0), 0)
        const balance = totalFees - totalPaid
        
        return {
          ...student,
          totalFees,
          totalPaid,
          balance,
          studentFees
        }
      })
      
      setStudents(enrichedStudents)
    } catch (err) {
      setError('Failed to fetch students: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  const handleSaveStudent = async (studentData) => {
    try {
      if (editingStudent) {
        await studentAPI.update(editingStudent.id, studentData)
      } else {
        await studentAPI.create(studentData)
      }
      await fetchStudents()
      setShowModal(false)
      setEditingStudent(null)
    } catch (err) {
      setError('Failed to save student: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await studentAPI.delete(studentId)
        await fetchStudents()
      } catch (err) {
        setError('Failed to delete student: ' + (err.response?.data?.message || err.message))
      }
    }
  }

  const handleViewPayments = (studentId) => {
    const student = students.find(s => s.id === studentId)
    setSelectedStudentId(studentId)
    setSelectedStudentName(student ? `${student.firstName} ${student.lastName}` : 'Unknown Student')
    setShowPaymentsModal(true)
  }

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    let matchesFilter = true
    if (filterStatus !== 'all') {
      const balance = student.balance || 0
      if (filterStatus === 'PAID' && balance === 0) {
        matchesFilter = true
      } else if (filterStatus === 'PARTIAL' && balance > 0 && balance < (student.totalFees || 0)) {
        matchesFilter = true
      } else if (filterStatus === 'PENDING' && balance >= (student.totalFees || 0)) {
        matchesFilter = true
      } else {
        matchesFilter = false
      }
    }
    
    return matchesSearch && matchesFilter
  })

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
        return <span className="status-badge success">Paid</span>
      case 'PARTIAL':
        return <span className="status-badge warning">Partial</span>
      case 'PENDING':
        return <span className="status-badge danger">Pending</span>
      default:
        return <span className="status-badge secondary">—</span>
    }
  }

  const getPaymentStatus = (balance) => {
    if (balance === 0) {
      return <span className="status-badge success">Paid</span>
    } else if (balance < 10000) {
      return <span className="status-badge warning">Partial</span>
    } else {
      return <span className="status-badge danger">Pending</span>
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading students...</p>
      </div>
    )
  }

  return (
    <div className="students-page">
      {/* Header */}
      <div className="students-header">
        <div className="students-title-section">
          {onBack && (
            <button 
              className="back-button"
              onClick={onBack}
              title="Back to Dashboard"
            >
              ← Back to Dashboard
            </button>
          )}
          <h2 className="students-title">Students</h2>
          <p className="students-subtitle">Manage student records and fee information</p>
        </div>
        <div className="students-actions">
          <button 
            className="action-button secondary"
            onClick={() => setShowAssignmentModal(true)}
          >
            <Plus className="w-4 h-4" />
            Assign Fee
          </button>
          <button 
            className="action-button primary"
            onClick={() => setShowModal(true)}
          >
            <Plus className="w-4 h-4" />
            Add Student
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
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          <div className="filter-controls">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="PARTIAL">Partial</option>
              <option value="PAID">Paid</option>
            </select>
            <button className="filter-button">
              <Filter className="w-4 h-4" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="students-table-card">
        <div className="students-table-header">
          <h3 className="students-table-title">Student Records ({filteredStudents.length})</h3>
          <p className="students-table-subtitle">Complete list of registered students</p>
        </div>
        <div className="students-table-content">
          <div className="table-container">
            <table className="students-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Academic Year</th>
                  <th>Total Fees</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, index) => (
                  <motion.tr
                    key={student.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="table-row"
                  >
                    <td>
                      <div className="student-info">
                        <div className="student-name">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="student-email">{student.email}</div>
                      </div>
                    </td>
                    <td>
                      <div className="table-cell">{student.course}</div>
                    </td>
                    <td>
                      <div className="table-cell">{student.academicYear}</div>
                    </td>
                    <td>
                      <div className="table-cell amount">
                        {formatCurrency(student.totalFees || 0)}
                      </div>
                    </td>
                    <td>
                      <div className="balance-cell">
                        <div className="balance-amount">
                          {formatCurrency(student.balance || 0)}
                        </div>
                      </div>
                    </td>
                    <td>
                      {getPaymentStatus(student.balance || 0)}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="action-btn view"
                          onClick={() => handleViewPayments(student.id)}
                          title="View Payments"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          className="action-btn assign"
                          onClick={() => {
                            setAssigningStudent(student)
                            setShowAssignmentModal(true)
                          }}
                          title="Assign Fee"
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>
                        <button 
                          className="action-btn edit"
                          onClick={() => {
                            setEditingStudent(student)
                            setShowModal(true)
                          }}
                          title="Edit Student"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          className="action-btn delete"
                          onClick={() => handleDeleteStudent(student.id)}
                          title="Delete Student"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Student Modal */}
      {showModal && (
        <StudentModal
          student={editingStudent}
          onClose={() => {
            setShowModal(false)
            setEditingStudent(null)
          }}
          onSave={handleSaveStudent}
        />
      )}

      {/* Student Payments Modal */}
      {showPaymentsModal && (
        <StudentPaymentsModal
          studentId={selectedStudentId}
          studentName={selectedStudentName}
          onClose={() => {
            setShowPaymentsModal(false)
            setSelectedStudentId(null)
            setSelectedStudentName('')
          }}
        />
      )}

      {/* Assignment Modal */}
      {showAssignmentModal && (
        <AssignmentModal
          assignment={assigningStudent}
          onClose={() => {
            setShowAssignmentModal(false)
            setAssigningStudent(null)
          }}
          onSave={async (assignmentData) => {
            try {
              console.log('Creating assignment with data:', assignmentData)
              
              // Convert date to ISO format for Instant conversion
              const dueDateISO = new Date(assignmentData.dueDate + 'T00:00:00.000Z').toISOString()
              console.log('Converted due date to ISO:', dueDateISO)
              
              // Call the API to create the assignment
              await studentFeeAPI.assign(
                assignmentData.studentId,
                assignmentData.feePlanId,
                dueDateISO
              )
              
              console.log('Assignment created successfully')
              setShowAssignmentModal(false)
              setAssigningStudent(null)
              
              // Refresh the students list to show updated data
              await fetchStudents()
            } catch (error) {
              console.error('Failed to create assignment:', error)
              // You might want to show an error message to the user here
            }
          }}
        />
      )}
    </div>
  )
}

export default StudentsPage
