from pydantic import BaseModel
from typing import Optional


class Document(BaseModel):
    user_id: str
    username: str
    email: str
    document_name: str
    description: Optional[str] = None
    file_content: str
    file_type: str
    status: str = "pending"
    submitted_at: str
    org_slug: str


class UpdateDocStatus(BaseModel):
    status: str
    comment: str = ""
    timestamp: str


class MultiDocumentSubmission(BaseModel):
    user_id: str
    username: str
    email: str
    document_name: str
    description: Optional[str] = None
    org_slug: str
