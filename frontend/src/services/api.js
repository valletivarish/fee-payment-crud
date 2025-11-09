import axios from 'axios'
import { API_BASE_URL } from '../config'

// Student API
export const studentAPI = {
  getAll: () => axios.get(`${API_BASE_URL}/students`),
  getById: (id) => axios.get(`${API_BASE_URL}/students/${id}`),
  create: (data) => axios.post(`${API_BASE_URL}/students`, data),
  update: (id, data) => axios.put(`${API_BASE_URL}/students`, data),
  delete: (id) => axios.delete(`${API_BASE_URL}/students/${id}`)
}

// Fee Plan API
export const feePlanAPI = {
  getAll: (course, academicYear) => axios.get(`${API_BASE_URL}/fee-plans`, { params: { course, academicYear } }),
  getById: (id) => axios.get(`${API_BASE_URL}/fee-plans/${id}`),
  create: (data) => axios.post(`${API_BASE_URL}/fee-plans`, data),
  update: (id, data) => axios.put(`${API_BASE_URL}/fee-plans/${id}`, data),
  delete: (id) => axios.delete(`${API_BASE_URL}/fee-plans/${id}`)
}

// Student Fee API (Assignments)
export const studentFeeAPI = {
  getAll: () => axios.get(`${API_BASE_URL}/student-fees`),
  getByStudentId: (studentId) => axios.get(`${API_BASE_URL}/student-fees/me?studentId=${studentId}`),
  assign: (studentId, feePlanId, dueDate) => axios.post(`${API_BASE_URL}/student-fees/assign`, null, { params: { studentId, feePlanId, dueDate } }),
  updateDueDate: (id, dueDate) => axios.patch(`${API_BASE_URL}/student-fees/${id}/due-date`, null, { params: { dueDate } }),
  delete: (id) => axios.delete(`${API_BASE_URL}/student-fees/${id}`)
}

// Payment API
export const paymentAPI = {
  getAll: (method, from, to) => {
    const params = {}
    if (method) params.method = method
    if (from) params.from = from
    if (to) params.to = to
    
    console.log('paymentAPI.getAll called with:', { method, from, to })
    console.log('Final params object:', params)
    
    return axios.get(`${API_BASE_URL}/payments`, { params })
  },
  getById: (id) => axios.get(`${API_BASE_URL}/payments/${id}`),
  getByStudentFeeId: (studentFeeId) => axios.get(`${API_BASE_URL}/payments/student-fee/${studentFeeId}`),
  create: (studentFeeId, method, amount) => axios.post(`${API_BASE_URL}/payments`, null, { params: { studentFeeId, method, amount } }),
  update: (id, data) => axios.put(`${API_BASE_URL}/payments/${id}`, data),
  delete: (id) => axios.delete(`${API_BASE_URL}/payments/${id}`)
}
