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

  const renderStats = () => (
    <div className="payments-metrics">
      <div className="payments-kpi">
        <div className="payments-kpi-icon">
          <CreditCard className="w-5 h-5" />
        </div>
        <div className="payments-kpi-body">
          <span className="payments-kpi-label">Total Payments</span>
          <span className="payments-kpi-value">{payments.length}</span>
        </div>
      </div>
      <div className="payments-kpi">
        <div className="payments-kpi-icon">
          <DollarSign className="w-5 h-5" />
        </div>
        <div className="payments-kpi-body">
          <span className="payments-kpi-label">Total Amount</span>
          <span className="payments-kpi-value">{formatCurrency(totalAmount)}</span>
        </div>
      </div>
    </div>
  )

  const renderFilters = () => (
    <div className="payments-filter-bar">
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
      <div className="payments-filter-controls">
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
  )

  const renderTable = () => (
    <div className="payments-table-card">
      <div className="payments-table-header">
        <div className="payments-table-heading">
          <h3 className="payments-table-title">Payment History ({filteredPayments.length})</h3>
          <p className="payments-table-subtitle">Complete list of payment transactions</p>
        </div>
      </div>
      <div className="payments-table-content">
        <div className="table-container">
          <table className="payments-table">
            <thead>
              <tr>
                <th className="col-student">Student</th>
                <th className="col-fee">Fee</th>
                <th className="col-amount">Amount</th>
                <th className="col-method">Method</th>
                <th className="col-date">Date</th>
                <th className="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <div className="empty-state">
                      <div className="empty-content">
                        <div className="empty-icon">No Payments</div>
                        <div className="empty-title">No payments found</div>
                        <div className="empty-description">
                          {searchTerm ? 'Try adjusting your search terms' : 'No payment records available'}
                        </div>
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
                    className="payments-table-row"
                  >
                    <td className="col-student">
                      <div className="payments-table-cell">
                        <div className="payments-student-name">{getStudentName(payment.studentId)}</div>
                        <div className="payments-student-meta">ID: {payment.studentId}</div>
                      </div>
                    </td>
                    <td className="col-fee">
                      <div className="payments-table-cell">
                        <div className="payments-fee-title">{getFeeInfo(payment.studentFeeId)}</div>
                      </div>
                    </td>
                    <td className="col-amount">
                      <div className="payments-table-cell amount">
                        {formatCurrency(payment.amount || 0)}
                      </div>
                    </td>
                    <td className="col-method">
                      <div className="payment-method">
                        {getMethodIcon(payment.method)}
                        <span>{payment.method}</span>
                      </div>
                    </td>
                    <td className="col-date">
                      <div className="payments-table-cell">
                        {formatDate(payment.paidAt)}
                      </div>
                    </td>
                    <td className="col-actions">
                      <div className="payment-actions">
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
  )

  return (
    <div className="payments-page">
      <div className="payments-content">
        <div className="section-summary">
          <p className="section-description">Review all recorded payments and filter by method or date.</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {renderStats()}

        {renderFilters()}

        {renderTable()}
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
                  Close
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