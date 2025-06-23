import json
from bson import ObjectId
from fastapi import (
    Body,
    File,
    Query,
    Request,
    Form,
    HTTPException,
    APIRouter,
    UploadFile,
    Depends,
)
from fastapi.responses import JSONResponse
import base64
from connection.conn import MogoConnection
from typing import List, Optional
import datetime
from DB_Collections import DBCollections
from model.document_model import UpdateDocStatus
from websocket.ConnectionManager import manager
from connection.conn import MogoConnection
from DB_Collections import DBCollections
from utils.exception.error_handler import exception_handler
from utils.validation.validation import validate_org
from utils.common.common_helper import get_ist_timestamp
from ml_model.aadhaar_checker import document_checker

router = APIRouter()
md = MogoConnection()
md.get_conn()

organization_name = ""


@router.get("/get_user_documents/{user_id}")
@exception_handler
async def get_user_documents(user_id: str, org: dict = Depends(validate_org)):
    org_slug = org["org_slug"]
    collection_name = DBCollections.DOCUMENT_COLLECTION.value
    query = {"user_id": user_id, "org_slug": org_slug}
    documents = md.read_document(collection_name, query)

    for doc in documents:
        doc["_id"] = str(doc["_id"])

    return JSONResponse(content={"documents": documents}, status_code=200)


@router.get("/get_all_documents")
@exception_handler
async def get_all_documents(
    org: dict = Depends(validate_org),
    status: Optional[str] = Query(None),
    month: Optional[int] = Query(None),
):
    org_slug = org["org_slug"]
    collection_name = DBCollections.DOCUMENT_COLLECTION.value
    query = {"org_slug": org_slug}

    if status:
        query["status"] = {"$in": status.split(",")}

    documents = md.read_document(collection_name, query)

    if month:
        filtered_docs = []
        for doc in documents:
            doc_month = datetime.datetime.fromisoformat(doc["submitted_at"]).month
            if doc_month == month:
                filtered_docs.append(doc)
        documents = filtered_docs

    for doc in documents:
        doc["_id"] = str(doc["_id"])

    return JSONResponse(content={"documents": documents}, status_code=200)


@router.delete("/delete_document/{document_id}")
@exception_handler
async def delete_document(
    document_id: str,
    request: Request,
    user_id: str = Body(...),
    org: dict = Depends(validate_org),
):
    org_slug = org["org_slug"]
    collection_name = DBCollections.DOCUMENT_COLLECTION.value

    document = md.read_document(collection_name, {"_id": ObjectId(document_id)})
    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found or you don't have permission to delete it",
        )

    if document[0].get("status") == "approved":
        raise HTTPException(
            status_code=400, detail="Cannot delete an approved document"
        )

    result = md.delete_document(collection_name, {"_id": ObjectId(document_id)})

    if result.get("message", "").startswith("Deleted"):
        await manager.broadcast(
            json.dumps(
                {
                    "event": "document_deleted",
                    "document_id": document_id,
                    "org_slug": org_slug,
                }
            )
        )
        return {"success": True, "message": "Document deleted successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to delete document")


@router.post("/submit_documents")
@exception_handler
async def submit_documents(
    user_id: str = Form(...),
    username: str = Form(...),
    email: str = Form(...),
    document_name: str = Form(...),
    description: Optional[str] = Form(None),
    files: List[UploadFile] = File(...),
    org: dict = Depends(validate_org),
):
    org_slug = org["org_slug"]
    collection_name = DBCollections.DOCUMENT_COLLECTION.value
    user_collection = DBCollections.USER_COLLECTION.value
    notification_collection = DBCollections.NOTIFICATION_COLLECTION.value

    attachments = []

    validate_aadhaar = any(
        keyword in document_name.lower() for keyword in ("adhaar", "adhar", "pan")
    )
    if validate_aadhaar and (
        "adhaar" in document_name.lower() or "adhar" in document_name.lower()
    ):
        validate_aadhaar = "Aadhar"
    elif validate_aadhaar and "pan" in document_name.lower():
        validate_aadhaar = "PAN"

    for file in files:
        file_content = await file.read()
        if not file_content:
            continue

        if validate_aadhaar:
            try:
                is_aadhaar = document_checker.predict(
                    file_content, file.content_type, validate_aadhaar
                )
            except Exception as e:
                raise HTTPException(
                    status_code=500, detail=f"Aadhaar validation failed: {str(e)}"
                )
            if not is_aadhaar:
                raise HTTPException(
                    status_code=422,
                    detail={
                        "code": "document_validation_failed",
                        "message": f"File is not a valid {document_name} document.",
                    },
                )

        encoded_file = base64.b64encode(file_content).decode("utf-8")
        attachments.append(
            {
                "filename": file.filename,
                "file_type": file.content_type,
                "file_content": encoded_file,
                "size": f"{(len(file_content) / (1024 * 1024)):.2f} MB",
                "uploaded_at": datetime.datetime.now().isoformat(),
            }
        )

    if not attachments:
        raise HTTPException(status_code=400, detail="No valid files provided")

    full_name = username

    document_data = {
        "user_id": user_id,
        "username": full_name,
        "email": email,
        "document_name": document_name,
        "description": description,
        "attachments": attachments,
        "status": "pending",
        "submitted_at": datetime.datetime.now().isoformat(),
        "org_slug": org_slug,
        "is_notified": False,
        "clear": False,
        "is_desktop_notified": True,
    }

    result = md.insert_record(collection_name, [document_data])
    if not result:
        raise HTTPException(status_code=500, detail="Failed to save document")

    if result:
        role_query = {
            "user_role": {"$in": ["admin", "superadmin"]},
            "org_slug": org_slug,
        }
        admins_and_superadmins = md.read_document(user_collection, role_query)
        notification_message = f"New document is submitted by {username}"
        timestamp = get_ist_timestamp()

        for user in admins_and_superadmins:
            notification_data = {
                "user_id": user["user_id"],
                "message": notification_message,
                "timestamp": timestamp,
                "type": "document",
                "is_admin_notified": True,
                "is_admin_desktop_notified": False,
                "admin_clear": False,
                "org_slug": org_slug,
            }
            md.insert_record(notification_collection, [notification_data])

    await manager.broadcast(
        json.dumps(
            {
                "event": "document_submitted",
                "org_slug": org_slug,
                "document_id": str(document_data["_id"]),
                "user_id": user_id,
                "username": full_name,
                "document_name": document_name,
                "timestamp": datetime.datetime.now().isoformat(),
                "needsNotification": True,
            }
        )
    )

    return JSONResponse(
        content={"message": "Document submitted successfully"}, status_code=200
    )


