import type {
  MovieDetail,
  MovieListResponse,
  MovieReview,
  ReviewCreate,
} from '../types/movie'

const API_URL = 'http://127.0.0.1:8000/api/v1'

export async function fetchMovies(
  page = 1,
  pageSize = 20,
  query = '',
  genre = '',
): Promise<MovieListResponse> {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  })

  if (query.trim()) {
    params.set('q', query.trim())
  }

  if (genre.trim()) {
    params.set('genero', genre.trim())
  }

  const response = await fetch(`${API_URL}/movies?${params}`)

  if (!response.ok) {
    throw new Error('Não foi possível carregar os filmes.')
  }

  return response.json() as Promise<MovieListResponse>
}

export async function createReview(
  movieId: string,
  review: ReviewCreate,
): Promise<MovieReview> {
  const response = await fetch(
    `${API_URL}/movies/${encodeURIComponent(movieId)}/reviews`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(review),
    },
  )

  if (!response.ok) {
    throw new Error('Não foi possível enviar a avaliação.')
  }

  return response.json() as Promise<MovieReview>
}