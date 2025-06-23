import os
import cv2
import joblib
import numpy as np
from skimage.feature import hog
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

IMAGE_SIZE = (128, 128)
DATA_DIRS = {"aadhaar": 0, "pan": 1, "not_aadhaar": 2}

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TRAINING_DATA_PATH = os.path.join(BASE_DIR, "training_model", "training_data")
MODEL_PATH = os.path.join(BASE_DIR, "ml_model", "multiclass_doc_classifier.pkl")


def extract_features(folder, label):
    features, labels = [], []
    for fname in os.listdir(folder):
        path = os.path.join(folder, fname)
        img = cv2.imread(path, cv2.IMREAD_GRAYSCALE)
        if img is None:
            continue
        img = cv2.resize(img, IMAGE_SIZE)
        feat = hog(img, pixels_per_cell=(16, 16), cells_per_block=(2, 2))
        features.append(feat)
        labels.append(label)
    return features, labels


def train_model():
    all_features, all_labels = [], []

    for folder_name, label in DATA_DIRS.items():
        folder_path = os.path.join(TRAINING_DATA_PATH, folder_name)
        feats, labs = extract_features(folder_path, label)
        all_features.extend(feats)
        all_labels.extend(labs)

    X = np.array(all_features)
    y = np.array(all_labels)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = SVC(kernel="rbf", probability=True)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"Accuracy: {acc * 100:.2f}%")

    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)

    joblib.dump(model, MODEL_PATH)
    print(f"Model saved to: {MODEL_PATH}")


if __name__ == "__main__":
    train_model()
