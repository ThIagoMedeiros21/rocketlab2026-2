from sqlalchemy import Float, case, cast, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dashboard.schemas import (
    DashboardIndicators,
    DashboardResponse,
    ExternalRankedMovie,
    FinancialRankedMovie,
    GenreCount,
    PopularMovie,
    RankedMovie,
    YearCount,
)
from app.movies.models import (
    DimGenre,
    DimMovie,
    FactMoviePerformance,
    MovieReview,
)


MINIMO_VOTOS_EXTERNOS = 100


def movie_columns():
    return (
        DimMovie.sk_movie_id.label("id"),
        DimMovie.titulo,
        DimMovie.ano_lancamento,
        DimMovie.url_poster,
    )


async def get_external_ranking(
    db: AsyncSession,
    source: str,
) -> list[ExternalRankedMovie]:
    if source == "tmdb":
        nota = FactMoviePerformance.nota_tmdb
        votos = FactMoviePerformance.qtd_tmdb
    elif source == "imdb":
        nota = FactMoviePerformance.nota_imdb
        votos = FactMoviePerformance.qtd_imdb
    else:
        raise ValueError("Fonte de avaliações inválida")

    consulta = (
        select(
            *movie_columns(),
            nota.label("nota"),
            votos.label("quantidade_votos"),
        )
        .select_from(DimMovie)
        .join(DimMovie.performance)
        .where(
            nota.between(0, 10),
            votos >= MINIMO_VOTOS_EXTERNOS,
        )
        .order_by(
            nota.desc(),
            votos.desc(),
            DimMovie.sk_movie_id,
        )
        .limit(10)
    )

    resultado = await db.execute(consulta)

    return [
        ExternalRankedMovie(**dict(linha))
        for linha in resultado.mappings()
    ]


async def get_financial_ranking(
    db: AsyncSession,
    metric: str,
) -> list[FinancialRankedMovie]:
    orcamento = FactMoviePerformance.orcamento_usd
    receita = FactMoviePerformance.receita_usd

    # Orçamento zero é tratado como indisponível para estes cálculos.
    lucro = case(
        (orcamento > 0, receita - orcamento),
        else_=None,
    )

    retorno = case(
        (
            orcamento > 0,
            (
                cast(receita, Float)
                / func.nullif(cast(orcamento, Float), 0)
                - 1
            ) * 100.0,
        ),
        else_=None,
    )

    filtros = [receita > 0]

    if metric == "lucro":
        filtros.append(orcamento > 0)
        ordem = lucro
    elif metric == "receita":
        ordem = receita
    elif metric == "retorno":
        filtros.append(orcamento > 0)
        ordem = retorno
    else:
        raise ValueError("Métrica financeira inválida")

    consulta = (
        select(
            *movie_columns(),
            orcamento.label("orcamento_usd"),
            receita.label("receita_usd"),
            lucro.label("lucro_estimado_usd"),
            retorno.label("retorno_percentual"),
        )
        .select_from(DimMovie)
        .join(DimMovie.performance)
        .where(*filtros)
        .order_by(
            ordem.desc(),
            receita.desc(),
            DimMovie.sk_movie_id,
        )
        .limit(10)
    )

    resultado = await db.execute(consulta)
    items = []

    for linha in resultado.mappings():
        dados = dict(linha)

        for campo in (
            "orcamento_usd",
            "receita_usd",
            "lucro_estimado_usd",
            "retorno_percentual",
        ):
            valor = dados[campo]
            dados[campo] = (
                round(float(valor), 2)
                if valor is not None
                else None
            )

        items.append(FinancialRankedMovie(**dados))

    return items


