from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

# Pest Disease Detection
import os # for path
import base64
from ultralytics import YOLO
from django.core.files.storage import default_storage # for storing the image
from django.core.files.base import ContentFile # for reading the image
from django.conf import settings

# Comprehensive remedies map mapped to YOLO model class names
DISEASE_REMEDIES = {
    "Apple___Apple_scab": [
        "Select scab-resistant apple varieties for planting.",
        "Rake and destroy fallen leaves in autumn to reduce overwintering spores.",
        "Prune trees to open up the canopy and improve air circulation.",
        "Apply preventive copper-based or organic fungicides during early green tip stage."
    ],
    "Apple___Black_rot": [
        "Prune out dead or diseased twigs, branches, and cankers during dormancy.",
        "Remove mummified fruit left on the trees or ground.",
        "Apply labeled fungicides from silver tip to harvest.",
        "Keep the orchard area clean and free of wood debris."
    ],
    "Apple___Cedar_apple_rust": [
        "Plant rust-resistant apple cultivars.",
        "Remove nearby Eastern Red Cedar trees if practical.",
        "Remove rust galls from cedar trees in early spring.",
        "Apply protective fungicides (e.g., myclobutanil) during the spore-shedding period."
    ],
    "Cherry_(including_sour)___Powdery_mildew": [
        "Prune trees to improve air flow and sunlight penetration.",
        "Avoid overhead irrigation to keep the foliage dry.",
        "Apply sulfur-based or potassium bicarbonate fungicides at the first sign of disease.",
        "Remove and destroy heavily infected leaves and shoots."
    ],
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": [
        "Plant resistant corn hybrids.",
        "Practice crop rotation to non-host crops like soybeans.",
        "Manage crop residue through tillage to accelerate decomposition.",
        "Apply foliar fungicides if disease risk is high and crop value justifies it."
    ],
    "Corn_(maize)___Common_rust_": [
        "Use resistant corn hybrids.",
        "Plant early in the season to avoid high spore concentrations.",
        "Fungicide applications are rarely necessary but can be used in high-value seed production fields."
    ],
    "Corn_(maize)___Northern_Leaf_Blight": [
        "Utilize resistant hybrids as the primary defense.",
        "Rotate crops for at least 1-2 years.",
        "Incorporate residue tillage to bury infected plant debris.",
        "Apply recommended fungicides at the tasseling stage if disease is present."
    ],
    "Grape___Black_rot": [
        "Select disease-resistant grape varieties.",
        "Prune vines to allow good air circulation and light exposure.",
        "Remove and destroy all mummified fruit and infected canes.",
        "Apply copper-based or synthetic fungicides starting at bud break."
    ],
    "Grape___Esca_(Black_Measles)": [
        "Avoid large pruning wounds and protect them with wound sealants.",
        "Prune during dry weather to prevent spore transmission.",
        "Remove and destroy severely infected vines to protect the vineyard.",
        "Apply approved biological agents or chemical treatments to pruning wounds."
    ],
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": [
        "Maintain proper vine spacing and canopy management to reduce humidity.",
        "Clean up fallen leaves and plant debris from around the vines.",
        "Apply protective copper or organic fungicides as needed.",
        "Irrigate at the base of the plant to keep leaves dry."
    ],
    "Orange___Haunglongbing_(Citrus_greening)": [
        "Use disease-free nursery stock for new plantings.",
        "Control the Asian citrus psyllid vector using insecticides or natural predators.",
        "Remove and destroy infected trees immediately to prevent spread.",
        "Provide optimal nutritional support to prolong tree productivity."
    ],
    "Peach___Bacterial_spot": [
        "Plant bacterial spot-resistant peach cultivars.",
        "Avoid excessive nitrogen fertilization, which promotes highly susceptible lush growth.",
        "Apply copper sprays during dormancy and early season.",
        "Maintain tree health with balanced nutrition and proper watering."
    ],
    "Pepper,_bell___Bacterial_spot": [
        "Use certified disease-free seeds and transplants.",
        "Avoid overhead watering and handle plants only when dry.",
        "Apply copper-based sprays combined with mancozeb for prevention.",
        "Practice a 2-3 year crop rotation away from solanaceous crops."
    ],
    "Potato___Early_blight": [
        "Plant certified, disease-free seed potatoes.",
        "Provide adequate nitrogen and potassium to keep plants robust.",
        "Practice crop rotation and avoid overhead watering.",
        "Apply preventive fungicides (e.g., chlorothalonil or copper) when conditions favor disease."
    ],
    "Potato___Late_blight": [
        "Plant resistant potato varieties and certified seed tubers.",
        "Eliminate cull piles and volunteer potato plants.",
        "Apply preventive fungicides before weather conditions turn cool and wet.",
        "Destroy infected foliage before harvest to protect tubers."
    ],
    "Squash___Powdery_mildew": [
        "Select resistant squash varieties.",
        "Plant in full sun and ensure adequate spacing for airflow.",
        "Apply neem oil, potassium bicarbonate, or sulfur fungicides at first sign.",
        "Water at the base of the plants, avoiding wet foliage."
    ],
    "Strawberry___Leaf_scorch": [
        "Plant certified disease-free strawberry runners.",
        "Keep beds free of weeds to improve air circulation.",
        "Renovate strawberry beds after harvest to destroy old leaves.",
        "Apply protective fungicides during wet spring periods if history of disease exists."
    ],
    "Tomato___Bacterial_spot": [
        "Use disease-free seed and transplants.",
        "Apply copper-based bactericides early in the season.",
        "Avoid overhead irrigation and working in wet fields.",
        "Rotate crops for at least 2 years with non-solanaceous crops."
    ],
    "Tomato___Early_blight": [
        "Remove and destroy infected lower leaves early in the season.",
        "Apply copper-based fungicides or Bacillus subtilis.",
        "Ensure adequate spacing between plants to improve air circulation.",
        "Avoid overhead watering; use drip irrigation instead.",
        "Rotate crops next season."
    ],
    "Tomato___Late_blight": [
        "Plant resistant tomato varieties.",
        "Monitor weather conditions (cool, wet periods promote blight).",
        "Apply preventive fungicides or biofungicides when blight is reported in the area.",
        "Destroy and remove infected plants immediately to prevent airborne spread.",
        "Practice crop rotation and keep weeds under control."
    ],
    "Tomato___Leaf_Mold": [
        "Grow tomatoes in well-ventilated structures or spaces to lower relative humidity.",
        "Prune lower leaves to enhance air flow near the ground.",
        "Apply preventive fungicides when humidity remains high.",
        "Use drip irrigation to prevent wetting the foliage."
    ],
    "Tomato___Septoria_leaf_spot": [
        "Remove infected lower leaves to prevent upward spread of spores.",
        "Apply organic mulches to create a barrier between soil-borne spores and foliage.",
        "Use drip irrigation or water at the base of the plant.",
        "Apply copper-based or chlorothalonil fungicides as necessary."
    ],
    "Tomato___Spider_mites Two-spotted_spider_mite": [
        "Spray plants with a strong stream of water to dislodge mites.",
        "Introduce natural predators like predatory mites (Phytoseiulus persimilis).",
        "Apply insecticidal soap, neem oil, or horticultural oils.",
        "Keep plants well-watered as drought-stressed plants are more susceptible."
    ],
    "Tomato___Target_Spot": [
        "Maintain a clean garden area and remove crop residues after harvest.",
        "Provide proper plant spacing for air circulation.",
        "Avoid overhead irrigation.",
        "Apply recommended fungicides if environmental conditions are warm and wet."
    ],
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus": [
        "Control whitefly vectors using yellow sticky traps and insecticidal sprays.",
        "Use physical barriers like insect-proof netting in greenhouses.",
        "Plant resistant tomato hybrids.",
        "Remove and destroy infected plants immediately."
    ],
    "Tomato___Tomato_mosaic_virus": [
        "Plant certified virus-free seeds and resistant varieties.",
        "Sanitize hands and tools with a disinfectant (like milk or trisodium phosphate) before handling plants.",
        "Remove and destroy infected plants and root systems immediately.",
        "Control weeds that may harbor the virus."
    ]
}

