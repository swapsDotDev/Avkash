import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from fastapi import HTTPException
from utils.email.email_template import get_birthday_email, get_anniversary_email


def send_email(to_email: str, subject: str, message: str):
    from_email = os.getenv("SENDER_EMAIL")
    password = os.getenv("SENDER_PASSWORD")
    msg = MIMEMultipart()
    msg["From"] = from_email
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(message, "html"))

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.ehlo()
        server.starttls()
        server.login(from_email, password)
        server.sendmail(from_email, to_email, msg.as_string())
        server.quit()
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))


def send_email_in_background(email: str, subject: str, message: str):
    send_email(email, subject, message)


def send_special_day_wishes():
    try:
        ist = pytz.timezone("Asia/Kolkata")
        today = datetime.datetime.now(ist).date()
        today_str = today.strftime("%m-%d")

        users = md.read_document(
            DBCollections.USER_COLLECTION.value, {"email_notification": True}
        )

        logger.info(
            f"Checking special days for {today_str}. Found {len(users)} users with notifications enabled"
        )

        for user in users:
            try:
                email = user.get("email")
                if not email:
                    continue

                username = user.get("username", "Team Member")
                org_name = user.get("organization_name", "Your Organization")
                dob = user.get("DateOfBirth")
                doj = user.get("DateOfJoining")

                if dob:
                    try:
                        dob_date = datetime.datetime.strptime(dob, "%Y-%m-%d").date()
                        if dob_date.strftime("%m-%d") == today_str:
                            subject, message = get_birthday_email(username, org_name)
                            send_email_in_background(email, subject, message)
                            logger.info(f"Birthday email sent to {username} ({email})")
                    except ValueError as e:
                        logger.error(f"Error parsing DOB for {email}: {str(e)}")

                if doj:
                    try:
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
                            logger.info(
                                f"Work anniversary email sent to {username} ({email})"
                            )
                    except ValueError as e:
                        logger.error(f"Error parsing DOJ for {email}: {str(e)}")

            except Exception as e:
                logger.error(f"Error processing user {user.get('email', '')}: {str(e)}")

    except Exception as e:
        logger.error(f"Error in send_special_day_wishes: {str(e)}")
