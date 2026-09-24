from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.movies.models import DimMovie
from app.movies.schemas import MovieListItem, MovieListResponse, ItemsReview, MoviePerformance, MovieDetail


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

async def get_movie(
    db: AsyncSession,
    movie_id: str,
) -> MovieDetail | None:
    consulta = (
        select(DimMovie)
        .where(DimMovie.sk_movie_id == movie_id)
        .options(
            selectinload(DimMovie.genres),
            selectinload(DimMovie.companies),
            selectinload(DimMovie.people),
            selectinload(DimMovie.performance),
            selectinload(DimMovie.reviews_summary),
            selectinload(DimMovie.reviews),
        )
    )

    filme = await db.scalar(consulta)

    if filme is None:
        return None
    avaliacoes = []

    for review in filme.reviews:
        avaliacoes.append(
            ItemsReview(
                id=review.sk_movie_review_id,
                nome=review.nome,
                nota=review.nota,
                comentario=review.comentario,
                created_at=review.created_at,
            )
        )

    desempenho = None

    if filme.performance is not None:
        desempenho = MoviePerformance.model_validate(filme.performance)

    resumo = filme.reviews_summary

    return MovieDetail(
        id=filme.sk_movie_id,
        titulo=filme.titulo,
        ano_lancamento=filme.ano_lancamento,
        nota_media=resumo.nota_media_usuarios if resumo else None,
        url_poster=filme.url_poster,
        generos=[genero.nome_genero for genero in filme.genres],
        id_filme=filme.id_filme,
        data_lancamento=filme.data_lancamento,
        duracao_minutos=filme.duracao_minutos,
        status_filme=filme.status_filme,
        sinopse=filme.sinopse,
        url_backdrop=filme.url_backdrop,
        produtoras=[
            produtora.nome_produtora for produtora in filme.companies
        ],
        atores=[
            pessoa.nome_pessoa
            for pessoa in filme.people
            if pessoa.tipo_pessoa == "Ator"
        ],
        diretores=[
            pessoa.nome_pessoa
            for pessoa in filme.people
            if pessoa.tipo_pessoa == "Diretor"
        ],
        roteiristas=[
            pessoa.nome_pessoa
            for pessoa in filme.people
            if pessoa.tipo_pessoa == "Roteirista"
        ],
        desempenho=desempenho,
        avaliacoes=avaliacoes,
    )