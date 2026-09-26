export interface DashboardMovie {
  id: string
  titulo: string
  ano_lancamento: number | null
  url_poster: string | null
}

export interface UserRankedMovie extends DashboardMovie {
  nota_media: number
  quantidade_avaliacoes: number
}

export interface ExternalRankedMovie extends DashboardMovie {
  nota: number
  quantidade_votos: number
}

export interface FinancialRankedMovie extends DashboardMovie {
  orcamento_usd: number | null
  receita_usd: number
  lucro_estimado_usd: number | null
  retorno_percentual: number | null
}

export interface PopularMovie extends DashboardMovie {
  popularidade: number
}

export interface DashboardResponse {
  indicadores: {
    total_filmes: number
    total_avaliacoes: number
    filmes_avaliados: number
    media_geral: number | null
    filmes_sem_genero: number
    filmes_sem_ano: number
  }
  filmes_por_genero: {
    genero: string
    quantidade: number
  }[]
  filmes_por_ano: {
    ano: number
    quantidade: number
  }[]
  melhores_filmes: UserRankedMovie[]
  melhores_tmdb: ExternalRankedMovie[]
  melhores_imdb: ExternalRankedMovie[]
  maiores_lucros: FinancialRankedMovie[]
  maiores_bilheterias: FinancialRankedMovie[]
  maiores_retornos: FinancialRankedMovie[]
  mais_populares: PopularMovie[]
  minimo_avaliacoes_ranking: number
  minimo_votos_externos: number
}