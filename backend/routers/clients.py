from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from database import get_db
from models import Client
from schemas import ClientOut, ClientCreate

router = APIRouter(prefix="/clients", tags=["clients"])

@router.get("", response_model=List[ClientOut])
async def get_clients(db: AsyncSession = Depends(get_db)):
    """List all clients sorted alphabetically by name."""
    result = await db.execute(select(Client).order_by(Client.name.asc()))
    return result.scalars().all()

@router.post("", response_model=ClientOut, status_code=201)
async def create_client(client_in: ClientCreate, db: AsyncSession = Depends(get_db)):
    """Create a new client name if it does not already exist."""
    name_clean = client_in.name.strip()
    if not name_clean:
        raise HTTPException(status_code=400, detail="Client name cannot be empty")
        
    existing = await db.execute(select(Client).where(Client.name.ilike(name_clean)))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Client name already exists")
        
    client = Client(name=name_clean)
    db.add(client)
    await db.commit()
    await db.refresh(client)
    return client
