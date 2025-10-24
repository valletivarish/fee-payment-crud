// Frontend validation utilities
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateAcademicYear = (year) => {
  const yearRegex = /^\d{4}-\d{4}$/;
  return yearRegex.test(year);
};

export const validateAmount = (amount) => {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
};

export const validateRequired = (value) => {
  return value && value.trim().length > 0;
};

export const validateStringLength = (value, min, max) => {
  if (!value) return false;
  return value.length >= min && value.length <= max;
};

export const validateStudent = (student) => {
  const errors = {};
  
  if (!validateRequired(student.firstName)) {
    errors.firstName = 'First name is required';
  } else if (!validateStringLength(student.firstName, 2, 50)) {
    errors.firstName = 'First name must be between 2 and 50 characters';
  }
  
  if (!validateRequired(student.lastName)) {
    errors.lastName = 'Last name is required';
  } else if (!validateStringLength(student.lastName, 2, 50)) {
    errors.lastName = 'Last name must be between 2 and 50 characters';
  }
  
  if (!validateRequired(student.email)) {
    errors.email = 'Email is required';
  } else if (!validateEmail(student.email)) {
    errors.email = 'Email must be valid';
  } else if (!validateStringLength(student.email, 1, 100)) {
    errors.email = 'Email must not exceed 100 characters';
  }
  
  if (!validateRequired(student.course)) {
    errors.course = 'Course is required';
  } else if (!validateStringLength(student.course, 1, 100)) {
    errors.course = 'Course must not exceed 100 characters';
  }
  
  if (!validateRequired(student.academicYear)) {
    errors.academicYear = 'Academic year is required';
  } else if (!validateAcademicYear(student.academicYear)) {
    errors.academicYear = 'Academic year must be in format YYYY-YYYY';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateFeePlan = (feePlan) => {
  const errors = {};
  
  if (!validateRequired(feePlan.course)) {
    errors.course = 'Course is required';
  } else if (!validateStringLength(feePlan.course, 1, 100)) {
    errors.course = 'Course must not exceed 100 characters';
  }
  
  if (!validateRequired(feePlan.academicYear)) {
    errors.academicYear = 'Academic year is required';
  } else if (!validateAcademicYear(feePlan.academicYear)) {
    errors.academicYear = 'Academic year must be in format YYYY-YYYY';
  }
  
  const amountFields = ['tuition', 'hostel', 'library', 'lab', 'sports'];
  amountFields.forEach(field => {
    const value = feePlan[field];
    if (value === undefined || value === null || value === '') {
      errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} fee is required`;
    } else {
      const num = parseFloat(value);
      if (isNaN(num) || num < 0) {
        errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} fee must be non-negative`;
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validatePayment = (payment) => {
  const errors = {};
  
  if (!validateRequired(payment.studentFeeId)) {
    errors.studentFeeId = 'Student fee ID is required';
  }
  
  if (!validateRequired(payment.method)) {
    errors.method = 'Payment method is required';
  }
  
  if (!validateRequired(payment.amount)) {
    errors.amount = 'Payment amount is required';
  } else if (!validateAmount(payment.amount)) {
    errors.amount = 'Payment amount must be greater than 0';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
