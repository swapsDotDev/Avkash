from pydantic import BaseModel
from typing import Optional


class UserInfo(BaseModel):
    user_id: str
    organization_name: str
    username: Optional[str]
    Gender: Optional[str]
    DateOfJoining: Optional[str]
    AccNumber: Optional[str]
    PanNumber: Optional[str]
    BankName: Optional[str]
    CountryCode: Optional[str]
    DateOfBirth: Optional[str]
    ContactNo: Optional[str]


class UserDetails(BaseModel):
    user_id: str
    user_role: str
    user_name: str
    imageUrl: str
    organization_name: str
    org_slug: str
    email: str
    role: Optional[str] = None


class UpdateInfo(BaseModel):
    designation: str
    role: str
    department: str
    ctc: float
