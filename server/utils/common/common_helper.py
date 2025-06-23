import pytz
import datetime
import logging
from connection.conn import MogoConnection
from DB_Collections import DBCollections

logger = logging.getLogger(__name__)

md = MogoConnection()
md.get_conn()


def get_ist_timestamp():
    ist = pytz.timezone("Asia/Kolkata")
    return datetime.datetime.now(ist).strftime("%Y-%m-%d %I:%M:%S %p")


def format_timestamp(timestamp):
    try:
        if isinstance(timestamp, datetime.datetime):
            return timestamp.strftime("%Y-%m-%d %H:%M:%S")
        elif isinstance(timestamp, str):
            return datetime.datetime.fromisoformat(timestamp).strftime(
                "%Y-%m-%d %H:%M:%S"
            )
        else:
            return str(timestamp) if timestamp else ""
    except (ValueError, TypeError):
        return str(timestamp) if timestamp else ""


def get_ceo(org_Data):
    for data in org_Data:
        if data["role"] == "CEO":
            return data
    return None
