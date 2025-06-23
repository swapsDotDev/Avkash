from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
import base64
from connection.conn import MogoConnection
import datetime
from DB_Collections import DBCollections
from utils.exception.error_handler import exception_handler
from utils.validation.validation import validate_org

router = APIRouter()
md = MogoConnection()
md.get_conn()


@router.get("/get_timesheet_data")
@exception_handler
def get_timesheet_data(org: dict = Depends(validate_org)):
    org_slug = org.get("org_slug", "")

    collection_name = DBCollections.TIMESHEET_COLLECTION.value
    timesheet_data = md.read_document(
        collection_name, {"org_slug": {"$in": [org_slug]}}
    )
    for timesheet in timesheet_data:
        if "_id" in timesheet:
            timesheet["_id"] = str(timesheet["_id"])

    if timesheet_data:
        return JSONResponse(content={"data": timesheet_data})
    else:
        raise HTTPException(
            status_code=404,
            detail="Timesheet data not found for the provided organization",
        )


@router.get("/timesheetdata/{user_id}")
@exception_handler
def get_department_data(user_id: str, org: dict = Depends(validate_org)):
    org_slug = org.get("org_slug")
    collection_name = DBCollections.TIMESHEET_COLLECTION.value
    timesheet_data = md.read_document(
        collection_name, {"user_id": user_id, "org_slug": org_slug}
    )
    for data in timesheet_data:
        if "_id" in data:
            data["_id"] = str(data["_id"])
    return JSONResponse(content={"timesheet_data": timesheet_data})


@router.get("/total_working_hours")
@exception_handler
def get_total_working_hours(org: dict = Depends(validate_org)):
    org_slug = org.get("org_slug", "")

    collection_name = DBCollections.TIMESHEET_COLLECTION.value
    current_date = datetime.datetime.now()
    current_week = current_date.isocalendar()[1]
    current_day = current_date.weekday()
    total_hours = 0
    count = 0
    timesheets = md.read_document(collection_name, {"org_slug": org_slug})
    week_start_date = current_date - datetime.timedelta(days=current_day)
    for data in timesheets:
        if "_id" in data:
            data["_id"] = str(data["_id"])
    for timesheet in timesheets:
        timesheet_date = datetime.datetime.strptime(timesheet["date"], "%Y-%m-%d")
        timesheet_week = timesheet_date.isocalendar()[1]
        timesheet_day = timesheet_date.weekday()
        if timesheet_week == current_week and timesheet_date >= week_start_date:
            if "worked_hours" in timesheet:
                total_hours += timesheet["worked_hours"]
    return JSONResponse(content={"total_working_hours": total_hours})
