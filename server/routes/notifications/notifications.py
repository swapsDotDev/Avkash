from fastapi import (
    HTTPException,
    Query,
    Header,
    Request,
    APIRouter,
    Depends,
)
from fastapi.responses import JSONResponse
from bson import ObjectId
import datetime
import logging
from fastapi import Request
from DB_Collections import DBCollections
from connection.conn import MogoConnection
from utils.notification.notification_helper import create_reimbursement_notification
from utils.exception.error_handler import exception_handler
from utils.validation.validation import validate_org
from utils.common.common_helper import format_timestamp


md = MogoConnection()
md.get_conn()
router = APIRouter()


@router.get("/send_notifications")
@exception_handler
def send_notifications(user_id: str, org: dict = Depends(validate_org)):
    organization_name = org.get("organization_name")
    org_slug = org.get("org_slug")
    if not organization_name:
        raise HTTPException(
            status_code=400,
            detail="Organization name not provided in the request header",
        )

    collection_name = DBCollections.LEAVE_COLLECTION.value
    collection_name1 = DBCollections.USER_FEEDBACK.value
    collection_name2 = DBCollections.REIMBURSEMENT_COLLECTION.value
    collection_name3 = DBCollections.NOTIFICATION_COLLECTION.value
    collection_name4 = DBCollections.DOCUMENT_COLLECTION.value

    jobs_true = md.read_document(
        collection_name3,
        {"is_notified": True, "clear": False, "org_slug": org_slug, "user_id": user_id},
    )
    jobs_false = md.read_document(
        collection_name3,
        {
            "is_notified": False,
            "clear": False,
            "org_slug": org_slug,
            "user_id": user_id,
        },
    )

    leave_requests_true = md.read_document(
        collection_name,
        {
            "is_notified": True,
            "clear": False,
            "status": {"$in": ["accepted", "rejected"]},
            "user_id": user_id,
            "org_slug": org_slug,
        },
    )
    leave_requests_false = md.read_document(
        collection_name,
        {
            "is_notified": False,
            "clear": False,
            "status": {"$in": ["accepted", "rejected"]},
            "user_id": user_id,
            "org_slug": org_slug,
        },
    )

    user_feedbacks_true = md.read_document(
        collection_name1,
        {
            "is_notified": True,
            "clear": False,
            "org_slug": org_slug,
            "user_id": user_id,
        },
    )
    user_feedbacks_false = md.read_document(
        collection_name1,
        {
            "is_notified": False,
            "clear": False,
            "org_slug": org_slug,
            "user_id": user_id,
        },
    )

    reimbursement_requests_true = md.read_document(
        collection_name2,
        {
            "is_notified": True,
            "clear": False,
            "org_slug": org_slug,
            "userId": user_id,
            "organization_name": organization_name,
        },
    )
    reimbursement_requests_false = md.read_document(
        collection_name2,
        {
            "is_notified": False,
            "clear": False,
            "org_slug": org_slug,
            "userId": user_id,
            "organization_name": organization_name,
        },
    )

    document_requests_true = md.read_document(
        collection_name4,
        {
            "is_notified": True,
            "clear": False,
            "org_slug": org_slug,
            "status": {"$in": ["in_review", "approved", "rejected"]},
        },
    )
    document_requests_false = md.read_document(
        collection_name4,
        {
            "is_notified": {"$in": [False, None]},
            "clear": False,
            "org_slug": org_slug,
            "status": {"$in": ["in_review", "approved", "rejected"]},
        },
    )

    notifications_true = []
    notifications_false = []
    seen_notifications = set()

    for job in jobs_true:
        if not all(notification_key in job for notification_key in ["_id"]):
            continue
        notification = {
            "collectionName": collection_name3,
            "_id": str(job["_id"]),
            "type": "referral",
            "timestamp": job["timestamp"],
            "message": job["message"],
        }
        notifications_true.append(notification)

    for job in jobs_false:
        if not all(
            notification_key in job for notification_key in ["_id", "timestamp"]
        ):
            continue
        notification = {
            "collectionName": collection_name3,
            "_id": str(job["_id"]),
            "type": "referral",
            "timestamp": job["timestamp"],
            "message": job["message"],
        }
        notifications_false.append(notification)

    for leave_request in leave_requests_true:
        if not all(
            notification_key in leave_request
            for notification_key in [
                "_id",
                "user_id",
                "admin_timestamp",
                "leave_type",
                "status",
            ]
        ):
            continue
        notification = {
            "collectionName": collection_name,
            "_id": str(leave_request["_id"]),
            "user_id": leave_request["user_id"],
            "type": "leave",
            "timestamp": leave_request["admin_timestamp"],
            "message": f"Your leave request for {leave_request['leave_type']} is {leave_request['status']}",
            "is_notified": True,
        }
        notification_key = f"{notification['_id']}_{notification['type']}"
        if notification_key not in seen_notifications:
            notifications_true.append(notification)
            seen_notifications.add(notification_key)

    for leave_request in leave_requests_false:
        if not all(
            notification_key in leave_request
            for notification_key in [
                "_id",
                "user_id",
                "admin_timestamp",
                "leave_type",
                "status",
            ]
        ):
            continue
        notification = {
            "collectionName": collection_name,
            "_id": str(leave_request["_id"]),
            "user_id": leave_request["user_id"],
            "type": "leave",
            "timestamp": leave_request["admin_timestamp"],
            "message": f"Your leave request for {leave_request['leave_type']} is {leave_request['status']}",
            "is_notified": False,
        }
        notification_key = f"{notification['_id']}_{notification['type']}"
        if notification_key not in seen_notifications:
            notifications_false.append(notification)
            seen_notifications.add(notification_key)

    for feedback in user_feedbacks_true:
        if not all(
            notification_key in feedback
            for notification_key in ["_id", "user_id", "admin_reply_timestamp", "reply"]
        ):
            continue
        notification = {
            "collectionName": collection_name1,
            "_id": str(feedback["_id"]),
            "user_id": feedback["user_id"],
            "type": "feedback",
            "timestamp": feedback["admin_reply_timestamp"],
            "message": f"You have received a reply to your feedback: {feedback['reply']}",
            "is_notified": True,
        }
        notification_key = f"{notification['_id']}_{notification['type']}"
        if notification_key not in seen_notifications:
            notifications_true.append(notification)
            seen_notifications.add(notification_key)

    for feedback in user_feedbacks_false:
        if not all(
            notification_key in feedback
            for notification_key in ["_id", "user_id", "admin_reply_timestamp", "reply"]
        ):
            continue
        notification = {
            "collectionName": collection_name1,
            "_id": str(feedback["_id"]),
            "user_id": feedback["user_id"],
            "type": "feedback",
            "timestamp": feedback["admin_reply_timestamp"],
            "message": f"You have received a reply to your feedback: {feedback['reply']}",
            "is_notified": False,
        }
        notification_key = f"{notification['_id']}_{notification['type']}"
        if notification_key not in seen_notifications:
            notifications_false.append(notification)
            seen_notifications.add(notification_key)

    for reimbursement in reimbursement_requests_true + reimbursement_requests_false:
        required_fields = ["_id", "userId", "status"]
        missing_fields = [
            field for field in required_fields if field not in reimbursement
        ]
        if missing_fields:
            continue
        notification = create_reimbursement_notification(
            reimbursement, collection_name2
        )
        if notification:
            notification_key = f"{notification['_id']}_{notification['type']}"
            if notification_key not in seen_notifications:
                if reimbursement.get("is_notified", False):
                    notifications_true.append(notification)
                else:
                    notifications_false.append(notification)
                seen_notifications.add(notification_key)

    for doc in document_requests_true:
        if not all(
            notification_key in doc
            for notification_key in ["_id", "user_id", "status", "document_name"]
        ):
            continue
        notification = {
            "collectionName": collection_name4,
            "_id": str(doc["_id"]),
            "user_id": doc["user_id"],
            "type": "document",
            "timestamp": doc.get("timestamp", doc.get("submitted_at")),
            "message": f"Your document request {doc['document_name']} has been {'In review' if doc['status'] == 'in_review' else doc['status']}.",
            "is_notified": True,
        }
        notification_key = f"{notification['_id']}_{notification['type']}"
        if notification_key not in seen_notifications:
            notifications_true.append(notification)
            seen_notifications.add(notification_key)

    for doc in document_requests_false:
        if not all(
            notification_key in doc
            for notification_key in ["_id", "user_id", "status", "document_name"]
        ):
            continue
        notification = {
            "collectionName": collection_name4,
            "_id": str(doc["_id"]),
            "user_id": doc["user_id"],
            "type": "document",
            "timestamp": doc.get("timestamp", doc.get("submitted_at")),
            "message": f"Your document request {doc['document_name']} has been {doc['status']}.",
            "is_notified": False,
        }
        notification_key = f"{notification['_id']}_{notification['type']}"
        if notification_key not in seen_notifications:
            notifications_false.append(notification)
            seen_notifications.add(notification_key)

    return JSONResponse(
        content={
            "notifications_true": notifications_true,
            "notifications_false": notifications_false,
        }
    )


