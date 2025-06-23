import pytz
import datetime
import unicodedata
from connection.conn import MogoConnection
from DB_Collections import DBCollections
from fastapi import HTTPException
import json
import websocket.ConnectionManager as manager

md = MogoConnection()
organization_name = ""

last_archive_time = None


def normalize_org_slug(org_name: str) -> str:
    if not org_name:
        return ""
    return org_name.strip().lower().replace(" ", "-")


def sanitize_filename(filename: str) -> str:
    normalized = unicodedata.normalize("NFKD", filename)
    ascii_filename = normalized.encode("ascii", "ignore").decode("ascii")
    safe_filename = "".join(
        c if c.isalnum() or c == "." else "_" for c in ascii_filename
    )
    return safe_filename


async def archive_expired_notices():
    global last_archive_time
    try:
        collection_name = DBCollections.NOTICE_COLLECTION.value
        ist = pytz.timezone("Asia/Kolkata")
        now = datetime.datetime.now(ist)

        query = {
            "archived": False,
            "expiry": {"$ne": "", "$lte": now.strftime("%Y-%m-%d %H:%M:%S")},
        }
        notices_to_archive = md.read_document(collection_name, query)

        if not notices_to_archive:
            last_archive_time = now
            return 0

        update_result = md.db[collection_name].update_many(
            query, {"$set": {"archived": True}}
        )

        modified_count = update_result.modified_count

        for notice in notices_to_archive:
            notice["_id"] = str(notice["_id"])
            notice["archived"] = True
            notice["id"] = notice["_id"]
            message = {
                "event": "update_notice",
                "org_slug": notice.get("org_slug"),
                "organization_name": organization_name,
                "notice": notice,
            }
            await manager.broadcast(json.dumps(message))

        last_archive_time = now
        return modified_count
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