# Create your views here.
def health(req):
    return HttpResponse("Disease Health is Working Fine")

@csrf_exempt
def pestDisease(request):
    if request.method == "POST":
        image_content = None
        filename = "uploaded_image.jpg"

        if request.FILES.get("image"):
            uploaded_file = request.FILES["image"]
            image_content = uploaded_file.read()
            filename = uploaded_file.name
        else:
            # Check JSON body or POST body for base64 image
            import json
            data = {}
            try:
                if request.body:
                    data = json.loads(request.body.decode('utf-8'))
            except Exception:
                pass
            
            raw_base64 = data.get("image") or request.POST.get("image")
            if raw_base64:
                try:
                    if "base64," in raw_base64:
                        raw_base64 = raw_base64.split("base64,")[1]
                    image_content = base64.b64decode(raw_base64)
                    filename = data.get("filename") or "base64_upload.jpg"
                except Exception as b64_err:
                    return JsonResponse({"success": False, "error": f"Invalid base64 image data: {str(b64_err)}"}, status=400)

        if not image_content:
            return JsonResponse({"success": False, "error": "No image file uploaded under key 'image'"}, status=400)

        try:
            MODEL_PATH = os.path.join(settings.BASE_DIR, "best.pt")
            model = YOLO(MODEL_PATH)

            # 1. Save uploaded file
            temp_path = default_storage.save(
                "uploads/" + filename,
                ContentFile(image_content)
            )
            input_path = os.path.join(settings.MEDIA_ROOT, temp_path)

            # 2. Run YOLOv8 inference
            results = model.predict(
                source=input_path,
                save=False,  # we'll render the annotated image ourselves via plot()
            )

            # Extract predictions
            if results and len(results[0].boxes) > 0:
                cls_id = int(results[0].boxes.cls[0])  # take the first prediction
                class_name = model.names[cls_id]
                confidence = float(results[0].boxes.conf[0])
            else:
                class_name = "Healthy / No Disease Detected"
                confidence = 1.0

            # Get remedies based on disease classification
            remedies = DISEASE_REMEDIES.get(class_name, [
                "No specific disease remedies required.",
                "Continue standard cultural practices, irrigation, and crop monitoring."
            ])

            # Render the annotated image directly in memory using YOLO's plot()
            # This avoids path-guessing issues with save=True and save_dir
            encoded_image = ""
            try:
                import cv2
                annotated_frame = results[0].plot()  # returns BGR numpy array
                # Encode the numpy array as JPEG bytes
                success, buffer = cv2.imencode('.jpg', annotated_frame)
                if success:
                    encoded_image = base64.b64encode(buffer.tobytes()).decode("utf-8")
                else:
                    print("Warning: cv2.imencode failed for annotated image")
            except Exception as img_err:
                print(f"Error encoding annotated image: {img_err}")
                import traceback as tb
                tb.print_exc()

            return JsonResponse({
                "success": True,
                "disease": class_name,
                "confidence": confidence,
                "remedies": remedies,
                "image_base64": f"data:image/jpeg;base64,{encoded_image}" if encoded_image else None
            })
        except Exception as e:
            import traceback
            traceback.print_exc()
            return JsonResponse({"success": False, "error": str(e)}, status=500)

    return JsonResponse({"success": False, "error": "Only POST method is allowed"}, status=405)