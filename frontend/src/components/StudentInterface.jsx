import React, { useState, useEffect } from 'react';
import { studentFeeAPI, paymentAPI } from '../services/api';

const StudentInterface = ({ selectedStudent }) => {
  const [studentFees, setStudentFees] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [paymentForm, setPaymentForm] = useState({
    studentFeeId: '',
    method: 'CASH',
    amount: '',
    referenceNo: '',
    notes: ''
  });

  useEffect(() => {
    if (selectedStudent) {
      fetchCurrentStudentFees();
    }
  }, [selectedStudent]);

  const fetchCurrentStudentFees = async () => {
    if (!selectedStudent) return;
    
    try {
      setLoading(true);
      const response = await studentFeeAPI.getByStudentId(selectedStudent.id);
      setStudentFees(response.data);
    } catch (err) {
      setError('Failed to fetch your fees: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };


  const fetchPayments = async (studentFeeId) => {
    try {
      const response = await paymentAPI.getByStudentFeeId(studentFeeId);
      setPayments(response.data);
    } catch (err) {
      setError('Failed to fetch payments: ' + (err.response?.data?.message || err.message));
    }
  };


  const handleMakePayment = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Convert amount to number to ensure proper decimal handling
      const amount = parseFloat(paymentForm.amount);
      if (isNaN(amount) || amount <= 0) {
        setError('Please enter a valid amount');
        return;
      }
      
      console.log('Making payment:', {
        studentFeeId: paymentForm.studentFeeId,
        method: paymentForm.method,
        amount: amount
      });
      
      await paymentAPI.create(paymentForm.studentFeeId, paymentForm.method, amount);
      setSuccess('Payment made successfully!');
      setPaymentForm({ studentFeeId: '', method: 'CASH', amount: '', referenceNo: '', notes: '' });
      fetchCurrentStudentFees();
    } catch (err) {
      setError('Failed to make payment: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };


  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  if (!selectedStudent) {
    return (
      <div className="container">
        <div className="loading">Please select a student from the home page.</div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="page-title">Student Dashboard - {selectedStudent.firstName} {selectedStudent.lastName}</h1>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      {/* My Fees */}
      <div className="card">
        <h2 className="card-title">My Fee Statements</h2>
        {loading ? (
          <div className="loading">Loading your fees...</div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Academic Year</th>
                  <th>Amount Assigned</th>
                  <th>Amount Paid</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {studentFees.map(fee => (
                  <tr key={fee.id}>
                    <td>{fee.course}</td>
                    <td>{fee.academicYear}</td>
                    <td>{formatCurrency(fee.amountAssigned)}</td>
                    <td>{formatCurrency(fee.amountPaid)}</td>
                    <td>{formatCurrency(fee.balance)}</td>
                    <td>
                      <span className={`status-badge status-${fee.status.toLowerCase()}`}>
                        {fee.status}
                      </span>
                    </td>
                    <td>{fee.dueDate ? formatDate(fee.dueDate) : 'N/A'}</td>
                    <td>
                      <button 
                        className="btn btn-success"
                        onClick={() => {
                          setPaymentForm({...paymentForm, studentFeeId: fee.id});
                          fetchPayments(fee.id);
                        }}
                      >
                        Make Payment
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Form */}
      {paymentForm.studentFeeId && (
        <div className="card">
          <h2 className="card-title">Make Payment</h2>
          <form onSubmit={handleMakePayment}>
            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select
                className="form-select"
                value={paymentForm.method}
                onChange={(e) => setPaymentForm({...paymentForm, method: e.target.value})}
                required
              >
                <option value="CASH">Cash</option>
                <option value="CARD">Card</option>
                <option value="UPI">UPI</option>
                <option value="NET_BANKING">Net Banking</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Amount</label>
              <input
                type="number"
                className="form-input"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                step="0.01"
                min="0"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Reference Number (Optional)</label>
              <input
                type="text"
                className="form-input"
                value={paymentForm.referenceNo}
                onChange={(e) => setPaymentForm({...paymentForm, referenceNo: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Notes (Optional)</label>
              <textarea
                className="form-input"
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
                rows="3"
              />
            </div>
            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? 'Processing...' : 'Make Payment'}
            </button>
            <button 
              type="button" 
              className="btn btn-danger"
              onClick={() => setPaymentForm({studentFeeId: '', method: 'CASH', amount: '', referenceNo: '', notes: ''})}
              style={{marginLeft: '10px'}}
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Payment History */}
      {payments.length > 0 && (
        <div className="card">
          <h2 className="card-title">Payment History</h2>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Paid At</th>
                  <th>Reference No</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(payment => (
                  <tr key={payment.id}>
                    <td>{formatCurrency(payment.amount)}</td>
                    <td>{payment.method}</td>
                    <td>{formatDate(payment.paidAt)}</td>
                    <td>{payment.referenceNo || 'N/A'}</td>
                    <td>{payment.notes || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentInterface;

