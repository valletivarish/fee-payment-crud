import React from 'react'

const getButtonClasses = (variant, size, className) => {
  const baseClasses = "btn"
  const variantClasses = {
    default: "btn-primary",
    destructive: "btn-danger", 
    outline: "btn-outline",
    secondary: "btn-secondary",
    ghost: "btn-ghost",
    link: "btn-link",
    gradient: "btn-gradient",
    success: "btn-success",
    warning: "btn-warning",
    danger: "btn-danger"
  }
  const sizeClasses = {
    default: "btn-default",
    sm: "btn-sm",
    lg: "btn-lg",
    icon: "btn-icon"
  }
  
  return `${baseClasses} ${variantClasses[variant] || variantClasses.default} ${sizeClasses[size] || sizeClasses.default} ${className || ''}`.trim()
}

export const Button = React.forwardRef(({ 
  className, 
  variant = "default", 
  size = "default", 
  children, 
  ...props 
}, ref) => {
  return (
    <button
      className={getButtonClasses(variant, size, className)}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  )
})
Button.displayName = "Button"
