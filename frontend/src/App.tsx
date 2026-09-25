import { Route, Routes } from 'react-router-dom'
import CatalogPage from './pages/CatalogPage'
import MovieDetailPage from './pages/MovieDetailPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<CatalogPage />} />
      <Route path="/movies/:movieId" element={<MovieDetailPage />} />
    </Routes>
  )
}
