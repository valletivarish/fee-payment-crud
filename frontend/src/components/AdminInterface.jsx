import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { getCourseOptions, getDegreeOptions, getAcademicYearOptions } from '../services/dataService';
import { API_BASE_URL } from '../config';

const AdminInterface = ({ onStudentCreated }) => {
  const [students, setStudents] = useState([]);
  const [feePlans, setFeePlans] = useState([]);
  const [studentFees, setStudentFees] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Course options from centralized service
  const courseOptions = useMemo(() => getCourseOptions(), []);
  const degreeOptions = useMemo(() => getDegreeOptions(), []);
  const academicYearOptions = useMemo(() => getAcademicYearOptions(), []);

  // Student creation form
  const [newStudent, setNewStudent] = useState({
    firstName: '',
    lastName: '',
    email: '',
    course: '',
    courseStartYear: '',
    courseEndYear: '',
    degreeType: degreeOptions[0]?.value || '',
    degreeDurationYears: degreeOptions[0]?.durationYears || ''
  });

  // State for custom course input
  const [showCustomCourse, setShowCustomCourse] = useState(false);
  const [customCourse, setCustomCourse] = useState('');

  // Course duration mapping
  const getCourseDuration = (course) => {
    const durationMap = {
      'Computer Science Engineering': '4 years',
      'Information Technology': '4 years',
      'Electronics and Communication Engineering': '4 years',
      'Mechanical Engineering': '4 years',
      'Civil Engineering': '4 years',
      'Electrical Engineering': '4 years',
      'Chemical Engineering': '4 years',
      'Aerospace Engineering': '4 years',
      'Biotechnology': '4 years',
      'Business Administration': '3 years',
      'Commerce': '3 years',
      'Finance': '3 years',
      'Marketing': '3 years',
      'Human Resources': '3 years',
      'Arts': '3 years',
      'Literature': '3 years',
      'History': '3 years',
      'Philosophy': '3 years',
      'Psychology': '3 years',
      'Science': '3 years',
      'Physics': '3 years',
      'Chemistry': '3 years',
      'Mathematics': '3 years',
      'Biology': '3 years',
      'Medicine': '5 years',
      'Law': '3 years',
      'Architecture': '5 years',
      'Design': '4 years'
    };
    return durationMap[course] || '3 years';
  };

  // Academic year options from centralized service
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

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      const startYear = parseInt(newStudent.courseStartYear, 10)
      const endYear = parseInt(newStudent.courseEndYear, 10)

      if (Number.isNaN(startYear) || Number.isNaN(endYear)) {
        setError('Please provide valid course start and end years')
        setLoading(false)
        return
      }

      if (endYear <= startYear) {
        setError('Course end year must be after start year')
        setLoading(false)
        return
      }

      await axios.post(`${API_BASE_URL}/students`, {
        firstName: newStudent.firstName,
        lastName: newStudent.lastName,
        email: newStudent.email,
        course: newStudent.course,
        degreeType: newStudent.degreeType || degreeOptions[0]?.value || '',
        degreeDurationYears: newStudent.degreeDurationYears
          ? Number(newStudent.degreeDurationYears)
          : undefined,
        courses: [
          {
            courseName: newStudent.course,
            startYear,
            endYear,
            primary: true
          }
        ],
        academicYear: newStudent.courseStartYear && newStudent.courseEndYear
          ? `${newStudent.courseStartYear}-${newStudent.courseEndYear}`
          : ''
      });
      setSuccess('Student added successfully!');
      setNewStudent({
        firstName: '',
        lastName: '',
        email: '',
        course: '',
        courseStartYear: '',
        courseEndYear: '',
        degreeType: degreeOptions[0]?.value || '',
        degreeDurationYears: degreeOptions[0]?.durationYears || ''
      });
      setShowCustomCourse(false);
      setCustomCourse('');
      fetchStudents();
      if (onStudentCreated) {
        onStudentCreated();
      }
    } catch (err) {
      setError('Failed to add student: ' + (err.response?.data?.message || err.message));
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

  const calculateTotal = (feePlan) => {
    return (feePlan.tuition || 0) + (feePlan.hostel || 0) + (feePlan.library || 0) + 
           (feePlan.lab || 0) + (feePlan.sports || 0);
  };

  return (
    <div className="container">
      <h1 className="page-title">Admin Interface</h1>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="grid grid-3">
        {/* Add Student */}
        <div className="card">
          <h2 className="card-title">Add New Student</h2>
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
              <select
                className="form-select"
                value={newStudent.course}
                onChange={(e) => {
                  if (e.target.value === 'Other') {
                    setShowCustomCourse(true);
                    setNewStudent({...newStudent, course: ''});
                  } else {
                    setShowCustomCourse(false);
                    setNewStudent({...newStudent, course: e.target.value});
                  }
                }}
                required
              >
                <option value="">Select Course</option>
                {courseOptions.map(course => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
              {showCustomCourse && (
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter custom course name"
                  value={customCourse}
                  onChange={(e) => {
                    setCustomCourse(e.target.value);
                    setNewStudent({...newStudent, course: e.target.value});
                  }}
                  style={{marginTop: '10px'}}
                />
              )}
              {newStudent.course && !showCustomCourse && (
                <div className="course-info">
                  <strong>Duration:</strong> {getCourseDuration(newStudent.course)}
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Degree</label>
              <select
                className="form-select"
                value={newStudent.degreeType}
                onChange={(e) => {
                  const value = e.target.value;
                  const selectedDegree = degreeOptions.find(option => option.value === value);
                  setNewStudent({
                    ...newStudent,
                    degreeType: value,
                    degreeDurationYears: selectedDegree?.durationYears ?? ''
                  });
                }}
                required
              >
                <option value="">Select Degree</option>
                {degreeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Degree Duration (years)</label>
              <input
                type="number"
                className="form-input"
                value={newStudent.degreeDurationYears}
                onChange={(e) => setNewStudent({...newStudent, degreeDurationYears: e.target.value})}
                min="1"
                max="10"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Course Start Year</label>
              <input
                type="number"
                className="form-input"
                value={newStudent.courseStartYear}
                onChange={(e) => setNewStudent({...newStudent, courseStartYear: e.target.value})}
                min="1900"
                max="3000"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Course End Year</label>
              <input
                type="number"
                className="form-input"
                value={newStudent.courseEndYear}
                onChange={(e) => setNewStudent({...newStudent, courseEndYear: e.target.value})}
                min="1900"
                max="3000"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Student'}
            </button>
          </form>
        </div>

        {/* Create Fee Plan */}
        <div className="card">
          <h2 className="card-title">Create Fee Plan</h2>
          <form onSubmit={handleCreateFeePlan}>
            <div className="form-group">
              <label className="form-label">Course</label>
              <select
                className="form-select"
                value={newFeePlan.course}
                onChange={(e) => {
                  if (e.target.value === 'Other') {
                    setShowCustomCourse(true);
                    setNewFeePlan({...newFeePlan, course: ''});
                  } else {
                    setShowCustomCourse(false);
                    setNewFeePlan({...newFeePlan, course: e.target.value});
                  }
                }}
                required
              >
                <option value="">Select Course</option>
                {courseOptions.map(course => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
              {showCustomCourse && (
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter custom course name"
                  value={customCourse}
                  onChange={(e) => {
                    setCustomCourse(e.target.value);
                    setNewFeePlan({...newFeePlan, course: e.target.value});
                  }}
                  style={{marginTop: '10px'}}
                />
              )}
              {newFeePlan.course && !showCustomCourse && (
                <div className="course-info">
                  <strong>Duration:</strong> {getCourseDuration(newFeePlan.course)}
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Academic Year</label>
              <select
                className="form-select"
                value={newFeePlan.academicYear}
                onChange={(e) => setNewFeePlan({...newFeePlan, academicYear: e.target.value})}
                required
              >
                <option value="">Select Academic Year</option>
                {academicYearOptions.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
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

