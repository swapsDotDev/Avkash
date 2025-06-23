from pymongo import MongoClient
import json
import logging
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
from config import DATABASE_URL, DATABASE_NAME


class MongoDBHandler:
    def __init__(self):
        self.uri = DATABASE_URL
        self.db_name = DATABASE_NAME
        self.client = None
        self.db = None

    def get_conn(self):
        try:
            self.client = MongoClient(self.uri)
            self.client.admin.command("ping")
            self.db = self.client[self.db_name]
            logging.info(
                "Pinged your deployment. You have successfully connected to MongoDB!"
            )
        except Exception as e:
            logging.error(
                f"Error occurred while getting connection from mongo client. Error: {e}"
            )
        return self.client

    def get_db(self, db_name):
        databases = self.client.list_database_names()
        if db_name in databases:
            self.db = self.client[db_name]
            return self.db
        else:
            try:
                self.db = self.client[db_name]
            except Exception as e:
                logging.error(f"Error occurred while creating database {db_name} : {e}")
            return self.db

    def list_collections(self):
        try:
            collection_list = self.db.list_collection_names()
            return collection_list
        except Exception as e:
            logging.error(f"Error occurred while listing collections: {e}")

    def get_schema(self, schema_file):
        script_dir = os.path.dirname(os.path.abspath(__file__))
        schema_path = os.path.join(script_dir, schema_file)
        try:
            with open(schema_path, "r") as f:
                collection_schema = json.load(f)
                return collection_schema
        except Exception as e:
            logging.error(f"Error occurred while accessing schema: {e}")
            return None

    def create_collections(self):
        collection_schema = self.get_schema("schema.json")
        if collection_schema is None:
            logging.error("Unable to create collections: schema not found or invalid")
            return
        for collection_name, schema_info in collection_schema.items():
            try:
                collections = self.list_collections()
                if collection_name not in collections:
                    self.db.create_collection(
                        collection_name, validator={"$jsonSchema": schema_info}
                    )
                    logging.info(
                        f"Collection '{collection_name}' created with schema: {schema_info}"
                    )
                else:
                    current_schema = (
                        self.db.get_collection(collection_name)
                        .options()
                        .get("validator", {})
                    )
                    if current_schema == {"$jsonSchema": schema_info}:
                        logging.info(
                            f"Collection '{collection_name}' already exists with the same schema."
                        )
                    else:
                        self.db.command(
                            "collMod",
                            collection_name,
                            validator={"$jsonSchema": schema_info},
                        )
                        logging.info(
                            f"Collection '{collection_name}' updated with new schema: {schema_info}"
                        )
            except Exception as e:
                logging.error(
                    f"Error occurred while creating/updating collection '{collection_name}': {e}"
                )


if __name__ == "__main__":
    mongo_handler = MongoDBHandler()
    mongo_handler.get_conn()
    mongo_handler.get_db(mongo_handler.db_name)
    mongo_handler.create_collections()
