from pydantic import BaseModel


class Holiday(BaseModel):
    date: str
    summary: str
    holiday_type: str
    org_slug: str


class UpdateHolidayRequest(BaseModel):
    holiday_type: str
    summary: str
