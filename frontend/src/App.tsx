import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import AdminPage from './pages/AdminPage'
import CatalogPage from './pages/CatalogPage'
import LoginPage from './pages/LoginPage'
import MovieDetailPage from './pages/MovieDetailPage'

export default function App() {
  const [token, setToken] = useState<string | null>(null)

  return (
    <Routes>
      <Route path="/" element={<CatalogPage />} />

      <Route
        path="/login"
        element={
          token ? (
            <Navigate to="/admin" replace />
          ) : (
            <LoginPage onLogin={setToken} />
          )
        }
      />

      <Route
        path="/admin"
        element={
          token ? (
            <AdminPage
              token={token}
              onLogout={() => setToken(null)}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/movies/:movieId"
        element={<MovieDetailPage />}
      />
    </Routes>
  )
}