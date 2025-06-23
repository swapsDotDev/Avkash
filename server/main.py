import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from connection.conn import MogoConnection
import uvicorn
import logging
from routes.noticeboard.noticeboard import router as noticeboard_router
from routes.reimbursement.reimbursement import router as reimbursement_router
from routes.referral.referral import router as referral_router
from routes.dashboard.dashboard import router as dashboard_router
from routes.department.department import router as department_router
from routes.feedback.feedback import router as feedback_router
from routes.org_info.org_info import router as org_info_router
from routes.holiday.holiday import router as holiday_router
from routes.leaverequest.leaverequest import router as leave_request_router
from routes.notifications.notifications import router as notifications_router
from routes.payslip.payslip import router as payslip_router
from routes.settings.settings import router as settings_router
from routes.timesheet.timesheet import router as timesheet_router
from routes.user_info.user_info import router as user_info_router
from routes.document.document import router as documents_router
from websocket.websocket import router as websocket_router

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()
md = MogoConnection()
md.get_conn()

CORS_ALLOW_ORIGINS = os.getenv("CORS_ALLOW_ORIGINS", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[CORS_ALLOW_ORIGINS],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return "Server is running"


app.include_router(noticeboard_router)
app.include_router(reimbursement_router)
app.include_router(referral_router)
app.include_router(dashboard_router)
app.include_router(department_router)
app.include_router(feedback_router)
app.include_router(org_info_router)
app.include_router(holiday_router)
app.include_router(leave_request_router)
app.include_router(notifications_router)
app.include_router(payslip_router)
app.include_router(settings_router)
app.include_router(timesheet_router)
app.include_router(user_info_router)
app.include_router(documents_router)
app.include_router(websocket_router)

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        ws_ping_interval=30,
        ws_ping_timeout=30,
    )
