// Removed Tailwind dependencies - using custom CSS classes instead

// Simple class name utility function
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function formatCurrency(amount) {
  if (typeof amount === 'number') {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }
  return 'EUR 0.00'
}

export function formatDate(date) {
  if (!date) return 'N/A'
  const d = new Date(date)
  return d.toLocaleDateString('en-IE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function getStatusColor(status) {
  switch (status) {
    case 'PAID':
      return 'success'
    case 'PARTIAL':
      return 'warning'
    case 'PENDING':
      return 'danger'
    default:
      return 'secondary'
  }
}

export function getStatusIcon(status) {
  switch (status) {
    case 'PAID':
      return 'OK'
    case 'PARTIAL':
      return 'WARN'
    case 'PENDING':
      return 'WAIT'
    default:
      return '?'
  }
}