@router.get("/send_desktop_notifications")
@exception_handler
def send_desktop_notifications(user_id: str, org: dict = Depends(validate_org)):
    organization_name = org.get("organization_name")
    org_slug = org.get("org_slug")
    if organization_name:
        collection_name = DBCollections.LEAVE_COLLECTION.value
        collection_name1 = DBCollections.USER_FEEDBACK.value
        collection_name2 = DBCollections.REIMBURSEMENT_COLLECTION.value
        collection_name3 = DBCollections.NOTIFICATION_COLLECTION.value
        collection_name4 = DBCollections.DOCUMENT_COLLECTION.value

        leave_requests = md.read_document(
            collection_name,
            {
                "is_desktop_notified": False,
                "clear": False,
                "status": {"$in": ["accepted", "rejected"]},
                "user_id": user_id,
                "org_slug": org_slug,
            },
        )
        user_feedbacks = md.read_document(
            collection_name1,
            {
                "is_desktop_notified": False,
                "clear": False,
                "user_id": user_id,
                "org_slug": org_slug,
            },
        )
        jobs = md.read_document(
            collection_name3,
            {
                "is_desktop_notified": False,
                "clear": False,
                "org_slug": org_slug,
                "user_id": user_id,
            },
        )
        reimbursement_requests = md.read_document(
            collection_name2,
            {
                "is_desktop_notified": False,
                "clear": False,
                "userId": user_id,
                "status": {"$in": ["approved", "rejected"]},
                "org_slug": org_slug,
            },
        )
        document_notifications = md.read_document(
            collection_name4,
            {
                "is_desktop_notified": False,
                "clear": False,
                "user_id": user_id,
                "org_slug": org_slug,
            },
        )

        notifications = []

        for job in jobs:
            if "_id" in job:
                job["_id"] = str(job["_id"])
            notification = {
                "collectionName": collection_name3,
                "_id": str(job["_id"]),
                "type": "referral",
                "message": job["message"],
            }
            notifications.append(notification)

        for leave_request in leave_requests:
            if "_id" in leave_request:
                leave_request["_id"] = str(leave_request["_id"])
            notification = {
                "collectionName": collection_name,
                "_id": str(leave_request["_id"]),
                "user_id": leave_request["user_id"],
                "message": f"Your leave request for {leave_request['leave_type']} is {leave_request['status']}",
            }
            notifications.append(notification)

        for feedback in user_feedbacks:
            if "_id" in feedback:
                feedback["_id"] = str(feedback["_id"])
            notification = {
                "collectionName": collection_name1,
                "_id": str(feedback["_id"]),
                "user_id": feedback["user_id"],
                "message": f"You have received a reply to your feedback :{feedback['reply']}",
            }
            notifications.append(notification)

        for reimbursement in reimbursement_requests:
            if "_id" in reimbursement:
                reimbursement["_id"] = str(reimbursement["_id"])
                notification = {
                    "collectionName": collection_name2,
                    "_id": str(reimbursement["_id"]),
                    "user_id": reimbursement["userId"],
                    "message": f"Your reimbursement request is {reimbursement['status']}",
                }
                notifications.append(notification)

        for doc in document_notifications:
            if "_id" in doc:
                doc["_id"] = str(doc["_id"])
            notification = {
                "collectionName": collection_name4,
                "_id": str(doc["_id"]),
                "user_id": doc["user_id"],
                "message": f"Your document request {doc['document_name']} has been {'In review' if doc['status'] == 'in_review' else doc['status']}.",
            }
            notifications.append(notification)

        return JSONResponse(content={"notifications": notifications})
    else:
        raise HTTPException(
            status_code=400,
            detail="Organization name not provided in the request header",
        )


