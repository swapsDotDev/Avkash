from DB_Collections import DBCollections
from fastapi import APIRouter, HTTPException, Request, APIRouter, Depends
import os
import requests
from connection.conn import MogoConnection
from model.org_info_model import current_organization
from utils.common.common_helper import get_ceo
from utils.holiday.holiday_helper import create_holidays_collection
from utils.exception.error_handler import exception_handler
from DB_Collections import DBCollections
from utils.validation.validation import validate_org

md = MogoConnection()
md.get_conn()
router = APIRouter()

organization_name = ""


@router.get("/organizationdata")
@exception_handler
def generate_org_structure(org: dict = Depends(validate_org)):
    org_slug = org.get("org_slug")

    collection_name = DBCollections.USER_COLLECTION.value
    query = {
        "role": {"$exists": True},
        "department": {"$exists": True},
        "org_slug": org_slug,
    }
    users_info = md.read_document(collection_name, query)
    ceo = get_ceo(users_info)
    if ceo is None:
        raise HTTPException(status_code=400, detail="No CEO found in organization data")
    structure = {
        "name": ceo["username"],
        "role": "CEO",
        "image": ceo["imageUrl"],
        "children": [],
    }
    departments = []
    managers = {}
    for user in users_info:
        department = user["department"]
        if department not in departments:
            departments.append(department)
        if user["role"] == "Manager":
            managers[department] = {
                "name": user["username"],
                "role": "Manager",
                "department": department,
                "image": user["imageUrl"],
            }
    for department in departments:
        datalist = []
        if department in managers:
            manager_data = managers[department]
            manager_data["children"] = []
            for user in users_info:
                if user["department"] == department and user["role"] == "Employee":
                    manager_data["children"].append(
                        {
                            "name": user["username"],
                            "role": user["role"],
                            "department": user["department"],
                            "image": user["imageUrl"],
                        }
                    )
            structure["children"].append(manager_data)
        else:
            department_data = {"department": department, "children": []}
            for user in users_info:
                if user["department"] == department and user["role"] == "Employee":
                    department_data["children"].append(
                        {
                            "name": user["username"],
                            "role": user["role"],
                            "department": department,
                            "image": user["imageUrl"],
                        }
                    )
            structure["children"].append(department_data)
    return structure


@router.post("/orgname")
@exception_handler
def orgname(org_name: current_organization, request: Request):
    organization_name = org_name.organization
    org_slug = org_name.org_slug
    request.app.state.organization_name = organization_name
    request.app.state.org_slug = org_slug
    create_holidays_collection(organization_name, org_slug)
    return {"message": "Organization name set successfully"}


@router.get("/deleteallolddata/{org_id}")
@exception_handler
def delete_all_old_data(org_id: str, org: dict = Depends(validate_org)):
    org_slug = org.get("org_slug")
    secret_key = os.getenv("CHECK_CLERK_SECRET_KEY")
    if not secret_key:
        raise HTTPException(status_code=500, detail="Secret key not found")

    url = f"https://api.clerk.com/v1/organizations/{org_id}/memberships"
    headers = {
        "Authorization": f"Bearer {secret_key}",
        "Content-Type": "application/json",
    }

    response = requests.get(url, headers=headers)
    response.raise_for_status()

    memberships = response.json().get("data", [])
    user_ids = [member["public_user_data"]["user_id"] for member in memberships]

    collections = [
        DBCollections.USER_COLLECTION.value,
        DBCollections.USER_FEEDBACK.value,
        DBCollections.TIMESHEET_COLLECTION.value,
        DBCollections.PAYSLIP_COLLECTION.value,
        DBCollections.LEAVE_COLLECTION.value,
    ]

    for collection_name in collections:
        documents = md.read_document(collection_name, {"org_slug": {"$in": [org_slug]}})

        for document in documents:
            user_id = str(document.get("user_id"))
            if user_id not in user_ids:
                md.delete_document(collection_name, {"_id": document["_id"]})
    return {"successful": True}
