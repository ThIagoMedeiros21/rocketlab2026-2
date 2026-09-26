import type {
  MovieDetail,
  MovieListResponse,
  MovieReview,
  ReviewCreate,
  MovieCreate,
  MovieCreated,
  MovieUpdate
} from '../types/movie'
import type { DashboardResponse } from '../types/dashboard'
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

async function checkAdminResponse(response: Response): Promise<void> {
  if (response.ok) return

  if (response.status === 401) {
    throw new Error('Sua sessão expirou ou é inválida. Saia e entre novamente.')
  }

  if (response.status === 403) {
    throw new Error('Você não tem permissão para realizar esta ação.')
  }

  if (response.status === 404) {
    throw new Error('Este filme não foi encontrado. Atualize a listagem.')
  }

  if (response.status === 422) {
    throw new Error('Confira os campos enviados.')
  }

  throw new Error('Não foi possível concluir a operação. Tente novamente.')
}

export async function updateMovie(
  movieId: string,
  movie: MovieUpdate,
  token: string,
): Promise<MovieDetail> {
  const response = await fetch(
    `${API_URL}/movies/${encodeURIComponent(movieId)}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(movie),
    },
  )

  await checkAdminResponse(response)
  return response.json() as Promise<MovieDetail>
}

export async function deleteMovie(
  movieId: string,
  token: string,
): Promise<void> {
  const response = await fetch(
    `${API_URL}/movies/${encodeURIComponent(movieId)}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  await checkAdminResponse(response)
  // O DELETE retorna 204, sem JSON no corpo.
}

export async function fetchDashboard(
  token: string,
  minimoAvaliacoes = 3,
  signal?: AbortSignal,
): Promise<DashboardResponse> {
  const params = new URLSearchParams({
    minimo_avaliacoes: String(minimoAvaliacoes),
  })

  const response = await fetch(`${API_URL}/dashboard?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    signal,
  })

  await checkAdminResponse(response)
  return response.json() as Promise<DashboardResponse>
}