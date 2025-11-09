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
  
  if (!validateRequired(student.degreeType)) {
    errors.degreeType = 'Degree type is required';
  }

  if (student.degreeDurationYears !== undefined && student.degreeDurationYears !== null) {
    const duration = parseInt(student.degreeDurationYears, 10);
    if (isNaN(duration)) {
      errors.degreeDurationYears = 'Degree duration must be a number';
    } else if (duration < 1 || duration > 10) {
      errors.degreeDurationYears = 'Degree duration must be between 1 and 10 years';
    }
  }

  const courseErrors = [];
  const courses = Array.isArray(student.courses) ? student.courses : [];

  if (!courses.length) {
    courseErrors.push({ courseName: 'At least one course is required' });
  } else {
    if (student.degreeType !== 'DUAL' && courses.length > 1) {
      errors.degreeType = 'Additional courses are allowed only for Dual Degree students';
    }

    courses.forEach((course, index) => {
      const entryErrors = {};
      if (!validateRequired(course.courseName)) {
        entryErrors.courseName = 'Course name is required';
      } else if (!validateStringLength(course.courseName, 1, 100)) {
        entryErrors.courseName = 'Course name must not exceed 100 characters';
      }

      const startYear = parseInt(course.startYear, 10);
      const endYear = parseInt(course.endYear, 10);

      if (isNaN(startYear)) {
        entryErrors.startYear = 'Start year is required';
      } else if (startYear < 1900 || startYear > 3000) {
        entryErrors.startYear = 'Start year must be between 1900 and 3000';
      }

      if (isNaN(endYear)) {
        entryErrors.endYear = 'End year is required';
      } else if (endYear < 1900 || endYear > 3000) {
        entryErrors.endYear = 'End year must be between 1900 and 3000';
      } else if (!isNaN(startYear) && endYear <= startYear) {
        entryErrors.endYear = 'End year must be after start year';
      }

      courseErrors[index] = entryErrors;
    });

    const hasPrimary = courses.some(course => course.primary);
    if (!hasPrimary && courseErrors.length) {
      courseErrors[0] = { ...(courseErrors[0] || {}), primary: 'Select a primary course' };
    }
  }

  if (courseErrors.some(entry => entry && Object.keys(entry).length > 0)) {
    errors.courses = courseErrors;
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
