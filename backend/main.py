from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import json
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import transforms, models

app = FastAPI(title="LeafCheck API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Load the 38 Class Indices
try:
    with open("class_indices.json", "r") as f:
        CLASS_NAMES = json.load(f)
except FileNotFoundError:
    print("Warning: class_indices.json not found. Run in the same directory as the file.")
    CLASS_NAMES = [f"Class_{i}" for i in range(38)]

# 2. Load the PyTorch Model Architecture and Weights
try:
    # Use GPU if available, otherwise fallback to CPU
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    # Build the empty MobileNetV2 architecture
    model = models.mobilenet_v2(weights=None)
    
    # Modify the final classification layer to output 38 classes instead of 1000
    num_features = model.classifier[1].in_features
    model.classifier[1] = nn.Linear(num_features, 38)
    
    # Load the saved weights (state_dict) into the architecture
    state_dict = torch.load("plant_mobilenet_v2.pth", map_location=device, weights_only=True)
    model.load_state_dict(state_dict)
    
    model.to(device)
    # Set model to evaluation mode (disables dropout, fixes batch norm)
    model.eval() 
    MODEL_LOADED = True
except Exception as e:
    print(f"Warning: Could not load PyTorch model ({e}). Running in mock mode.")
    MODEL_LOADED = False

# 3. Define Image Preprocessing Pipeline
preprocess = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(), # Converts 0-255 to 0.0-1.0 and changes shape to (C, H, W)
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

@app.post("/predict")
async def predict_leaf(file: UploadFile = File(...)):
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes))
    
    # Ensure image is RGB (removes alpha channel if PNG)
    if image.mode != "RGB":
        image = image.convert("RGB")
        
    if MODEL_LOADED:
        # Preprocess and add batch dimension: (1, 3, 224, 224)
        input_tensor = preprocess(image).unsqueeze(0).to(device)
        
        with torch.no_grad(): # Disable gradient calculation for faster inference
            output = model(input_tensor)
            # Convert raw logits to probabilities (0.0 to 1.0)
            probabilities = F.softmax(output[0], dim=0)
        
        # Get the top 3 probabilities and their index locations
        top3_prob, top3_catid = torch.topk(probabilities, 3)
        
        results = []
        for i in range(3):
            class_index = top3_catid[i].item()
            
            # Convert probability (e.g., 0.9462) to percentage (94.62)
            confidence = round(top3_prob[i].item() * 100, 2) 
            
            # Handle class_indices.json formatting (supports both list and dictionary)
            if isinstance(CLASS_NAMES, dict):
                label = CLASS_NAMES.get(str(class_index), f"Unknown_{class_index}")
            else:
                label = CLASS_NAMES[class_index]

            results.append({
                "label": label,
                "confidence": confidence
            })
    else:
        # Mock fallback based on Member 3's contract
        results = [
            {"label": "Tomato___Bacterial_spot", "confidence": 94.62},
            {"label": "Tomato___Early_blight", "confidence": 3.15},
            {"label": "Tomato___healthy", "confidence": 1.12}
        ]

    return {"predictions": results}

@app.get("/")
def read_root():
    return {"status": "PyTorch Backend is running", "model_loaded": MODEL_LOADED}