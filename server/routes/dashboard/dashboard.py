from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
from connection.conn import MogoConnection
import datetime
from DB_Collections import DBCollections
from utils.exception.error_handler import exception_handler
from utils.validation.validation import validate_org

router = APIRouter()
md = MogoConnection()
md.get_conn()


@router.get("/department_efficiency")
@exception_handler
def get_department_efficiency(org: dict = Depends(validate_org)):
    collection_name = DBCollections.USER_COLLECTION.value
    department_counts = {}
    users = md.read_document(collection_name, {"org_slug": org["org_slug"]})
    if users:
        for user in users:
            if "department" in user:
                department = user["department"]
                if department in department_counts:
                    department_counts[department] += 1
                else:
                    department_counts[department] = 1
    return JSONResponse(content={"department_counts": department_counts})


@router.post("/add_checkin_time/{user_id}")
@exception_handler
def add_checkin_time(
    user_id: str, checkin_time: dict, org: dict = Depends(validate_org)
):
    org_slug = org["org_slug"]
    collection_name = DBCollections.TIMESHEET_COLLECTION.value
    today_date = datetime.datetime.now().strftime("%Y-%m-%d")
    query = {"user_id": user_id, "date": today_date, "org_slug": org_slug}
    existing_record = md.read_document(collection_name, query)
    if not existing_record:
        break_data = {
            "user_id": user_id,
            "date": today_date,
            "checkin_time": checkin_time["checkin_time"],
            "break_time": 0,
            "is_checked_in": "true",
            "org_slug": org_slug,
        }
        result = md.insert_record(collection_name, [break_data])
        if result:
            return {"message": "Check in successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to check in")


@router.put("/add_checkout_time/{user_id}")
@exception_handler
def add_checkout_time(
    user_id: str, checkout_time: dict, org: dict = Depends(validate_org)
):
    org_slug = org["org_slug"]
    collection_name = DBCollections.TIMESHEET_COLLECTION.value
    today_date = datetime.datetime.now().strftime("%Y-%m-%d")
    query = {"user_id": user_id, "date": today_date, "org_slug": org_slug}
    existing_record = md.read_document(collection_name, query)

    if existing_record and existing_record[0].get("checkout_time"):
        return JSONResponse(
            content={"message": "Checkout time already exists"}, status_code=200
        )

    update_data = {
        "checkout_time": checkout_time["checkout_time"],
    }

    result = md.update_document(collection_name, query, update_data)
    if result and "message" in result and "Updated" in result["message"]:
        return JSONResponse(
            content={"message": "Checked Out Successfully"}, status_code=200
        )
    else:
        raise HTTPException(status_code=404, detail="Failed to Check out")


@router.get("/check_in_status/{user_id}")
@exception_handler
def check_in_status(user_id: str, org: dict = Depends(validate_org)):
    org_slug = org["org_slug"]
    collection_name = DBCollections.TIMESHEET_COLLECTION.value
    today_date = datetime.datetime.now().strftime("%Y-%m-%d")
    query = {"user_id": user_id, "date": today_date, "org_slug": org_slug}
    result = md.read_document(collection_name, query)
    for data in result:
        if "_id" in data:
            data["_id"] = str(data["_id"])
    if result and len(result) > 0:
        return JSONResponse(content={"user_data": result})
    else:
        return JSONResponse(content={"user_data": [{"is_checked_in": "false"}]})


@router.get("/check_for_checkout/{user_id}")
@exception_handler
def check_for_checkout(user_id: str, org: dict = Depends(validate_org)):
    org_slug = org["org_slug"]
    collection_name = DBCollections.TIMESHEET_COLLECTION.value
    today_date = datetime.datetime.now().strftime("%Y-%m-%d")
    query = {
        "user_id": user_id,
        "date": today_date,
        "worked_hours": {"$exists": True},
        "org_slug": org_slug,
    }
    result = md.read_document(collection_name, query)
    for data in result:
        if "_id" in data:
            data["_id"] = str(data["_id"])
    if result and len(result) > 0:
        return JSONResponse(content={"is_checked_in": "true"})
    else:
        return JSONResponse(content={"is_checked_in": "false"})


@router.put("/add_break_time/{user_id}")
@exception_handler
def add_break_time(user_id: str, break_time: dict, org: dict = Depends(validate_org)):
    org_slug = org["org_slug"]
    collection_name = DBCollections.TIMESHEET_COLLECTION.value
    today_date = datetime.datetime.now().strftime("%Y-%m-%d")
    query = {"user_id": user_id, "date": today_date, "org_slug": org_slug}
    existing_data = md.read_document(collection_name, query)

    if existing_data:
        updated_break_time = (
            existing_data[0].get("break_time", 0) + break_time["break_time"]
        )
        update_data = {
            "break_time": updated_break_time,
        }
        result = md.update_document(collection_name, query, update_data)
        if result and "message" in result and "Updated" in result["message"]:
            return JSONResponse(
                content={"message": "Break Time updated successfully"},
                status_code=200,
            )
        else:
            raise HTTPException(status_code=404, detail="Break time not found")
    else:
        raise HTTPException(
            status_code=404, detail="Data not found for the user and date"
        )


@router.put("/store_total_worked_hours/{user_id}/{date}")
@exception_handler
def store_total_worked_hours(
    user_id: str, date: str, org: dict = Depends(validate_org)
):
    org_slug = org["org_slug"]
    collection_name = DBCollections.TIMESHEET_COLLECTION.value
    query = {"user_id": user_id, "date": date, "org_slug": org_slug}
    result = md.read_document(collection_name, query)
    if result and len(result) > 0:
        checkin_time_obj = datetime.datetime.strptime(
            result[0]["checkin_time"], "%I:%M:%S %p"
        )
        checkout_time_obj = datetime.datetime.strptime(
            result[0]["checkout_time"], "%I:%M:%S %p"
        )

        time_difference = checkout_time_obj - checkin_time_obj
        total_worked_hours = time_difference.total_seconds() / 3600
        update_data = {"worked_hours": round(total_worked_hours, 2)}
        update_result = md.update_document(collection_name, query, update_data)
        if (
            update_result
            and "message" in update_result
            and "Updated" in update_result["message"]
        ):
            return JSONResponse(
                content={"message": "Total worked hours stored successfully"},
                status_code=200,
            )
        else:
            raise HTTPException(
                status_code=500, detail="Failed to store total worked hours"
            )
    else:
        return JSONResponse(
            content={"error": "No timesheet data found for the given user and date"}
        )


@router.get("/check_leave_status/{user_id}")
@exception_handler
def check_leave_status(user_id: str, org: dict = Depends(validate_org)):
    org_slug = org["org_slug"]
    collection_name = DBCollections.LEAVE_COLLECTION.value
    today_date = datetime.datetime.now().strftime("%Y-%m-%d")

    query = {
        "user_id": user_id,
        "status": "accepted",
        "org_slug": org_slug,
        "$or": [{"start_date": {"$lte": today_date}, "end_date": {"$gte": today_date}}],
    }

    leave_requests = md.read_document(collection_name, query)
    is_on_leave = len(leave_requests) > 0

    return JSONResponse(content={"is_on_leave": is_on_leave})
