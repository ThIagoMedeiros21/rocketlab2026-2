from fastapi import APIRouter, Depends, Query, HTTPException, Response
from sqlalchemy.ext.asyncio import AsyncSession
from app.auth.dependencies import require_admin
from app.db.session import get_db
from app.movies.schemas import MovieListResponse, MovieDetail, MovieCreate, MovieCreated, MovieUpdate, ItemsReview, ReviewCreate
from app.movies.service import list_movies, get_movie, create_movie, update_movie, delete_movie, create_review

router = APIRouter()
@router.get("", response_model=MovieListResponse)
async def get_movies(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    q: str | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    return await list_movies(db = db, page = page, page_size = page_size, q = q)

@router.get("/{movie_id}", response_model=MovieDetail)
async def get_movies_by_id(movie_id: str, db: AsyncSession = Depends(get_db)):
    filme = await get_movie(movie_id=movie_id, db=db)

    if filme is None:
        raise HTTPException(status_code = 404, detail = "Filme não encontrado")

    return filme

@router.post("", response_model=MovieCreated, status_code=201, dependencies=[Depends(require_admin)])
async def post_movie(
    movie_data: MovieCreate,
    db: AsyncSession = Depends(get_db),
):
    return await create_movie(db=db, movie_data=movie_data)

@router.patch("/{movie_id}", response_model=MovieDetail, dependencies=[Depends(require_admin)])
async def patch_movie(
    movie_id: str,
    movie_data: MovieUpdate,
    db: AsyncSession = Depends(get_db),
):
    filme = await update_movie(
        db=db,
        movie_id=movie_id,
        movie_data=movie_data,
    )

    if filme is None:
        raise HTTPException(status_code=404, detail="Filme não encontrado")

    return filme

@router.delete("/{movie_id}", status_code=204, dependencies=[Depends(require_admin)])
async def remove_movie(
    movie_id: str,
    db: AsyncSession = Depends(get_db),
):
    removido = await delete_movie(db=db, movie_id=movie_id)

    if not removido:
        raise HTTPException(status_code=404, detail="Filme não encontrado")

    return Response(status_code=204)

@router.post("/{movie_id}/reviews", response_model=ItemsReview, status_code=201)
async def post_review(
    movie_id: str,
    review_data: ReviewCreate,
    db: AsyncSession = Depends(get_db),
):
    avaliacao = await create_review(
        db=db,
        movie_id=movie_id,
        review_data=review_data,
    )

    if avaliacao is None:
        raise HTTPException(status_code=404, detail="Filme não encontrado")

    return avaliacao