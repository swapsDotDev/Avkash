from typing import List
from pydantic import BaseModel


class ReimbursementInfo(BaseModel):
    employeeName: str
    employeeId: str
    department: str
    expenses: List[dict]
    totalAmount: float
    createdAt: str
    org_slug: str


class UpdateInfo(BaseModel):
    status: str
    timestamp: str
