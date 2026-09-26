export interface MovieListItem {
  id : string
  titulo : string
  ano_lancamento : number | null
  nota_media : number | null
  url_poster : string | null
  generos : string[]
}

export interface MovieListResponse {
  items: MovieListItem[]
  page: number
  page_size: number
  total: number
  total_pages: number
}

export interface MovieReview {
  id: string
  nome: string
  nota: number
  comentario: string
  created_at: string
}

export interface MoviePerformance {
  orcamento_usd: string | null
  receita_usd: string | null
  lucro_usd: string
  orcamento_brl: string | null
  receita_brl: string | null
  lucro_brl: string
  popularidade: number | null
  nota_tmdb: number | null
  qtd_tmdb: number | null
  nota_imdb: number | null
  qtd_imdb: number | null
}

export interface MovieDetail extends MovieListItem {
  id_filme: string
  data_lancamento: string | null
  duracao_minutos: number | null
  status_filme: string | null
  sinopse: string | null
  url_backdrop: string | null
  produtoras: string[]
  atores: string[]
  diretores: string[]
  roteiristas: string[]
  desempenho: MoviePerformance | null
  avaliacoes: MovieReview[]
}

export interface ReviewCreate {
  nome: string
  nota: number
  comentario: string
}

export interface MovieCreate {
  titulo: string
  data_lancamento?: string | null
  ano_lancamento?: number | null
  duracao_minutos?: number | null
  status_filme?: string | null
  sinopse?: string | null
  url_poster?: string | null
  url_backdrop?: string | null
  generos?: string[]
  diretores?: string[]
}

export interface MovieCreated {
  id: string
  id_filme: string
  titulo: string
}

export interface MovieUpdate {
  titulo?: string
  ano_lancamento?: number | null
  sinopse?: string | null
}