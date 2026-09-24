from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.movies.schemas import MovieListResponse
from app.movies.service import list_movies

router = APIRouter()
@router.get("", response_model=MovieListResponse)
async def get_movies(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    return await list_movies(db=db, page=page, page_size=page_size)