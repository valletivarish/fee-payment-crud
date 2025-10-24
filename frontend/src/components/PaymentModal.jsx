import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X, CreditCard, DollarSign, Calendar } from 'lucide-react'
import { formatCurrency } from '../lib/utils'
import { paymentAPI } from '../services/api'

const PaymentModal = ({ fee, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    amount: fee?.balance || 0,
    method: 'CASH',
    referenceNo: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!fee) return

    try {
      setLoading(true)
      setError('')
      
      await paymentAPI.create(
        fee.id,
        formData.method,
        parseFloat(formData.amount)
      )
      
      onSuccess()
    } catch (err) {
      setError('Failed to process payment: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  const handleAmountChange = (value) => {
    const amount = parseFloat(value)
    if (amount > fee.balance) {
      setError('Amount cannot exceed the balance')
    } else {
      setError('')
    }
    setFormData({ ...formData, amount: value })
  }

  return (
    <div className="modal-overlay">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="modal-container payment-modal-container"
      >
        <div className="modal-card">
          <div className="modal-header">
            <div>
              <h2 className="modal-title">Make Payment</h2>
              <p className="modal-description">
                Pay for {fee?.course || 'Fee'}
              </p>
            </div>
            <button className="modal-close-button" onClick={onClose}>
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="modal-content">
            {fee && (
              <div className="payment-summary">
                <div className="payment-summary-row">
                  <span className="payment-summary-label">Total Amount</span>
                  <span className="payment-summary-value">{formatCurrency(fee.amountAssigned)}</span>
                </div>
                <div className="payment-summary-row">
                  <span className="payment-summary-label">Amount Paid</span>
                  <span className="payment-summary-paid">{formatCurrency(fee.amountPaid)}</span>
                </div>
                <div className="payment-summary-row">
                  <span className="payment-summary-label">Balance</span>
                  <span className="payment-summary-balance">{formatCurrency(fee.balance)}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="payment-form">
              <div className="form-field">
                <label className="form-label">
                  <DollarSign className="w-4 h-4" />
                  Payment Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={fee?.balance || 0}
                  value={formData.amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-field">
                <label className="form-label">
                  <CreditCard className="w-4 h-4" />
                  Payment Method
                </label>
                <select
                  value={formData.method}
                  onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                  className="form-select"
                >
                  <option value="CASH">Cash</option>
                  <option value="CARD">Card</option>
                  <option value="UPI">UPI</option>
                  <option value="NET_BANKING">Net Banking</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="form-field">
                <label className="form-label">
                  Reference Number (Optional)
                </label>
                <input
                  type="text"
                  value={formData.referenceNo}
                  onChange={(e) => setFormData({ ...formData, referenceNo: e.target.value })}
                  className="form-input"
                  placeholder="Enter reference number"
                />
              </div>

              <div className="form-field">
                <label className="form-label">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="form-textarea"
                  rows="3"
                  placeholder="Add any additional notes"
                />
              </div>

              {error && (
                <div className="form-error-message">
                  {error}
                </div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="btn secondary"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn primary"
                  disabled={loading || error}
                >
                  {loading ? 'Processing...' : 'Make Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default PaymentModal