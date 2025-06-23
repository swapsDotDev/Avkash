from pydantic import BaseModel


class DepartmentInfo(BaseModel):
    department_name: str
    manager: str
    user_id: str
    org_slug: str
