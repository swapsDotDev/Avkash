import os
import uuid
import json
from fastapi import (
    Query,
    Request,
    Form,
    HTTPException,
    APIRouter,
    Depends,
)
from fastapi.responses import JSONResponse
import base64
from connection.conn import MogoConnection
from typing import Optional
import datetime
from DB_Collections import DBCollections
from model.reimbursement_model import UpdateInfo
from utils.common.common_helper import get_ist_timestamp
from websocket.ConnectionManager import manager
from connection.conn import MogoConnection
from DB_Collections import DBCollections
from utils.exception.error_handler import exception_handler
from utils.validation.validation import validate_org

router = APIRouter()
md = MogoConnection()
md.get_conn()

organization_name = ""


@router.post("/submit_reimbursement_request")
@exception_handler
async def submit_reimbursement_request(
    request: Request, user_id: str = Form(...), org: dict = Depends(validate_org)
):
    org_slug = org.get("org_slug")
    organization_name = org.get("organization_name")
    collection_name = DBCollections.REIMBURSEMENT_COLLECTION.value
    user_collection = DBCollections.USER_COLLECTION.value
    notification_collection = DBCollections.NOTIFICATION_COLLECTION.value
    form_data = await request.form()
    reimbursementData = form_data.get("reimbursementData")
    if not reimbursementData:
        raise HTTPException(status_code=400, detail="Missing reimbursementData")

    reimbursement_json = json.loads(reimbursementData)
    reimbursement_id = str(uuid.uuid4())
    expenses = reimbursement_json.get("expenses", [])
    employeeName = reimbursement_json.get("employeeName", "Member")

    for expense in expenses:
        expense_date = datetime.datetime.strptime(expense["date"], "%Y-%m-%d")
        if expense_date > datetime.datetime.now():
            raise HTTPException(
                status_code=400,
                detail=f"Expense date {expense['date']} cannot be in the future",
            )
        expense["expense_id"] = str(uuid.uuid4())
        expense["attachments"] = expense.get("attachments", [])
        expense["status"] = "pending"
        expense["is_notified"] = False
        expense["is_desktop_notified"] = False
        expense["timestamp"] = None

    reimbursement_json["reimbursement_id"] = reimbursement_id
    reimbursement_json["userId"] = user_id
    reimbursement_json["organization_name"] = organization_name
    reimbursement_json["org_slug"] = org_slug
    reimbursement_json["status"] = "pending"
    reimbursement_json["created_at"] = datetime.datetime.now().isoformat()
    reimbursement_json["is_notified"] = False
    reimbursement_json["is_desktop_notified"] = False
    reimbursement_json["clear"] = False
    reimbursement_json["admin_update_timestamp"] = None

    BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    attachments_dir = os.path.join(BASE_DIR, "attachments", org_slug, reimbursement_id)
    os.makedirs(attachments_dir, exist_ok=True)

    attachment_info = []
    attachments_by_expense = {}
    for key, attachment in form_data.items():
        if key.startswith("attachments_") and key not in [
            "reimbursementData",
            "user_id",
        ]:
            expense_index = int(key.split("_")[1])
            if expense_index >= len(expenses):
                continue
            file_content = await attachment.read()
            if not file_content:
                continue

            def sanitize_filename(filename):
                return "".join(
                    c for c in filename if c.isalnum() or c in (".", "_", "-")
                ).strip()

            sanitized_filename = sanitize_filename(attachment.filename)
            file_path = os.path.join(attachments_dir, sanitized_filename)

            with open(file_path, "wb") as buffer:
                buffer.write(file_content)

            base64_content = base64.b64encode(file_content).decode("utf-8")
            attachment_data = {
                "filename": sanitized_filename,
                "content_type": attachment.content_type,
                "path": file_path,
                "content": base64_content,
                "expense_id": expenses[expense_index]["expense_id"],
                "size": f"{(len(file_content) / (1024 * 1024)):.2f} Mb",
                "date": datetime.datetime.now().strftime("%d/%m/%Y"),
            }
            attachment_info.append(attachment_data)

            if expense_index not in attachments_by_expense:
                attachments_by_expense[expense_index] = []
            attachments_by_expense[expense_index].append(
                {
                    "filename": sanitized_filename,
                    "size": f"{(len(file_content) / (1024 * 1024)):.2f} Mb",
                    "date": datetime.datetime.now().strftime("%d/%m/%Y"),
                    "content_type": attachment.content_type,
                    "path": file_path,
                    "content": base64_content,
                }
            )

    for expense_index, attachments in attachments_by_expense.items():
        expenses[expense_index]["attachments"] = attachments

    reimbursement_json["attachments"] = attachment_info

    result = md.db[collection_name].insert_one(reimbursement_json)
    if result:
        role_query = {
            "user_role": {"$in": ["admin", "superadmin"]},
            "org_slug": org_slug,
        }
        admins_and_superadmins = md.read_document(user_collection, role_query)
        notification_message = f"You got a reimbursement request from {employeeName}"
        timestamp = get_ist_timestamp()

        for user in admins_and_superadmins:
            notification_data = {
                "user_id": user["user_id"],
                "message": notification_message,
                "timestamp": timestamp,
                "type": "reimbursement",
                "is_admin_notified": True,
                "is_admin_desktop_notified": False,
                "admin_clear": False,
                "org_slug": org_slug,
            }
            md.insert_record(notification_collection, [notification_data])

    return JSONResponse(
        content={
            "success": True,
            "message": "Reimbursement request submitted successfully",
            "reimbursement_id": reimbursement_id,
        },
        status_code=200,
    )


