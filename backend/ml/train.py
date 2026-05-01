import pandas as pd
import requests
from xgboost import XGBRegressor
import pickle

# 🔗 Fetch data from backend
data = requests.get("http://localhost:5000/ml-data").json()

df = pd.DataFrame(data)

# Convert date
df['date'] = pd.to_datetime(df['date'])

# Feature engineering
df['day'] = df['date'].dt.day
df['month'] = df['date'].dt.month

# Encode SKU + region
df['sku_id'] = df['sku_id'].astype('category').cat.codes
df['region'] = df['region'].astype('category').cat.codes

# Features + target
X = df[['sku_id', 'region', 'day', 'month', 'promotion']]
y = df['units_sold']

# Train model
model = XGBRegressor()
model.fit(X, y)

# Save model
pickle.dump(model, open("model.pkl", "wb"))

print("Model trained and saved")