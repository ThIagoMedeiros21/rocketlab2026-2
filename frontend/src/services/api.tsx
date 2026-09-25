import type { MovieListResponse } from '../types/movie'

const API_URL = 'http://127.0.0.1:8000/api/v1'

export async function fetchMovies(
  page = 1,
  pageSize = 20,
  query = '',
): Promise<MovieListResponse> {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  })

  if (query.trim()) {
    params.set('q', query.trim())
  }

  const response = await fetch(`${API_URL}/movies?${params}`)

  if (!response.ok) {
    throw new Error('Não foi possível carregar os filmes.')
  }

  return response.json() as Promise<MovieListResponse>
}