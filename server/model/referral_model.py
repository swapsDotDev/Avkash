from typing import Optional
from pydantic import BaseModel


class Job(BaseModel):
    title: str
    description: str
    skills: str
    experience: str
    workmode: str
    location: str
    deadline: str
    org_slug: str


class JobUpdateModel(BaseModel):
    title: Optional[str]
    description: Optional[str]
    skills: str
    experience: str
    location: Optional[str]
    deadline: Optional[str]
