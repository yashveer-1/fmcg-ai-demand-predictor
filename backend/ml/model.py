from flask import Flask, request, jsonify
import pickle
import pandas as pd

app = Flask(__name__)

# Load the trained model and the category maps used during training.
model = pickle.load(open("model.pkl", "rb"))
sku_map = pickle.load(open("sku_map.pkl", "rb"))
region_map = pickle.load(open("region_map.pkl", "rb"))

def fallback_code(value, mapping):
    if value in mapping:
        return mapping[value]

    if not mapping:
        return 0

    return sum(ord(char) for char in value) % len(mapping)

@app.route("/", methods=["GET"])
def home():
    return "ML API is running"

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json
        print("Incoming data:", data)

        df = pd.DataFrame([data])

        # Keep these string fields in the same shape as the training data.
        df['sku_id'] = df['sku_id'].astype(str).str.strip()
        df['region'] = df['region'].astype(str).str.strip()

        df['day'] = pd.to_numeric(df.get('day', 1), errors='coerce').fillna(1).clip(1, 31)
        df['month'] = pd.to_numeric(df.get('month', 1), errors='coerce').fillna(1).clip(1, 12)
        df['promotion'] = pd.to_numeric(df.get('promotion', 0), errors='coerce').fillna(0).clip(0, 1)

        # Unknown values are assigned a stable code instead of failing the request.
        df['sku_id'] = df['sku_id'].apply(lambda value: fallback_code(value, sku_map))
        df['region'] = df['region'].apply(lambda value: fallback_code(value, region_map))

        print("After encoding:\n", df)

        df = df.astype({
            "sku_id": int,
            "region": int,
            "day": int,
            "month": int,
            "promotion": int
        })

        # XGBoost expects the same feature order used during training.
        df = df[['sku_id', 'region', 'day', 'month', 'promotion']]

        print("Final DF types:\n", df.dtypes)

        prediction = model.predict(df)

        return jsonify({
            "prediction": float(prediction[0])
        })

    except Exception as e:
        print("ERROR:", str(e))
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(port=8000, debug=True)