async def get_dashboard(
    db: AsyncSession,
    minimo_avaliacoes: int = 3,
) -> DashboardResponse:
    total_filmes = await db.scalar(
        select(func.count()).select_from(DimMovie)
    ) or 0

    resultado_avaliacoes = await db.execute(
        select(
            func.count(MovieReview.sk_movie_review_id),
            func.count(func.distinct(MovieReview.sk_movie_id)),
            func.avg(MovieReview.nota),
        )
    )

    total_avaliacoes, filmes_avaliados, media_geral = (
        resultado_avaliacoes.one()
    )

    filmes_sem_genero = await db.scalar(
        select(func.count())
        .select_from(DimMovie)
        .where(~DimMovie.genres.any())
    ) or 0

    filmes_sem_ano = await db.scalar(
        select(func.count())
        .select_from(DimMovie)
        .where(DimMovie.ano_lancamento.is_(None))
    ) or 0

    # Distribuição por gênero.
    quantidade_genero = func.count(DimMovie.sk_movie_id)

    resultado_generos = await db.execute(
        select(
            DimGenre.nome_genero.label("genero"),
            quantidade_genero.label("quantidade"),
        )
        .select_from(DimGenre)
        .join(DimGenre.movies)
        .group_by(
            DimGenre.sk_genre_id,
            DimGenre.nome_genero,
        )
        .order_by(
            quantidade_genero.desc(),
            DimGenre.nome_genero,
        )
    )

    filmes_por_genero = [
        GenreCount(**dict(linha))
        for linha in resultado_generos.mappings()
    ]

    # Distribuição por ano.
    resultado_anos = await db.execute(
        select(
            DimMovie.ano_lancamento.label("ano"),
            func.count(DimMovie.sk_movie_id).label("quantidade"),
        )
        .where(DimMovie.ano_lancamento.is_not(None))
        .group_by(DimMovie.ano_lancamento)
        .order_by(DimMovie.ano_lancamento)
    )

    filmes_por_ano = [
        YearCount(**dict(linha))
        for linha in resultado_anos.mappings()
    ]

    # Ranking das avaliações dos usuários da aplicação.
    media_filme = func.avg(MovieReview.nota)
    quantidade_avaliacoes = func.count(MovieReview.sk_movie_review_id)

    resultado_ranking = await db.execute(
        select(
            *movie_columns(),
            media_filme.label("nota_media"),
            quantidade_avaliacoes.label("quantidade_avaliacoes"),
        )
        .select_from(DimMovie)
        .join(
            MovieReview,
            MovieReview.sk_movie_id == DimMovie.sk_movie_id,
        )
        .group_by(
            DimMovie.sk_movie_id,
            DimMovie.titulo,
            DimMovie.ano_lancamento,
            DimMovie.url_poster,
        )
        .having(quantidade_avaliacoes >= minimo_avaliacoes)
        .order_by(
            media_filme.desc(),
            quantidade_avaliacoes.desc(),
            DimMovie.sk_movie_id,
        )
        .limit(10)
    )

    melhores_filmes = []

    for linha in resultado_ranking.mappings():
        dados = dict(linha)
        dados["nota_media"] = round(float(dados["nota_media"]), 2)
        melhores_filmes.append(RankedMovie(**dados))

    # Rankings das fontes externas.
    melhores_tmdb = await get_external_ranking(db, "tmdb")
    melhores_imdb = await get_external_ranking(db, "imdb")

    # Rankings financeiros.
    maiores_lucros = await get_financial_ranking(db, "lucro")
    maiores_bilheterias = await get_financial_ranking(db, "receita")
    maiores_retornos = await get_financial_ranking(db, "retorno")

    # Popularidade disponível na base importada.
    resultado_populares = await db.execute(
        select(
            *movie_columns(),
            FactMoviePerformance.popularidade,
        )
        .select_from(DimMovie)
        .join(DimMovie.performance)
        .where(FactMoviePerformance.popularidade >= 0)
        .order_by(
            FactMoviePerformance.popularidade.desc(),
            DimMovie.sk_movie_id,
        )
        .limit(10)
    )

    mais_populares = [
        PopularMovie(**dict(linha))
        for linha in resultado_populares.mappings()
    ]

    return DashboardResponse(
        indicadores=DashboardIndicators(
            total_filmes=total_filmes,
            total_avaliacoes=total_avaliacoes,
            filmes_avaliados=filmes_avaliados,
            media_geral=(
                round(float(media_geral), 2)
                if media_geral is not None
                else None
            ),
            filmes_sem_genero=filmes_sem_genero,
            filmes_sem_ano=filmes_sem_ano,
        ),
        filmes_por_genero=filmes_por_genero,
        filmes_por_ano=filmes_por_ano,
        melhores_filmes=melhores_filmes,
        melhores_tmdb=melhores_tmdb,
        melhores_imdb=melhores_imdb,
        maiores_lucros=maiores_lucros,
        maiores_bilheterias=maiores_bilheterias,
        maiores_retornos=maiores_retornos,
        mais_populares=mais_populares,
        minimo_avaliacoes_ranking=minimo_avaliacoes,
        minimo_votos_externos=MINIMO_VOTOS_EXTERNOS,
    )