from sentence_transformers import SentenceTransformer

ACCEPTED_EXTENSIONS = {"pdf", "jpg", "jpeg", "png"}
ARCHIVE_INTERVAL_SECONDS = 3600
model = SentenceTransformer("all-MiniLM-L6-v2")
