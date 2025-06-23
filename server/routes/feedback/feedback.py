from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
from bson import ObjectId
import datetime
from DB_Collections import DBCollections
from connection.conn import MogoConnection
from model.feedback_model import UpdateFeedbackInfo, Userfeedback
from utils.common.common_helper import get_ist_timestamp
from utils.exception.error_handler import exception_handler
from utils.validation.validation import validate_org

router = APIRouter()
md = MogoConnection()
md.get_conn()


@router.post("/feedback")
@exception_handler
def post_feedback(feedback_data: Userfeedback, org: dict = Depends(validate_org)):

    org_slug = org.get("org_slug")
    organization_name = org.get("organization_name")
    collection_name = DBCollections.USER_FEEDBACK.value
    user_collection = DBCollections.USER_COLLECTION.value
    notification_collection = DBCollections.NOTIFICATION_COLLECTION.value
    record = dict(feedback_data)
    record["organization_name"] = organization_name
    record["org_slug"] = org_slug
    result = md.insert_record(collection_name, [record])
    if result:
        role_query = {
            "user_role": {"$in": ["admin", "superadmin"]},
            "org_slug": org_slug,
        }
        admins_and_superadmins = md.read_document(user_collection, role_query)
        notification_message = f"You have received feedback: {record['feedback']}"
        timestamp = get_ist_timestamp()

        for user in admins_and_superadmins:
            notification_data = {
                "collectionName": notification_collection,
                "user_id": user["user_id"],
                "message": notification_message,
                "timestamp": timestamp,
                "type": "feedback",
                "is_admin_notified": True,
                "is_admin_desktop_notified": False,
                "admin_clear": False,
                "org_slug": org_slug,
            }
            md.insert_record(notification_collection, [notification_data])

        return JSONResponse(
            content={"message": "Feedback submitted successfully"},
            status_code=200,
        )
    else:
        return JSONResponse(
            content={"message": "failed to submit feedback"}, status_code=200
        )


@router.get("/feedback")
@exception_handler
def get_feedback(org: dict = Depends(validate_org)):
    org_slug = org.get("org_slug")
    collection_name = DBCollections.USER_FEEDBACK.value
    data = md.read_document(collection_name, {"org_slug": {"$in": [org_slug]}})
    for fb in data:
        if "_id" in fb:
            fb["_id"] = str(fb["_id"])
    return {"data": data}


@router.delete("/feedback/{_id}")
@exception_handler
async def delete_feedback(_id: str, org: dict = Depends(validate_org)):

    collection_name = DBCollections.USER_FEEDBACK.value
    result = md.delete_document(collection_name, {"_id": ObjectId(_id)})
    if result and result["message"].startswith("Deleted"):
        return JSONResponse(
            content={"message": "Feedback deleted successfully"},
            status_code=200,
        )
    else:
        raise HTTPException(status_code=404, detail="Feedback not found")


@router.put("/update_feedback_status/{feedback_id}")
@exception_handler
def update_feedback_status(
    feedback_id: str, update_info: UpdateFeedbackInfo, org: dict = Depends(validate_org)
):

    collection_name = DBCollections.USER_FEEDBACK.value
    query = {"_id": ObjectId(feedback_id)}
    admin_reply_time = (
        datetime.datetime.now(datetime.timezone.utc)
        .isoformat(timespec="milliseconds")
        .replace("+00:00", "Z")
    )
    update_data = {
        "reply": update_info.reply,
        "is_notified": True,
        "is_desktop_notified": False,
        "admin_reply_timestamp": admin_reply_time,
    }
    result = md.update_document(collection_name, query, update_data)
    if result and "message" in result and "Updated" in result["message"]:
        return JSONResponse(
            content={"message": "Feedback updated successfully"},
            status_code=200,
        )
    else:
        raise HTTPException(status_code=404, detail="Feedback not found")
