```markdown
# LeafCheck 🍃

LeafCheck is an AI-powered full-stack application that diagnoses plant diseases from leaf photos. It utilizes a React frontend, a FastAPI backend, and a PyTorch-trained MobileNetV2 model to deliver real-time, high-accuracy disease predictions.

## 🏗 Architecture & Request Flow

1. **Upload:** The user selects a leaf photo in the React application.
2. **Transmit:** The frontend transmits the photo to the backend via a `POST /predict` `multipart/form-data` request.
3. **Pre-process:** FastAPI receives the image, converts it to RGB, resizes it to 224x224, and applies ImageNet normalization.
4. **Inference:** The PyTorch MobileNetV2 model processes the tensor and calculates softmax probabilities across 38 distinct plant disease classes.
5. **Response:** The backend returns the Top-3 highest confidence predictions.
6. **Display:** The frontend renders the diagnosis, confidence bars, and relevant treatment advice from the disease library, saving the scan to local browser history.

## 🛠 Tech Stack

* **Frontend:** React.js, Vite/CRA
* **Backend:** Python, FastAPI, Uvicorn, Pillow, python-multipart
* **Machine Learning:** PyTorch, Torchvision (MobileNetV2)

## 🚀 Getting Started

### Prerequisites
Ensure you have Node.js (v16+) and Python (3.9+) installed.

### 1. Backend Setup (FastAPI + PyTorch)

Navigate to the backend directory and install the required Python dependencies:

```bash
cd backend
pip install fastapi uvicorn python-multipart Pillow torch torchvision

```

Ensure the AI model files (`plant_mobilenet_v2.pth` and `class_indices.json`) are located in the `backend/` root folder.

Start the development server:

```bash
uvicorn main:app --reload --port 8080

```

*The backend API will be available at `http://localhost:8080` and the interactive Swagger docs at `http://localhost:8080/docs`.*

### 2. Frontend Setup (React)

Open a new terminal, navigate to the frontend directory, and install the Node modules:

```bash
cd frontend
npm install

```

Start the frontend development server:

```bash
npm run dev
# or 'npm start' if using Create React App

```

## 🔌 API Reference

### `POST /predict`

Evaluates a plant leaf image and returns the top 3 disease predictions.

**Request Body:**

* `file`: (File, required) The leaf image (JPEG, PNG).

**Response (200 OK):**

```json
{
  "predictions": [
    {
      "label": "Tomato___Bacterial_spot",
      "confidence": 94.62
    },
    {
      "label": "Tomato___Early_blight",
      "confidence": 3.15
    },
    {
      "label": "Tomato___healthy",
      "confidence": 1.12
    }
  ]
}

```

## 👥 Team

* **Member 1:** Frontend Development (React, UI/UX, State Management)
* **Member 2:** Backend Architecture (FastAPI, PyTorch Integration, API Design)
* **Member 3:** AI/ML Engineering (MobileNetV2 Training, PyTorch Modeling)

```

<ElicitationsGroup message="What would you like to wrap up next?">
  <Elicitation label="Merge branch to main" query="How do I create a Pull Request and merge my backend branch into the main branch on GitHub?"/>
  <Elicitation label="Add a requirements.txt" query="How do I generate a requirements.txt file for the backend so my teammates can install the exact dependencies?"/>
  <Elicitation label="Deploy the backend" query="How do we deploy this FastAPI backend so it is accessible on the internet for our final submission?"/>
</ElicitationsGroup>

```
