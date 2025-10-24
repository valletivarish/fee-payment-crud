import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const AdminInterface = () => {
  const [students, setStudents] = useState([]);
  const [feePlans, setFeePlans] = useState([]);
  const [studentFees, setStudentFees] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [newFeePlan, setNewFeePlan] = useState({
    course: '',
    academicYear: '',
    tuition: '',
    hostel: '',
    library: '',
    lab: '',
    sports: ''
  });

  const [assignFeeForm, setAssignFeeForm] = useState({
    studentId: '',
    feePlanId: '',
    dueDate: ''
  });

  useEffect(() => {
    fetchStudents();
    fetchFeePlans();
    fetchStudentFees();
    fetchPayments();
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

  const fetchFeePlans = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/fee-plans`);
      setFeePlans(response.data);
    } catch (err) {
      setError('Failed to fetch fee plans: ' + (err.response?.data?.message || err.message));
    }
  };

  const fetchStudentFees = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/student-fees`);
      setStudentFees(response.data);
    } catch (err) {
      setError('Failed to fetch student fees: ' + (err.response?.data?.message || err.message));
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/payments`);
      setPayments(response.data);
    } catch (err) {
      setError('Failed to fetch payments: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCreateFeePlan = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const feePlanData = {
        ...newFeePlan,
        tuition: parseFloat(newFeePlan.tuition) || 0,
        hostel: parseFloat(newFeePlan.hostel) || 0,
        library: parseFloat(newFeePlan.library) || 0,
        lab: parseFloat(newFeePlan.lab) || 0,
        sports: parseFloat(newFeePlan.sports) || 0
      };
      await axios.post(`${API_BASE_URL}/fee-plans`, feePlanData);
      setSuccess('Fee plan created successfully!');
      setNewFeePlan({
        course: '',
        academicYear: '',
        tuition: '',
        hostel: '',
        library: '',
        lab: '',
        sports: ''
      });
      fetchFeePlans();
    } catch (err) {
      setError('Failed to create fee plan: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleAssignFee = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(''); // Clear any previous errors
      
      // Validate required fields
      if (!assignFeeForm.studentId || !assignFeeForm.feePlanId || !assignFeeForm.dueDate) {
        setError('Please fill in all required fields');
        return;
      }
      
      // Convert date to ISO 8601 format with timezone
      const dueDateISO = new Date(assignFeeForm.dueDate + 'T23:59:59Z').toISOString();
      
      await axios.post(`${API_BASE_URL}/student-fees/assign`, null, {
        params: {
          studentId: assignFeeForm.studentId,
          feePlanId: assignFeeForm.feePlanId,
          dueDate: dueDateISO
        }
      });
      setSuccess('Fee assigned successfully!');
      setAssignFeeForm({ studentId: '', feePlanId: '', dueDate: '' });
      fetchStudentFees();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Unknown error occurred';
      setError('Failed to assign fee: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        setLoading(true);
        await axios.delete(`${API_BASE_URL}/students/${studentId}`);
        setSuccess('Student deleted successfully!');
        fetchStudents();
      } catch (err) {
        setError('Failed to delete student: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteFeePlan = async (feePlanId) => {
    if (window.confirm('Are you sure you want to delete this fee plan?')) {
      try {
        setLoading(true);
        await axios.delete(`${API_BASE_URL}/fee-plans/${feePlanId}`);
        setSuccess('Fee plan deleted successfully!');
        fetchFeePlans();
      } catch (err) {
        setError('Failed to delete fee plan: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
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

  const calculateTotal = (feePlan) => {
    return (feePlan.tuition || 0) + (feePlan.hostel || 0) + (feePlan.library || 0) + 
           (feePlan.lab || 0) + (feePlan.sports || 0);
  };

  return (
    <div className="container">
      <h1 className="page-title">Admin Interface</h1>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="grid grid-2">
        {/* Create Fee Plan */}
        <div className="card">
          <h2 className="card-title">Create Fee Plan</h2>
          <form onSubmit={handleCreateFeePlan}>
            <div className="form-group">
              <label className="form-label">Course</label>
              <input
                type="text"
                className="form-input"
                value={newFeePlan.course}
                onChange={(e) => setNewFeePlan({...newFeePlan, course: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Academic Year</label>
              <input
                type="text"
                className="form-input"
                value={newFeePlan.academicYear}
                onChange={(e) => setNewFeePlan({...newFeePlan, academicYear: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Tuition Fee</label>
              <input
                type="number"
                className="form-input"
                value={newFeePlan.tuition}
                onChange={(e) => setNewFeePlan({...newFeePlan, tuition: e.target.value})}
                step="0.01"
                min="0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Hostel Fee</label>
              <input
                type="number"
                className="form-input"
                value={newFeePlan.hostel}
                onChange={(e) => setNewFeePlan({...newFeePlan, hostel: e.target.value})}
                step="0.01"
                min="0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Library Fee</label>
              <input
                type="number"
                className="form-input"
                value={newFeePlan.library}
                onChange={(e) => setNewFeePlan({...newFeePlan, library: e.target.value})}
                step="0.01"
                min="0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Lab Fee</label>
              <input
                type="number"
                className="form-input"
                value={newFeePlan.lab}
                onChange={(e) => setNewFeePlan({...newFeePlan, lab: e.target.value})}
                step="0.01"
                min="0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Sports Fee</label>
              <input
                type="number"
                className="form-input"
                value={newFeePlan.sports}
                onChange={(e) => setNewFeePlan({...newFeePlan, sports: e.target.value})}
                step="0.01"
                min="0"
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Fee Plan'}
            </button>
          </form>
        </div>

        {/* Assign Fee to Student */}
        <div className="card">
          <h2 className="card-title">Assign Fee to Student</h2>
          <form onSubmit={handleAssignFee}>
            <div className="form-group">
              <label className="form-label">Student</label>
              <select
                className="form-select"
                value={assignFeeForm.studentId}
                onChange={(e) => setAssignFeeForm({...assignFeeForm, studentId: e.target.value})}
                required
              >
                <option value="">Select Student</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.firstName} {student.lastName} - {student.email}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Fee Plan</label>
              <select
                className="form-select"
                value={assignFeeForm.feePlanId}
                onChange={(e) => setAssignFeeForm({...assignFeeForm, feePlanId: e.target.value})}
                required
              >
                <option value="">Select Fee Plan</option>
                {feePlans.map(plan => (
                  <option key={plan.id} value={plan.id}>
                    {plan.course} - {plan.academicYear} (Total: {formatCurrency(calculateTotal(plan))})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input
                type="date"
                className="form-input"
                value={assignFeeForm.dueDate}
                onChange={(e) => setAssignFeeForm({...assignFeeForm, dueDate: e.target.value})}
                required
              />
            </div>
            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? 'Assigning...' : 'Assign Fee'}
            </button>
          </form>
        </div>
      </div>

      {/* Fee Plans Management */}
      <div className="card">
        <h2 className="card-title">Fee Plans</h2>
        {loading ? (
          <div className="loading">Loading fee plans...</div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Academic Year</th>
                  <th>Tuition</th>
                  <th>Hostel</th>
                  <th>Library</th>
                  <th>Lab</th>
                  <th>Sports</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {feePlans.map(plan => (
                  <tr key={plan.id}>
                    <td>{plan.course}</td>
                    <td>{plan.academicYear}</td>
                    <td>{formatCurrency(plan.tuition)}</td>
                    <td>{formatCurrency(plan.hostel)}</td>
                    <td>{formatCurrency(plan.library)}</td>
                    <td>{formatCurrency(plan.lab)}</td>
                    <td>{formatCurrency(plan.sports)}</td>
                    <td>{formatCurrency(calculateTotal(plan))}</td>
                    <td>
                      <button 
                        className="btn btn-danger"
                        onClick={() => handleDeleteFeePlan(plan.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Students Management */}
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
                  <th>Academic Year</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.id}>
                    <td>{student.firstName} {student.lastName}</td>
                    <td>{student.email}</td>
                    <td>{student.course}</td>
                    <td>{student.academicYear}</td>
                    <td>
                      <button 
                        className="btn btn-danger"
                        onClick={() => handleDeleteStudent(student.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Student Fees Overview */}
      <div className="card">
        <h2 className="card-title">Student Fees Overview</h2>
        {loading ? (
          <div className="loading">Loading student fees...</div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Academic Year</th>
                  <th>Amount Assigned</th>
                  <th>Amount Paid</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {studentFees.map(fee => {
                  const student = students.find(s => s.id === fee.studentId);
                  return (
                    <tr key={fee.id}>
                      <td>{student ? `${student.firstName} ${student.lastName}` : 'Unknown'}</td>
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
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payments Overview */}
      <div className="card">
        <h2 className="card-title">All Payments</h2>
        {loading ? (
          <div className="loading">Loading payments...</div>
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default AdminInterface;