@router.put("/update_notification/{notification_id}/")
@exception_handler
def update_notification(
    notification_id: str,
    request: Request,
    collection_name: str,
    org: dict = Depends(validate_org),
):
    organization_name = org.get("organization_name")
    org_slug = org.get("org_slug")
    if organization_name:
        collection_name1 = DBCollections.LEAVE_COLLECTION.value
        collection_name2 = DBCollections.USER_FEEDBACK.value
        collection_name3 = DBCollections.REIMBURSEMENT_COLLECTION.value
        collection_name4 = DBCollections.NOTIFICATION_COLLECTION.value
        collection_name5 = DBCollections.DOCUMENT_COLLECTION.value
        if collection_name == collection_name1:
            result = md.update_document(
                collection_name,
                {"_id": ObjectId(notification_id), "org_slug": org_slug},
                {"is_notified": False},
            )
        elif collection_name == collection_name4:
            result = md.update_document(
                collection_name,
                {"_id": ObjectId(notification_id), "org_slug": org_slug},
                {"is_notified": False},
            )
        elif collection_name == collection_name2:
            result = md.update_document(
                collection_name,
                {"_id": ObjectId(notification_id), "org_slug": org_slug},
                {"is_notified": False},
            )
        elif collection_name == collection_name3:
            result = md.update_document(
                collection_name,
                {"_id": ObjectId(notification_id), "org_slug": org_slug},
                {"is_notified": False},
            )
        elif collection_name == collection_name5:
            result = md.update_document(
                collection_name,
                {"_id": ObjectId(notification_id), "org_slug": org_slug},
                {"is_notified": False},
            )
        else:
            raise HTTPException(status_code=400, detail="Invalid collection name")
        if result:
            return {"message": "Notification status updated successfully"}
        else:
            raise HTTPException(status_code=404, detail="Notification not found")
    else:
        raise HTTPException(
            status_code=400,
            detail="Organization name not provided in the request header",
        )


