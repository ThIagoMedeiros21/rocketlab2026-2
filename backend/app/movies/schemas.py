from pydantic import BaseModel

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