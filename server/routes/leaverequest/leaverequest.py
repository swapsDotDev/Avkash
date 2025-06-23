import json
from fastapi import (
    APIRouter,
    Request,
    Form,
    HTTPException,
    Request,
    UploadFile,
    Depends,
)
from pydantic import BaseModel
from fastapi.responses import JSONResponse
from bson import ObjectId
import base64
from connection.conn import MogoConnection
from typing import Optional, Dict, Any
import logging
import datetime
from DB_Collections import DBCollections
from model.leaverequest_model import LeaveRequest
from utils.common.common_helper import get_ist_timestamp
from utils.dashboard.darshboard_helper import calculate_working_days
from utils.leaverequest.leaverequest_helper import (
    get_last_date_of_last_of_last_month,
    get_latest_start_of_6_month_period,
    get_leave_balance,
    get_total_leaves_for_join_date,
    should_auto_approve_leave,
)
from utils.exception.error_handler import exception_handler
from utils.validation.validation import validate_org

router = APIRouter()
md = MogoConnection()
md.get_conn()

organization_name = ""


@router.put("/update_leave_dates/{leave_req_id}")
@exception_handler
def update_leave_dates(leave_req_id: str, alldates: Dict[str, Dict[str, Any]]):
    if not ObjectId.is_valid(leave_req_id):
        raise HTTPException(status_code=400, detail="Invalid leave request ID format")

    query = {"_id": ObjectId(leave_req_id)}
    update_data = {"leavedates": alldates}

    total_leaves = 0
    swap_days_used = 0

    for date, leave_data in alldates.items():
        if leave_data.get("fullLeave", False):
            total_leaves += 1
            if leave_data.get("useSwap", False):
                swap_days_used += 1
        if leave_data.get("firstHalf", False) or leave_data.get("secondHalf", False):
            total_leaves += 0.5
            if leave_data.get("useSwap", False):
                swap_days_used += 0.5

    update_data["span"] = total_leaves
    update_data["swap_days_used"] = swap_days_used

    result = md.update_document(
        DBCollections.LEAVE_COLLECTION.value, query, update_data
    )
    if result:
        return {"message": "Data submitted successfully"}


