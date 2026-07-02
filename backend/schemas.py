from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional
import uuid

class ClientOut(BaseModel):
    id: uuid.UUID
    created_at: datetime
    name: str

    model_config = {"from_attributes": True}

class ClientCreate(BaseModel):
    name: str

class RecordingOut(BaseModel):
    id: uuid.UUID
    created_at: datetime
    transcript: str
    summary: str
    status: str
    date_recorded: Optional[date] = None
    type: str
    client_id: Optional[uuid.UUID] = None
    client: Optional[ClientOut] = None
    user_email: Optional[str] = None

    model_config = {"from_attributes": True}

class StatusUpdate(BaseModel):
    status: str  # urgent | done | postpone | pending

class DateUpdate(BaseModel):
    date_recorded: date

class ClientUpdate(BaseModel):
    client_id: Optional[uuid.UUID] = None
