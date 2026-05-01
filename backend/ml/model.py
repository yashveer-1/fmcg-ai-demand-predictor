from flask import Flask, request, jsonify
import pickle
import pandas as pd

app = Flask(__name__)

model = pickle.load(open("model.pkl", "rb"))

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json

    df = pd.DataFrame([data])

    prediction = model.predict(df)

    return jsonify({"prediction": float(prediction[0])})

app.run(port=8000)