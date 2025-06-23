from pydantic import BaseModel
from typing import Optional


class Payslip(BaseModel):
    user_id: str
    username: str
    organization_name: str
    designation: str
    lop: Optional[float]
    paiddays: Optional[float]
    total_hours: Optional[float]
    basic_salary: float
    professional_tax: float
    income_tax: float
    insurance: float
    paid_date: str
    paid_month: str
    org_slug: str
