from pydantic import BaseModel


class DashboardIndicators(BaseModel):
    total_filmes: int
    total_avaliacoes: int
    filmes_avaliados: int
    media_geral: float | None
    filmes_sem_genero: int
    filmes_sem_ano: int


class GenreCount(BaseModel):
    genero: str
    quantidade: int


class YearCount(BaseModel):
    ano: int
    quantidade: int


class DashboardMovie(BaseModel):
    id: str
    titulo: str
    ano_lancamento: int | None
    url_poster: str | None


class RankedMovie(DashboardMovie):
    nota_media: float
    quantidade_avaliacoes: int


class ExternalRankedMovie(DashboardMovie):
    nota: float
    quantidade_votos: int


class FinancialRankedMovie(DashboardMovie):
    orcamento_usd: float | None
    receita_usd: float
    lucro_estimado_usd: float | None
    retorno_percentual: float | None


class PopularMovie(DashboardMovie):
    popularidade: float


class DashboardResponse(BaseModel):
    indicadores: DashboardIndicators
    filmes_por_genero: list[GenreCount]
    filmes_por_ano: list[YearCount]

    melhores_filmes: list[RankedMovie]
    melhores_tmdb: list[ExternalRankedMovie]
    melhores_imdb: list[ExternalRankedMovie]

    maiores_lucros: list[FinancialRankedMovie]
    maiores_bilheterias: list[FinancialRankedMovie]
    maiores_retornos: list[FinancialRankedMovie]

    mais_populares: list[PopularMovie]

    minimo_avaliacoes_ranking: int
    minimo_votos_externos: int