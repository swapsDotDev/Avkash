from fastapi import (
    APIRouter,
    HTTPException,
    Depends,
)
from fastapi.responses import JSONResponse
from connection.conn import MogoConnection
import datetime
from DB_Collections import DBCollections
from model.payslip_model import Payslip
from utils.dashboard.darshboard_helper import calculate_working_days
from utils.exception.error_handler import exception_handler
from utils.validation.validation import validate_org

router = APIRouter()
md = MogoConnection()
md.get_conn()


@router.post("/payslip")
@exception_handler
def post_payslip(user_data: Payslip, org: dict = Depends(validate_org)):

    collection_name = DBCollections.PAYSLIP_COLLECTION.value
    record = dict(user_data)
    filter_query = {
        "user_id": record["user_id"],
        "paid_month": record["paid_month"],
        "org_slug": record["org_slug"],
    }
    data = md.read_document(collection_name, filter_query)
    if data:
        return {"message": "Payslip data already present."}
    result = md.insert_record(collection_name, [record])
    if result:
        return {"message": "Payslip Send successfully"}
    else:
        return {"message": "Failed to send payslip"}


@router.get("/user_payslip")
@exception_handler
def get_payslip_data(org: dict = Depends(validate_org)):
    org_slug = org.get("org_slug")

    collection_name = DBCollections.USER_COLLECTION.value
    payslip_data = md.read_document(collection_name, {"org_slug": org_slug})
    if not payslip_data:
        raise HTTPException(status_code=404, detail="Payslip data not found")
    processed_payslip_data = []
    for payslip in payslip_data:
        if "_id" in payslip:
            payslip["_id"] = str(payslip["_id"])
        ctc = payslip.get("ctc", 0)
        basic_salary = payslip.get("ctc", 0) / 12
        payslip["basicSalary"] = round(basic_salary, 2)
        payslip["insurances"] = round(5000 / 12, 2)
        if ctc <= 250000:
            payslip["incomeTax"] = 0.00
        elif 250001 <= ctc <= 500000:
            payslip["incomeTax"] = round(((ctc - 250000) * 0.05) / 12, 2)
        elif 500001 <= ctc <= 900000:
            payslip["incomeTax"] = round(((ctc - 500000) * 0.1 + 12500) / 12, 2)
        elif 900001 <= ctc <= 1200000:
            payslip["incomeTax"] = round(((ctc - 900000) * 0.15 + 62500) / 12, 2)
        elif 1200001 <= ctc <= 1500000:
            payslip["incomeTax"] = round(((ctc - 1200000) * 0.2 + 125000) / 12, 2)
        else:
            payslip["incomeTax"] = round(((ctc - 1500000) * 0.3 + 325000) / 12, 2)
        if basic_salary <= 7500:
            payslip["profTax"] = 0.00
        elif 7501 <= basic_salary <= 10000:
            payslip["profTax"] = round(175, 2)
        else:
            payslip["profTax"] = round(300, 2)
        processed_payslip_data.append(payslip)
    return JSONResponse(content={"payslip_data": processed_payslip_data})


@router.get("/payslip_data/{user_id}")
@exception_handler
def get_payslip_data(user_id: str, org: dict = Depends(validate_org)):
    organization_name = org.get("organization_name")
    org_slug = org.get("org_slug")

    user_info = md.read_document(
        DBCollections.USER_COLLECTION.value, {"user_id": user_id}
    )
    employee_id = None
    if user_info and len(user_info) > 0:
        employee_id = user_info[0].get("employee_id")

    collection_name = DBCollections.PAYSLIP_COLLECTION.value
    user_data = md.read_document(collection_name, {"user_id": user_id})
    for payslipdata in user_data:
        if employee_id:
            payslipdata["employee_id"] = employee_id
        if "_id" in payslipdata:
            payslipdata["_id"] = str(payslipdata["_id"])
        payslipdata["monthSalary"] = payslipdata.get("basic_salary", 0)
        payslipdata["lopCost"] = (
            payslipdata.get("lop", 0)
            / (payslipdata.get("paiddays", 0) + payslipdata.get("lop", 0))
            * payslipdata.get("basic_salary", 0)
        )
        payslipdata["taxInsurance"] = (
            payslipdata.get("professional_tax", 0)
            + payslipdata.get("income_tax", 0)
            + payslipdata.get("insurance", 0)
            + payslipdata["lopCost"]
        )
        current_date = datetime.datetime.now()
        working_days = calculate_working_days(current_date.year, current_date.month)
        payslipdata["perDaySalary"] = payslipdata["monthSalary"] / working_days
        lop_days = payslipdata.get("lop", 0)
        if lop_days >= 1.5:
            working_days -= lop_days - 1.5

        payslipdata["currentMonthSalary"] = payslipdata["perDaySalary"] * (working_days)
        payslipdata["perDayHoursSalary"] = payslipdata["perDaySalary"] / 9
        payslipdata["totaHours"] = payslipdata.get("total_hours", 0)
        payslipdata["regularHours"] = 9 * (working_days)
        if payslipdata["totaHours"] > payslipdata["regularHours"]:
            payslipdata["overtimeHours"] = (
                payslipdata["totaHours"] - payslipdata["regularHours"]
            )
            payslipdata["overtimeMoney"] = (
                payslipdata["perDayHoursSalary"] * payslipdata["overtimeHours"]
            )
        else:
            payslipdata["overtimeMoney"] = 0

        payslipdata["total_money"] = (
            payslipdata["currentMonthSalary"] + payslipdata["overtimeMoney"]
        ) - payslipdata["taxInsurance"]
        payslipdata["grossEarning"] = (
            payslipdata.get("basic_salary", 0) + payslipdata["overtimeMoney"]
        )
    return JSONResponse(content={"user_data": user_data})


