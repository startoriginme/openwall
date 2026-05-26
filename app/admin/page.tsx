"use client"

import { useState } from "react"
import { AdminLogin } from "@/components/admin-login"
import { AdminDashboard } from "@/components/admin-dashboard"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")

  return (
    <>
      {!isAuthenticated ? (
        <AdminLogin
          onLogin={(pwd) => {
            setPassword(pwd)
            setIsAuthenticated(true)
          }}
        />
      ) : (
        <AdminDashboard
          password={password}
          onLogout={() => {
            setIsAuthenticated(false)
            setPassword("")
          }}
        />
      )}
    </>
  )
}
