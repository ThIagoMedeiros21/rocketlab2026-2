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