import logging
from fastapi import (
    Request,
    Form,
    HTTPException,
    APIRouter,
    Depends,
)
from fastapi.responses import JSONResponse
from bson import ObjectId
import base64
from connection.conn import MogoConnection
import datetime
from fastapi import BackgroundTasks, UploadFile, File
from DB_Collections import DBCollections
from model.referral_model import Job, JobUpdateModel
from utils.email.email_helper import send_email_in_background
from utils.referral.referral_helper import (
    calculate_relevance_score,
    extract_text_from_resume,
)
from utils.common.common_helper import get_ist_timestamp
from model.referral_model import Job, JobUpdateModel
from connection.conn import MogoConnection
from DB_Collections import DBCollections
from utils.exception.error_handler import exception_handler
from utils.validation.validation import validate_org

router = APIRouter()
md = MogoConnection()
md.get_conn()

organization_name = ""


@router.get("/get_jobs")
@exception_handler
def get_jobs(org: dict = Depends(validate_org)):
    org_slug = org.get("org_slug")

    collection_name = DBCollections.JOB_COLLECTION.value
    job_data = md.read_document(collection_name, {"org_slug": org_slug})
    for job in job_data:
        job["_id"] = str(job.get("_id", ""))
    return JSONResponse(content={"jobs": job_data}, status_code=200)


@router.post("/add_job")
@exception_handler
def add_job(
    job: Job, background_tasks: BackgroundTasks, org: dict = Depends(validate_org)
):
    org_slug = org.get("org_slug")

    collection_name = DBCollections.JOB_COLLECTION.value
    user_collection = DBCollections.USER_COLLECTION.value
    notification_collection = DBCollections.NOTIFICATION_COLLECTION.value

    user_data = md.read_document(user_collection, {"org_slug": job.org_slug})
    employee_emails = [user["email"] for user in user_data if "email" in user]
    org_slug = job.org_slug
    job_data = job.model_dump()
    admin_timestamp = (
        datetime.datetime.now(datetime.timezone.utc)
        .isoformat(timespec="milliseconds")
        .replace("+00:00", "Z")
    )
    job_data["admin_timestamp"] = admin_timestamp
    collection = md.db[collection_name]
    result = collection.insert_one(job_data)

    if result:
        role_query = {"user_role": {"$in": ["member"]}, "org_slug": org_slug}
        admins_and_superadmins = md.read_document(user_collection, role_query)
        notification_message = (
            f"New career opportunity: {job_data['title']} role is open for applications"
        )
        timestamp = admin_timestamp

        for user in admins_and_superadmins:
            notification_data = {
                "user_id": user["user_id"],
                "message": notification_message,
                "timestamp": timestamp,
                "is_notified": True,
                "is_desktop_notified": False,
                "clear": False,
                "org_slug": org_slug,
            }
            md.insert_record(notification_collection, [notification_data])

    if result.inserted_id:
        logging.info("Job stored successfully")
        subject = f"📢 New Job Opening: {job_data.get('title', 'Unknown Title')}"
        message = f"""
<html>
<body>
<p>Hi Team,</p>

<p>A new job opening has been posted:</p>

<p><strong>🔹 Title:</strong> {job_data.get('title')}</p>
<p><strong>🔹 Location:</strong> {job_data.get('location')}</p>
<p><strong>🔹 Deadline:</strong> {job_data.get('deadline')}</p>
<p><strong>🔹 Experience:</strong> {job_data.get('experience')} years</p>

<p><strong>🔹 Description:</strong></p>
{job_data.get('description', '')}

<p>Please refer suitable candidates via the portal.</p>

<p>Best regards,<br>HR Team</p>
</body>
</html>
"""
        for email in employee_emails:
            background_tasks.add_task(send_email_in_background, email, subject, message)

        return {"message": "Job added and notifications sent"}
    else:
        raise HTTPException(status_code=500, detail="Failed to store job")


