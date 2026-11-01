// Disease library. Keys match PlantVillage labels: "Plant___Condition".
export const DISEASES = [
  { key: "Tomato___Late_blight", plant: "Tomato", name: "Late blight",
    symptoms: "Large, dark, water-soaked patches on leaves, often with white fuzzy growth underneath in damp weather. Fruit gets firm brown blotches.",
    cause: "The water mold Phytophthora infestans, which spreads fast in cool, wet, humid conditions.",
    prevention: "Water at the base, space plants for airflow, remove infected plants quickly, and rotate crops." },
  { key: "Tomato___Early_blight", plant: "Tomato", name: "Early blight",
    symptoms: "Brown spots with concentric rings (like a target) on older, lower leaves, often with a yellow halo.",
    cause: "The fungus Alternaria solani, which survives in soil and plant debris.",
    prevention: "Mulch, remove lower leaves, clear debris after harvest, and rotate crops every year." },
  { key: "Tomato___Leaf_Mold", plant: "Tomato", name: "Leaf mold",
    symptoms: "Pale yellow spots on the upper leaf surface and olive-green to grey mold on the underside.",
    cause: "The fungus Passalora fulva, common in humid greenhouses and poorly ventilated plots.",
    prevention: "Reduce humidity, prune for airflow, and avoid wetting the leaves." },
  { key: "Potato___Early_blight", plant: "Potato", name: "Early blight",
    symptoms: "Dark brown spots with ring patterns on older leaves, which then yellow and drop.",
    cause: "The fungus Alternaria solani, favored by warm weather and stressed plants.",
    prevention: "Keep plants well fed and watered, use clean seed tubers, and rotate crops." },
  { key: "Potato___Late_blight", plant: "Potato", name: "Late blight",
    symptoms: "Dark, greasy-looking lesions on leaves and stems that spread quickly; tubers can rot.",
    cause: "The water mold Phytophthora infestans, which thrives in cool, wet weather.",
    prevention: "Plant certified seed, hill soil around stems, and destroy infected plants early." },
  { key: "Corn_(maize)___Common_rust_", plant: "Corn", name: "Common rust",
    symptoms: "Small, powdery, reddish-brown pustules scattered on both sides of the leaf.",
    cause: "The fungus Puccinia sorghi, spread by wind-blown spores in cool, humid weather.",
    prevention: "Plant resistant hybrids and plant early in the season." },
  { key: "Apple___Apple_scab", plant: "Apple", name: "Apple scab",
    symptoms: "Olive-green to dark scabby spots on leaves and fruit; heavily infected leaves curl and fall.",
    cause: "The fungus Venturia inaequalis, which overwinters in fallen leaves.",
    prevention: "Rake and remove fallen leaves, prune for airflow, and choose resistant varieties." },
  { key: "Grape___Black_rot", plant: "Grape", name: "Black rot",
    symptoms: "Small brown circular spots on leaves, then berries shrivel into hard, black mummies.",
    cause: "The fungus Guignardia bidwellii, spread by rain splash in warm, wet weather.",
    prevention: "Remove mummified fruit, prune for airflow, and keep vines off the ground." },
  { key: "Pepper,_bell___Bacterial_spot", plant: "Pepper", name: "Bacterial spot",
    symptoms: "Small, dark, slightly raised spots on leaves and fruit; spotted leaves may yellow and drop.",
    cause: "Xanthomonas bacteria, carried on seed and spread by splashing water.",
    prevention: "Use disease-free seed, avoid working among wet plants, and rotate crops." },
];

export function findDisease(label) {
  return DISEASES.find((d) => d.key === label) || null;
}

export const FAQ = [
  ["How accurate is it?", "On clean, well-lit photos of the plants it was trained on, a model like this can be very accurate. Photos with messy backgrounds, shadows or several leaves are harder, so the confidence percentage matters. Treat low confidence as a hint to retake the photo."],
  ["Which plants does it support?", "It follows the PlantVillage dataset, which covers around 14 crops such as tomato, potato, apple, corn, grape and pepper. Plants outside that list can give wrong answers."],
  ["Is my photo stored?", "In this version your photo stays in your browser. Only the result text (name, confidence, time) is saved in your scan history on this device, and you can clear it at any time."],
  ["Can I use this instead of an expert?", "No. It's a first check. For a serious outbreak or before using chemicals, confirm with a local agriculture extension officer or plant pathologist."],
  ["Why does it say demo mode?", "The page isn't connected to a trained model yet, so results are sample data. Once the backend is connected, that notice goes away."],
];