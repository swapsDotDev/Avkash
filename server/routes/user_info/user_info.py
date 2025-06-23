from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
from bson import ObjectId
from connection.conn import MogoConnection
from DB_Collections import DBCollections
from model.user_info_model import UpdateInfo, UserDetails, UserInfo
from routes.org_info.org_info import generate_org_structure
from utils.exception.error_handler import exception_handler
from utils.validation.validation import validate_org
import pytz
from utils.email.email_helper import send_email_in_background
from utils.email.email_template import get_birthday_email, get_anniversary_email
from utils.email.email_helper import send_special_day_wishes
from apscheduler.schedulers.background import BackgroundScheduler
import datetime
import logging

router = APIRouter()
md = MogoConnection()
md.get_conn()
scheduler = BackgroundScheduler()


@router.get("/get_user_info")
@exception_handler
def get_user_info(org: dict = Depends(validate_org)):
    org_slug = org.get("org_slug")
    collection_name = DBCollections.USER_COLLECTION.value
    users_info = md.read_document(collection_name, {"org_slug": org_slug})
    for user_info in users_info:
        if "_id" in user_info:
            user_info["_id"] = str(user_info["_id"])
    return JSONResponse(content={"users_info": users_info})


@router.put("/update_user_informations/{request_id}")
@exception_handler
def update_user_informations(
    request_id: str, update_info: UpdateInfo, org: dict = Depends(validate_org)
):
    organization_name = org.get("organization_name")
    org_slug = org.get("org_slug")
    collection_name = DBCollections.USER_COLLECTION.value
    query = {"_id": ObjectId(request_id)}
    update_data = {
        "designation": update_info.designation,
        "role": update_info.role,
        "department": update_info.department,
        "ctc": update_info.ctc,
    }
    result = md.update_document(collection_name, query, update_data)
    if result:
        generate_org_structure(organization_name, org_slug)
        return result
    else:
        raise HTTPException(status_code=404, detail="User Data not found")


@router.post("/userinfo")
@exception_handler
def userinfo(user_data: UserInfo, org: dict = Depends(validate_org)):
    organization_name = org.get("organization_name")
    collection_name = DBCollections.USER_COLLECTION.value
    user_id = user_data.user_id
    record = dict(user_data)
    ist = pytz.timezone("Asia/Kolkata")
    current_time = datetime.datetime.now(ist)
    existing_user = md.read_document(collection_name, {"user_id": user_id})

    if existing_user:
        existing_user = existing_user[0]
        dob_updated = existing_user.get("DateOfBirth") != record.get("DateOfBirth")
        doj_updated = existing_user.get("DateOfJoining") != record.get("DateOfJoining")
        record.update(
            {
                "last_profile_update": current_time.isoformat(),
                "dob_updated": dob_updated,
                "doj_updated": doj_updated,
            }
        )

        update_result = md.update_document(
            collection_name, {"user_id": user_id}, record
        )
        if update_result:
            updated_user = md.read_document(collection_name, {"user_id": user_id})
            if updated_user and isinstance(updated_user, list):
                updated_user = updated_user[0]

            if updated_user.get("email_notification", True):
                email = updated_user.get("email")
                if email:
                    username = updated_user.get("username", "Team Member")
                    org_name = updated_user.get(
                        "organization_name", "Your Organization"
                    )
                    today = current_time.date()
                    today_str = today.strftime("%m-%d")

                    if dob_updated:
                        dob = updated_user.get("DateOfBirth")
                        if dob:
                            dob_date = datetime.datetime.strptime(
                                dob, "%Y-%m-%d"
                            ).date()
                            if dob_date.strftime("%m-%d") == today_str:
                                subject, message = get_birthday_email(
                                    username, org_name
                                )
                                send_email_in_background(email, subject, message)

                    if doj_updated:
                        doj = updated_user.get("DateOfJoining")
                        if doj:
                            doj_date = datetime.datetime.strptime(
                                doj, "%Y-%m-%d"
                            ).date()
                            if (
                                doj_date.strftime("%m-%d") == today_str
                                and today.year > doj_date.year
                            ):
                                years = today.year - doj_date.year
                                subject, message = get_anniversary_email(
                                    username, org_name, years
                                )
                                send_email_in_background(email, subject, message)
            return {"message": "User details updated successfully"}
        else:
            logging.error("Failed to update user data")
    else:
        result = md.insert_record(collection_name, [record])
        if result:
            return {"message": "User details inserted successfully"}
        else:
            logging.error("Failed to insert user data")


