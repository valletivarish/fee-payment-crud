import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const StudentInterface = () => {
  const [students, setStudents] = useState([]);
  const [studentFees, setStudentFees] = useState([]);
  const [payments, setPayments] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [newStudent, setNewStudent] = useState({
    firstName: '',
    lastName: '',
    email: '',
    course: '',
    academicYear: ''
  });

  const [paymentForm, setPaymentForm] = useState({
    studentFeeId: '',
    method: 'CASH',
    amount: '',
    referenceNo: '',
    notes: ''
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/students`);
      // Handle both array response and error response
      if (Array.isArray(response.data)) {
        setStudents(response.data);
      } else if (response.data.status === 404) {
        setStudents([]); // Empty array for no records found
      } else {
        setStudents(response.data);
      }
    } catch (err) {
      setError('Failed to fetch students: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentFees = async (studentId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/student-fees/me?studentId=${studentId}`);
      setStudentFees(response.data);
    } catch (err) {
      setError('Failed to fetch student fees: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async (studentFeeId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/payments/student-fee/${studentFeeId}`);
      setPayments(response.data);
    } catch (err) {
      setError('Failed to fetch payments: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/students`, newStudent);
      setSuccess('Student added successfully!');
      setNewStudent({ firstName: '', lastName: '', email: '', course: '', academicYear: '' });
      fetchStudents();
    } catch (err) {
      setError('Failed to add student: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleMakePayment = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/payments`, null, {
        params: {
          studentFeeId: paymentForm.studentFeeId,
          method: paymentForm.method,
          amount: paymentForm.amount
        }
      });
      setSuccess('Payment made successfully!');
      setPaymentForm({ studentFeeId: '', method: 'CASH', amount: '', referenceNo: '', notes: '' });
      if (selectedStudent) {
        fetchStudentFees(selectedStudent.id);
      }
    } catch (err) {
      setError('Failed to make payment: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const selectStudent = (student) => {
    setSelectedStudent(student);
    fetchStudentFees(student.id);
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

  return (
    <div className="container">
      <h1 className="page-title">Student Interface</h1>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="grid grid-2">
        {/* Student Management */}
        <div className="card">
          <h2 className="card-title">Student Management</h2>
          
          {/* Add Student Form */}
          <form onSubmit={handleAddStudent}>
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input
                type="text"
                className="form-input"
                value={newStudent.firstName}
                onChange={(e) => setNewStudent({...newStudent, firstName: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                className="form-input"
                value={newStudent.lastName}
                onChange={(e) => setNewStudent({...newStudent, lastName: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={newStudent.email}
                onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Course</label>
              <input
                type="text"
                className="form-input"
                value={newStudent.course}
                onChange={(e) => setNewStudent({...newStudent, course: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Academic Year</label>
              <input
                type="text"
                className="form-input"
                value={newStudent.academicYear}
                onChange={(e) => setNewStudent({...newStudent, academicYear: e.target.value})}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Student'}
            </button>
          </form>
        </div>

        {/* Student List */}
        <div className="card">
          <h2 className="card-title">Students</h2>
          {loading ? (
            <div className="loading">Loading students...</div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Course</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => (
                    <tr key={student.id}>
                      <td>{student.firstName} {student.lastName}</td>
                      <td>{student.email}</td>
                      <td>{student.course}</td>
                      <td>
                        <button 
                          className="btn btn-primary"
                          onClick={() => selectStudent(student)}
                        >
                          View Fees
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Selected Student Fees */}
      {selectedStudent && (
        <div className="card">
          <h2 className="card-title">
            Fees for {selectedStudent.firstName} {selectedStudent.lastName}
          </h2>
          {loading ? (
            <div className="loading">Loading fees...</div>
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
      )}

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

