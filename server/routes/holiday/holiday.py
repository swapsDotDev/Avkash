import io
from turtle import pd
from fastapi import (
    APIRouter,
    HTTPException,
    Query,
    UploadFile,
    Header,
    Depends,
)
from fastapi.responses import JSONResponse
from bson import ObjectId
from connection.conn import MogoConnection
import logging
import pandas as pd
import datetime
from DB_Collections import DBCollections
from model.holiday_model import Holiday, UpdateHolidayRequest
from utils.exception.error_handler import exception_handler
from utils.validation.validation import validate_org

router = APIRouter()
md = MogoConnection()
md.get_conn()


@router.get("/holidays")
@exception_handler
def get_holidays(org: dict = Depends(validate_org)):
    org_slug = org.get("org_slug")
    collection_name = DBCollections.HOLIDAY_COLLECTION.value
    holiday_list = md.read_document(collection_name, {"org_slug": {"$in": [org_slug]}})
    for holiday in holiday_list:
        if "_id" in holiday:
            holiday["_id"] = str(holiday["_id"])

    holiday_dict = {}

    for holiday in holiday_list:
        date = holiday["date"]
        holiday_type = holiday.get("holiday_type", "").strip()

        if date in holiday_dict:
            if holiday_type and not holiday_dict[date].get("holiday_type"):
                holiday_dict[date] = holiday
        else:
            holiday_dict[date] = holiday

    filtered_holidays = list(holiday_dict.values())

    if filtered_holidays:
        return JSONResponse(content={"data": filtered_holidays})
    else:
        raise HTTPException(status_code=404, detail="Holiday data not found")


@router.post("/add_holidays")
@exception_handler
def add_holidays(holiday: Holiday, org: dict = Depends(validate_org)):
    collection_name = DBCollections.HOLIDAY_COLLECTION.value
    holiday_data = holiday.model_dump()
    collection = md.db[collection_name]
    result = collection.insert_one(holiday_data)
    if result.inserted_id:
        logging.info("Holiday stored successfully")
        return {"message": "Holiday added successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to store holiday")


@router.get("/mandatory_holidays")
@exception_handler
def get_mandatory_holidays(org: dict = Depends(validate_org)):
    org_slug = org.get("org_slug")
    collection_name = DBCollections.HOLIDAY_COLLECTION.value
    query = {"holiday_type": "Mandatory", "org_slug": org_slug}
    holiday_list = md.read_document(collection_name, query)
    for holiday in holiday_list:
        if "_id" in holiday:
            holiday["_id"] = str(holiday["_id"])
    if holiday_list is not None:
        return JSONResponse(content={"data": holiday_list})
    else:
        raise HTTPException(status_code=404, detail="Holiday data not found")


@router.put("/update_holiday/{holiday_id}")
@exception_handler
def update_holiday(
    holiday_id: str,
    update_info: UpdateHolidayRequest,
    org: dict = Depends(validate_org),
):
    collection_name = DBCollections.HOLIDAY_COLLECTION.value
    query = {"_id": ObjectId(holiday_id)}
    update_data = {
        "holiday_type": update_info.holiday_type,
        "summary": update_info.summary,
    }
    result = md.update_document(collection_name, query, update_data)
    if result:
        return JSONResponse(
            content={"message": "Holiday updated successfully"}, status_code=200
        )
    else:
        raise HTTPException(status_code=404, detail="Holiday update failed")


@router.delete("/delete_holiday/{holiday_id}")
@exception_handler
def delete_holiday(
    holiday_id: str,
    org: dict = Depends(validate_org),
):
    collection_name = DBCollections.HOLIDAY_COLLECTION.value
    query = {"_id": ObjectId(holiday_id)}
    result = md.delete_document(collection_name, query)
    if result:
        return JSONResponse(
            content={"message": "Holiday deleted successfully"}, status_code=200
        )
    else:
        raise HTTPException(status_code=404, detail="Holiday not found")


@router.post("/import_holidays")
@exception_handler
async def import_holidays(file: UploadFile, org: dict = Depends(validate_org)):
    org_slug = org.get("org_slug")
    if not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="Only Excel files are allowed")

    collection_name = DBCollections.HOLIDAY_COLLECTION.value
    collection = md.db[collection_name]

    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    df = pd.read_excel(io.BytesIO(contents), engine="openpyxl")

    column_mapping = {
        "Date": "date",
        "Holiday Name": "summary",
        "Holiday Type": "holiday_type",
    }

    for old_col, new_col in column_mapping.items():
        if old_col in df.columns:
            df.rename(columns={old_col: new_col}, inplace=True)

    required_columns = ["date", "summary"]
    if not all(col in df.columns for col in required_columns):
        raise HTTPException(
            status_code=400,
            detail="Invalid template format. The Excel file must contain at least 'date' and 'summary' columns.",
        )

    holidays = []
    for _, row in df.iterrows():
        holiday_date = pd.to_datetime(row["date"], errors="coerce").date()
        if pd.isna(holiday_date):
            logging.error(f"Invalid date format in row: {row}")
            continue

        summary = row["summary"].strip() if pd.notna(row["summary"]) else ""
        holiday_type = (
            row.get("holiday_type", "Optional").strip()
            if pd.notna(row.get("holiday_type"))
            else "Optional"
        )

        holiday = {
            "date": holiday_date.isoformat(),
            "summary": summary,
            "holiday_type": holiday_type,
            "org_slug": org_slug,
        }
        holidays.append(holiday)

    holidays_added = 0
    holidays_updated = 0
    duplicates = 0

    current_year_start = datetime.datetime(datetime.datetime.now().year, 1, 1)
    for holiday in holidays:
        existing_summary = collection.find_one(
            {"summary": holiday["summary"], "org_slug": org_slug}
        )
        if existing_summary and existing_summary.get("date") != holiday["date"]:
            date = existing_summary.get("date")
            holiday_date = datetime.datetime.strptime(date, "%Y-%m-%d")
            if holiday_date >= current_year_start:
                return {
                    "status": "exist",
                    "message": f"Same holidays already exist on date {existing_summary['date']}",
                }
        if len(holiday["summary"]) < 2:
            return {
                "status": "error",
                "message": "Holiday name should be at least 2 characters long",
            }

    for holiday in holidays:
        existing_holiday = collection.find_one(
            {"date": holiday["date"], "org_slug": org_slug}
        )

        if existing_holiday:
            updates_needed = {}
            if existing_holiday.get("holiday_type") != holiday["holiday_type"]:
                updates_needed["holiday_type"] = holiday["holiday_type"]
            if existing_holiday.get("summary") != holiday["summary"]:
                updates_needed["summary"] = holiday["summary"]

            if updates_needed:
                collection.update_one(
                    {"_id": existing_holiday["_id"]},
                    {"$set": updates_needed},
                )
                holidays_updated += 1
            else:
                duplicates += 1
        else:
            collection.insert_one(holiday)
            holidays_added += 1

    if duplicates == len(holidays) and duplicates > 0:
        return {
            "status": "duplicate",
            "message": "Same holidays already exist on the calender",
        }
    elif holidays_added > 0 and holidays_updated == 0:
        return {
            "status": "success",
            "message": f"Successfully imported {holidays_added} new holidays",
        }
    elif holidays_updated > 0 and holidays_added == 0:
        return {
            "status": "updated",
            "message": f"Successfully updated {holidays_updated} existing holidays",
        }
    else:
        return {
            "status": "mixed",
            "message": f"Successfully imported {holidays_added + holidays_updated} holidays ({holidays_added} added, {holidays_updated} updated)",
        }