@router.post("/userDetails")
@exception_handler
def userdetails(user_data: UserDetails, org: dict = Depends(validate_org)):
    organization_name = org.get("organization_name")
    collection_name = DBCollections.USER_COLLECTION.value
    notification_collection = DBCollections.NOTIFICATION_COLLECTION.value
    user_id = user_data.user_id
    user_data = user_data.model_dump(exclude_unset=True)
    user_name = user_data["user_name"]
    imageUrl = user_data["imageUrl"]
    org_slug = user_data["org_slug"]
    email = user_data["email"]
    user_role = user_data["user_role"]
    last_employee = md.db[collection_name].find_one(
        {"org_slug": org_slug},
        sort=[("employee_id", -1)],
    )
    if last_employee and "employee_id" in last_employee:
        new_employee_id = int(last_employee["employee_id"]) + 1
    else:
        new_employee_id = 1
    record = {
        "user_id": user_id,
        "user_role": user_role,
        "username": user_name,
        "imageUrl": imageUrl,
        "org_slug": org_slug,
        "email": email,
        "swap_count": 0,
        "employee_id": str(new_employee_id),
    }
    role = user_data.get("role")
    if role is not None:
        record["role"] = role
    existing_user = md.read_document(
        collection_name, {"user_id": user_id, "org_slug": org_slug}
    )
    if not existing_user:
        result = md.insert_record(collection_name, [record])
        if result:
            generate_org_structure(organization_name, org_slug)
            return {"message": "User details inserted successfully"}
        else:
            logging.error("Failed to insert user data")
    else:
        if existing_user[0].get("user_role") != user_role:
            update_result = md.update_document(
                collection_name,
                {"user_id": user_id, "org_slug": org_slug},
                {"user_role": user_role},
            )
            deleted_notifications = md.delete_document(
                notification_collection,
                {"user_id": user_id, "org_slug": org_slug},
            )
            if update_result:
                return {"message": "User role updated successfully"}


@router.get("/user_name")
@exception_handler
def get_department_data(org: dict = Depends(validate_org)):
    org_slug = org.get("org_slug")
    collection_name = DBCollections.USER_COLLECTION.value
    collection_name1 = DBCollections.DEPARTMENT_COLLECTION.value
    department_data = md.read_document(collection_name, {"org_slug": org_slug})
    manager_data = md.read_document(collection_name1, {"org_slug": {"$in": [org_slug]}})
    usernames = []
    for user in department_data:
        if "_id" in user:
            user["_id"] = str(user["_id"])
    for username in department_data:
        if "_id" in username:
            usernames.append(username["username"])
    managers = []
    for manager in manager_data:
        if "_id" in manager:
            managers.append(manager["manager"])
    if department_data:
        return JSONResponse(
            content={
                "usernames": usernames,
                "managers": managers,
                "alldata": department_data,
            }
        )
    else:
        raise HTTPException(status_code=404, detail="Department data not found")


@router.get("/user/{user_id}")
@exception_handler
def get_user_data(user_id: str, org: dict = Depends(validate_org)):
    org_slug = org.get("org_slug")
    collection_name = DBCollections.USER_COLLECTION.value
    user_data = md.read_document(
        collection_name, {"user_id": user_id, "org_slug": org_slug}
    )
    for user in user_data:
        if "_id" in user:
            user["_id"] = str(user["_id"])
    if user_data:
        return JSONResponse(content={"user_data": user_data})
    else:
        raise HTTPException(status_code=404, detail="User data not found")


scheduler.add_job(
    send_special_day_wishes,
    "cron",
    hour=10,
    minute=0,
    timezone=pytz.timezone("Asia/Kolkata"),
)


@router.on_event("startup")
def startup_event():
    if not scheduler.running:
        scheduler.start()
