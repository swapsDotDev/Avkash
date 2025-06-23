from pydantic import BaseModel
from typing import Optional
from typing import Dict


class LeaveRequest(BaseModel):
    user_id: str
    email: str
    leave_type: str
    imageurl: str
    start_date: str
    end_date: str
    username: str
    is_notified: bool = False
    is_desktop_notified: bool = False
    clear: bool = False
    status: str = "pending"
    description: Optional[str] = None
    attachment: Optional[str] = None
    leavedates: Dict[str, Dict[str, bool]] = {}
    span: float = 0


class LeaveInfo(BaseModel):
    leave_type: str
    count: int
