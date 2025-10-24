import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  CreditCard, 
  FileText, 
  BarChart3, 
  Settings, 
  Menu, 
  X, 
  Search, 
  Home,
  Plus,
  Filter
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import { Button } from './ui/button'
import StudentsPage from './admin/StudentsPage'
import FeePlansPage from './admin/FeePlansPage'
import AssignmentsPage from './admin/AssignmentsPage'
import PaymentsPage from './admin/PaymentsPage'
import { studentAPI, feePlanAPI, paymentAPI } from '../services/api'

const AdminDashboard = ({ onBack }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activePage, setActivePage] = useState('dashboard')

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'fee-plans', label: 'Fee Plans', icon: FileText },
    { id: 'assignments', label: 'Assignments', icon: CreditCard },
    { id: 'payments', label: 'Payments', icon: CreditCard },
  ]

  const [stats, setStats] = useState([
    { title: 'Total Students', value: '0', color: 'stat-blue' },
    { title: 'Active Fee Plans', value: '0', color: 'stat-green' },
    { title: 'Pending Payments', value: '0', color: 'stat-yellow' },
    { title: 'Total Payments', value: '0', color: 'stat-info' },
  ])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      const [studentsRes, feePlansRes, paymentsRes] = await Promise.all([
        studentAPI.getAll(),
        feePlanAPI.getAll(),
        paymentAPI.getAll()
      ])

      const students = studentsRes.data || []
      const feePlans = feePlansRes.data || []
      const payments = paymentsRes.data || []

      // Calculate stats from real data
      const totalStudents = students.length
      const activeFeePlans = feePlans.length
      const totalPayments = payments.length
      const pendingPayments = payments.filter(p => p.status === 'PENDING').length

      setStats([
        { title: 'Total Students', value: totalStudents.toString(), color: 'stat-blue' },
        { title: 'Active Fee Plans', value: activeFeePlans.toString(), color: 'stat-green' },
        { title: 'Pending Payments', value: pendingPayments.toString(), color: 'stat-yellow' },
        { title: 'Total Payments', value: totalPayments.toString(), color: 'stat-info' },
      ])
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

  const renderPage = () => {
    switch (activePage) {
      case 'students':
        return <StudentsPage onBack={() => setActivePage('dashboard')} />
      case 'fee-plans':
        return <FeePlansPage onBack={() => setActivePage('dashboard')} />
      case 'assignments':
        return <AssignmentsPage onBack={() => setActivePage('dashboard')} />
      case 'payments':
        return <PaymentsPage onBack={() => setActivePage('dashboard')} />
      default:
        return <DashboardOverview stats={stats} loading={loading} onNavigate={setActivePage} />
    }
  }

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}
      >
        <div className="admin-sidebar-header">
          <h2 className="admin-sidebar-title">Fee Management</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="admin-sidebar-close"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <nav className="admin-nav">
          {menuItems.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setActivePage(item.id)
                setSidebarOpen(false)
              }}
              className={`admin-nav-item ${
                activePage === item.id ? 'active' : ''
              }`}
            >
              <item.icon className="admin-nav-icon" />
              {item.label}
            </motion.button>
          ))}
        </nav>
      </motion.div>

      {/* Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="admin-overlay"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`admin-main ${!sidebarOpen ? 'sidebar-closed' : ''}`}>
        {/* Top Bar */}
        <header className="admin-header">
          <div className="admin-header-content">
            <div className="admin-header-left">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="admin-menu-button"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <h1 className="admin-page-title">
                {activePage.replace('-', ' ')}
              </h1>
            </div>

            <div className="admin-header-right">
              <div className="admin-search">
                <Search className="admin-search-icon" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="admin-search-input"
                />
              </div>


              <Button variant="outline" onClick={onBack} className="admin-back-button">
                Back to Home
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>
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
      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="stat-card"
          >
            <Card className="stat-card-inner">
              <CardContent className="stat-content">
                <div className="stat-header">
                  <div>
                    <p className="stat-title">{stat.title}</p>
                    <p className="stat-value">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

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

export default AdminDashboard
