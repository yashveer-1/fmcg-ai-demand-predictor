from flask import Flask, request, jsonify
import pickle
import pandas as pd

app = Flask(__name__)

# 🔹 Load model + mappings
model = pickle.load(open("model.pkl", "rb"))
sku_map = pickle.load(open("sku_map.pkl", "rb"))
region_map = pickle.load(open("region_map.pkl", "rb"))

@app.route("/", methods=["GET"])
def home():
    return "ML API is running"

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json
        print("Incoming data:", data)

        # ✅ Convert to DataFrame
        df = pd.DataFrame([data])

        # 🧹 Clean input (important)
        df['sku_id'] = df['sku_id'].astype(str).str.strip()
        df['region'] = df['region'].astype(str).str.strip()

        # 🔥 Use SAME encoding as training
        df['sku_id'] = df['sku_id'].map(sku_map)
        df['region'] = df['region'].map(region_map)

        print("After encoding:\n", df)

        # 🚨 Check encoding failure
        if df.isnull().any().any():
            return jsonify({
                "error": "Invalid SKU or Region",
                "received": data
            }), 400

        # 🔹 Ensure correct types
        df = df.astype({
            "sku_id": int,
            "region": int,
            "day": int,
            "month": int,
            "promotion": int
        })

        # 🔹 Match training feature order EXACTLY
        df = df[['sku_id', 'region', 'day', 'month', 'promotion']]

        print("Final DF types:\n", df.dtypes)

        # 🤖 Predict
        prediction = model.predict(df)

        return jsonify({
            "prediction": float(prediction[0])
        })

    except Exception as e:
        print("ERROR:", str(e))
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(port=8000, debug=True)