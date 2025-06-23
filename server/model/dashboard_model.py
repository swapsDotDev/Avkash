from pydantic import BaseModel


class MonthData(BaseModel):
    month: str
    accepted: int
    rejected: int
    inreview: int
