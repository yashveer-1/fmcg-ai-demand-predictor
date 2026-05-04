import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema({
  sku_id: {
    type: String,
    required: true,
    trim: true
  },
  current_stock: {
    type: Number,
    required: true,
    min: 0
  },
  lead_time_days: {
    type: Number,
    required: true,
    min: 0
  }
}, { timestamps: true });

const Inventory = mongoose.model("Inventory", inventorySchema);

export default Inventory;