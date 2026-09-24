import argparse
import asyncio
import csv
from datetime import date
from pathlib import Path

from sqlalchemy.dialects.sqlite import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import AsyncSessionLocal, engine
from app.movies.models import (
    DimMovie,
    DimGenre,
    DimReview,
    MovieReview,
    DimPerson,
    DimCompany,
    bridge_movie_genre,
    bridge_movie_person,
    bridge_movie_company,
)


def ler_filmes(caminho: Path):
    with caminho.open(encoding="utf-8-sig", newline="") as arquivo:
        leitor = csv.DictReader(arquivo)

        for linha in leitor:
            yield linha


def converter_filme(linha: dict[str, str]) -> dict:
    return {
        "sk_movie_id": linha["sk_movie_id"],
        "id_filme": linha["id_filme"],
        "titulo": linha["titulo"],
        "data_lancamento": (
            date.fromisoformat(linha["data_lancamento"])
            if linha["data_lancamento"] else None
        ),
        "ano_lancamento": (
            int(linha["ano_lancamento"])
            if linha["ano_lancamento"] else None
        ),
        "duracao_minutos": (
            int(linha["duracao_minutos"])
            if linha["duracao_minutos"] else None
        ),
        "status_filme": linha["status_filme"] or None,
        "sinopse": linha["sinopse"] or None,
        "url_poster": linha["url_poster"] or None,
        "url_backdrop": linha["url_backdrop"] or None,
    }

async def importar_filmes(db: AsyncSession, caminho: Path):
    comando = insert(DimMovie).on_conflict_do_nothing(
        index_elements=["sk_movie_id"]
    )

    lote = []

    async with db.begin():
        for linha in ler_filmes(caminho):
            lote.append(converter_filme(linha))

            if len(lote) == 1000:
                await db.execute(comando, lote)
                lote.clear()

        if lote:
            await db.execute(comando, lote)

async def importar_generos(db: AsyncSession, caminho: Path):
    comando = insert(DimGenre).on_conflict_do_nothing(
        index_elements=["sk_genre_id"]
    )

    with caminho.open(encoding="utf-8-sig", newline="") as arquivo:
        generos = list(csv.DictReader(arquivo))

    async with db.begin():
        if generos:
            await db.execute(comando, generos)

async def importar_vinculos_generos(db: AsyncSession, caminho: Path):
    comando = insert(bridge_movie_genre).on_conflict_do_nothing(
        index_elements=["sk_movie_id", "sk_genre_id"]
    )

    with caminho.open(encoding="utf-8-sig", newline="") as arquivo:
        leitor = csv.DictReader(arquivo)
        lote = []

        async with db.begin():
            for linha in leitor:
                lote.append(linha)

                if len(lote) == 1000:
                    await db.execute(comando, lote)
                    lote.clear()

            if lote:
                await db.execute(comando, lote)

async def importar_resumos(db: AsyncSession, caminho: Path):
    comando = insert(DimReview).on_conflict_do_nothing(
        index_elements=["sk_movie_id"]
    )

    with caminho.open(encoding="utf-8-sig", newline="") as arquivo:
        leitor = csv.DictReader(arquivo)
        lote = []

        async with db.begin():
            for linha in leitor:
                lote.append({
                    "sk_review_id": linha["sk_review_id"],
                    "sk_movie_id": linha["sk_movie_id"],
                    "qtd_avaliacoes_usuarios": int(
                        linha["qtd_avaliacoes_usuarios"]
                    ),
                    "nota_media_usuarios": (
                        float(linha["nota_media_usuarios"])
                        if linha["nota_media_usuarios"] else None
                    ),
                })

                if len(lote) == 1000:
                    await db.execute(comando, lote)
                    lote.clear()

            if lote:
                await db.execute(comando, lote)

async def importar_avaliacoes(db: AsyncSession, caminho: Path):
    comando = insert(MovieReview).on_conflict_do_nothing(
        index_elements=["sk_movie_review_id"]
    )

    with caminho.open(encoding="utf-8-sig", newline="") as arquivo:
        leitor = csv.DictReader(arquivo)
        lote = []

        async with db.begin():
            for linha in leitor:
                lote.append({
                    "sk_movie_review_id": linha["sk_movie_review_id"],
                    "sk_movie_id": linha["sk_movie_id"],
                    "nome": linha["nome"],
                    "nota": float(linha["nota"]),
                    "comentario": linha["comentario"],
                })

                if len(lote) == 1000:
                    await db.execute(comando, lote)
                    lote.clear()

            if lote:
                await db.execute(comando, lote)


async def importar_csv_texto(
    db: AsyncSession,
    caminho: Path,
    tabela,
    chaves: list[str],
):
    comando = insert(tabela).on_conflict_do_nothing(
        index_elements=chaves
    )

    with caminho.open(encoding="utf-8-sig", newline="") as arquivo:
        leitor = csv.DictReader(arquivo)
        lote = []

        async with db.begin():
            for linha in leitor:
                lote.append(linha)

                if len(lote) == 1000:
                    await db.execute(comando, lote)
                    lote.clear()

            if lote:
                await db.execute(comando, lote)


async def main(pasta: Path):
    try:
        async with AsyncSessionLocal() as db:
            await importar_filmes(db, pasta / "dim_movies.csv")
            await importar_generos(db, pasta / "dim_genres.csv")
            await importar_vinculos_generos(
                db, pasta / "bridge_movie_genre.csv"
            )
            await importar_resumos(db, pasta / "dim_reviews.csv")
            await importar_avaliacoes(
                db, pasta / "movies_reviews.csv"
            )
            await importar_csv_texto(
                db,
                pasta / "dim_people.csv",
                DimPerson,
                ["sk_person_id"],
            )

            await importar_csv_texto(
                db,
                pasta / "dim_companies.csv",
                DimCompany,
                ["sk_company_id"],
            )

            await importar_csv_texto(
                db,
                pasta / "bridge_movie_person.csv",
                bridge_movie_person,
                ["sk_movie_id", "sk_person_id"],
            )

            await importar_csv_texto(
                db,
                pasta / "bridge_movie_company.csv",
                bridge_movie_company,
                ["sk_movie_id", "sk_company_id"],
            )
        print("Importação concluída.")
    finally:
        await engine.dispose()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("pasta", type=Path)
    argumentos = parser.parse_args()

    asyncio.run(main(argumentos.pasta))