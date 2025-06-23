from fastapi import APIRouter
from connection.conn import MogoConnection
from DB_Collections import DBCollections
import logging
import requests
import os

router = APIRouter()
md = MogoConnection()
md.get_conn()


def create_holidays_collection(organization_name, org_slug):
    if organization_name:
        collection_name = DBCollections.HOLIDAY_COLLECTION.value
        if collection_name not in md.db.list_collection_names():
            md.db.create_collection(collection_name)
            logging.info(f"Collection '{collection_name}' created for holidays.")
        collection = md.db[collection_name]
        existing_holidays = collection.find_one({"org_slug": org_slug})
        if not existing_holidays:
            url = f"https://www.googleapis.com/calendar/v3/calendars/en.indian%23holiday%40group.v.calendar.google.com/events?timeMin=2024-01-01T00%3A00%3A00Z&timeMax=2025-12-31T23%3A59%3A59Z&key={os.getenv('CALENDAR_API_KEY')}"
            response = requests.get(url)
            response.raise_for_status()
            holidays_data = response.json()
            holidays = []
            for item in holidays_data["items"]:
                start_date = item["start"]["date"]
                summary = item["summary"]
                holiday_type = item.get("type", "")
                holidays.append(
                    {
                        "date": start_date,
                        "summary": summary,
                        "holiday_type": holiday_type,
                        "org_slug": org_slug,
                    }
                )
            result = collection.insert_many(holidays)
            if result:
                logging.info(
                    f"Holidays stored successfully for organization {org_slug}"
                )
            else:
                logging.error("Failed to store holidays")
        else:
            logging.info(f"Holidays already exist for organization {org_slug}.")
