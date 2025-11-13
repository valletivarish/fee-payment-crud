import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  CreditCard,
  FileText,
  Search,
  Home,
  ArrowLeft,
  Plus
} from 'lucide-react'
import { NavLink, Outlet, useLocation, useNavigate, useOutletContext } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import { Button } from './ui/button'
import StudentsPage from './admin/StudentsPage'
import FeePlansPage from './admin/FeePlansPage'
import AssignmentsPage from './admin/AssignmentsPage'
import PaymentsPage from './admin/PaymentsPage'
import { studentAPI, feePlanAPI, studentFeeAPI } from '../services/api'
import { formatCurrency, formatDate } from '../lib/utils'

const metricMeta = {
  'Total Students': {
    icon: Users,
    tone: 'primary',
    hint: 'Active student profiles'
  },
  'Active Fee Plans': {
    icon: FileText,
    tone: 'neutral',
    hint: 'Plans configured this cycle'
  },
  'Pending Payments': {
    icon: CreditCard,
    tone: 'warning',
    hint: 'Awaiting settlement'
  },
  'Total Payments': {
    icon: CreditCard,
    tone: 'success',
    hint: 'Total assignments tracked'
  }
}

const AdminDashboard = ({ onBack }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    { to: '/admin', label: 'Dashboard', icon: Home, end: true },
    { to: '/admin/students', label: 'Students', icon: Users },
    { to: '/admin/fee-plans', label: 'Fee Plans', icon: FileText },
    { to: '/admin/due-payments', label: 'Due Payments', icon: CreditCard },
    { to: '/admin/payments', label: 'Payments', icon: CreditCard },
  ]

  const [stats, setStats] = useState([
    { title: 'Total Students', value: '0', color: 'stat-blue' },
    { title: 'Active Fee Plans', value: '0', color: 'stat-green' },
    { title: 'Pending Payments', value: '0', color: 'stat-yellow' },
    { title: 'Total Payments', value: '0', color: 'stat-info' },
  ])
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      const [studentsRes, feePlansRes, assignmentsRes] = await Promise.all([
        studentAPI.getAll(),
        feePlanAPI.getAll(),
        studentFeeAPI.getAll()
      ])

      const students = studentsRes.data || []
      const feePlans = feePlansRes.data || []
      const assignmentsData = assignmentsRes.data || []

      // Calculate stats from real data
      const totalStudents = students.length
      const activeFeePlans = feePlans.length
      const totalAssignments = assignmentsData.length
      const pendingAssignments = assignmentsData.filter(assignment => assignment.status !== 'PAID').length

      setStats([
        { title: 'Total Students', value: totalStudents.toString(), color: 'stat-blue' },
        { title: 'Active Fee Plans', value: activeFeePlans.toString(), color: 'stat-green' },
        { title: 'Pending Payments', value: pendingAssignments.toString(), color: 'stat-yellow' },
        { title: 'Total Payments', value: totalAssignments.toString(), color: 'stat-info' },
      ])
      setAssignments(assignmentsData)
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
      // Set error state for stats
      setStats([
        { title: 'Total Students', value: 'Error', color: 'stat-blue' },
        { title: 'Active Fee Plans', value: 'Error', color: 'stat-green' },
        { title: 'Pending Payments', value: 'Error', color: 'stat-yellow' },
        { title: 'Total Payments', value: 'Error', color: 'stat-info' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleNavigate = (target) => {
    if (!target) return
    const normalized = target.startsWith('/admin') ? target : `/admin/${target}`
    navigate(normalized, { replace: false })
  }

  const activeItem =
    menuItems.find(item =>
      item.end
        ? location.pathname === item.to
        : location.pathname.startsWith(item.to)
    ) || menuItems[0]

  const getStatValue = (title) =>
    stats.find(stat => stat.title === title)?.value || '0'

  const pendingPaymentsValue = getStatValue('Pending Payments')
  const totalPaymentsValue = getStatValue('Total Payments')
  const pendingNumeric = Number(pendingPaymentsValue) || 0
  const totalNumeric = Number(totalPaymentsValue) || 0
  const completedPaymentsValue = Math.max(totalNumeric - pendingNumeric, 0)
  const pendingPaymentsHint = `${completedPaymentsValue} completed · ${pendingPaymentsValue} pending`

  const heroMetrics = ['Total Students', 'Active Fee Plans', 'Pending Payments', 'Total Payments'].map((title) => {
    const stat = stats.find(item => item.title === title) || { value: '0' }
    const meta = metricMeta[title] || {}
    return {
      label: title,
      value: stat.value,
      icon: meta.icon || Users,
      tone: meta.tone || 'neutral',
      hint: title === 'Pending Payments' ? pendingPaymentsHint : meta.hint || ''
    }
  })

  const outletContext = {
    stats,
    loading,
    onNavigate: handleNavigate,
    onBack,
  }

  const pendingAssignments = assignments
    .filter(assignment => assignment.status !== 'PAID')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))

  return (
    <div className="admin-dashboard student-dashboard">
      <div className="student-hero admin-hero">
        <div className="student-hero__inner">
          <div className="student-hero__meta">
            <button onClick={onBack} className="student-hero__back admin-hero__back">
              <ArrowLeft className="w-5 h-5" />
              <span>Logout</span>
            </button>
            <div className="admin-hero__identity">
              <div className="admin-hero__identity-header">
                <div className="student-hero__avatar admin-hero__avatar">AD</div>
                <span className="student-hero__eyebrow">Administrator Console</span>
              </div>
              <div className="admin-hero__identity-body">
                <h1 className="student-hero__title">Fee Management Overview</h1>
                <p className="student-hero__subtitle">
                  Monitor students, fee plans, assignments, and payments.
                </p>
              </div>
            </div>
          </div>
          <div className="admin-hero__metrics-wrapper">
            <div className="admin-hero__metrics-grid">
              {heroMetrics.map(({ label, value, icon: Icon, tone, hint }) => (
                <div key={label} className={`student-hero__metric student-hero__metric--${tone}`}>
                  <div className="student-hero__metric-icon">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="student-hero__metric-body">
                    <span className="student-hero__metric-label">{label}</span>
                    <span className="student-hero__metric-value">{value}</span>
                    {hint ? <span className="student-hero__metric-hint">{hint}</span> : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="student-shell admin-shell">
        <div className="student-shell__inner admin-shell__inner">
          <aside className="student-shell__sidebar admin-shell__sidebar">
            <div className="student-shell__sidebar-header">
              <p className="student-shell__sidebar-title">Navigation</p>
              <span className="student-shell__sidebar-subtitle">Administrative tools</span>
            </div>

            <nav className="student-shell__nav admin-shell__nav">
              {menuItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `student-shell__nav-link ${isActive ? 'is-active' : ''}`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </aside>

          <div className="student-shell__content admin-shell__content">
            <div className="admin-shell__toolbar">
              <div className="admin-shell__headline">
                <h2>{activeItem.label}</h2>
              </div>
              <div className="admin-shell__toolbar-actions"></div>
            </div>

            <div className="student-shell__panel admin-shell__panel">
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
    </div>
  )
}

// Dashboard Overview Component
const DashboardOverview = ({ stats, loading, onNavigate }) => {
  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-skeleton">
          <div className="skeleton-card"></div>
          <div className="skeleton-card"></div>
          <div className="skeleton-card"></div>
          <div className="skeleton-card"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-overview">
      
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="quick-actions-grid">
            <Button 
              variant="primary" 
              className="quick-action-button"
              onClick={() => onNavigate('students')}
            >
              <Plus className="w-6 h-6 mb-2" />
              Add New Student
            </Button>
            <Button 
              variant="outline" 
              className="quick-action-button"
              onClick={() => onNavigate('fee-plans')}
            >
              <FileText className="w-6 h-6 mb-2" />
              Create Fee Plan
            </Button>
            <Button 
              variant="outline" 
              className="quick-action-button"
              onClick={() => onNavigate('payments')}
            >
              <CreditCard className="w-6 h-6 mb-2" />
              View Payments
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const DashboardOverviewScreen = () => {
  const { stats, loading, onNavigate } = useOutletContext()
  return <DashboardOverview stats={stats} loading={loading} onNavigate={onNavigate} />
}

export const StudentsPageScreen = () => {
  const { onBack } = useOutletContext()
  return <StudentsPage onBack={onBack} />
}

export const FeePlansPageScreen = () => {
  const { onBack } = useOutletContext()
  return <FeePlansPage onBack={onBack} />
}

export const AssignmentsPageScreen = () => {
  const { onBack } = useOutletContext()
  return <AssignmentsPage onBack={onBack} />
}

export const PaymentsPageScreen = () => {
  const { onBack } = useOutletContext()
  return <PaymentsPage onBack={onBack} />
}

export default AdminDashboard
