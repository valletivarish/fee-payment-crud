import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Filter, 
  Eye,
  CreditCard,
  Calendar,
  DollarSign,
  TrendingUp
} from 'lucide-react'
import { formatCurrency, formatDate } from '../../lib/utils'
import { paymentAPI, studentAPI, studentFeeAPI } from '../../services/api'

const PaymentsPage = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterMethod, setFilterMethod] = useState('all')
  const [payments, setPayments] = useState([])
  const [students, setStudents] = useState([])
  const [studentFees, setStudentFees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Date range filters
  const [filterFromDate, setFilterFromDate] = useState('')
  const [filterToDate, setFilterToDate] = useState('')
  
  // Payment modal state
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  useEffect(() => {
    fetchPayments()
    fetchStudents()
    fetchStudentFees()
  }, [filterMethod, filterFromDate, filterToDate])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const method = filterMethod === 'all' ? null : filterMethod
      const from = filterFromDate ? new Date(filterFromDate + 'T00:00:00.000Z').toISOString() : null
      const to = filterToDate ? new Date(filterToDate + 'T23:59:59.999Z').toISOString() : null
      
      console.log('Frontend filter parameters:', { method, from, to, filterMethod, filterFromDate, filterToDate })
      
      const response = await paymentAPI.getAll(method, from, to)
      console.log('API response:', response.data)
      setPayments(response.data || [])
    } catch (err) {
      console.error('Error fetching payments:', err)
      setError('Failed to fetch payments: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  const fetchStudents = async () => {
    try {
      const response = await studentAPI.getAll()
      setStudents(response.data || [])
    } catch (err) {
      console.error('Error fetching students:', err)
    }
  }

  const fetchStudentFees = async () => {
    try {
      const response = await studentFeeAPI.getAll()
      setStudentFees(response.data || [])
    } catch (err) {
      console.error('Error fetching student fees:', err)
    }
  }

  // Since we're using backend filtering, we only need client-side search filtering
  const filteredPayments = payments.filter(payment => {
    if (!searchTerm) return true // Show all if no search term
    
    const matchesSearch = 
      payment.referenceNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.studentFeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.method?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })



  const handleViewPayment = (payment) => {
    setSelectedPayment(payment)
    setShowPaymentModal(true)
  }

  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId)
    return student ? `${student.firstName} ${student.lastName}` : 'Unknown Student'
  }

  const getFeeInfo = (studentFeeId) => {
    const studentFee = studentFees.find(sf => sf.id === studentFeeId)
    if (!studentFee) return 'Unknown Fee'
    
    // Get the student info to show course
    const student = students.find(s => s.id === studentFee.studentId)
    const course = student ? student.course : 'Unknown Course'
    
    return `${course} - ${studentFee.academicYear || 'N/A'}`
  }

  const getMethodIcon = (method) => {
    switch (method) {
      case 'UPI':
        return <CreditCard className="method-icon" />
      case 'CARD':
        return <CreditCard className="method-icon" />
      case 'NET_BANKING':
        return <CreditCard className="method-icon" />
      case 'CASH':
        return <DollarSign className="method-icon" />
      default:
        return <CreditCard className="method-icon" />
    }
  }

  const totalAmount = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0)

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading payments...</p>
      </div>
    )
  }

  
  return (
    <div className="payments-page">
      {/* Header */}
      <div className="payments-header">
        <div className="payments-title-section">
          {onBack && (
            <button 
              className="back-button"
              onClick={onBack}
              title="Back to Dashboard"
            >
              ← Back to Dashboard
            </button>
          )}
          <h2 className="payments-title">Payments</h2>
          <p className="payments-subtitle">View and manage all payment transactions</p>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}


      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-inner">
            <div className="stat-content">
              <div className="stat-header">
                <p className="stat-title">Total Payments</p>
                <p className="stat-value">{payments.length}</p>
              </div>
              <div className="stat-icon">
                <CreditCard className="stat-icon" />
              </div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-inner">
            <div className="stat-content">
              <div className="stat-header">
                <p className="stat-title">Total Amount</p>
                <p className="stat-value">{formatCurrency(totalAmount)}</p>
              </div>
              <div className="stat-icon">
                <DollarSign className="stat-icon" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-card">
        <div className="filters-content">
          <div className="search-section">
            <div className="search-input-container">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          <div className="filter-controls">
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Methods</option>
              <option value="UPI">UPI</option>
              <option value="CARD">Card</option>
              <option value="NET_BANKING">Net Banking</option>
              <option value="CASH">Cash</option>
              <option value="OTHER">Other</option>
            </select>
            <input
              type="date"
              value={filterFromDate}
              onChange={(e) => setFilterFromDate(e.target.value)}
              className="filter-select"
              placeholder="From Date"
            />
            <input
              type="date"
              value={filterToDate}
              onChange={(e) => setFilterToDate(e.target.value)}
              className="filter-select"
              placeholder="To Date"
            />
            <button 
              className="filter-button"
              onClick={() => {
                setFilterMethod('all')
                setFilterFromDate('')
                setFilterToDate('')
              }}
            >
              <Filter className="filter-icon" />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="payments-table-card">
        <div className="payments-table-header">
          <h3 className="payments-table-title">Payment History ({filteredPayments.length})</h3>
          <p className="payments-table-subtitle">Complete list of payment transactions</p>
        </div>
        <div className="payments-table-content">
          <div className="table-container">
            <table className="payments-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Fee</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Date</th>
                  <th>Reference</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="empty-state">
                      <div className="empty-content">
                        <div className="empty-icon">💳</div>
                        <div className="empty-title">No payments found</div>
                        <div className="empty-description">
                          {searchTerm ? 'Try adjusting your search terms' : 'No payment records available'}
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment, index) => (
                    <motion.tr
                      key={payment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="table-row"
                    >
                      <td>
                        <div className="table-cell">
                          <div className="student-info">
                            <div className="student-name">{getStudentName(payment.studentId)}</div>
                            <div className="student-id">ID: {payment.studentId}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="table-cell">
                          <div className="fee-info">
                            <div className="fee-course">{getFeeInfo(payment.studentFeeId)}</div>
                            <div className="fee-id">ID: {payment.studentFeeId}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="table-cell amount">
                          {formatCurrency(payment.amount || 0)}
                        </div>
                      </td>
                      <td>
                        <div className="payment-method-cell">
                          {getMethodIcon(payment.method)}
                          <span className="payment-method-text">{payment.method}</span>
                        </div>
                      </td>
                      <td>
                        <div className="table-cell">
                          {formatDate(payment.paidAt)}
                        </div>
                      </td>
                      <td>
                        <div className="table-cell reference-number">
                          {payment.referenceNo || '—'}
                        </div>
                      </td>
                      <td>
                        <div className="table-cell">
                          {payment.notes || '—'}
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="action-btn view"
                            onClick={() => handleViewPayment(payment)}
                            title="View payment details"
                          >
                            <Eye className="action-icon" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Payment Details Modal */}
      {showPaymentModal && selectedPayment && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-card">
              <div className="modal-header">
                <h3 className="modal-title">Payment Details</h3>
                <button 
                  className="modal-close-button"
                  onClick={() => setShowPaymentModal(false)}
                >
                  ×
                </button>
              </div>
              <div className="modal-content">
                <div className="payment-details">
                  <div className="detail-row">
                    <span className="detail-label">Student:</span>
                    <span className="detail-value">{getStudentName(selectedPayment.studentId)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Student ID:</span>
                    <span className="detail-value">{selectedPayment.studentId}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Student Fee ID:</span>
                    <span className="detail-value">{selectedPayment.studentFeeId}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Amount:</span>
                    <span className="detail-value amount">{formatCurrency(selectedPayment.amount || 0)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Payment Method:</span>
                    <span className="detail-value">{selectedPayment.method}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Payment Date:</span>
                    <span className="detail-value">{formatDate(selectedPayment.paidAt)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Reference Number:</span>
                    <span className="detail-value">{selectedPayment.referenceNo || 'Not provided'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Notes:</span>
                    <span className="detail-value">{selectedPayment.notes || 'No notes'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PaymentsPage