import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Users,
  Calendar,
  DollarSign
} from 'lucide-react'
// Removed UI component imports to use custom CSS classes
import { formatCurrency, formatDate } from '../../lib/utils'
import { studentFeeAPI } from '../../services/api'
import AssignmentModal from './AssignmentModal'

const AssignmentsPage = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState(null)

  // Fetch assignments from API
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAssignments = async () => {
      setLoading(true)
      try {
        const response = await studentFeeAPI.getAll()
        setAssignments(response.data)
      } catch (error) {
        console.error('Failed to fetch assignments:', error)
        setAssignments([])
      } finally {
        setLoading(false)
      }
    }
    fetchAssignments()
  }, [])

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.course.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || assignment.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="danger">Pending</Badge>
      case 'PARTIAL':
        return <Badge variant="warning">Partial</Badge>
      case 'PAID':
        return <Badge variant="success">Paid</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          {onBack && (
            <button 
              className="back-button mb-2"
              onClick={onBack}
              title="Back to Dashboard"
            >
              Back to Dashboard
            </button>
          )}
          <h2 className="text-2xl font-bold text-gray-900">Fee Assignments</h2>
          <p className="text-gray-600">Manage fee plan assignments to students</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="gradient" 
            size="sm"
            onClick={() => setShowModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Assign Fee Plan
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search assignments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="PARTIAL">Partial</option>
                <option value="PAID">Paid</option>
              </select>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assignments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Assignments ({filteredAssignments.length})</CardTitle>
          <CardDescription>Complete list of fee plan assignments to students</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Student</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Course</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Fee Plan</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Total Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Balance</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Due Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.map((assignment, index) => (
                  <motion.tr
                    key={assignment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {assignment.studentName}
                        </div>
                        <div className="text-sm text-gray-500">{assignment.studentEmail}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-900">{assignment.course}</div>
                      <div className="text-xs text-gray-500">{assignment.academicYear}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-900">{assignment.feePlan}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(assignment.totalAmount)}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(assignment.balance)}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(assignment.status)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-900">
                        {formatDate(assignment.dueDate)}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setEditingAssignment(assignment)
                            setShowModal(true)
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Assignment Modal */}
      {showModal && (
        <AssignmentModal
          assignment={editingAssignment}
          onClose={() => {
            setShowModal(false)
            setEditingAssignment(null)
          }}
          onSave={(assignmentData) => {
            console.log('Save assignment:', assignmentData)
            setShowModal(false)
            setEditingAssignment(null)
          }}
        />
      )}
    </div>
  )
}

export default AssignmentsPage