@router.get("/get_reimbursement_requests/{user_id}")
@exception_handler
async def get_reimbursement_requests(user_id: str, org: dict = Depends(validate_org)):
    org_slug = org.get("org_slug")
    organization_name = org.get("organization_name")
    collection_name = DBCollections.REIMBURSEMENT_COLLECTION.value
    if not user_id:
        raise HTTPException(status_code=400, detail="User ID not provided")

    query = {
        "userId": user_id,
        "organization_name": organization_name,
    }
    if org_slug:
        query["org_slug"] = org_slug

    reimbursement_requests = md.read_document(collection_name, query)
    if not reimbursement_requests:
        return JSONResponse(
            content={"success": True, "reimbursement_requests": [], "total": 0}
        )

    formatted_requests = []
    for request in reimbursement_requests:
        if "_id" in request:
            request["_id"] = str(request["_id"])

        created_at = request.get("created_at", "")
        expenses = request.get("expenses", [])
        reimbursement_type = (
            expenses[0].get("categories", ["Others"])[0] if expenses else "Others"
        )
        total_amount = float(request.get("totalAmount", 0))

        for expense in expenses:
            expense["attachments"] = expense.get("attachments", [])
            for attachment in expense["attachments"]:
                attachment.setdefault("filename", "")
                attachment.setdefault("size", "0.00 Mb")
                attachment.setdefault("date", "")
                attachment.setdefault("content_type", "application/octet-stream")
                attachment.setdefault("path", "")
                attachment.setdefault("content", "")

        formatted_request = {
            "reimbursement_id": request.get("reimbursement_id", ""),
            "employeeName": request.get("employeeName", ""),
            "employeeId": request.get("employeeId", ""),
            "department": request.get("department", ""),
            "manager": request.get("manager", ""),
            "totalAmount": total_amount,
            "status": request.get("status", "pending"),
            "created_at": created_at,
            "reimbursement_type": reimbursement_type,
            "organization_name": request.get("organization_name", organization_name),
            "org_slug": request.get("org_slug", org_slug),
            "expenses": expenses,
            "attachments": request.get("attachments", []),
        }
        formatted_requests.append(formatted_request)

    return JSONResponse(
        content={
            "success": True,
            "reimbursement_requests": formatted_requests,
            "total": len(formatted_requests),
        }
    )


