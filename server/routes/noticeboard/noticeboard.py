from bson.errors import InvalidId
import io
import json
from fastapi import (
    BackgroundTasks,
    Request,
    UploadFile,
    File,
    Form,
    HTTPException,
    APIRouter,
    BackgroundTasks,
    Depends,
)
from pydantic import ValidationError
from fastapi.responses import JSONResponse, StreamingResponse
from bson import ObjectId
import base64
from connection.conn import MogoConnection
from typing import Optional, List
import datetime
import pytz
from DB_Collections import DBCollections
from const import ACCEPTED_EXTENSIONS, ARCHIVE_INTERVAL_SECONDS
from utils.noticeboard.notice_helper import (
    sanitize_filename,
    archive_expired_notices,
    last_archive_time,
)
from utils.common.common_helper import get_ist_timestamp
from websocket.ConnectionManager import manager
from model.noticeboard_model import Notice
from connection.conn import MogoConnection
from DB_Collections import DBCollections
from utils.exception.error_handler import exception_handler
from utils.validation.validation import validate_org

router = APIRouter()
md = MogoConnection()
md.get_conn()

organization_name = ""


@router.get("/get_high_priority_notices")
@exception_handler
async def get_high_priority_notices(
    org: dict = Depends(validate_org),
    page: int = 1,
    page_size: int = 20,
    background_tasks: BackgroundTasks = None,
):
    org_slug = org.get("org_slug")

    ist = pytz.timezone("Asia/Kolkata")
    now = datetime.datetime.now(ist)
    if (
        last_archive_time is None
        or (now - last_archive_time).total_seconds() > ARCHIVE_INTERVAL_SECONDS
    ):
        background_tasks.add_task(archive_expired_notices)

    collection_name = DBCollections.NOTICE_COLLECTION.value

    query = {"org_slug": org_slug, "archived": False, "priority": "high"}

    skip = (page - 1) * page_size
    notices = md.read_document(collection_name, query) or []
    notices = sorted(notices, key=lambda x: x.get("timestamp", ""), reverse=True)
    paginated_notices = notices[skip : skip + page_size]

    formatted_notices = [
        {
            "id": str(notice.get("_id")),
            "title": notice.get("title"),
            "content": notice.get("content"),
            "category": notice.get("category"),
            "priority": notice.get("priority"),
            "attachments": notice.get("attachments", []),
            "expiry": notice.get("expiry"),
            "pinned": notice.get("pinned", False),
            "archived": notice.get("archived", False),
            "timestamp": notice.get("timestamp"),
            "user_id": notice.get("user_id"),
        }
        for notice in paginated_notices
    ]

    total_count = len(notices) if notices else 0
    return {
        "notices": formatted_notices,
        "total_count": total_count,
        "page": page,
        "page_size": page_size,
    }


@router.get("/get_non_archived_notices")
@exception_handler
async def get_non_archived_notices(
    org: dict = Depends(validate_org),
    page: int = 1,
    page_size: int = 20,
    background_tasks: BackgroundTasks = None,
):
    org_slug = org.get("org_slug")
    ist = pytz.timezone("Asia/Kolkata")
    now = datetime.datetime.now(ist)
    if (
        last_archive_time is None
        or (now - last_archive_time).total_seconds() > ARCHIVE_INTERVAL_SECONDS
    ):
        background_tasks.add_task(archive_expired_notices)

        collection_name = DBCollections.NOTICE_COLLECTION.value
        query = {"org_slug": org_slug, "archived": False}
        skip = (page - 1) * page_size
        notices = md.read_document(collection_name, query) or []
        notices = sorted(notices, key=lambda x: x.get("timestamp", ""), reverse=True)
        paginated_notices = notices[skip : skip + page_size]

    formatted_notices = [
        {
            "id": str(notice.get("_id")),
            "title": notice.get("title"),
            "content": notice.get("content"),
            "category": notice.get("category"),
            "priority": notice.get("priority"),
            "attachments": notice.get("attachments", []),
            "expiry": notice.get("expiry"),
            "pinned": notice.get("pinned", False),
            "archived": notice.get("archived", False),
            "timestamp": notice.get("timestamp"),
            "user_id": notice.get("user_id"),
        }
        for notice in paginated_notices
    ]

    total_count = len(notices)
    return {
        "notices": formatted_notices,
        "total_count": total_count,
        "page": page,
        "page_size": page_size,
    }


