import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

import Sales from "./src/models/schema.js";
import Inventory from "./src/models/inventory.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;
const fallbackInventory = [
  { sku_id: "SKU1", current_stock: 100, lead_time_days: 3, shelf_capacity: 180, pending_orders: 4, incoming_stock: 120 },
  { sku_id: "SKU2", current_stock: 80, lead_time_days: 2, shelf_capacity: 160, pending_orders: 2, incoming_stock: 75 },
  { sku_id: "SKU3", current_stock: 120, lead_time_days: 4, shelf_capacity: 220, pending_orders: 6, incoming_stock: 140 }
];
let mongoReady = false;

// 🔗 MongoDB connection
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      mongoReady = true;
      console.log("MongoDB connected");
    })
    .catch(err => console.log("MongoDB unavailable, using fallback inventory:", err.message));
} else {
  console.log("MONGO_URI missing, using fallback inventory");
}

const getInventoryRecord = async (sku_id) => {
  if (mongoReady) {
    const inventory = await Inventory.findOne({ sku_id });
    if (inventory) {
      return {
        sku_id: inventory.sku_id,
        current_stock: inventory.current_stock,
        lead_time_days: inventory.lead_time_days,
        shelf_capacity: 200,
        pending_orders: inventory.current_stock < 100 ? 5 : 2,
        incoming_stock: inventory.current_stock < 100 ? 120 : 60
      };
    }
  }

  return fallbackInventory.find(item => item.sku_id === sku_id);
};

const estimateDemand = ({ sku_id = "SKU1", month = 1, promotion = 0 }) => {
  const baseBySku = { SKU1: 34, SKU2: 26, SKU3: 42 };
  const seasonalLift = [11, 8, 5, 3, 6, 10, 14, 13, 7, 4, 9, 16][Number(month) - 1] || 6;
  const promoLift = Number(promotion) ? 15 : 0;

  return (baseBySku[sku_id] || 30) + seasonalLift + promoLift;
};

/* ------------------ BASIC ROUTES ------------------ */

// ✅ Test route
app.get("/", (req, res) => {
  res.send("API working");
});

// ✅ Get sample data
app.get("/data", async (req, res) => {
  if (!mongoReady) return res.json([]);

  const data = await Sales.find().limit(10);
  res.json(data);
});

// ✅ Aggregation
app.get("/total-sales", async (req, res) => {
  if (!mongoReady) return res.json([]);

  const result = await Sales.aggregate([
    {
      $group: {
        _id: "$sku_id",
        total_sales: { $sum: "$units_sold" }
      }
    }
  ]);

  res.json(result);
});

// ✅ Full data for ML
app.get("/ml-data", async (req, res) => {
  if (!mongoReady) return res.json([]);

  const data = await Sales.find();
  res.json(data);
});

/* ------------------ ML ROUTE ------------------ */

// ✅ Direct ML call
app.post("/predict-demand", async (req, res) => {
  try {
    const response = await axios.post(
      process.env.ML_API_URL || "http://127.0.0.1:8000/predict",
      req.body
    );

    res.json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Prediction failed" });
  }
});

/* ------------------ INVENTORY ROUTES ------------------ */

// 🔹 Seed inventory (run once)
app.get("/seed-inventory", async (req, res) => {
  try {
    await Inventory.deleteMany({});

    await Inventory.insertMany([
      { sku_id: "SKU1", current_stock: 100, lead_time_days: 3 },
      { sku_id: "SKU2", current_stock: 80, lead_time_days: 2 },
      { sku_id: "SKU3", current_stock: 120, lead_time_days: 4 }
    ]);

    res.send("Inventory seeded successfully");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Get inventory
app.get("/inventory", async (req, res) => {
  if (!mongoReady) return res.json(fallbackInventory);

  const data = await Inventory.find();
  res.json(data);
});

app.get("/dashboard-data", async (req, res) => {
  const inventory = mongoReady
    ? await Inventory.find()
    : fallbackInventory;

  const normalized = inventory.map(item => ({
    sku_id: item.sku_id,
    current_stock: item.current_stock,
    lead_time_days: item.lead_time_days,
    shelf_capacity: item.shelf_capacity || 200,
    pending_orders: item.pending_orders || (item.current_stock < 100 ? 4 : 2),
    incoming_stock: item.incoming_stock || (item.current_stock < 100 ? 120 : 70)
  }));

  res.json({
    hub: "Delhi Hub",
    inventory: normalized,
    totals: {
      skus: normalized.length,
      current_stock: normalized.reduce((sum, item) => sum + item.current_stock, 0),
      capacity: normalized.reduce((sum, item) => sum + item.shelf_capacity, 0),
      pending_orders: normalized.reduce((sum, item) => sum + item.pending_orders, 0),
      incoming_stock: normalized.reduce((sum, item) => sum + item.incoming_stock, 0)
    }
  });
});

/* ------------------ FINAL CORE API ------------------ */

// 🚀 Inventory + ML + IEM logic
app.post("/inventory-analysis", async (req, res) => {
  try {
    console.log("Request:", req.body);

    // 🔮 Step 1: ML Prediction
    let predictedDemand;
    let predictionSource = "ml";

    try {
      const mlResponse = await axios.post(
        process.env.ML_API_URL || "http://127.0.0.1:8000/predict",
        req.body
      );

      predictedDemand = mlResponse.data.prediction;
    } catch (err) {
      predictionSource = "estimate";
      predictedDemand = estimateDemand(req.body);
    }

    console.log("Predicted Demand:", predictedDemand);

    // 📦 Step 2: Get inventory
    const inventory = await getInventoryRecord(req.body.sku_id);

    if (!inventory) {
      return res.status(400).json({ error: "Inventory not found" });
    }

    const currentStock = inventory.current_stock;
    const L = inventory.lead_time_days;
    const shelfCapacity = inventory.shelf_capacity || 200;

    // 📊 Step 3: Safety Stock
    const Z = 1.65; // 95% service level
    const sigma = predictedDemand * 0.2; // assume 20% variability

    const safetyStock = Z * sigma * Math.sqrt(L);

    // 📦 Step 4: Reorder Point
    const reorderPoint = predictedDemand * L + safetyStock;

    // 🚨 Step 5: Risk calculation
    const risk = currentStock < reorderPoint ? "HIGH" : "LOW";

    // ✅ Final response
    res.json({
      sku_id: req.body.sku_id,
      predictedDemand: Number(predictedDemand.toFixed(2)),
      safetyStock: Number(safetyStock.toFixed(2)),
      reorderPoint: Number(reorderPoint.toFixed(2)),
      currentStock,
      shelfCapacity,
      leadTimeDays: L,
      pendingOrders: inventory.pending_orders || (risk === "HIGH" ? 5 : 2),
      incomingStock: inventory.incoming_stock || (risk === "HIGH" ? 120 : 70),
      stockoutGap: Number(Math.max(reorderPoint - currentStock, 0).toFixed(2)),
      utilization: Number(((currentStock / shelfCapacity) * 100).toFixed(1)),
      risk,
      predictionSource
    });

  } catch (err) {
    console.error("ERROR:", err.message);
    res.status(500).json({ error: "Failed" });
  }
});

/* ------------------ START SERVER ------------------ */

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