@router.post("/submit_leave_request")
@exception_handler
async def submit_leave_request(
    request: Request,
    user_id: str = Form(...),
    email: str = Form(...),
    leave_type: str = Form(...),
    imageurl: str = Form(...),
    start_date: str = Form(...),
    end_date: str = Form(...),
    username: str = Form(...),
    description: Optional[str] = Form(None),
    attachment: Optional[UploadFile] = None,
    leavedates: Optional[str] = Form(None),
    org: dict = Depends(validate_org),
    leave_available: float = Form(...),
):
    org_slug = org.get("org_slug")
    collection_name = DBCollections.LEAVE_COLLECTION.value
    user_collection = DBCollections.USER_COLLECTION.value
    notification_collection = DBCollections.NOTIFICATION_COLLECTION.value
    query = {
        "user_id": user_id,
        "status": {"$ne": "cancelled"},
        "$or": [
            {
                "start_date": {"$lte": start_date},
                "end_date": {"$gte": start_date},
            },
            {"start_date": {"$lte": end_date}, "end_date": {"$gte": end_date}},
            {"start_date": {"$gt": start_date}, "end_date": {"$lt": end_date}},
        ],
    }
    existing_requests = md.read_document(collection_name, query)
    if existing_requests:
        raise HTTPException(
            status_code=400,
            detail="Leave request for this period already exists",
        )
    leave_dates_dict = {}
    span = 0
    if leavedates:
        leave_dates_dict = json.loads(leavedates)
        for date, leave_data in leave_dates_dict.items():
            if not isinstance(leave_data, dict):
                raise HTTPException(
                    status_code=400, detail="Invalid leave dates format"
                )
            if leave_data.get("fullLeave", False):
                span += 1
            elif leave_data.get("firstHalf", False) or leave_data.get(
                "secondHalf", False
            ):
                span += 0.5
    else:
        start_dt = datetime.datetime.strptime(start_date, "%Y-%m-%d")
        end_dt = datetime.datetime.strptime(end_date, "%Y-%m-%d")
        current_dt = start_dt
        if start_date == end_date:
            if leave_type == "firstHalf":
                leave_dates_dict = {
                    start_date: {
                        "fullLeave": False,
                        "firstHalf": True,
                        "secondHalf": False,
                    }
                }
                span = 0.5
            elif leave_type == "secondHalf":
                leave_dates_dict = {
                    start_date: {
                        "fullLeave": False,
                        "firstHalf": False,
                        "secondHalf": True,
                    }
                }
                span = 0.5
            else:
                leave_dates_dict = {
                    start_date: {
                        "fullLeave": True,
                        "firstHalf": False,
                        "secondHalf": False,
                    }
                }
                span = 1
        else:
            while current_dt <= end_dt:
                date_str = current_dt.strftime("%Y-%m-%d")
                if current_dt == start_dt:
                    leave_dates_dict[date_str] = {
                        "fullLeave": False,
                        "firstHalf": True,
                        "secondHalf": False,
                    }
                    span += 0.5
                else:
                    leave_dates_dict[date_str] = {
                        "fullLeave": True,
                        "firstHalf": False,
                        "secondHalf": False,
                    }
                    span += 1
                current_dt += datetime.timedelta(days=1)
    attachment_data = None
    if attachment and hasattr(attachment, "filename"):
        contents = await attachment.read()
        if contents:
            attachment_data = base64.b64encode(contents).decode("utf-8")
    leave_data = {
        "user_id": user_id,
        "email": email,
        "leave_type": leave_type,
        "imageurl": imageurl,
        "start_date": start_date,
        "end_date": end_date,
        "username": username,
        "description": description,
        "attachment": attachment_data,
        "leavedates": leave_dates_dict,
        "span": span,
        "leave_available": leave_available,
        "status": "pending",
        "org_slug": org_slug,
        "timestamp": get_ist_timestamp(),
    }
    should_auto_approve, approval_reason = should_auto_approve_leave(leave_data)
    if should_auto_approve:
        leave_data["status"] = "accepted"
        leave_data["auto_approved"] = True
        leave_data["auto_approval_reason"] = approval_reason
    result = md.insert_record(collection_name, [leave_data])
    if not result:
        raise HTTPException(status_code=500, detail="Failed to submit leave request")

    response_data = {
        "message": "Leave request submitted successfully",
        "status": leave_data["status"],
        "auto_approved": leave_data.get("auto_approved", False),
        "auto_approval_reason": leave_data.get("auto_approval_reason", ""),
        "leave_req_id": str(result["message"]),
    }

    if not should_auto_approve:
        role_query = {
            "user_role": {"$in": ["admin", "superadmin"]},
            "org_slug": org_slug,
        }
        admins_and_superadmins = md.read_document(user_collection, role_query)
        notification_message = (
            f"You got a leave request for {leave_type} from {username}"
        )
        timestamp = get_ist_timestamp()
        for user in admins_and_superadmins:
            notification_data = {
                "user_id": user["user_id"],
                "message": notification_message,
                "timestamp": timestamp,
                "type": "leave request",
                "is_admin_notified": True,
                "is_admin_desktop_notified": False,
                "admin_clear": False,
                "org_slug": org_slug,
            }
            md.insert_record(notification_collection, [notification_data])

    return response_data


@router.get("/get_leave_requests/{user_id}")
@exception_handler
def get_leave_requests(user_id: str, org: dict = Depends(validate_org)):
    collection_name = DBCollections.LEAVE_COLLECTION.value
    query = {"user_id": user_id}
    leave_requests = md.read_document(collection_name, query)
    for leave_request in leave_requests:
        if "_id" in leave_request:
            leave_request["_id"] = str(leave_request["_id"])
    return JSONResponse(content={"leave_requests": leave_requests})


@router.delete("/delete_leave_request/{_id}")
@exception_handler
async def delete_leave_request(_id: str, org: dict = Depends(validate_org)):
    collection_name = DBCollections.LEAVE_COLLECTION.value
    result = md.delete_document(collection_name, {"_id": ObjectId(_id)})
    if result and result["message"].startswith("Deleted"):
        return JSONResponse(
            content={"message": "Leave request deleted successfully"},
            status_code=200,
        )
    else:
        raise HTTPException(status_code=404, detail="Leave request not found")


@router.get("/leave-data")
@exception_handler
def get_leave_data(org: dict = Depends(validate_org)):
    org_slug = org.get("org_slug")
    collection_name = DBCollections.LEAVE_COLLECTION.value
    leave_data = md.read_document(collection_name, {"org_slug": {"$in": [org_slug]}})
    for data in leave_data:
        if "_id" in data:
            data["_id"] = str(data["_id"])
    if leave_data:
        return JSONResponse(content={"leave_data": leave_data})
    else:
        raise HTTPException(status_code=404, detail="Leave data not found")


