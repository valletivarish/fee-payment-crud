import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CreditCard, 
  History, 
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  User,
  BookOpen,
  Calendar,
  ArrowLeft,
  FileText
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import { Button } from './ui/button'
import { formatCurrency, formatDate, getStatusColor, getStatusIcon } from '../lib/utils'
import PaymentModal from './PaymentModal'
import { studentFeeAPI, paymentAPI } from '../services/api'

const StudentDashboard = ({ student, onBack }) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedFee, setSelectedFee] = useState(null)
  const [studentFees, setStudentFees] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (student?.id) {
      fetchStudentData()
    }
  }, [student])

  const fetchStudentData = async () => {
    try {
      setLoading(true)
      const [feesResponse, paymentsResponse] = await Promise.all([
        studentFeeAPI.getByStudentId(student.id),
        paymentAPI.getAll()
      ])
      setStudentFees(feesResponse.data)
      setPayments(paymentsResponse.data.filter(payment => 
        feesResponse.data.some(fee => fee.id === payment.studentFeeId)
      ))
    } catch (err) {
      setError('Failed to fetch student data: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  const totalAssigned = studentFees.reduce((sum, fee) => sum + fee.amountAssigned, 0)
  const totalPaid = studentFees.reduce((sum, fee) => sum + fee.amountPaid, 0)
  const totalBalance = totalAssigned - totalPaid

  const handleMakePayment = (fee) => {
    setSelectedFee(fee)
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false)
    setSelectedFee(null)
    fetchStudentData() // Refresh data after payment
  }

  if (loading) {
    return (
      <div className="student-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading student data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="student-dashboard">
        <div className="error-container">
          <div className="error-message">
            {error}
          </div>
          <button
            onClick={onBack}
            className="student-back-button"
          >
          Back to Home
          </button>
        </div>
      </div>
    )
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4" />
      case 'PARTIAL':
        return <AlertCircle className="w-4 h-4" />
      case 'PAID':
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const renderOverview = () => (
    <div>
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-content">
          <div>
            <h2 className="welcome-title">
              Welcome back, {student?.firstName}!
            </h2>
            <p className="welcome-subtitle">
              {student?.course} - {student?.academicYear}
            </p>
          </div>
          <div className="welcome-balance">
            <div className="balance-amount">
              {formatCurrency(totalBalance)}
            </div>
            <p className="balance-label">Outstanding Balance</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="student-stats-grid">
        <div className="student-stat-card">
          <div className="student-stat-header">
            <div>
              <p className="student-stat-label">Total Fees</p>
              <p className="student-stat-value">
                {formatCurrency(totalAssigned)}
              </p>
            </div>
            <div className="student-stat-icon blue">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="student-stat-card">
          <div className="student-stat-header">
            <div>
              <p className="student-stat-label">Amount Paid</p>
              <p className="student-stat-value">
                {formatCurrency(totalPaid)}
              </p>
            </div>
            <div className="student-stat-icon green">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="student-stat-card">
          <div className="student-stat-header">
            <div>
              <p className="student-stat-label">Pending Fees</p>
              <p className="student-stat-value">
                {studentFees.filter(fee => fee.status !== 'PAID').length}
              </p>
            </div>
            <div className="student-stat-icon yellow">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common student tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="gradient" 
              className="h-20 flex flex-col"
              onClick={() => setActiveTab('fees')}
            >
              <CreditCard className="w-6 h-6 mb-2" />
              View My Fees
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col"
              onClick={() => setActiveTab('payments')}
            >
              <History className="w-6 h-6 mb-2" />
              Payment History
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderFees = () => (
    <div>
      <div className="fees-header">
        <h2 className="fees-title">My Fees</h2>
      </div>

      <div className="student-fees-table">
        <div className="student-fees-header">
          <h3 className="student-fees-title">Fee Details</h3>
        </div>
        <div className="student-fees-content">
          <table>
            <thead>
              <tr>
                <th>Fee Type</th>
                <th>Total Amount</th>
                <th>Amount Paid</th>
                <th>Balance</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {studentFees.map((fee, index) => (
                <motion.tr
                  key={fee.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <td>
                    <div className="fee-type">
                      {fee.feeType}
                    </div>
                  </td>
                  <td>
                    <div className="fee-amount">
                      {formatCurrency(fee.amountAssigned)}
                    </div>
                  </td>
                  <td>
                    <div className="fee-paid">
                      {formatCurrency(fee.amountPaid)}
                    </div>
                  </td>
                  <td>
                    <div className="fee-balance">
                      {formatCurrency(fee.balance)}
                    </div>
                  </td>
                  <td>
                    <div className="fee-due-date">
                      {formatDate(fee.dueDate)}
                    </div>
                  </td>
                  <td>
                    <span className={`student-status-badge ${fee.status.toLowerCase()}`}>
                      {fee.status}
                    </span>
                  </td>
                  <td>
                    {fee.status !== 'PAID' && (
                      <button 
                        className="student-payment-button"
                        onClick={() => handleMakePayment(fee)}
                      >
                        <CreditCard className="w-4 h-4" />
                        Pay Now
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderPayments = () => (
    <div className="payments-section">
      <div className="payments-header">
        <h2 className="payments-title">Payment History</h2>
        <p className="payments-subtitle">View your payment transactions</p>
      </div>

      <div className="payments-table-card">
        <div className="payments-table-content">
          <table className="payments-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Fee Type</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.length > 0 ? (
                payments.map((payment, index) => (
                  <motion.tr
                    key={payment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="payment-row"
                  >
                    <td>
                      <div className="payment-date">
                        {formatDate(payment.paidAt)}
                      </div>
                    </td>
                    <td>
                      <div className="payment-fee-type">
                        {studentFees.find(fee => fee.id === payment.studentFeeId)?.course || 'N/A'}
                      </div>
                    </td>
                    <td>
                      <div className="payment-amount">
                        {formatCurrency(payment.amount)}
                      </div>
                    </td>
                    <td>
                      <div className="payment-method">
                        {payment.method}
                      </div>
                    </td>
                    <td>
                      <span className="payment-status completed">
                        Completed
                      </span>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-payments">
                    <div className="empty-state">
                      <div className="empty-icon">
                        <History className="w-8 h-8" />
                      </div>
                      <h3 className="empty-title">No Payments Yet</h3>
                      <p className="empty-description">
                        Your payment history will appear here once you make payments.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  return (
    <div className="student-dashboard">
      {/* Header */}
      <div className="student-header">
        <div className="student-header-content">
          <button
            onClick={onBack}
            className="student-back-button"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="student-info">
            <div className="student-avatar">
              {student?.firstName?.[0]}{student?.lastName?.[0]}
            </div>
            <div className="student-details">
              <h2>Student Dashboard</h2>
              <p>{student?.firstName} {student?.lastName} - {student?.course}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="student-content">
        <div className="student-tabs">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'fees', label: 'My Fees', icon: FileText },
            { id: 'payments', label: 'Payments', icon: History }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`student-tab ${activeTab === tab.id ? 'active' : ''}`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'fees' && renderFees()}
            {activeTab === 'payments' && renderPayments()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          fee={selectedFee}
          onClose={() => {
            setShowPaymentModal(false)
            setSelectedFee(null)
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  )
}

export default StudentDashboard