@router.get("/get_archived_notices")
@exception_handler
async def get_archived_notices(
    org: dict = Depends(validate_org), page: int = 1, page_size: int = 20
):
    org_slug = org.get("org_slug")
    collection_name = DBCollections.NOTICE_COLLECTION.value
    query = {"org_slug": org_slug, "archived": True}
    skip = (page - 1) * page_size
    notices = md.read_document(collection_name, query)

    if notices:
        notices = sorted(notices, key=lambda x: x.get("timestamp", ""), reverse=True)
        paginated_notices = notices[skip : skip + page_size]
    else:
        paginated_notices = []

    formatted_notices = [
        {
            "id": str(notice.get("_id")),
            "title": notice.get("title"),
            "content": notice.get("content"),
            "category": notice.get("category"),
            "priority": notice.get("priority"),
            "attachments": notice.get("attachments", []),
            "expiry": notice.get("expiry"),
            "pinned": notice.get("pinned", False),
            "archived": notice.get("archived", False),
            "timestamp": notice.get("timestamp"),
            "user_id": notice.get("user_id"),
        }
        for notice in paginated_notices
    ]

    total_count = len(notices) if notices else 0
    return {
        "notices": formatted_notices,
        "total_count": total_count,
        "page": page,
        "page_size": page_size,
    }


@router.post("/auto_archive_notices")
@exception_handler
async def auto_archive_notices(background_tasks: BackgroundTasks = None):
    background_tasks.add_task(archive_expired_notices)
    return {"message": "Archiving notices in the background"}


@router.get("/get_pinned_notices")
@exception_handler
async def get_pinned_notices(
    org: dict = Depends(validate_org),
    page: int = 1,
    page_size: int = 20,
    background_tasks: BackgroundTasks = None,
):
    org_slug = org.get("org_slug")
    ist = pytz.timezone("Asia/Kolkata")
    now = datetime.datetime.now(ist)
    if (
        last_archive_time is None
        or (now - last_archive_time).total_seconds() > ARCHIVE_INTERVAL_SECONDS
    ):
        background_tasks.add_task(archive_expired_notices)

        collection_name = DBCollections.NOTICE_COLLECTION.value
        query = {"org_slug": org_slug, "archived": False, "pinned": True}
        skip = (page - 1) * page_size

        notices = md.read_document(collection_name, query) or []

        notices = sorted(notices, key=lambda x: x.get("priority", ""), reverse=True)
        paginated_notices = notices[skip : skip + page_size]

    formatted_notices = [
        {
            "id": str(notice.get("_id")),
            "title": notice.get("title"),
            "content": notice.get("content"),
            "category": notice.get("category"),
            "priority": notice.get("priority"),
            "attachments": notice.get("attachments", []),
            "expiry": notice.get("expiry"),
            "pinned": notice.get("pinned", False),
            "archived": notice.get("archived", False),
            "timestamp": notice.get("timestamp"),
            "user_id": notice.get("user_id"),
        }
        for notice in paginated_notices
    ]

    total_count = len(notices)
    return {
        "notices": formatted_notices,
        "total_count": total_count,
        "page": page,
        "page_size": page_size,
    }


