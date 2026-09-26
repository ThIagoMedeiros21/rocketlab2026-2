import type {
  MovieDetail,
  MovieListResponse,
  MovieReview,
  ReviewCreate,
  MovieCreate,
  MovieCreated
} from '../types/movie'

import type { LoginRequest, TokenResponse } from '../types/auth'

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

export async function fetchMovie(movieId: string): Promise<MovieDetail> {
  const response = await fetch(
    `${API_URL}/movies/${encodeURIComponent(movieId)}`,
  )

  if (!response.ok) {
    throw new Error('Não foi possível carregar os detalhes do filme.')
  }

  return response.json() as Promise<MovieDetail>
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

export async function login(
  credentials: LoginRequest,
): Promise<TokenResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Usuário ou senha inválidos.')
    }

    throw new Error('Não foi possível entrar. Tente novamente.')
  }

  return response.json() as Promise<TokenResponse>
}

export async function createMovie(
  movie: MovieCreate,
  token: string,
): Promise<MovieCreated> {
  const response = await fetch(`${API_URL}/movies`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(movie),
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Sua sessão expirou ou é inválida. Entre novamente.')
    }

    if (response.status === 422) {
      throw new Error(
        'Confira os campos. Gêneros e diretores não podem conter nomes vazios ou duplicados.',
      )
    }

    throw new Error('Não foi possível cadastrar o filme. Tente novamente.')
  }

  return response.json() as Promise<MovieCreated>
}