@router.put("/update_job/{job_id}")
@exception_handler
def update_job(job_id: str, job_data: JobUpdateModel):
    collection_name = DBCollections.JOB_COLLECTION.value
    update_data = {
        "title": job_data.title,
        "description": job_data.description,
        "skills": job_data.skills,
        "experience": job_data.experience,
        "location": job_data.location,
        "deadline": job_data.deadline,
    }
    query = {"_id": ObjectId(job_id)}

    result = md.update_document(collection_name, query, update_data)

    if not result:
        raise HTTPException(status_code=404, detail="Job not found or no changes made")

    return JSONResponse(
        content={"message": "Job updated successfully"}, status_code=200
    )


@router.get("/get_all_referrals")
@exception_handler
def get_all_referrals(org: dict = Depends(validate_org)):
    org_slug = org.get("org_slug")

    collection_name = DBCollections.REFERRAL_COLLECTION.value
    referred_candidates = md.read_document(collection_name, {"org_slug": org_slug})

    for candidate in referred_candidates:
        if "_id" in candidate:
            candidate["_id"] = str(candidate["_id"])

    return JSONResponse(content={"referred_candidates": referred_candidates})


@router.post("/refer_candidate")
@exception_handler
async def refer_candidate(
    request: Request,
    job_title: str = Form(...),
    job_id: str = Form(...),
    name: str = Form(...),
    email: str = Form(...),
    resume: UploadFile = File(...),
    org_slug: str = Form(...),
    emp_id: str = Form(...),
    emp_name: str = Form(...),
    emp_email: str = Form(...),
    org: dict = Depends(validate_org),
):
    org_slug = org.get("org_slug")

    collection_name = DBCollections.JOB_COLLECTION.value
    referal_collection = DBCollections.REFERRAL_COLLECTION.value
    user_collection = DBCollections.USER_COLLECTION.value
    notification_collection = DBCollections.NOTIFICATION_COLLECTION.value

    collection = md.db[collection_name]
    referral_collection = md.db[referal_collection]
    job = collection.find_one({"_id": ObjectId(job_id), "org_slug": org_slug})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    resume_text = extract_text_from_resume(resume)
    jd_description = job.get("description", "")
    jd_skills = job.get("skills", "")

    score = calculate_relevance_score(resume_text, jd_description, jd_skills)
    resume.file.seek(0)
    contents = await resume.read()
    encoded_resume = base64.b64encode(contents).decode("utf-8")
    candidate_data = {
        "job_id": job_id,
        "job_title": job_title,
        "candidate_name": name,
        "candidate_email": email,
        "AI_score": score,
        "resume_data": encoded_resume,
        "emp_id": emp_id,
        "emp_name": emp_name,
        "emp_email": emp_email,
        "org_slug": org_slug,
    }

    result = referral_collection.insert_one(candidate_data)

    if result:
        role_query = {
            "user_role": {"$in": ["admin", "superadmin"]},
            "org_slug": org_slug,
        }
        admins_and_superadmins = md.read_document(user_collection, role_query)
        notification_message = f"New referral received for the {job_title} position"
        timestamp = get_ist_timestamp()
        for user in admins_and_superadmins:
            notification_data = {
                "user_id": user["user_id"],
                "message": notification_message,
                "timestamp": timestamp,
                "type": "referral",
                "is_admin_notified": True,
                "is_admin_desktop_notified": False,
                "admin_clear": False,
                "org_slug": org_slug,
            }
            md.insert_record(notification_collection, [notification_data])
        return {"message": "Candidate referred successfully!"}
    else:
        raise HTTPException(
            status_code=500, detail="Failed to update job with referral"
        )


@router.get("/get_referred_candidates")
@exception_handler
def get_referred_candidates(emp_id: str, org: dict = Depends(validate_org)):
    org_slug = org.get("org_slug")

    collection_name = DBCollections.REFERRAL_COLLECTION.value
    referred_candidates = md.read_document(
        collection_name, {"emp_id": emp_id, "org_slug": org_slug}
    )

    for candidate in referred_candidates:
        if "_id" in candidate:
            candidate["_id"] = str(candidate["_id"])

    return JSONResponse(content={"referred_candidates": referred_candidates})
