import io
import json
import torch
import torch.nn as nn
from PIL import Image
from torchvision import models, transforms

# 1. Load Class Labels (38 Classes)
with open("class_indices.json", "r") as f:
    CLASS_LABELS = json.load(f)

# 2. Setup Device and Load MobileNetV2 Architecture
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = models.mobilenet_v2()
model.classifier[1] = nn.Linear(model.classifier[1].in_features, len(CLASS_LABELS))
model.load_state_dict(torch.load("plant_mobilenet_v2.pth", map_location=device))
model.to(device)
model.eval()

# 3. Define Preprocessing Pipeline (224x224 Sizing + Normalization)
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

def predict_plant_disease(image_bytes: bytes) -> list:
    """
    Takes raw image bytes, runs MobileNetV2 inference, 
    and returns top-3 predictions with labels and confidence percentages.
    """
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    tensor = transform(image).unsqueeze(0).to(device)
    
    with torch.no_grad():
        outputs = model(tensor)
        probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
        top3_prob, top3_indices = torch.topk(probabilities, 3)
        
    predictions = []
    for prob, idx in zip(top3_prob, top3_indices):
        predictions.append({
            "label": CLASS_LABELS[idx.item()],
            "confidence": round(prob.item() * 100, 2)
        })
        
    return predictions