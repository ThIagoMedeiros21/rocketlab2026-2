from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.movies.models import DimMovie
from app.movies.schemas import MovieListItem, MovieListResponse
async def list_movies(
    db: AsyncSession,
    page: int,
    page_size: int,
) -> MovieListResponse:
    deslocamento = (page - 1) * page_size
    consulta = (
        select(DimMovie)
        .options(
            selectinload(DimMovie.genres),
            selectinload(DimMovie.reviews_summary),
        )
        .order_by(DimMovie.titulo, DimMovie.sk_movie_id)
        .offset(deslocamento)
        .limit(page_size)
    )
    resultado = await db.scalars(consulta)
    filmes = resultado.all()
    items = []

    for filme in filmes:
        resumo = filme.reviews_summary

        item = MovieListItem(
            id=filme.sk_movie_id,
            titulo=filme.titulo,
            ano_lancamento=filme.ano_lancamento,
            nota_media=resumo.nota_media_usuarios if resumo else None,
            url_poster=filme.url_poster,
            generos=[genero.nome_genero for genero in filme.genres],
        )

        items.append(item)
    consulta_total = select(func.count()).select_from(DimMovie)
    total = await db.scalar(consulta_total) or 0

    return MovieListResponse(
        items=items,
        page=page,
        page_size=page_size,
        total=total,
        total_pages=(total + page_size - 1) // page_size,
    )