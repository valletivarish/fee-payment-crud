import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CreditCard, 
  History, 
  DollarSign,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  ArrowLeft,
  FileText,
  Calendar,
  PieChart,
  GraduationCap
} from 'lucide-react'
import { NavLink, Outlet, useLocation, useNavigate, useOutletContext } from 'react-router-dom'
import { formatCurrency, formatDate } from '../lib/utils'
import PaymentModal from './PaymentModal'
import { studentFeeAPI, paymentAPI } from '../services/api'

const normalizeStatus = (status) => (status || 'PENDING').toUpperCase()

const safeDate = (value) => {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const getInitials = (firstName, lastName) => {
  const first = firstName?.[0] || ''
  const last = lastName?.[0] || ''
  return `${first}${last}`.toUpperCase() || 'ST'
}

const StudentDashboard = ({ student, onBack }) => {
  const navigate = useNavigate()
  const location = useLocation()
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
      const fees = feesResponse.data || []
      setStudentFees(fees)
      setPayments(
        (paymentsResponse.data || []).filter(payment =>
          fees.some(fee => fee.id === payment.studentFeeId)
        )
      )
    } catch (err) {
      setError('Failed to fetch student data: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  const totalAssigned = studentFees.reduce((sum, fee) => sum + (fee.amountAssigned || 0), 0)
  const totalPaid = studentFees.reduce((sum, fee) => sum + (fee.amountPaid || 0), 0)
  const totalBalance = totalAssigned - totalPaid

  const primaryCourse = student?.courses?.find(course => course?.primary) ?? student?.courses?.[0]
  const courseLabel = primaryCourse
    ? `${primaryCourse.courseName}${primaryCourse.startYear && primaryCourse.endYear ? ` · ${primaryCourse.startYear} - ${primaryCourse.endYear}` : ''}`
    : student?.course
  const degreeLabel = student?.degreeType
    ? `${student.degreeType}${student?.degreeDurationYears ? ` · ${student.degreeDurationYears} years` : ''}`
    : ''
  const subtitle = [courseLabel, degreeLabel].filter(Boolean).join(' • ')

  const activeFeesCount = studentFees.length
  const paidPercentage = totalAssigned > 0 ? Math.round((totalPaid / totalAssigned) * 100) : 0
  const pendingCount = studentFees.filter(fee => normalizeStatus(fee.status) === 'PENDING').length
  const partialCount = studentFees.filter(fee => normalizeStatus(fee.status) === 'PARTIAL').length
  const feeStatusSummary = pendingCount + partialCount > 0
    ? `${pendingCount} pending · ${partialCount} partial`
    : 'All fees settled'

  const nextDueItem = studentFees
    .map(fee => ({ fee, dueAt: safeDate(fee.dueDate) }))
    .filter(item => item.dueAt)
    .sort((a, b) => a.dueAt - b.dueAt)[0]
  const nextDueFee = nextDueItem?.fee
  const nextDueLabel = nextDueFee ? formatDate(nextDueFee.dueDate) : 'No upcoming due dates'

  const handleMakePayment = (fee) => {
    setSelectedFee({
      ...fee,
      balance: (fee.amountAssigned || 0) - (fee.amountPaid || 0)
    })
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false)
    setSelectedFee(null)
    fetchStudentData()
  }

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false)
    setSelectedFee(null)
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
          <div className="error-message">{error}</div>
          <button
            onClick={onBack}
            className="student-back-button"
          >
            Logout
          </button>
        </div>
      </div>
    )
  }

  const basePath = `/student/${student?.id ?? ''}`
  const tabs = [
    { to: basePath, label: 'Overview', icon: TrendingUp, end: true },
    { to: `${basePath}/fees`, label: 'My Fees', icon: FileText },
    { to: `${basePath}/payments`, label: 'Payments', icon: History }
  ]

  const navigateToTab = (tab) => {
    if (!student?.id) return
    switch (tab) {
      case 'overview':
        navigate(basePath)
        break
      case 'fees':
        navigate(`${basePath}/fees`)
        break
      case 'payments':
        navigate(`${basePath}/payments`)
        break
      default:
        navigate(basePath)
    }
  }

  const nextDueFeeType = nextDueFee?.feeType

  const outletContext = {
    student,
    studentFees,
    payments,
    totals: {
      assigned: totalAssigned,
      paid: totalPaid,
      balance: totalBalance,
    },
    onNavigateTab: navigateToTab,
    onMakePayment: handleMakePayment,
    onPaymentSuccess: handlePaymentSuccess,
  }

  return (
    <div className="student-dashboard">
      <div className="student-hero">
        <div className="student-hero__inner">
          <div className="student-hero__meta">
            <button onClick={onBack} className="student-hero__back">
              <ArrowLeft className="w-5 h-5" />
              <span>Logout</span>
            </button>
            <div className="student-hero__identity">
              <div className="student-hero__avatar">
                {getInitials(student?.firstName, student?.lastName)}
              </div>
              <div className="student-hero__identity-text">
                <span className="student-hero__eyebrow">Student Dashboard</span>
                <h1 className="student-hero__title">
                  {student?.firstName} {student?.lastName}
                </h1>
                {subtitle ? (
                  <p className="student-hero__subtitle">{subtitle}</p>
                ) : null}
              </div>
            </div>
          </div>
          <div className="student-hero__metrics">
            {[
              {
                label: 'Total Assigned',
                value: formatCurrency(totalAssigned),
                icon: DollarSign,
                tone: 'primary',
                hint: 'Across all fee plans'
              },
              {
                label: 'Amount Paid',
                value: formatCurrency(totalPaid),
                icon: CheckCircle,
                tone: 'success',
                hint: `${paidPercentage}% complete`
              },
              {
                label: 'Active Fee Plans',
                value: activeFeesCount,
                icon: FileText,
                tone: 'neutral',
                hint: feeStatusSummary
              }
            ].map(({ label, value, icon: Icon, tone, hint }) => (
              <div key={label} className={`student-hero__metric student-hero__metric--${tone}`}>
                <div className="student-hero__metric-icon">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="student-hero__metric-body">
                  <span className="student-hero__metric-label">{label}</span>
                  <span className="student-hero__metric-value">{value}</span>
                  <span className="student-hero__metric-hint">{hint}</span>
                </div>
            </div>
            ))}
          </div>
        </div>
      </div>

      <div className="student-shell">
        <div className="student-shell__inner">
          <aside className="student-shell__sidebar">
            <div className="student-shell__sidebar-header">
              <p className="student-shell__sidebar-title">Navigation</p>
              <span className="student-shell__sidebar-subtitle">Manage your records</span>
            </div>

            <nav className="student-shell__nav">
              {tabs.map(tab => (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  end={tab.end}
                  className={({ isActive }) => `student-shell__nav-link ${isActive ? 'is-active' : ''}`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </NavLink>
              ))}
            </nav>
          </aside>

          <div className="student-shell__content">
            <div className="student-shell__panel">
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                >
                  <Outlet context={outletContext} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showPaymentModal && selectedFee && (
          <PaymentModal
            fee={selectedFee}
            onClose={handleClosePaymentModal}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

const OverviewContent = ({ student, totals, studentFees, payments, onNavigateTab }) => {
  const paidPercentage = totals.assigned > 0 ? Math.round((totals.paid / totals.assigned) * 100) : 0
  const outstanding = Math.max(totals.balance, 0)
  const upcomingFees = studentFees
    .map(fee => ({
      fee,
      dueAt: safeDate(fee.dueDate),
      balance: (fee.amountAssigned || 0) - (fee.amountPaid || 0)
    }))
    .filter(item => item.dueAt)
    .sort((a, b) => a.dueAt - b.dueAt)
  const upcomingWithBalance = upcomingFees.filter(item => item.balance > 0).slice(0, 3)
  const nextDueEntry = upcomingWithBalance[0] || upcomingFees[0] || null
  const nextDueFeeDetail = nextDueEntry?.fee
  const nextDueStatus = nextDueFeeDetail ? normalizeStatus(nextDueFeeDetail.status) : null
  const nextDueBalance = nextDueEntry ? Math.max(nextDueEntry.balance || 0, 0) : 0
  const recentPayments = [...payments]
    .map(payment => ({ ...payment, paidAtDate: safeDate(payment.paidAt) }))
    .filter(item => item.paidAtDate)
    .sort((a, b) => b.paidAtDate - a.paidAtDate)
    .slice(0, 3)
  const activePlans = studentFees.length
  const pendingCount = studentFees.filter(fee => normalizeStatus(fee.status) === 'PENDING').length
  const partialCount = studentFees.filter(fee => normalizeStatus(fee.status) === 'PARTIAL').length
  const overviewStatusSummary = pendingCount + partialCount > 0
    ? `${pendingCount} pending · ${partialCount} partial`
    : 'All fees settled'
  const courseSummaries = student?.courses?.map(course => (
    `${course.courseName}${course.startYear && course.endYear ? ` · ${course.startYear}-${course.endYear}` : ''}`
  )) || []
  const degreeSummary = student?.degreeType
    ? `${student.degreeType}${student?.degreeDurationYears ? ` • ${student.degreeDurationYears} years` : ''}`
    : null

  return (
    <div className="student-overview">
      <section className="student-section">
        <header className="student-section__header">
            <div>
            <h3 className="student-section__title">Quick Actions</h3>
            <p className="student-section__subtitle">
              Access the most common tasks directly from your dashboard.
            </p>
          </div>
        </header>
        <div className="student-quick-actions">
          <button
            type="button"
            className="student-quick-action student-quick-action--primary"
            onClick={() => onNavigateTab('fees')}
          >
            <div className="student-quick-action__icon">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="student-quick-action__body">
              <span className="student-quick-action__label">Manage my fees</span>
              <span className="student-quick-action__hint">
                Review assigned plans and settle balances.
              </span>
            </div>
          </button>
          <button
            type="button"
            className="student-quick-action"
            onClick={() => onNavigateTab('payments')}
          >
            <div className="student-quick-action__icon">
              <History className="w-5 h-5" />
            </div>
            <div className="student-quick-action__body">
              <span className="student-quick-action__label">Payment history</span>
              <span className="student-quick-action__hint">
                View previous transactions and receipts.
              </span>
            </div>
          </button>
          <div className="student-quick-action student-quick-action--muted">
            <div className="student-quick-action__icon">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="student-quick-action__body">
              <span className="student-quick-action__label">Academic profile</span>
              <span className="student-quick-action__hint">
                {courseSummaries.length > 0 ? courseSummaries.join(' • ') : 'Course details will appear here.'}
              </span>
              {degreeSummary ? (
                <span className="student-quick-action__meta">{degreeSummary}</span>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="student-section">
        <header className="student-section__header">
            <div>
            <h3 className="student-section__title">Fee Snapshot</h3>
            <p className="student-section__subtitle">
              Understand where you stand with upcoming dues and progress.
            </p>
          </div>
        </header>
        <div className="student-insights">
          <div className="student-insight-card student-insight-card--featured">
            <div className="student-insight-icon">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="student-insight-body">
              <span className="student-insight-label">Outstanding balance</span>
              <span className="student-insight-value">{formatCurrency(outstanding)}</span>
              {nextDueFeeDetail ? (
                <span className="student-insight-hint">
                  {nextDueFeeDetail.feeType || 'Fee Plan'}
                </span>
              ) : (
                <span className="student-insight-empty">All dues settled</span>
              )}
            </div>
          </div>
          <div className="student-insight-card">
            <div className="student-insight-icon">
              <PieChart className="w-5 h-5" />
            </div>
            <div className="student-insight-body">
              <span className="student-insight-label">Payment progress</span>
              <span className="student-insight-value">{paidPercentage}%</span>
              <div className="student-progress">
                <div className="student-progress__track">
                  <div
                    className="student-progress__fill"
                    style={{ width: `${Math.min(paidPercentage, 100)}%` }}
                  />
                </div>
                <span className="student-progress__hint">
                  {formatCurrency(totals.paid)} of {formatCurrency(totals.assigned)} paid
                </span>
              </div>
            </div>
          </div>
          <div className="student-insight-card">
            <div className="student-insight-icon">
              <FileText className="w-5 h-5" />
            </div>
            <div className="student-insight-body">
              <span className="student-insight-label">Active fee plans</span>
              <span className="student-insight-value">{activePlans}</span>
              <span className="student-insight-hint">{overviewStatusSummary}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="student-section student-section--split">
        <div className="student-section__column">
          <header className="student-section__header">
            <div>
              <h3 className="student-section__title">Upcoming fees</h3>
              <p className="student-section__subtitle">
                Keep an eye on the fees that need attention next.
              </p>
      </div>
            <button
              type="button"
              className="student-section__cta"
              onClick={() => onNavigateTab('fees')}
            >
              View all
            </button>
          </header>
          <ul className="student-list">
            {upcomingWithBalance.length > 0 ? (
              upcomingWithBalance.map(({ fee, balance }) => (
                <li key={fee.id} className="student-list__item">
                  <div className="student-list__icon">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="student-list__body">
                    <span className="student-list__title">{fee.feeType || 'Fee Plan'}</span>
                    <span className="student-list__subtitle">
                      Due {formatDate(fee.dueDate)} · {formatCurrency(balance)}
                    </span>
                  </div>
                  <span className={`student-status-badge status-${normalizeStatus(fee.status).toLowerCase()}`}>
                    {normalizeStatus(fee.status)}
                  </span>
                </li>
              ))
            ) : (
              <li className="student-list__empty">You're all caught up!</li>
            )}
          </ul>
        </div>
        <div className="student-section__column">
          <header className="student-section__header">
            <div>
              <h3 className="student-section__title">Latest payments</h3>
              <p className="student-section__subtitle">
                Recent transactions recorded by the system.
              </p>
            </div>
            <button
              type="button"
              className="student-section__cta"
              onClick={() => onNavigateTab('payments')}
            >
              View history
            </button>
          </header>
          <ul className="student-activity-list">
            {recentPayments.length > 0 ? (
              recentPayments.map(payment => (
                <li key={payment.id} className="student-activity">
                  <div className="student-activity__icon">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div className="student-activity__body">
                    <span className="student-activity__title">
                      {formatCurrency(payment.amount)} paid
                    </span>
                    <span className="student-activity__subtitle">
                      {formatDate(payment.paidAt)} · {payment.method}
                    </span>
                  </div>
                </li>
              ))
            ) : (
              <li className="student-activity student-activity--empty">
                <p>No payments recorded yet.</p>
              </li>
            )}
          </ul>
          </div>
      </section>
    </div>
  )
}

const FeesContent = ({ studentFees, onMakePayment }) => (
  <div className="student-section student-section--table">
    <header className="student-section__header">
    <div>
        <h2 className="student-section__title">Fee Plans</h2>
        <p className="student-section__subtitle">
          Track each assigned fee plan, the amount paid so far, and what remains.
        </p>
      </div>
      <span className="student-section__meta">{studentFees.length} assignment{studentFees.length === 1 ? '' : 's'}</span>
    </header>
    <div className="student-table">
      <table className="student-table__grid">
            <thead>
              <tr>
            <th>Fee Plan</th>
            <th>Total</th>
            <th>Paid</th>
                <th>Balance</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
          {studentFees.length > 0 ? (
            studentFees.map((fee, index) => {
              const balance = (fee.amountAssigned || 0) - (fee.amountPaid || 0)
              const status = normalizeStatus(fee.status)
              return (
                <motion.tr
                  key={fee.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  className="student-table__row"
                >
                  <td>
                    <div className="student-table__primary">
                      <span className="student-table__title">{fee.feeType || 'Fee Plan'}</span>
                      <span className="student-table__meta">
                        {fee.academicYear || 'Academic year not set'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="student-table__value">{formatCurrency(fee.amountAssigned)}</span>
                  </td>
                  <td>
                    <span className="student-table__value">{formatCurrency(fee.amountPaid)}</span>
                  </td>
                  <td>
                    <span className="student-table__value student-table__value--highlight">
                      {formatCurrency(balance)}
                    </span>
                  </td>
                  <td>
                    <span className="student-table__meta">{formatDate(fee.dueDate)}</span>
                  </td>
                  <td>
                    <span className={`student-status-badge status-${status.toLowerCase()}`}>
                      {status}
                    </span>
                  </td>
                  <td className="student-table__actions">
                    {balance > 0 ? (
                      <button 
                        type="button"
                        className="student-pill-button"
                        onClick={() => onMakePayment({ ...fee, balance })}
                      >
                        <CreditCard className="w-4 h-4" />
                        Pay now
                      </button>
                    ) : (
                      <span className="student-table__tag">Settled</span>
                    )}
                  </td>
                </motion.tr>
              )
            })
          ) : (
            <tr>
              <td colSpan="7">
                <div className="student-empty">
                  <div className="student-empty__icon">
                    <FileText className="w-8 h-8" />
                  </div>
                  <h4 className="student-empty__title">No fee plans assigned yet</h4>
                  <p className="student-empty__subtitle">
                    Once an administrator assigns a fee plan it will appear here.
                  </p>
                </div>
              </td>
            </tr>
          )}
            </tbody>
          </table>
      </div>
    </div>
  )

const PaymentsContent = ({ payments, studentFees }) => {
  const feeLookup = new Map(studentFees.map(fee => [fee.id, fee]))
  return (
    <div className="student-section student-section--table">
      <header className="student-section__header">
        <div>
          <h2 className="student-section__title">Payment History</h2>
          <p className="student-section__subtitle">
            A detailed record of every payment captured against your account.
          </p>
      </div>
        <span className="student-section__meta">
          {payments.length} transaction{payments.length === 1 ? '' : 's'}
        </span>
      </header>
      <div className="student-table student-table--payments">
        <table className="student-table__grid">
            <thead>
              <tr>
                <th>Date</th>
              <th>Fee Plan</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.length > 0 ? (
              payments.map((payment, index) => {
                const relatedFee = feeLookup.get(payment.studentFeeId)
                return (
                  <motion.tr
                    key={payment.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="student-table__row"
                  >
                    <td>
                      <span className="student-table__value">{formatDate(payment.paidAt)}</span>
                    </td>
                    <td>
                      <div className="student-table__primary">
                        <span className="student-table__title">
                          {relatedFee?.feeType || 'Fee Plan'}
                        </span>
                        <span className="student-table__meta">
                          {relatedFee?.academicYear || relatedFee?.course || 'Assignment'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="student-table__value">{formatCurrency(payment.amount)}</span>
                    </td>
                    <td>
                      <span className="student-table__meta">{payment.method}</span>
                    </td>
                    <td>
                      <span className="student-status-badge status-paid">COMPLETED</span>
                    </td>
                  </motion.tr>
                )
              })
              ) : (
                <tr>
                <td colSpan="5">
                  <div className="student-empty">
                    <div className="student-empty__icon">
                        <History className="w-8 h-8" />
                      </div>
                    <h4 className="student-empty__title">No payments recorded</h4>
                    <p className="student-empty__subtitle">
                      When payments are recorded they will appear in this list.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
      </div>
    </div>
  )
}

export const StudentOverviewScreen = () => {
  const { student, totals, studentFees, payments, onNavigateTab } = useOutletContext()
  return (
    <OverviewContent
      student={student}
      totals={totals}
      studentFees={studentFees}
      payments={payments}
      onNavigateTab={onNavigateTab}
    />
  )
}

export const StudentFeesScreen = () => {
  const { studentFees, onMakePayment } = useOutletContext()
  return <FeesContent studentFees={studentFees} onMakePayment={onMakePayment} />
}

export const StudentPaymentsScreen = () => {
  const { payments, studentFees } = useOutletContext()
  return <PaymentsContent payments={payments} studentFees={studentFees} />
}

export default StudentDashboard
