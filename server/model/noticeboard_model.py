from typing import List, Optional
from pydantic import BaseModel
import datetime


class Notice(BaseModel):
    user_id: str
    title: str
    content: str
    category: str
    priority: str
    attachments: List[str] = []
    attachment_data: List[str] = []
    expiry: Optional[str] = None
    pinned: bool = False
    archived: bool = False
    timestamp: str
    org_slug: str

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {datetime: lambda v: v.isoformat()}


class PinStatusUpdate(BaseModel):
    pinned: bool