@router.post("/submit_notice")
@exception_handler
async def submit_notice(
    request: Request,
    user_id: str = Form(...),
    title: str = Form(...),
    content: str = Form(...),
    category: str = Form(...),
    priority: str = Form(...),
    expiry: Optional[str] = Form(None),
    pinned: bool = Form(False),
    archived: bool = Form(False),
    attachments: str = Form("[]"),
    attachment_files: Optional[List[UploadFile]] = File(None),
    org: dict = Depends(validate_org),
):
    org_slug = org.get("org_slug")
    organization_name = org.get("organization_name")

    if expiry:
        ist = pytz.timezone("Asia/Kolkata")
        expiry_datetime = datetime.datetime.fromisoformat(expiry.replace("Z", "+00:00"))
        if expiry_datetime.tzinfo is None:
            expiry_datetime = ist.localize(expiry_datetime)
        else:
            expiry_datetime = expiry_datetime.astimezone(ist)
        expiry = expiry_datetime.replace(hour=23, minute=59, second=59).strftime(
            "%Y-%m-%d %H:%M:%S"
        )

    attachment_names = []
    attachment_data_list = []

    attachment_names = json.loads(attachments)
    if not isinstance(attachment_names, list):
        raise HTTPException(status_code=400, detail="Attachments must be a list")

    if attachment_files:
        for file in attachment_files:
            extension = file.filename.split(".")[-1].lower()
            if extension not in ACCEPTED_EXTENSIONS:
                raise HTTPException(
                    status_code=400, detail=f"Unsupported file type: {file.filename}"
                )

            max_size = 10 * 1024 * 1024
            if file.size > max_size:
                raise HTTPException(
                    status_code=400, detail=f"File too large: {file.filename}"
                )

            contents = await file.read()
            base64_string = base64.b64encode(contents).decode("utf-8")
            attachment_data_list.append(base64_string)

            if file.filename not in attachment_names:
                attachment_names.append(file.filename)

    if len(attachment_names) != len(attachment_data_list):
        attachment_names = attachment_names[: len(attachment_data_list)]

    notice_data = Notice(
        user_id=user_id,
        title=title,
        content=content,
        category=category,
        priority=priority,
        attachments=attachment_names,
        attachment_data=attachment_data_list,
        expiry=expiry,
        pinned=pinned,
        archived=archived,
        timestamp=get_ist_timestamp(),
        org_slug=org_slug,
    )

    serialized_notice = notice_data.model_dump()

    result = md.insert_record(
        DBCollections.NOTICE_COLLECTION.value, [serialized_notice]
    )
    if result and "message" in result:
        notice_id = str(result["message"])
        broadcast_notice = serialized_notice.copy()
        broadcast_notice["id"] = notice_id

        def convert_objectid_to_str(data):
            if isinstance(data, dict):
                return {k: convert_objectid_to_str(v) for k, v in data.items()}
            elif isinstance(data, list):
                return [convert_objectid_to_str(item) for item in data]
            elif isinstance(data, ObjectId):
                return str(data)
            return data

        broadcast_notice = convert_objectid_to_str(broadcast_notice)

        normalized_organization_name = (
            organization_name.strip().lower().replace(" ", "-")
        )
        broadcast_message = {
            "event": "new_notice",
            "org_slug": org_slug,
            "organization_name": normalized_organization_name,
            "notice": broadcast_notice,
        }

        broadcast_message_str = json.dumps(broadcast_message)
        await manager.broadcast(broadcast_message_str)
        return {
            "message": "Notice submitted successfully",
            "timestamp": notice_data.timestamp,
            "notice_id": notice_id,
        }

    raise HTTPException(status_code=500, detail="Failed to submit notice")


@router.put("/update_notice/{notice_id}")
@exception_handler
async def update_notice(
    notice_id: str,
    request: Request,
    user_id: str = Form(...),
    title: str = Form(...),
    content: str = Form(...),
    category: str = Form(...),
    priority: str = Form(...),
    expiry: Optional[str] = Form(None),
    pinned: bool = Form(False),
    archived: bool = Form(False),
    attachments: Optional[str] = Form(None),
    attachment_files: Optional[List[UploadFile]] = File(None),
    org: dict = Depends(validate_org),
):
    org_slug = org.get("org_slug")
    organization_name = org.get("organization_name")

    if expiry:
        ist = pytz.timezone("Asia/Kolkata")
        expiry_datetime = datetime.datetime.fromisoformat(expiry.replace("Z", "+00:00"))
        if expiry_datetime.tzinfo is None:
            expiry_datetime = ist.localize(expiry_datetime)
        else:
            expiry_datetime = expiry_datetime.astimezone(ist)
        expiry = expiry_datetime.replace(hour=23, minute=59, second=59).strftime(
            "%Y-%m-%d %H:%M:%S"
        )

    query = {"_id": ObjectId(notice_id)}

    existing_notice = md.read_document(DBCollections.NOTICE_COLLECTION.value, query)
    if not existing_notice:
        raise HTTPException(status_code=404, detail="Notice not found")
    existing_notice = existing_notice[0]

    existing_attachments = existing_notice.get("attachments", [])
    existing_attachment_data = existing_notice.get("attachment_data", [])
    updated_attachments = json.loads(attachments) if attachments else []
    attachments_to_remove = [
        attachment
        for attachment in existing_attachments
        if attachment not in updated_attachments
    ]
    for attachment in attachments_to_remove:
        if attachment in existing_attachments:
            index = existing_attachments.index(attachment)
            existing_attachments.pop(index)
            if index < len(existing_attachment_data):
                existing_attachment_data.pop(index)
    update_data = {
        "user_id": user_id,
        "title": title,
        "content": content,
        "category": category,
        "priority": priority,
        "expiry": expiry,
        "pinned": pinned,
        "archived": archived,
        "attachments": updated_attachments,
        "timestamp": get_ist_timestamp(),
    }

    if attachment_files:
        new_attachment_names = []
        new_attachment_data = []
        for file in attachment_files:
            contents = await file.read()
            if contents:
                new_attachment_names.append(file.filename)
                new_attachment_data.append(base64.b64encode(contents).decode("utf-8"))

        update_data["attachments"] = existing_attachments + new_attachment_names
        update_data["attachment_data"] = existing_attachment_data + new_attachment_data
    else:
        update_data["attachments"] = existing_attachments
        update_data["attachment_data"] = existing_attachment_data

    result = md.update_document(
        DBCollections.NOTICE_COLLECTION.value, query, update_data
    )

    if result.get("message", "").startswith("Updated"):
        updated_notice = {
            "id": notice_id,
            "user_id": user_id,
            "title": title,
            "content": content,
            "category": category,
            "priority": priority,
            "expiry": expiry,
            "pinned": pinned,
            "archived": archived,
            "attachments": update_data["attachments"],
            "timestamp": update_data["timestamp"],
        }
        await manager.broadcast(
            json.dumps(
                {
                    "event": "update_notice",
                    "org_slug": org_slug,
                    "organization_name": organization_name,
                    "notice": updated_notice,
                }
            )
        )
        return JSONResponse(
            content={
                "message": "Notice updated successfully",
                "updated_notice": updated_notice,
            },
            status_code=200,
        )
    raise HTTPException(status_code=404, detail="Notice not found or no changes made")