@router.get("/get_all_leave_requests")
@exception_handler
def get_all_leave_requests(org: dict = Depends(validate_org)):
    org_slug = org.get("org_slug")
    collection_name = DBCollections.LEAVE_COLLECTION.value
    leave_requests = md.read_document(
        collection_name, {"org_slug": {"$in": [org_slug]}}
    )
    collection_name = DBCollections.USER_COLLECTION.value
    for leave_request in leave_requests:
        if "_id" in leave_request:
            leave_request["_id"] = str(leave_request["_id"])
        user_data = md.read_document(
            collection_name,
            {"user_id": leave_request["user_id"], "org_slug": org_slug},
        )
        if not user_data:
            leave_request["leave_available"] = 0
            continue
        if "DateOfJoining" not in user_data[0]:
            leave_request["leave_available"] = 0
        else:
            join_date = user_data[0]["DateOfJoining"]
            start_of_6month = get_latest_start_of_6_month_period(join_date)
            leave_balance = get_leave_balance(start_of_6month)
            payslip_before_date = datetime.datetime.strptime(
                leave_request["start_date"], "%Y-%m-%d"
            ).date()
            leave_remaining = get_total_leaves_for_join_date(
                start_of_6month,
                payslip_before_date,
                leave_balance,
                leave_requests,
                leave_request["user_id"],
            )
            if leave_remaining < 0:
                leave_remaining = 0
            past_leaves = md.read_document(
                DBCollections.LEAVE_COLLECTION.value,
                {
                    "user_id": leave_request["user_id"],
                    "status": "accepted",
                    "org_slug": org_slug,
                    "start_date": {"$lt": leave_request["start_date"]},
                },
            )

            total_taken = 0
            for doc in past_leaves:
                leavedates = doc.get("leavedates", {})
                for val in leavedates.values():
                    if not val.get("useSwap"):
                        if val.get("fullLeave"):
                            total_taken += 1
                        elif val.get("firstHalf") or val.get("secondHalf"):
                            total_taken += 0.5

            leave_remaining = leave_balance - total_taken
            leave_request["leave_available"] = max(0, leave_remaining)
            leave_request["leave_available"] = leave_remaining
    return JSONResponse(content={"leave_requests": leave_requests})


@router.get("/get_all_accepted_leave_requests")
@exception_handler
def get_all_accepted_leave_requests(org: dict = Depends(validate_org)):
    org_slug = org.get("org_slug")
    collection_name = DBCollections.LEAVE_COLLECTION.value
    leave_requests = md.read_document(
        collection_name, {"status": "accepted", "org_slug": org_slug}
    )

    filtered_requests = []
    today = datetime.date.today()

    for leave_request in leave_requests:
        start_date = datetime.datetime.strptime(
            leave_request["start_date"], "%Y-%m-%d"
        ).date()
        end_date = datetime.datetime.strptime(
            leave_request["end_date"], "%Y-%m-%d"
        ).date()
        if start_date <= today and end_date >= today:
            filtered_requests.append(leave_request)
            leave_request["_id"] = str(leave_request["_id"])
    return JSONResponse(content={"leave_requests": filtered_requests})


class UpdateInfo(BaseModel):
    status: str
    admin_timestamp: str


@router.put("/update_leave_request_status/{leave_request_id}")
@exception_handler
def update_leave_request_status(
    leave_request_id: str, update_info: UpdateInfo, org: dict = Depends(validate_org)
):
    collection_name = DBCollections.LEAVE_COLLECTION.value
    query = {"_id": ObjectId(leave_request_id)}
    admin_timestamp = (
        datetime.datetime.now(datetime.timezone.utc)
        .isoformat(timespec="milliseconds")
        .replace("+00:00", "Z")
    )
    if update_info.status != "in_review":
        update_data = {
            "status": update_info.status,
            "is_notified": True,
            "admin_timestamp": admin_timestamp,
        }
    else:
        update_data = {
            "status": update_info.status,
            "timestamp": update_info.admin_timestamp,
        }
    result = md.update_document(collection_name, query, update_data)
    if result and "message" in result and "Updated" in result["message"]:
        if update_info.status == "accepted":
            leave_doc = md.read_document(DBCollections.LEAVE_COLLECTION.value, query)
            if leave_doc:
                leavedates = leave_doc[0].get("leavedates", {})
                used_swap_days = 0
                for entry in leavedates.values():
                    if entry.get("useSwap"):
                        if entry.get("fullLeave"):
                            used_swap_days += 1
                        elif entry.get("firstHalf") or entry.get("secondHalf"):
                            used_swap_days += 0.5

                if used_swap_days > 0:
                    user_query = {
                        "user_id": leave_doc[0]["user_id"],
                        "org_slug": leave_doc[0]["org_slug"],
                    }
                    user_doc = md.read_document(
                        DBCollections.USER_COLLECTION.value, user_query
                    )
                    if user_doc:
                        current_swap = user_doc[0].get("swap_count", 0)
                        new_swap = max(current_swap - used_swap_days, 0)
                        md.update_document(
                            DBCollections.USER_COLLECTION.value,
                            user_query,
                            {"swap_count": new_swap},
                        )

        return JSONResponse(
            content={"message": "Leave request status updated successfully"},
            status_code=200,
        )
    else:
        raise HTTPException(status_code=404, detail="Leave request not found")


