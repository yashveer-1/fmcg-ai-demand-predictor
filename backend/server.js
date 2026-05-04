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

// 🔗 MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

/* ------------------ BASIC ROUTES ------------------ */

// ✅ Test route
app.get("/", (req, res) => {
  res.send("API working");
});

// ✅ Get sample data
app.get("/data", async (req, res) => {
  const data = await Sales.find().limit(10);
  res.json(data);
});

// ✅ Aggregation
app.get("/total-sales", async (req, res) => {
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
  const data = await Inventory.find();
  res.json(data);
});

/* ------------------ FINAL CORE API ------------------ */

// 🚀 Inventory + ML + IEM logic
app.post("/inventory-analysis", async (req, res) => {
  try {
    console.log("Request:", req.body);

    // 🔮 Step 1: ML Prediction
    const mlResponse = await axios.post(
      process.env.ML_API_URL || "http://127.0.0.1:8000/predict",
      req.body
    );

    const predictedDemand = mlResponse.data.prediction;
    console.log("Predicted Demand:", predictedDemand);

    // 📦 Step 2: Get inventory
    const inventory = await Inventory.findOne({
      sku_id: req.body.sku_id
    });

    if (!inventory) {
      return res.status(400).json({ error: "Inventory not found" });
    }

    const currentStock = inventory.current_stock;
    const L = inventory.lead_time_days;

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
      risk
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