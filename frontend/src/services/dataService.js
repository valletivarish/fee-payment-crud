// Centralized data service for static options
// This replaces hardcoded arrays throughout the application

export const getCourseOptions = () => [
  'Computer Science Engineering',
  'Information Technology',
  'Electronics and Communication Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
  'Chemical Engineering',
  'Aerospace Engineering',
  'Biotechnology',
  'Business Administration',
  'Commerce',
  'Finance',
  'Marketing',
  'Human Resources',
  'Arts',
  'Literature',
  'History',
  'Philosophy',
  'Psychology',
  'Science',
  'Physics',
  'Chemistry',
  'Mathematics',
  'Biology',
  'Medicine',
  'Law',
  'Architecture',
  'Design',
  'Other'
]

export const generateAcademicYears = () => {
  const currentYear = new Date().getFullYear()
  const years = []
  
  // Generate years from current year + 1 to current year - 4
  for (let i = 1; i >= -4; i--) {
    const year = currentYear + i
    years.push(`${year}-${year + 1}`)
  }
  
  return years
}

export const getAcademicYearOptions = () => generateAcademicYears()

export const getDegreeOptions = () => [
  { value: 'BACHELOR', label: 'Bachelor\'s Degree', durationYears: 4 },
  { value: 'MASTER', label: 'Master\'s Degree', durationYears: 2 },
  { value: 'DIPLOMA', label: 'Diploma', durationYears: 3 },
  { value: 'DUAL', label: 'Dual Degree', durationYears: 5 },
  { value: 'OTHER', label: 'Other', durationYears: null }
]

export const getPaymentMethods = () => [
  { value: 'CASH', label: 'Cash' },
  { value: 'CARD', label: 'Card' },
  { value: 'UPI', label: 'UPI' },
  { value: 'NET_BANKING', label: 'Net Banking' },
  { value: 'OTHER', label: 'Other' }
]

export const getStatusOptions = () => [
  { value: 'PENDING', label: 'Pending' },
  { value: 'PARTIAL', label: 'Partial' },
  { value: 'PAID', label: 'Paid' }
]
