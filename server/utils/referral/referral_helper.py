from fastapi import UploadFile
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import pdfplumber
import docx
import io
from fastapi import HTTPException
from const import model


def calculate_relevance_score(
    resume_text: str, jd_description: str, jd_skills: str = ""
) -> float:
    job_text = jd_description + "\nSkills:\n" + jd_skills
    embeddings = model.encode([resume_text, job_text])
    score = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
    return f"{round(score * 100)}%"


def extract_text_from_resume(file: UploadFile) -> str:
    file_ext = file.filename.split(".")[-1].lower()

    if file_ext == "pdf":
        with pdfplumber.open(io.BytesIO(file.file.read())) as pdf:
            text = "\n".join(page.extract_text() or "" for page in pdf.pages)
        return text

    elif file_ext in ["doc", "docx"]:
        doc = docx.Document(io.BytesIO(file.file.read()))
        text = "\n".join([para.text for para in doc.paragraphs])
        return text

    else:
        raise HTTPException(
            status_code=400, detail="Unsupported file format. Upload PDF or DOCX."
        )
