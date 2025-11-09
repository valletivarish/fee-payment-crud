import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Login from './Login'

const RoleLoginPage = () => {
  const { role } = useParams()
  const normalizedRole = (role || '').toLowerCase()

  useEffect(() => {
    const baseTitle = 'Fee Management System'
    const roleTitle = normalizedRole === 'admin' ? 'Administrator Login' : 'Student Login'
    document.title = `${roleTitle} | ${baseTitle}`
  }, [normalizedRole])

  return <Login />
}

export default RoleLoginPage

