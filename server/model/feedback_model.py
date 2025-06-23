from pydantic import BaseModel


class Userfeedback(BaseModel):
    user_id: str
    email: str
    feedback: str
    timestamp: str
    is_notified: bool = False
    is_desktop_notified: bool = True
    clear: bool = False
    admin_reply_timestamp: str = None


class UpdateFeedbackInfo(BaseModel):
    reply: str
