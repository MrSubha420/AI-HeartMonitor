from flask import Flask, request, jsonify
import joblib
import pandas as pd
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load models
models = {
    "decision_tree": joblib.load("heart_disease_QIIMGAdecision_tree_model.pkl"),
    "knn": joblib.load("heart_disease_QIIMGAknn_model.pkl"),
    "logistic_regression": joblib.load("heart_disease_QIIMGAlogistic_regression_model.pkl"),
    "mlp": joblib.load("heart_disease_QIIMGAmlp_model.pkl"),
    "svm": joblib.load("heart_disease_QIIMGAsvm_model.pkl")
}

# Define the correct feature order used during training
FEATURE_ORDER = [
    'sex', 'cp', 'bp', 'bol', 'fbs', 'restecg',
    'thalach', 'exang', 'bodytemp', 'slope', 'pal', 'thal'
]

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json
        # Create DataFrame with correct feature names and order
        features = pd.DataFrame([data["features"]], columns=FEATURE_ORDER)
        
        predictions = {}
        for model_name, model in models.items():
            prediction = model.predict(features)[0]
            result = "Heart Disease Detected" if prediction == 1 else "No Heart Disease"
            predictions[model_name] = result

        return jsonify(predictions)

    except Exception as e:
        app.logger.error(f"Prediction error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)