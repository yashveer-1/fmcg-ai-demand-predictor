import pandas as pd
import requests
from xgboost import XGBRegressor
import pickle

print("Fetching data from backend...")

# 🔗 Fetch data
data = requests.get("http://localhost:5000/ml-data").json()

df = pd.DataFrame(data)

print("Data loaded:", len(df))

# 🧹 Clean columns (important)
df['sku_id'] = df['sku_id'].astype(str).str.strip()
df['region'] = df['region'].astype(str).str.strip()

# 📅 Convert date
df['date'] = pd.to_datetime(df['date'])

# 🔧 Feature engineering
df['day'] = df['date'].dt.day
df['month'] = df['date'].dt.month

# 🔥 CREATE ENCODING MAPS (IMPORTANT FIX)
sku_categories = df['sku_id'].astype('category').cat.categories
region_categories = df['region'].astype('category').cat.categories

sku_map = {v: k for k, v in enumerate(sku_categories)}
region_map = {v: k for k, v in enumerate(region_categories)}

print("SKU MAP:", sku_map)
print("REGION MAP:", region_map)

# 🔹 Apply encoding
df['sku_id'] = df['sku_id'].map(sku_map)
df['region'] = df['region'].map(region_map)

# 🚨 Safety check
if df.isnull().any().any():
    print("❌ Encoding issue detected")
    print(df[df.isnull().any(axis=1)])
    exit()

# 🎯 Features + target
X = df[['sku_id', 'region', 'day', 'month', 'promotion']]
y = df['units_sold']

print("Training model...")

# 🤖 Train model
model = XGBRegressor()
model.fit(X, y)

# 💾 Save model + mappings
pickle.dump(model, open("model.pkl", "wb"))
pickle.dump(sku_map, open("sku_map.pkl", "wb"))
pickle.dump(region_map, open("region_map.pkl", "wb"))

print("✅ Model and mappings saved successfully")