@router.put("/update_notification_clear/{notification_id}")
@exception_handler
def update_notification_clear(
    notification_id: str, request: Request, collection_name: str
):
    organization_name = request.query_params.get("organization_name")

    if not organization_name:
        raise HTTPException(
            status_code=400, detail="Organization name not provided in the request"
        )

    expected_leave_collection = DBCollections.LEAVE_COLLECTION.value
    expected_feedback_collection = DBCollections.USER_FEEDBACK.value
    expected_reimbursement_collection = DBCollections.REIMBURSEMENT_COLLECTION.value

    if collection_name in [
        expected_leave_collection,
        expected_feedback_collection,
        expected_reimbursement_collection,
    ]:
        result = md.update_document(
            collection_name,
            {"_id": ObjectId(notification_id)},
            {"clear": True, "is_desktop_notified": False},
        )
        if result:
            return {"message": "Notification status updated successfully"}
        else:
            raise HTTPException(status_code=404, detail="Notification not found")
    else:
        raise HTTPException(status_code=400, detail="Invalid collection name")


@router.put("/update_notificationbar_clear/{notification_id}/")
@exception_handler
def update_notificationbar_clear(
    notification_id: str, request: Request, collection_name: str
):
    organization_name = request.query_params.get("organization_name")
    if organization_name:
        collection_name1 = DBCollections.LEAVE_COLLECTION.value
        collection_name2 = DBCollections.USER_FEEDBACK.value
        collection_name3 = DBCollections.REIMBURSEMENT_COLLECTION.value
        collection_name4 = DBCollections.NOTIFICATION_COLLECTION.value
        collection_name5 = DBCollections.DOCUMENT_COLLECTION.value
        if collection_name == collection_name1:
            result = md.update_document(
                collection_name, {"_id": ObjectId(notification_id)}, {"clear": True}
            )
        elif collection_name == collection_name2:
            result = md.update_document(
                collection_name, {"_id": ObjectId(notification_id)}, {"clear": True}
            )
        elif collection_name == collection_name3:
            result = md.update_document(
                collection_name, {"_id": ObjectId(notification_id)}, {"clear": True}
            )
        elif collection_name == collection_name4:
            result = md.update_document(
                collection_name, {"_id": ObjectId(notification_id)}, {"clear": True}
            )
        elif collection_name == collection_name5:
            result = md.update_document(
                collection_name, {"_id": ObjectId(notification_id)}, {"clear": True}
            )
        else:
            raise HTTPException(status_code=400, detail="Invalid collection name")
        if result:
            return {"message": "Notification status updated successfully"}
        else:
            raise HTTPException(status_code=404, detail="Notification not found")
    else:
        raise HTTPException(
            status_code=400,
            detail="Organization name not provided in the request header",
        )


