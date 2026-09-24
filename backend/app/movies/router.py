from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.movies.schemas import MovieListResponse, MovieDetail
from app.movies.service import list_movies, get_movie

router = APIRouter()
@router.get("", response_model=MovieListResponse)
async def get_movies(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    return await list_movies(db=db, page=page, page_size=page_size)

@router.get("/{movie_id}", response_model=MovieDetail)
async def get_movies_by_id(movie_id: str, db: AsyncSession = Depends(get_db)):
    filme = await get_movie(movie_id=movie_id, db=db)

    if filme is None:
        raise HTTPException(status_code=404, detail="Filme não encontrado")

    return filme
