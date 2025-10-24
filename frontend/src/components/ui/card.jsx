import React from 'react'

const getCardClasses = (className) => {
  return `card ${className || ''}`.trim()
}

export const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={getCardClasses(className)}
    {...props}
  />
))
Card.displayName = "Card"

export const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`card-header ${className || ''}`.trim()}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

export const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={`card-title ${className || ''}`.trim()}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

export const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={`card-description ${className || ''}`.trim()}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

export const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={`card-content ${className || ''}`.trim()} {...props} />
))
CardContent.displayName = "CardContent"

export const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`card-footer ${className || ''}`.trim()}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"
