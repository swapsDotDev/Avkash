import asyncio
from functools import wraps
from fastapi.responses import JSONResponse
from pymongo.errors import PyMongoError
from fastapi import HTTPException
from bson.errors import InvalidId
from pydantic import ValidationError
import base64, json


def exception_handler(func):
    @wraps(func)
    async def async_wrapper(*args, **kwargs):
        try:
            if asyncio.iscoroutinefunction(func):
                return await func(*args, **kwargs)
            else:
                return func(*args, **kwargs)
        except HTTPException as http_exc:
            raise http_exc
        except json.JSONDecodeError:
            return JSONResponse(
                status_code=400, content={"detail": "Invalid JSON format"}
            )
        except InvalidId:
            return JSONResponse(
                status_code=400, content={"detail": "Invalid ID format"}
            )
        except ValidationError:
            return JSONResponse(
                status_code=400, content={"detail": "Invalid data format"}
            )
        except base64.binascii.Error:
            return JSONResponse(
                status_code=400, content={"detail": "Invalid base64 data"}
            )
        except PyMongoError as e:
            return JSONResponse(
                status_code=500, content={"detail": "Database Error", "error": str(e)}
            )
        except ValueError as ve:
            if "time data" in str(ve) or "does not match format" in str(ve):
                return JSONResponse(
                    status_code=400, content={"detail": "Invalid date format"}
                )
            return JSONResponse(status_code=400, content={"detail": str(ve)})
        except Exception as e:
            return JSONResponse(
                status_code=500,
                content={"detail": "Internal Server Error", "error": str(e)},
            )

    return async_wrapper
