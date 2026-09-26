from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import require_admin
from app.dashboard.schemas import DashboardResponse
from app.dashboard.service import get_dashboard
from app.db.session import get_db

router = APIRouter(
    dependencies=[Depends(require_admin)],
)


@router.get("", response_model=DashboardResponse)
async def read_dashboard(
    minimo_avaliacoes: int = Query(default=3, ge=1),
    db: AsyncSession = Depends(get_db),
):
    return await get_dashboard(
        db=db,
        minimo_avaliacoes=minimo_avaliacoes,
    )