@router.get("/user_image")
@exception_handler
async def get_user_image(
    employee_id: str = Query(..., description="Employee ID"),
    org: dict = Depends(validate_org),
):
    org_slug = org.get("org_slug")
    query = {"employee_id": employee_id}
    if org_slug:
        query["org_slug"] = org_slug

    users = md.read_document("user_collection", query)
    if not users:
        raise HTTPException(status_code=404, detail="User not found")

    user = users[0] if isinstance(users, list) else users

    return JSONResponse(content={"success": True, "imageUrl": user.get("imageUrl", "")})


@router.get("/get_all_reimbursement_requests")
@exception_handler
async def get_organization_reimbursement_requests_admin(
    org: dict = Depends(validate_org),
):
    org_slug = org.get("org_slug")
    organization_name = org.get("organization_name")
    collection_name = DBCollections.REIMBURSEMENT_COLLECTION.value

    query = {"organization_name": organization_name}
    if org_slug:
        query["org_slug"] = org_slug

    reimbursement_requests = md.read_document(collection_name, query)
    if not reimbursement_requests:
        return JSONResponse(
            content={"success": True, "reimbursement_requests": [], "total": 0}
        )

    formatted_requests = []
    for request in reimbursement_requests:
        if "_id" in request:
            request["_id"] = str(request["_id"])

        created_at = request.get("created_at", "")

        expenses = request.get("expenses", [])
        reimbursement_type = (
            expenses[0].get("categories", ["Others"])[0] if expenses else "Others"
        )

        total_amount = float(request.get("totalAmount", 0))

        formatted_request = {
            "reimbursement_id": request.get("reimbursement_id", ""),
            "employeeName": request.get("employeeName", ""),
            "employeeId": request.get("employeeId", ""),
            "department": request.get("department", ""),
            "manager": request.get("manager", ""),
            "totalAmount": total_amount,
            "status": request.get("status", "pending"),
            "created_at": created_at,
            "reimbursement_type": reimbursement_type,
            "organization_name": request.get("organization_name", organization_name),
            "org_slug": request.get("org_slug", org_slug),
            "expenses": expenses,
            "attachments": request.get("attachments", []),
        }
        formatted_requests.append(formatted_request)

    return JSONResponse(
        content={
            "success": True,
            "reimbursement_requests": formatted_requests,
            "total": len(formatted_requests),
        }
    )


@router.put("/update_reimbursement_status/{reimbursement_id}")
@exception_handler
async def update_reimbursement_status(
    reimbursement_id: str, update_info: UpdateInfo, org: dict = Depends(validate_org)
):
    organization_name = org.get("organization_name")
    collection_name = DBCollections.REIMBURSEMENT_COLLECTION.value
    collection = md.db[collection_name]
    query = {
        "reimbursement_id": reimbursement_id,
        "organization_name": organization_name,
    }
    current_doc = collection.find_one(query)

    if not current_doc:
        raise HTTPException(status_code=404, detail="Reimbursement request not found")

    all_expenses = current_doc.get("expenses", [])
    total_count = len(all_expenses)
    finalized_count = sum(
        1 for exp in all_expenses if exp.get("status") in ["approved", "rejected"]
    )

    if finalized_count == total_count and update_info.status != "in_review":
        raise HTTPException(
            status_code=400, detail="All expenses are already finalized"
        )

    admin_timestamp = datetime.datetime.now().isoformat()

    new_status = update_info.status
    if update_info.status == "approved":
        new_status = f"approved {total_count}/{total_count}"
    elif update_info.status == "rejected":
        new_status = f"approved 0/{total_count}"
    elif update_info.status == "in_review":
        new_status = "in_review"

    update_data = {
        "$set": {
            "status": new_status,
            "is_notified": True,
            "is_desktop_notified": True,
            "admin_clear": False,
            "admin_update_timestamp": admin_timestamp,
            "expenses": [
                {
                    **expense,
                    "status": update_info.status,
                    "timestamp": admin_timestamp,
                    "is_notified": True,
                    "is_desktop_notified": True,
                }
                for expense in all_expenses
            ],
        }
    }

    result = collection.update_one(query, update_data)
    if result.matched_count > 0:
        if update_info.status in ["approved", "rejected"]:
            notification_message = {
                "type": "reimbursement_update",
                "action": "status_update",
                "reimbursement_id": reimbursement_id,
                "organization_name": organization_name,
                "status": update_info.status,
                "needsDesktopNotification": True,
                "userId": current_doc.get("userId", ""),
            }
            await manager.broadcast(json.dumps(notification_message))
        return JSONResponse(
            content={"message": "Reimbursement request status updated successfully"},
            status_code=200,
        )


