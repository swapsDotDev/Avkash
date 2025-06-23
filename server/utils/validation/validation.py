from fastapi import Query, HTTPException


def validate_org(
    organization_name: str = Query(None, alias="organization_name"),
    org_slug: str = Query(None, alias="org_slug"),
):
    if not organization_name and not org_slug:
        raise HTTPException(
            status_code=400,
            detail="At least one of 'organization-name' or 'org-slug' header must be provided",
        )
    return {"organization_name": organization_name, "org_slug": org_slug}
