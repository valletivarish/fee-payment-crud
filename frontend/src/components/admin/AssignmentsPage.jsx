import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import { formatCurrency, formatDate } from '../../lib/utils'
import { studentFeeAPI, studentAPI } from '../../services/api'

const DuePaymentsPage = () => {
  const [assignments, setAssignments] = useState([])
  const [studentsById, setStudentsById] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [assignmentsRes, studentsRes] = await Promise.all([
          studentFeeAPI.getAll(),
          studentAPI.getAll()
        ])

        setAssignments(assignmentsRes.data || [])

        const studentMap = {}
        ;(studentsRes.data || []).forEach(student => {
          studentMap[student.id] = student
        })
        setStudentsById(studentMap)
      } catch (error) {
        console.error('Failed to fetch due payments data:', error)
        setAssignments([])
        setStudentsById({})
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const pendingAssignments = useMemo(() =>
    (assignments || [])
      .filter(assignment => assignment.status !== 'PAID')
      .map(assignment => ({
        ...assignment,
        student: studentsById[assignment.studentId] || {}
      }))
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)),
  [assignments, studentsById])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading due payments...</p>
      </div>
    )
  }

  return (
    <div className="due-payments-page">
      <div className="due-payments-summary">
        <h2>Outstanding Accounts</h2>
        <p>Students with unpaid fee assignments</p>
        <span className="due-payments-count">{pendingAssignments.length} record{pendingAssignments.length === 1 ? '' : 's'}</span>
      </div>

      {pendingAssignments.length === 0 ? (
        <div className="due-payments-empty">
          <AlertCircle className="due-payments-empty__icon" />
          <p>No outstanding payments. Great job!</p>
              </div>
      ) : (
        <div className="due-payments-list">
          {pendingAssignments.map((assignment, index) => {
            const student = assignment.student || {}
            const name = assignment.studentName || `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Unknown student'
            const email = assignment.studentEmail || student.email || '—'
            const course = assignment.course || student.courses?.[0]?.courseName || '—'
            const feePlan = assignment.feePlanName || assignment.feeType || '—'
            const balance = assignment.balance ?? assignment.amountDue ?? 0
            const dueDate = assignment.dueDate ? formatDate(assignment.dueDate) : 'No due date'
            const dueTimestamp = assignment.dueDate ? new Date(assignment.dueDate).getTime() : null
            const isOverdue = dueTimestamp ? dueTimestamp < Date.now() : false

            return (
              <motion.div
                    key={assignment.id}
                initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                className={`due-payments-row ${isOverdue ? 'is-overdue' : ''}`}
                  >
                <div className="due-payments-row__primary">
                  <span className="due-payments-name">{name}</span>
                  <span className="due-payments-email">{email}</span>
                        </div>
                <div className="due-payments-row__meta">
                  <span className="due-payments-plan">{feePlan}</span>
                  <span className="due-payments-course">{course}</span>
                      </div>
                <div className="due-payments-row__amount">
                  <span>{formatCurrency(balance)}</span>
                  <span className={`due-payments-due ${isOverdue ? 'overdue' : 'upcoming'}`}>
                    {isOverdue ? `Overdue since ${dueDate}` : `Due ${dueDate}`}
                  </span>
                      </div>
              </motion.div>
            )
          })}
          </div>
      )}
    </div>
  )
}

export default DuePaymentsPage