@router.put("/update_desktop_notification/{notification_id}")
@exception_handler
def update_notification_clear(
    notification_id: str, collection: str, org: dict = Depends(validate_org)
):
    organization_name = org.get("organization_name")
    if not organization_name:
        raise HTTPException(
            status_code=400, detail="Organization name not provided in the request"
        )

    collection_name = DBCollections.LEAVE_COLLECTION.value
    collection_name1 = DBCollections.USER_FEEDBACK.value
    collection_name2 = DBCollections.REIMBURSEMENT_COLLECTION.value
    collection_name3 = DBCollections.NOTIFICATION_COLLECTION.value
    collection_name4 = DBCollections.DOCUMENT_COLLECTION.value

    if (
        collection == collection_name
        or collection == collection_name1
        or collection == collection_name2
        or collection == collection_name3
        or collection == collection_name4
    ):
        result = md.update_document(
            collection,
            {"_id": ObjectId(notification_id)},
            {"is_desktop_notified": True},
        )
        if result:
            return {"message": "Notification status updated successfully"}
        else:
            raise HTTPException(status_code=404, detail="Notification not found")
    else:
        raise HTTPException(status_code=400, detail="Invalid collection name")


@router.put("/clear_notifications/{user_id}")
@exception_handler
async def clear_notifications(
    user_id: str,
    request: Request,
    type: str = Query(None),
    organization_name: str = Header(None),
):
    if not organization_name:
        raise HTTPException(
            status_code=400,
            detail="Organization name not provided in the request header",
        )

    if type == "leave":
        collection_name = DBCollections.LEAVE_COLLECTION.value
        md.update_document(collection_name, {"user_id": user_id}, {"clear": True})
    elif type == "feedback":
        collection_name = DBCollections.USER_FEEDBACK.value
        md.update_document(collection_name, {"user_id": user_id}, {"clear": True})
    elif type == "reimbursement":
        collection_name = DBCollections.REIMBURSEMENT_COLLECTION.value
        md.update_document(collection_name, {"user_id": user_id}, {"clear": True})
    else:
        collection_name1 = DBCollections.LEAVE_COLLECTION.value
        collection_name2 = DBCollections.USER_FEEDBACK.value
        collection_name3 = DBCollections.REIMBURSEMENT_COLLECTION.value
        md.update_document(collection_name1, {"user_id": user_id}, {"clear": True})
        md.update_document(collection_name2, {"user_id": user_id}, {"clear": True})
        md.update_document(collection_name3, {"user_id": user_id}, {"clear": True})

    return {"message": "Notifications cleared successfully"}


@router.put("/clear_notificationsbar/{user_id}")
@exception_handler
def clear_notificationsbar(
    user_id: str, request: Request, org: dict = Depends(validate_org)
):
    org_slug = org.get("org_slug")
    organization_name = org.get("organization_name")
    if organization_name:
        collection_name1 = DBCollections.LEAVE_COLLECTION.value
        collection_name2 = DBCollections.USER_FEEDBACK.value
        collection_name3 = DBCollections.REIMBURSEMENT_COLLECTION.value
        collection_name4 = DBCollections.NOTIFICATION_COLLECTION.value
        collection_name5 = DBCollections.DOCUMENT_COLLECTION.value

        leave = md.update_document(
            collection_name1, {"user_id": user_id}, {"clear": True}
        )
        feedback = md.update_document(
            collection_name2, {"user_id": user_id}, {"clear": True}
        )
        reimbursement = md.update_document(
            collection_name3, {"userId": user_id}, {"clear": True}
        )
        jobs = md.update_document(
            collection_name4, {"user_id": user_id}, {"clear": True}
        )
        document = md.update_document(
            collection_name5, {"user_id": user_id}, {"clear": True}
        )
    else:
        raise HTTPException(
            status_code=400,
            detail="Organization name not provided in the request header",
        )


