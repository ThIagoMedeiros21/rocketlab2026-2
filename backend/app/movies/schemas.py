from pydantic import BaseModel, ConfigDict, field_validator
from datetime import datetime, date
from decimal import Decimal

class MovieListItem(BaseModel):
    id : str
    titulo : str
    ano_lancamento : int | None
    nota_media : float | None
    url_poster : str | None
    generos : list[str]

class MovieListResponse(BaseModel):
    items: list[MovieListItem]
    page: int
    page_size: int
    total: int
    total_pages: int

class ItemsReview(BaseModel):
    id: str
    nome : str
    nota : float
    comentario: str
    created_at: datetime


class MoviePerformance(BaseModel):
    orcamento_usd: Decimal | None
    receita_usd: Decimal | None
    lucro_usd: Decimal
    orcamento_brl: Decimal | None
    receita_brl: Decimal | None
    lucro_brl: Decimal
    popularidade: float | None
    nota_tmdb: float | None
    qtd_tmdb: int | None
    nota_imdb: float | None
    qtd_imdb: int | None
    model_config = ConfigDict(from_attributes=True)

class MovieDetail(MovieListItem):
    id_filme: str
    data_lancamento: date | None
    duracao_minutos: int | None
    status_filme: str | None
    sinopse: str | None
    url_backdrop: str | None
    produtoras: list[str]
    atores: list[str]
    diretores: list[str]
    roteiristas: list[str]
    desempenho: MoviePerformance | None
    avaliacoes: list[ItemsReview]


class MovieCreate(BaseModel):
    id_filme: str
    titulo: str
    data_lancamento: date | None = None
    ano_lancamento: int | None = None
    duracao_minutos: int | None = None
    status_filme: str | None = None
    sinopse: str | None = None
    url_poster: str | None = None
    url_backdrop: str | None = None

class MovieCreated(BaseModel):
    id: str
    id_filme: str
    titulo: str

class MovieUpdate(BaseModel):
    titulo: str | None = None
    ano_lancamento: int | None = None
    sinopse: str | None = None
    @field_validator("titulo")
    @classmethod
    def validar_titulo(cls, valor: str | None) -> str:
        if valor is None or not valor.strip():
            raise ValueError("O título não pode ser nulo ou vazio")
        return valor.strip()