@router.get("/payslip_billing")
@exception_handler
def get_payslip_billing(org: dict = Depends(validate_org)):
    org_slug = org.get("org_slug")

    collection_name = DBCollections.PAYSLIP_COLLECTION.value
    collection_name1 = DBCollections.USER_COLLECTION.value
    payslip_data = md.read_document(collection_name, {"org_slug": {"$in": [org_slug]}})
    for payslipdata in payslip_data:
        if "_id" in payslipdata:
            payslipdata["_id"] = str(payslipdata["_id"])

        user_data = md.read_document(
            collection_name1, {"user_id": payslipdata.get("user_id")}
        )
        if user_data and "email" in user_data[0]:
            payslipdata["email"] = user_data[0]["email"]
        else:
            payslipdata["email"] = "---"
        payslipdata["monthSalary"] = payslipdata.get("basic_salary", 0)
        payslipdata["lopCost"] = (
            payslipdata.get("lop", 0)
            / (payslipdata.get("paiddays", 0) + payslipdata.get("lop", 0))
            * payslipdata.get("basic_salary", 0)
        )
        payslipdata["taxInsurance"] = (
            payslipdata.get("professional_tax", 0)
            + payslipdata.get("income_tax", 0)
            + payslipdata.get("insurance", 0)
            + payslipdata["lopCost"]
        )
        current_date = datetime.datetime.now()
        working_days = calculate_working_days(current_date.year, current_date.month)
        payslipdata["perDaySalary"] = payslipdata["monthSalary"] / working_days
        lop_days = payslipdata.get("lop", 0)
        if lop_days >= 1.5:
            working_days -= lop_days - 1.5
        payslipdata["currentMonthSalary"] = payslipdata["perDaySalary"] * (working_days)
        payslipdata["perDayHoursSalary"] = payslipdata["perDaySalary"] / 9
        payslipdata["totaHours"] = payslipdata.get("total_hours", 0)
        payslipdata["regularHours"] = 9 * (working_days)
        if payslipdata["totaHours"] > payslipdata["regularHours"]:
            payslipdata["overtimeHours"] = (
                payslipdata["totaHours"] - payslipdata["regularHours"]
            )
            payslipdata["overtimeMoney"] = (
                payslipdata["perDayHoursSalary"] * payslipdata["overtimeHours"]
            )
        else:
            payslipdata["overtimeMoney"] = 0

        payslipdata["total_money"] = (
            payslipdata["currentMonthSalary"] + payslipdata["overtimeMoney"]
        ) - payslipdata["taxInsurance"]

    if payslip_data:
        return JSONResponse(content={"payslip_data": payslip_data})
    else:
        raise HTTPException(status_code=404, detail="Payslip data not found")


@router.get("/billing_working_hours")
@exception_handler
def get_billing_working_hours(org: dict = Depends(validate_org)):
    org_slug = org.get("org_slug")

    collection_name = DBCollections.TIMESHEET_COLLECTION.value
    today_date = datetime.datetime.now()
    first_day_of_month = today_date.replace(day=1, month=today_date.month - 1)
    if today_date.month == 1:
        first_day_of_month = first_day_of_month.replace(
            year=today_date.year - 1, month=12
        )
    last_day_of_month = today_date.replace(
        day=1, month=today_date.month
    ) - datetime.timedelta(days=1)

    first_day_str = first_day_of_month.strftime("%Y-%m-%d")
    last_day_str = last_day_of_month.strftime("%Y-%m-%d")

    query = {
        "date": {"$gte": first_day_str, "$lte": last_day_str},
        "org_slug": org_slug,
    }
    result = md.read_document(collection_name, query)
    user_total_worked_hours = {}
    for data in result:
        if "_id" in data:
            data["_id"] = str(data["_id"])
        user_id = data.get("user_id")
        worked_hours = data.get("worked_hours", 0)
        if user_id in user_total_worked_hours:
            user_total_worked_hours[user_id] += worked_hours
        else:
            user_total_worked_hours[user_id] = worked_hours

    total_worked_hours_previous_month = sum(user_total_worked_hours.values())

    for data in result:
        user_id = data.get("user_id")
        data["total_worked_hours"] = user_total_worked_hours.get(user_id, 0)
    if result and len(result) > 0:
        return JSONResponse(
            content={
                "user_data": result,
                "total_worked_hours_previous_month": total_worked_hours_previous_month,
            }
        )
    else:
        return JSONResponse(content={"is_checked_in": "false"})