@router.get("/leave_requests")
@exception_handler
def get_month(org: dict = Depends(validate_org)):
    org_slug = org.get("org_slug")
    collection_name = DBCollections.LEAVE_COLLECTION.value
    month_data = {}
    all_documents = md.read_document(collection_name, {"org_slug": {"$in": [org_slug]}})
    for doc in all_documents:
        start_date = doc.get("start_date")
        if start_date:
            month = datetime.datetime.strptime(start_date, "%Y-%m-%d").strftime("%B")
            if month not in month_data:
                month_data[month] = {
                    "accepted": 0,
                    "rejected": 0,
                    "inreview": 0,
                }
            if doc["status"] == "accepted":
                month_data[month]["accepted"] += 1
            elif doc["status"] == "rejected":
                month_data[month]["rejected"] += 1
            elif doc["status"] == "in_review":
                month_data[month]["inreview"] += 1
    sorted_months = sorted(
        month_data.keys(), key=lambda x: datetime.datetime.strptime(x, "%B")
    )
    sorted_month_data = {month: month_data[month] for month in sorted_months}
    return sorted_month_data


@router.put("/addSwap")
@exception_handler
def add_Swap(user_id: str):
    if not user_id:
        raise HTTPException(
            status_code=400,
            detail="User id is not provided in request parameters",
        )

    collection_user = DBCollections.USER_COLLECTION.value
    user_data = md.db[collection_user].find_one({"user_id": user_id})

    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")

    result = md.db[collection_user].update_one(
        {"user_id": user_id}, {"$inc": {"swap_count": 1}}
    )

    if result.modified_count > 0:
        logging.info("Swapcount incremented successfully")
        return {"message": "Swapcount incremented successfully"}
    else:
        logging.warning("Swapcount was already up-to-date or not modified")
        return {"message": "Swapcount was already up-to-date"}


@router.get("/get_accepted_leave")
@exception_handler
def get_accepted_leave(org: dict = Depends(validate_org)):
    org_slug = org.get("org_slug")
    collection_name = DBCollections.LEAVE_COLLECTION.value
    leave_requests = (
        md.read_document(collection_name, {"status": "accepted", "org_slug": org_slug})
        or []
    )
    collection_name = DBCollections.USER_COLLECTION.value
    filtered_requests = []
    today = datetime.datetime.today()
    current_month = today.month
    current_year = today.year
    if current_month == 1:
        previous_month = 12
        previous_year = current_year - 1
    else:
        previous_month = current_month - 1
        previous_year = current_year

    working_days = calculate_working_days(previous_year, previous_month)
    count = working_days

    for leave_request in leave_requests:
        start_date = datetime.datetime.strptime(
            leave_request["start_date"], "%Y-%m-%d"
        ).date()
        end_date = datetime.datetime.strptime(
            leave_request["end_date"], "%Y-%m-%d"
        ).date()

        if (
            start_date.year == previous_year and start_date.month == previous_month
        ) or (end_date.year == previous_year and end_date.month == previous_month):
            filtered_requests.append(leave_request)
            leave_request["_id"] = str(leave_request["_id"])

    leave_balance = 9

    for request in filtered_requests:
        user_data = md.read_document(collection_name, {"user_id": request["user_id"]})
        join_date = user_data[0]["DateOfJoining"]
        start_of_6month = get_latest_start_of_6_month_period(join_date)
        leave_balance = get_leave_balance(start_of_6month)
        payslip_before_date = get_last_date_of_last_of_last_month()
        leave_remaining = get_total_leaves_for_join_date(
            start_of_6month,
            payslip_before_date,
            leave_balance,
            leave_requests,
            request["user_id"],
        )
        if leave_remaining < 0:
            leave_remaining = 0
        request["leave_remaining"] = leave_remaining

    return JSONResponse(content={"leave_requests": filtered_requests, "count": count})


@router.get("/get_accepted_leave/{user_id}")
@exception_handler
def get_accepted_leave(user_id: str, org: dict = Depends(validate_org)):
    collection_name = DBCollections.LEAVE_COLLECTION.value
    user_data = md.read_document(
        collection_name, {"status": "accepted", "user_id": user_id}
    )
    for user in user_data:
        if "_id" in user:
            user["_id"] = str(user["_id"])
    if user_data:
        return JSONResponse(content={"user_data": user_data})
    else:
        raise HTTPException(status_code=404, detail="payslip data not found")