@router.put("/update_notice_pin_status/{notice_id}")
@exception_handler
async def update_notice_pin_status(notice_id: str, org: dict = Depends(validate_org)):

    collection_name = DBCollections.NOTICE_COLLECTION.value
    query = {"_id": ObjectId(notice_id)}

    notices = md.read_document(collection_name, query)
    if not notices or len(notices) == 0:
        raise HTTPException(status_code=404, detail="Notice not found")

    notice = notices[0]
    current_pinned = notice.get("pinned", False)
    new_pinned_status = not current_pinned

    update_data = {"$set": {"pinned": new_pinned_status}}
    result = md.db[collection_name].update_one(query, update_data)

    if result.modified_count > 0:
        return {"message": "Notice updated successfully", "pinned": new_pinned_status}
    return {"detail": "No changes made to the notice"}


@router.put("/archive_notice/{notice_id}")
@exception_handler
async def archive_notice(notice_id: str, organization_name: str):

    collection_name = DBCollections.NOTICE_COLLECTION.value
    query = {"_id": ObjectId(notice_id)}
    result = md.update_document(collection_name, query, {"archived": True})

    if result.get("message", "").startswith("Updated"):
        await manager.broadcast(f"Notice {notice_id} archived")
        return {"message": "Notice archived successfully"}
    raise HTTPException(status_code=404, detail="Notice not found")


@router.get("/get_notice_attachment/{notice_id}/{index}")
@exception_handler
async def get_notice_attachment(
    notice_id: str, index: int, org: dict = Depends(validate_org)
):

    collection_name = DBCollections.NOTICE_COLLECTION.value
    notice = md.db[collection_name].find_one({"_id": ObjectId(notice_id)})

    if not notice:
        raise HTTPException(status_code=404, detail="Notice not found")

    attachments = notice.get("attachments", [])
    attachment_data = notice.get("attachment_data", [])

    if (
        not attachments
        or not attachment_data
        or index < 0
        or index >= len(attachment_data)
    ):
        raise HTTPException(status_code=404, detail="Attachment not found")

    attachment_name = attachments[index]
    attachment_content = attachment_data[index]

    content = base64.b64decode(attachment_content)

    extension = attachment_name.split(".")[-1].lower()
    mime_types = {
        "pdf": "application/pdf",
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
        "png": "image/png",
        "gif": "image/gif",
    }
    content_type = mime_types.get(extension, "application/octet-stream")

    notice_title = notice.get("title", "notice")
    sanitized_title = sanitize_filename(notice_title)
    sanitized_attachment_name = sanitize_filename(attachment_name)
    custom_filename = f"{sanitized_title}_{sanitized_attachment_name}"

    return StreamingResponse(
        io.BytesIO(content),
        media_type=content_type,
        headers={"Content-Disposition": f'attachment; filename="{custom_filename}"'},
    )
