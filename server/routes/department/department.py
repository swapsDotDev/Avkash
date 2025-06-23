from fastapi import (
    APIRouter,
    HTTPException,
    Depends,
)
from fastapi.responses import JSONResponse
from connection.conn import MogoConnection
import logging
from DB_Collections import DBCollections
from model.department_model import DepartmentInfo
from utils.exception.error_handler import exception_handler
from utils.validation.validation import validate_org

router = APIRouter()
md = MogoConnection()
md.get_conn()


@router.post("/department")
@exception_handler
def departmentinfo(department_data: DepartmentInfo, org: dict = Depends(validate_org)):

    org_slug = org.get("org_slug")
    collection_name = DBCollections.DEPARTMENT_COLLECTION.value
    collection_user = DBCollections.USER_COLLECTION.value
    department_name = department_data.department_name
    record = {
        "department_name": department_name,
        "manager": department_data.manager,
        "org_slug": org_slug,
    }
    user_id = department_data.user_id
    md.update_document(
        collection_user,
        {"user_id": user_id, "org_slug": org_slug},
        {"role": "Manager", "department": department_name},
    )
    existing_department = md.read_document(
        collection_name,
        {
            "department_name": department_name,
            "org_slug": org_slug,
        },
    )
    for department in existing_department:
        if "_id" in department:
            department["_id"] = str(department["_id"])
    if existing_department:
        return {
            "message": "Department already exists with the given department ID or name"
        }
    else:
        result = md.insert_record(collection_name, [record])
        if result:
            return {"message": "Department details inserted successfully"}
        else:
            raise HTTPException(
                status_code=500, detail="Failed to insert department data"
            )


@router.get("/departmentinfo")
@exception_handler
def get_department_data(org: dict = Depends(validate_org)):

    org_slug = org.get("org_slug")
    collection_name = DBCollections.DEPARTMENT_COLLECTION.value
    department_data = md.read_document(
        collection_name, {"org_slug": {"$in": [org_slug]}}
    )
    for department in department_data:
        if "_id" in department:
            department["_id"] = str(department["_id"])
    return JSONResponse(content={"department_data": department_data})


@router.delete("/deletedepartments/{department_name}")
@exception_handler
def delete_department_data(department_name: str, org: dict = Depends(validate_org)):

    org_slug = org.get("org_slug")
    collection_name = DBCollections.DEPARTMENT_COLLECTION.value
    collection_name1 = DBCollections.USER_COLLECTION.value
    md.db[collection_name1].update_many(
        {"department": department_name, "org_slug": org_slug},
        {"$unset": {"department": ""}},
    )
    deleted_data = md.delete_document(
        collection_name,
        {"department_name": department_name, "org_slug": org_slug},
    )
    if deleted_data:
        return {"message": "Department details deleted successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to delete department data")


@router.put("/updatedepartments/{department_name}")
@exception_handler
def update_department_data(
    department_name: str, departmentData: dict, org: dict = Depends(validate_org)
):
    org_slug = org.get("org_slug")
    collection_name = DBCollections.DEPARTMENT_COLLECTION.value
    updated_data = md.update_document(
        collection_name,
        {"department_name": department_name, "org_slug": org_slug},
        departmentData,
    )
    if updated_data:
        return {"message": "Department details updated successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to update department data")
