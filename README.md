# FMCG AI Demand Predictor

An inventory dashboard for FMCG demand planning. The app predicts SKU demand, calculates safety stock and reorder points, and shows warehouse inventory risk in a 3D dashboard.

## Project Structure

```text
backend/
  server.js                 Express API server
  ml/                       Python demand model files and training script
  src/models/               MongoDB schemas
frontend/vite-project/
  src/api/api.js            Frontend API client
  src/pages/Dashboard.jsx   Main dashboard screen
  src/components/           Dashboard and warehouse components
```

## Tech Stack

- Frontend: React, Vite, Axios, Three.js, React Three Fiber
- Backend: Node.js, Express, MongoDB, Mongoose
- ML: Python, Flask, XGBoost

## Live Deployment

Frontend:

```text
https://fmcg-ai-demand-predictor.vercel.app/
```

Backend:

```text
https://fmcg-ai-demand-predictor.onrender.com
```

## Hosted Backend

The frontend is currently connected to the Render backend:

```text
https://fmcg-ai-demand-predictor.onrender.com
```

This is set in:

```text
frontend/vite-project/src/api/api.js
```

You can override it locally with a Vite environment variable:

```bash
VITE_API_URL=http://localhost:5000
```

## Run the Frontend

```bash
cd frontend/vite-project
npm install
npm run dev
```

Build for production:

```bash
cd frontend/vite-project
npm run build
```

## Run the Backend Locally

```bash
cd backend
npm install
npm run dev
```

Create `backend/.env` for local backend settings:

```text
PORT=5000
MONGO_URI=your_mongodb_connection_string
ML_API_URL=http://127.0.0.1:8000/predict
```

If `MONGO_URI` is not available, the backend falls back to sample inventory data.

## API Routes

```text
GET  /                         Health check
GET  /dashboard-data           Dashboard inventory summary
GET  /inventory                Inventory records
POST /inventory-analysis       Demand and reorder analysis
POST /predict-demand           Proxy to ML prediction service
GET  /ml-data                  Training data for the ML script
```

Example analysis request:

```bash
curl -X POST http://localhost:5000/inventory-analysis \
  -H "Content-Type: application/json" \
  -d '{"sku_id":"SKU1","region":"Delhi","day":10,"month":1,"promotion":1}'
```

## ML Service

The backend can call a local Flask ML service through `ML_API_URL`. If the ML service is not reachable, `/inventory-analysis` uses a built-in estimate so the dashboard can still return results.

Run the ML API from the model folder:

```bash
cd backend/ml
python model.py
```

Train or refresh the model:

```bash
cd backend/ml
python train.py
```

## Notes

- Frontend `.env` files are ignored by Git.
- Backend `.env` is ignored by Git.
- Generated folders like `node_modules`, `dist`, `venv`, and `__pycache__` are ignored.
