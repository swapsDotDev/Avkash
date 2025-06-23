import io
import cv2
import fitz
import numpy as np
from PIL import Image
from joblib import load
from skimage.feature import hog


class DocumentChecker:
    def __init__(self, model_path="ml_model/multiclass_doc_classifier.pkl"):
        self.model = load(model_path)
        self.labels = {0: "Aadhar", 1: "PAN", 2: "Other"}

    def is_pdf(self, file_type: str) -> bool:
        return "pdf" in file_type.lower()

    def read_image(self, file_bytes: bytes, file_type: str):
        try:
            if self.is_pdf(file_type):
                doc = fitz.open(stream=file_bytes, filetype="pdf")
                page = doc.load_page(0)
                pix = page.get_pixmap()
                img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            else:
                img = Image.open(io.BytesIO(file_bytes))

            img = img.convert("RGB")
            return np.array(img)
        except Exception as e:
            print(f"Failed to read image: {e}")
            return None

    def extract_features(self, image):
        if image is None:
            return None
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        resized = cv2.resize(gray, (128, 128))
        features = hog(
            resized, pixels_per_cell=(16, 16), cells_per_block=(2, 2), visualize=False
        )
        return features.reshape(1, -1)

    def predict(self, file_bytes: bytes, file_type: str, document_name: str) -> bool:
        try:
            image = self.read_image(file_bytes, file_type)
            features = self.extract_features(image)
            if features is None:
                return False

            probabilities = self.model.predict_proba(features)[0]
            max_prob = np.max(probabilities)
            predicted_class = np.argmax(probabilities)
            predicted_label = self.labels.get(predicted_class, "Unknown")

            if predicted_label == document_name:
                return max_prob >= 0.98

        except Exception as e:
            return False


document_checker = DocumentChecker()