@router.put("/update_expense_status/{expense_id}")
@exception_handler
async def update_expense_status(
    expense_id: str,
    update_info: UpdateInfo,
    org: dict = Depends(validate_org),
):
    organization_name = org.get("organization_name")
    collection_name = DBCollections.REIMBURSEMENT_COLLECTION.value
    collection = md.db[collection_name]
    query = {"expenses.expense_id": expense_id, "organization_name": organization_name}
    current_doc = collection.find_one(query)

    if not current_doc:
        raise HTTPException(status_code=404, detail="Expense not found")

    expense = next(
        (
            exp
            for exp in current_doc.get("expenses", [])
            if exp["expense_id"] == expense_id
        ),
        None,
    )
    if expense and expense.get("status") in ["approved", "rejected"]:
        raise HTTPException(
            status_code=400, detail="Expense status is already finalized"
        )

    already_notified = expense.get("notification_sent", False)

    notification_id = str(uuid.uuid4())
    admin_timestamp = datetime.datetime.now().isoformat()

    update_data = {
        "$set": {
            "expenses.$.status": update_info.status,
            "expenses.$.is_notified": True,
            "expenses.$.is_desktop_notified": False,
            "expenses.$.timestamp": admin_timestamp,
            "expenses.$.notification_id": notification_id,
            "expenses.$.notification_sent": True,
            "admin_update_timestamp": admin_timestamp,
        }
    }

    result = collection.update_one({"expenses.expense_id": expense_id}, update_data)

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Expense not found")

    updated_doc = collection.find_one(
        {"expenses.expense_id": expense_id, "organization_name": organization_name}
    )
    if not updated_doc:
        raise HTTPException(status_code=404, detail="Updated document not found")

    all_expenses = updated_doc.get("expenses", [])
    total_count = len(all_expenses)
    approved_count = sum(1 for exp in all_expenses if exp.get("status") == "approved")
    rejected_count = sum(1 for exp in all_expenses if exp.get("status") == "rejected")
    in_review_count = sum(1 for exp in all_expenses if exp.get("status") == "in_review")

    if approved_count == total_count:
        new_status = "approved"
    elif approved_count > 0:
        new_status = f"approved {approved_count}/{total_count}"
    elif in_review_count > 0:
        new_status = f"in_review {in_review_count}/{total_count}"
    elif rejected_count == total_count:
        new_status = "rejected"
    elif rejected_count > 0:
        new_status = f"rejected {rejected_count}/{total_count}"
    else:
        new_status = "pending"

    collection.update_one(
        {"_id": updated_doc["_id"]},
        {
            "$set": {
                "status": new_status,
                "is_notified": True,
                "admin_update_timestamp": admin_timestamp,
            }
        },
    )

    if update_info.status in ["approved", "rejected"] and not already_notified:
        updated_expense = next(
            (
                exp
                for exp in updated_doc.get("expenses", [])
                if exp["expense_id"] == expense_id
            ),
            None,
        )

        notification_message = {
            "type": "reimbursement_update",
            "action": "expense_status_update",
            "reimbursement_id": updated_doc["reimbursement_id"],
            "expense_id": expense_id,
            "expense_description": updated_expense.get("description", ""),
            "organization_name": organization_name,
            "status": update_info.status,
            "needsDesktopNotification": True,
            "userId": updated_doc.get("userId", ""),
            "timestamp": admin_timestamp,
            "notification_id": notification_id,
        }
        await manager.broadcast(json.dumps(notification_message))
    return JSONResponse(
        content={"message": "Expense status updated successfully"}, status_code=200
    )
