from pymongo import MongoClient
import logging
import sys
import os
from fastapi import HTTPException

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../")))
from config import DATABASE_URL, DATABASE_NAME


class MogoConnection:
    def __init__(self):
        self.uri = DATABASE_URL
        self.db_name = DATABASE_NAME
        self.client = None
        self.db = None
        self.get_conn()

    def get_conn(self):
        try:
            if self.client is None:
                self.client = MongoClient(self.uri)
                self.client.admin.command("ping")
                self.db = self.client[self.db_name]
                logging.info(
                    "Pinged your deployment. You have successfully connected to MongoDB!"
                )
            return self.client
        except Exception as e:
            logging.error(
                f"Error occurred while getting connection from mongo client. Error: {e}"
            )
            raise HTTPException(status_code=500, detail="Database connection error")

        return self.client

    def ensure_connection(self):
        if self.db is None:
            self.get_conn()

    def insert_record(self, collection_name, document):
        try:
            self.ensure_connection()
            collection = self.db[collection_name]
            result = collection.insert_many(document)
            if result.inserted_ids:
                return {"message": str(result.inserted_ids[0])}
            else:
                return None
        except Exception as e:
            logging.error(f"Error occurred while inserting document. \n  Error: {e}")
            return None

    def read_document(self, collection_name, query):
        try:
            self.ensure_connection()
            collection = self.db[collection_name]
            documents = collection.find(query)
            document_list = list(documents)
            return document_list if document_list else []
        except Exception as e:
            logging.error(f"Error occurred while reading documents. \n Error: {e}")
            return []

    def delete_document(self, collection_name, query):
        try:
            self.ensure_connection()
            collection = self.db[collection_name]
            result = collection.delete_many(query)
            if result.deleted_count > 0:
                return {
                    "message": f"Deleted {result.deleted_count} document(s) successfully"
                }
            else:
                return {"message": "No documents found to delete"}
        except Exception as e:
            logging.error(f"Error occurred while deleting document. \n Error: {e}")
            return {"message": "Error occurred while deleting document"}

    def update_document(self, collection_name, query, update_data):
        try:
            self.ensure_connection()
            collection = self.db[collection_name]
            result = collection.update_many(query, {"$set": update_data})
            if result.modified_count > 0:
                return {
                    "message": f"Updated {result.modified_count} document(s) successfully"
                }
            else:
                return {"message": "No documents found to update"}
        except Exception as e:
            logging.error(f"Error occurred while updating document. \n Error: {e}")
            return {"message": f"Error occurred while updating document. Error: {e}"}