@router.put("/update_document_status_by_user/{user_id}")
@exception_handler
async def update_document_status_by_user(
    user_id: str,
    update_info: UpdateDocStatus,
    document_id: str = Query(..., description="Document ID (string or ObjectId)"),
    org: dict = Depends(validate_org),
):
    org_slug = org["org_slug"]
    collection = md.db[DBCollections.DOCUMENT_COLLECTION.value]

    query = {"_id": ObjectId(document_id)}

    doc = collection.find_one(query)
    if not doc:
        print("DEBUG: Document not found with query:", query)
        raise HTTPException(status_code=404, detail="Document not found")

    update_data = {
        "$set": {
            "status": update_info.status.lower(),
            "comment": update_info.comment,
            "timestamp": datetime.datetime.now().isoformat(),
            "is_notified": True,
            "is_desktop_notified": False,
            "read": False,
        }
    }

    result = collection.update_one(query, update_data)

    if result.matched_count > 0:
        await manager.broadcast(
            json.dumps(
                {
                    "event": "document_prime_updated",
                    "org_slug": org_slug,
                    "document_id": document_id,
                    "status": update_info.status.lower(),
                    "user_id": doc.get("user_id", ""),
                    "username": doc.get("username", ""),
                    "document_name": doc.get("document_name", ""),
                    "timestamp": datetime.datetime.now().isoformat(),
                    "status": update_info.status.lower(),
                    "needsNotification": True,
                }
            )
        )

        return JSONResponse(
            content={"message": "Document status updated successfully"}, status_code=200
        )
    else:
        return JSONResponse(
            content={"message": "No changes made (already in this state?)"},
            status_code=200,
        )


@router.post("/update_document")
@exception_handler
async def update_document(
    document_id: str = Form(...),
    user_id: str = Form(...),
    username: str = Form(...),
    email: str = Form(...),
    document_name: str = Form(...),
    description: Optional[str] = Form(None),
    status: str = Form("pending"),
    files: List[UploadFile] = File(...),
    org: dict = Depends(validate_org),
):
    collection_name = DBCollections.DOCUMENT_COLLECTION.value
    org_slug = org["org_slug"]

    query = {"_id": ObjectId(document_id), "user_id": user_id, "org_slug": org_slug}
    doc = md.read_document(collection_name, query)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    attachments = []
    validate_aadhaar = any(
        keyword in document_name.lower() for keyword in ("adhaar", "adhar", "pan")
    )
    if validate_aadhaar and (
        "adhaar" in document_name.lower() or "adhar" in document_name.lower()
    ):
        validate_aadhaar = "Aadhar"
    elif validate_aadhaar and "pan" in document_name.lower():
        validate_aadhaar = "PAN"

    for file in files:
        content = await file.read()
        if not content:
            continue

        if validate_aadhaar:
            try:
                is_aadhaar = document_checker.predict(
                    content, file.content_type, validate_aadhaar
                )
            except Exception as e:
                raise HTTPException(
                    status_code=500, detail=f"Aadhaar validation failed: {str(e)}"
                )
            if not is_aadhaar:
                raise HTTPException(
                    status_code=422,
                    detail={
                        "code": "document_validation_failed",
                        "message": f"File is not a valid {document_name} document.",
                    },
                )

        encoded = base64.b64encode(content).decode("utf-8")
        attachments.append(
            {
                "filename": file.filename,
                "file_type": file.content_type,
                "file_content": encoded,
                "size": f"{(len(content) / (1024 * 1024)):.2f} MB",
                "uploaded_at": datetime.datetime.now().isoformat(),
            }
        )

    update_data = {
        "document_name": document_name,
        "description": description,
        "attachments": attachments,
        "status": "pending",
        "submitted_at": datetime.datetime.now().isoformat(),
    }

    result = md.update_document(collection_name, query, update_data)
    if not result:
        raise HTTPException(status_code=500, detail="Failed to update document")

    return JSONResponse(
        content={"message": "Document updated successfully"}, status_code=200
    )
