import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import Sales from "./src/models/schema.js";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 5000;

// 🔗 MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// ✅ Test route
app.get("/", (req, res) => {
  res.send("API working");
});

// ✅ Get data
app.get("/data", async (req, res) => {
  const data = await Sales.find().limit(10);
  res.json(data);
});

// ✅ Aggregation (IMPORTANT)
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
app.get("/ml-data", async (req, res) => {
  const data = await Sales.find();
  res.json(data);
});

app.post("/predict-demand", async (req, res) => {
  try {
    const response = await axios.post(
      "http://localhost:8000/predict",
      req.body
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Prediction failed" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});