@router.get("/send_admin_notifications")
@exception_handler
def send_admin_notifications(user_id: str, org: dict = Depends(validate_org)):
    organization_name = org.get("organization_name")
    org_slug = org.get("org_slug")
    if not organization_name:
        raise HTTPException(
            status_code=400,
            detail="Organization name not provided in the request header",
        )

    notification_collection = DBCollections.NOTIFICATION_COLLECTION.value

    all_notifications_true = md.read_document(
        notification_collection,
        {
            "is_admin_notified": True,
            "admin_clear": False,
            "org_slug": org_slug,
            "user_id": user_id,
        },
    )

    all_notifications_false = md.read_document(
        notification_collection,
        {
            "is_admin_notified": False,
            "admin_clear": False,
            "org_slug": org_slug,
            "user_id": user_id,
        },
    )

    notifications_true = []
    notifications_false = []

    for notifications in all_notifications_true + all_notifications_false:
        if "_id" in notifications:
            notifications["_id"] = str(notifications["_id"])
        notification = {
            "collectionName": notification_collection,
            "_id": notifications["_id"],
            "user_id": notifications["user_id"],
            "timestamp": format_timestamp(notifications.get("timestamp", "")),
            "message": notifications["message"],
            "type": notifications["type"],
            "read": notifications["is_admin_notified"],
        }
        if notifications["is_admin_notified"]:
            notifications_true.append(notification)
        else:
            notifications_false.append(notification)

    return JSONResponse(
        content={
            "notifications_true": notifications_true,
            "notifications_false": notifications_false,
        }
    )


@router.get("/send_admin_desktop_notifications")
@exception_handler
def send_admin_desktop_notifications(user_id: str, org: dict = Depends(validate_org)):
    organization_name = org.get("organization_name")
    org_slug = org.get("org_slug")
    if organization_name:
        notification_collection = DBCollections.NOTIFICATION_COLLECTION.value

        all_notifications = md.read_document(
            notification_collection,
            {
                "is_admin_desktop_notified": False,
                "admin_clear": False,
                "org_slug": org_slug,
                "user_id": user_id,
            },
        )

        notifications = []

        for all_notification in all_notifications:
            if "_id" in all_notification:
                all_notification["_id"] = str(all_notification["_id"])
            notification = {
                "collectionName": notification_collection,
                "_id": str(all_notification["_id"]),
                "user_id": all_notification["user_id"],
                "message": all_notification["message"],
                "type": all_notification["type"],
            }
            notifications.append(notification)

        return JSONResponse(content={"notifications": notifications})
    else:
        raise HTTPException(
            status_code=400,
            detail="Organization name not provided in the request header",
        )


@router.put("/update_admin_notification/{notification_id}/")
@exception_handler
def update_admin_notification(
    notification_id: str,
    request: Request,
    collection_name: str,
    org: dict = Depends(validate_org),
):
    organization_name = org.get("organization_name")
    if organization_name:
        notification_collection = DBCollections.NOTIFICATION_COLLECTION.value
        collection_name3 = DBCollections.REIMBURSEMENT_COLLECTION.value
        collection_name5 = DBCollections.DOCUMENT_COLLECTION.value
        if collection_name == notification_collection:
            result = md.update_document(
                collection_name,
                {"_id": ObjectId(notification_id)},
                {"is_admin_notified": False},
            )
        elif collection_name == collection_name3:
            result = md.update_document(
                collection_name,
                {"_id": ObjectId(notification_id)},
                {"is_admin_notified": False},
            )
        elif collection_name == collection_name5:
            result = md.update_document(
                collection_name,
                {"_id": ObjectId(notification_id)},
                {"is_admin_notified": False, "admin_clear": True},
            )
        if result:
            return {"message": "Notification status updated successfully"}
        else:
            raise HTTPException(status_code=404, detail="Notification not found")
    else:
        raise HTTPException(
            status_code=400,
            detail="Organization name not provided in the request header",
        )


