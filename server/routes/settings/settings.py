from turtle import pd
from dotenv import load_dotenv
from fastapi import (
    APIRouter,
    HTTPException,
    Depends,
)
from fastapi.responses import JSONResponse
from connection.conn import MogoConnection
from DB_Collections import DBCollections
from utils.exception.error_handler import exception_handler
from utils.validation.validation import validate_org
from utils.email.email_template import get_birthday_email, get_anniversary_email
from utils.email.email_helper import send_email_in_background
import datetime
import pytz

router = APIRouter()
md = MogoConnection()
md.get_conn()


@router.put("/switch_desktop_notfication/{user_id}")
@exception_handler
def switch_desktop_notfication(
    user_id: str, switch: bool = False, org: dict = Depends(validate_org)
):

    collection_name = DBCollections.USER_COLLECTION.value
    user_data = md.update_document(
        collection_name, {"user_id": user_id}, {"desktop_notification": switch}
    )
    if user_data:
        return JSONResponse(
            content={"message": "Desktop notification updated Succeesfully"}
        )
    else:
        raise HTTPException(
            status_code=400, detail="Error in updating Desktop notifications"
        )


@router.get("/email_notfication_status/{user_id}")
@exception_handler
def email_notfication_status(user_id: str, org: dict = Depends(validate_org)):

    collection_name = DBCollections.USER_COLLECTION.value
    user_data = md.read_document(collection_name, {"user_id": user_id})
    if user_data and user_data[0].get("email_notification", True) == False:
        return JSONResponse(content={"email_notification": False})
    return JSONResponse(content={"email_notification": True})


@router.put("/switch_email_notfication/{user_id}")
@exception_handler
def switch_email_notfication(
    user_id: str, switch: bool = False, org: dict = Depends(validate_org)
):

    collection_name = DBCollections.USER_COLLECTION.value
    ist = pytz.timezone("Asia/Kolkata")
    current_time = datetime.datetime.now(ist)

    current_user = md.read_document(collection_name, {"user_id": user_id})
    if not current_user:
        raise HTTPException(status_code=404, detail="User not found")

    current_user = current_user[0]

    update_data = {
        "email_notification": switch,
        "notification_enabled_at": current_time.isoformat() if switch else None,
    }

    user_data = md.update_document(collection_name, {"user_id": user_id}, update_data)
    if switch and user_data:
        last_update_time = current_user.get("last_profile_update")
        if last_update_time:
            last_update = datetime.datetime.fromisoformat(last_update_time)
            if (current_time - last_update).days <= 1:
                email = current_user.get("email")
                username = current_user.get("username", "Team Member")
                org_name = current_user.get("organization_name", "Your Organization")

                today = current_time.date()
                today_str = today.strftime("%m-%d")

                dob = current_user.get("DateOfBirth")
                if dob and current_user.get("dob_updated"):
                    dob_date = datetime.datetime.strptime(dob, "%Y-%m-%d").date()
                    if dob_date.strftime("%m-%d") == today_str:
                        subject, message = get_birthday_email(username, org_name)
                        send_email_in_background(email, subject, message)

                doj = current_user.get("DateOfJoining")
                if doj and current_user.get("doj_updated"):
                    doj_date = datetime.datetime.strptime(doj, "%Y-%m-%d").date()
                    if (
                        doj_date.strftime("%m-%d") == today_str
                        and today.year > doj_date.year
                    ):
                        years = today.year - doj_date.year
                        subject, message = get_anniversary_email(
                            username, org_name, years
                        )
                        send_email_in_background(email, subject, message)

    if user_data:
        return JSONResponse(
            content={"message": "Email notification updated Succeesfully"}
        )
    else:
        raise HTTPException(
            status_code=400, detail="Error in updating Email notifications"
        )
