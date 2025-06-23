from pydantic import BaseModel


class current_organization(BaseModel):
    organization: str
    org_slug: str
