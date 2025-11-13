import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowLeft, CreditCard, Calendar, DollarSign } from 'lucide-react'
import { formatCurrency, formatDate } from '../../lib/utils'
import { paymentAPI } from '../../services/api'
import { getPaymentMethods } from '../../services/dataService'

const StudentPaymentsModal = ({ studentId, studentName, onClose }) => {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterMethod, setFilterMethod] = useState('all')

  useEffect(() => {
    if (studentId) {
      fetchStudentPayments()
    }
  }, [studentId])

  const fetchStudentPayments = async () => {
    try {
      setLoading(true)
      const response = await paymentAPI.getAll()
      const studentPayments = (response.data || []).filter(
        (payment) => payment.studentId === studentId
      )
      setPayments(studentPayments)
    } catch (err) {
      setError('Failed to fetch payments: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  const filteredPayments = payments.filter(payment => {
    const matchesFilter = filterMethod === 'all' || payment.method === filterMethod
    return matchesFilter
  })

  const getMethodIcon = (method) => {
    switch (method) {
      case 'UPI':
        return <CreditCard className="w-4 h-4" />
      case 'CARD':
        return <CreditCard className="w-4 h-4" />
      case 'NET_BANKING':
        return <CreditCard className="w-4 h-4" />
      case 'CASH':
        return <DollarSign className="w-4 h-4" />
      default:
        return <CreditCard className="w-4 h-4" />
    }
  }

  const totalAmount = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0)

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
          className="modal-container student-payments-modal"
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
                    Payments for {studentName}
                  </h2>
                  <p className="modal-description">
                    View payment history and transaction details
                  </p>
                </div>
              </div>
              <button className="modal-close-button" onClick={onClose}>
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="modal-content">
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              {/* Payment Summary */}
              <div className="payment-summary">
                <div className="summary-item">
                  <span className="summary-label">Total Payments:</span>
                  <span className="summary-value">{payments.length}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Total Amount:</span>
                  <span className="summary-value">{formatCurrency(totalAmount)}</span>
                </div>
              </div>

              {/* Filter */}
              <div className="payment-filters">
                <select
                  value={filterMethod}
                  onChange={(e) => setFilterMethod(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Methods</option>
                  {getPaymentMethods().map(method => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payments List */}
              {loading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p className="loading-text">Loading payments...</p>
                </div>
              ) : filteredPayments.length > 0 ? (
                <div className="payments-list">
                  {filteredPayments.map((payment, index) => (
                    <motion.div
                      key={payment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="payment-item"
                    >
                      <div className="payment-info">
                        <div className="payment-method">
                          {getMethodIcon(payment.method)}
                          <span>{payment.method}</span>
                        </div>
                        <div className="payment-amount">
                          {formatCurrency(payment.amount || 0)}
                        </div>
                      </div>
                      <div className="payment-details">
                        <div className="payment-date">
                          <Calendar className="w-4 h-4" />
                          {formatDate(payment.paidAt)}
                        </div>
                        {payment.referenceNo && (
                          <div className="payment-reference">
                            Ref: {payment.referenceNo}
                          </div>
                        )}
                        {payment.notes && (
                          <div className="payment-notes">
                            {payment.notes}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <CreditCard className="w-12 h-12 text-gray-400 mb-4" />
                  <h3 className="empty-title">No Payments Found</h3>
                  <p className="empty-description">
                    This student hasn't made any payments yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default StudentPaymentsModal