@router.put("/update_admin_notification_clear/{notification_id}/")
@exception_handler
def update_admin_notification_clear(
    notification_id: str,
    request: Request,
    collection_name: str,
    org: dict = Depends(validate_org),
):
    organization_name = org.get("organization_name")
    if organization_name:
        notification_collection = DBCollections.NOTIFICATION_COLLECTION.value
        collection_name3 = DBCollections.REIMBURSEMENT_COLLECTION.value
        collection_name5 = DBCollections.DOCUMENT_COLLECTION.value
        if collection_name == notification_collection:
            result = md.update_document(
                collection_name,
                {"_id": ObjectId(notification_id)},
                {"admin_clear": True},
            )
        elif collection_name == collection_name3:
            result = md.update_document(
                collection_name,
                {"_id": ObjectId(notification_id)},
                {"admin_clear": True},
            )
        elif collection_name == collection_name5:
            result = md.update_document(
                collection_name,
                {"_id": ObjectId(notification_id)},
                {"admin_clear": True},
            )
        if result:
            return {"message": "Notification status updated successfully"}
        else:
            raise HTTPException(status_code=404, detail="Notification not found")
    else:
        raise HTTPException(
            status_code=400,
            detail="Organization name not provided in the request header",
        )


@router.put("/update_admin_desktop_notification/{notification_id}")
@exception_handler
def update_admin_notification_clear(
    notification_id: str, collection_name: str, org: dict = Depends(validate_org)
):
    organization_name = org.get("organization_name")
    if not organization_name:
        raise HTTPException(
            status_code=400, detail="Organization name not provided in the request"
        )

    notifications_collection = DBCollections.NOTIFICATION_COLLECTION.value
    collection_name2 = DBCollections.REIMBURSEMENT_COLLECTION.value

    if (
        collection_name == notifications_collection
        or collection_name == collection_name2
    ):
        result = md.update_document(
            collection_name,
            {"_id": ObjectId(notification_id)},
            {"is_admin_desktop_notified": True},
        )
        if result:
            return {"message": "Notification status updated successfully"}
        else:
            raise HTTPException(status_code=404, detail="Notification not found")
    else:
        raise HTTPException(status_code=400, detail="Invalid collection name")


@router.put("/clear_admin_notifications")
@exception_handler
def clear_admin_notifications(user_id: str, org: dict = Depends(validate_org)):
    organization_name = org.get("organization_name")
    org_slug = org.get("org_slug")
    if organization_name:
        notification_collection = DBCollections.NOTIFICATION_COLLECTION.value
        collection_name3 = DBCollections.REIMBURSEMENT_COLLECTION.value
        collection_name4 = DBCollections.REFERRAL_COLLECTION.value

        notifications = md.update_document(
            notification_collection,
            {"org_slug": org_slug, "user_id": user_id},
            {"admin_clear": True},
        )
        reimbursement = md.update_document(
            collection_name3,
            {"org_slug": {"$in": [org_slug]}},
            {"admin_clear": True},
        )
        referrals = md.update_document(
            collection_name4,
            {"org_slug": {"$in": [org_slug]}},
            {"admin_clear": True},
        )
    else:
        raise HTTPException(
            status_code=400,
            detail="Organization name not provided in the request header",
        )


@router.get("/desktop_notfication_status/{user_id}")
@exception_handler
def desktop_notfication_status(user_id: str, org: dict = Depends(validate_org)):
    organization_name = org.get("organization_name")
    if organization_name:
        collection_name = DBCollections.USER_COLLECTION.value
        user_data = md.read_document(collection_name, {"user_id": user_id})
        if user_data and user_data[0].get("desktop_notification", True) == False:
            return JSONResponse(content={"desktop_notification": False})
        return JSONResponse(content={"desktop_notification": True})
    else:
        raise HTTPException(
            status_code=400, detail="Error in updating Desktop notifications"
        )
