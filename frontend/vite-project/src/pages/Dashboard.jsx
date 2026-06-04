import { useEffect, useMemo, useState } from "react";

import LeftPanel from "../components/layout/LeftPanel";
import MiddlePanel from "../components/layout/MiddlePanel";
import RightPanel from "../components/layout/RightPanel";
import BottomPanel from "../components/layout/BottomPanel";
import TopNavbar from "../components/layout/TopNavBar";
import { analyzeInventory, getDashboardData } from "../api/api";

import "../styles/dashboard.css";

const initialForm = {
  sku_id: "SKU1",
  region: "Delhi",
  day: 10,
  month: 1,
  promotion: 1
};

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getRowValue = (row, keys, fallback = undefined) => {
  const key = keys.find(item => row[item] !== undefined && row[item] !== "");
  return key ? row[key] : fallback;
};

const createAnalysisPayload = (form, inventoryItem) => ({
  ...form,
  current_stock: inventoryItem?.current_stock,
  lead_time_days: inventoryItem?.lead_time_days,
  shelf_capacity: inventoryItem?.shelf_capacity,
  pending_orders: inventoryItem?.pending_orders,
  incoming_stock: inventoryItem?.incoming_stock
});

const getRiskLevel = (currentStock, reorderPoint) => {
  if (!Number.isFinite(currentStock) || !Number.isFinite(reorderPoint) || reorderPoint <= 0) {
    return "LOW";
  }

  if (currentStock < reorderPoint) return "HIGH";
  if (currentStock < reorderPoint * 1.25) return "MODERATE";
  return "LOW";
};

const normalizeAnalysis = (analysis, inventoryItem) => {
  if (!analysis) return null;

  const currentStock = inventoryItem?.current_stock ?? analysis.currentStock;
  const leadTimeDays = inventoryItem?.lead_time_days ?? analysis.leadTimeDays ?? 3;
  const shelfCapacity = inventoryItem?.shelf_capacity ?? analysis.shelfCapacity ?? 200;
  const predictedDemand = analysis.predictedDemand ?? 0;
  const safetyStock = Number((predictedDemand * 0.2 * 1.65 * Math.sqrt(leadTimeDays)).toFixed(2));
  const reorderPoint = Number((predictedDemand * leadTimeDays + safetyStock).toFixed(2));
  const risk = analysis.risk ?? getRiskLevel(currentStock, reorderPoint);
  const stockBuffer = Number((currentStock - reorderPoint).toFixed(2));

  return {
    ...analysis,
    currentStock,
    leadTimeDays,
    shelfCapacity,
    safetyStock,
    reorderPoint,
    risk,
    pendingOrders: inventoryItem?.pending_orders ?? analysis.pendingOrders,
    incomingStock: inventoryItem?.incoming_stock ?? analysis.incomingStock,
    stockoutGap: Number(Math.max(reorderPoint - currentStock, 0).toFixed(2)),
    stockBuffer,
    utilization: Number(((currentStock / shelfCapacity) * 100).toFixed(1))
  };
};

const parseInventoryCsv = (text) => {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  const normalizeHeader = (header) =>
    header.trim().replace(/([a-z])([A-Z])/g, "$1_$2").replace(/[\s-]+/g, "_").toLowerCase();
  const headers = lines[0].split(",").map(normalizeHeader);

  return lines.slice(1).map((line, index) => {
    const values = line.split(",").map(value => value.trim());
    const row = headers.reduce((acc, header, valueIndex) => ({
      ...acc,
      [header]: values[valueIndex]
    }), {});

    return {
      sku_id: getRowValue(row, ["sku_id", "sku", "skuId"], `SKU${index + 1}`),
      region: getRowValue(row, ["region", "zone", "hub"], initialForm.region),
      day: toNumber(getRowValue(row, ["day", "sales_day"], initialForm.day), initialForm.day),
      month: toNumber(getRowValue(row, ["month", "sales_month"], initialForm.month), initialForm.month),
      promotion: toNumber(getRowValue(row, ["promotion", "promo", "is_promo"], initialForm.promotion), initialForm.promotion),
      current_stock: toNumber(getRowValue(row, ["current_stock", "stock", "on_hand", "quantity", "units"], 0), 0),
      lead_time_days: toNumber(getRowValue(row, ["lead_time_days", "lead_time", "lead_days"], 3), 3),
      shelf_capacity: toNumber(getRowValue(row, ["shelf_capacity", "capacity", "max_capacity"], 200), 200),
      pending_orders: toNumber(getRowValue(row, ["pending_orders", "orders_pending", "open_orders"], 0), 0),
      incoming_stock: toNumber(getRowValue(row, ["incoming_stock", "incoming", "inbound"], 0), 0)
    };
  });
};

function Dashboard() {
  const [result, setResult] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(initialForm);
  const [uploadedFileName, setUploadedFileName] = useState("");

  const inventory = useMemo(
    () => dashboardData?.inventory || [],
    [dashboardData]
  );

  const selectedInventory = useMemo(
    () => inventory.find(item => item.sku_id === form.sku_id),
    [form.sku_id, inventory]
  );

  const buildSkuForm = (sku_id, sourceInventory = inventory) => {
    const item = sourceInventory.find(nextItem => nextItem.sku_id === sku_id);

    return {
      ...form,
      sku_id,
      region: item?.region ?? form.region,
      day: item?.day ?? form.day,
      month: item?.month ?? form.month,
      promotion: item?.promotion ?? form.promotion
    };
  };

  const handleSubmit = async (nextForm = form) => {
    setLoading(true);
    setError("");

    try {
      const inventoryItem = inventory.find(item => item.sku_id === nextForm.sku_id);
      const res = await analyzeInventory(createAnalysisPayload(nextForm, inventoryItem));
      setResult(normalizeAnalysis(res.data, inventoryItem));
    } catch (err) {
      console.log(err);
      setError("Backend is not reachable yet. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [dashboardRes, analysisRes] = await Promise.all([
          getDashboardData(),
          analyzeInventory(initialForm)
        ]);

        setDashboardData(dashboardRes.data);
        const inventoryItem = dashboardRes.data.inventory?.find(item => item.sku_id === initialForm.sku_id);
        setResult(normalizeAnalysis(analysisRes.data, inventoryItem));
    } catch (err) {
      console.log(err);
      setError("Dashboard data could not be loaded from the hosted backend.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const handleCsvUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsedInventory = parseInventoryCsv(text);

      if (!parsedInventory.length) {
        setError("CSV needs at least sku_id and current_stock columns.");
        return;
      }

      const nextSku = parsedInventory[0].sku_id;
      const nextForm = buildSkuForm(nextSku, parsedInventory);

      setUploadedFileName(file.name);
      setForm(nextForm);
      setDashboardData({
        hub: "Uploaded SKU Set",
        inventory: parsedInventory,
        totals: {
          skus: parsedInventory.length,
          current_stock: parsedInventory.reduce((sum, item) => sum + item.current_stock, 0),
          capacity: parsedInventory.reduce((sum, item) => sum + item.shelf_capacity, 0),
          pending_orders: parsedInventory.reduce((sum, item) => sum + item.pending_orders, 0),
          incoming_stock: parsedInventory.reduce((sum, item) => sum + item.incoming_stock, 0)
        }
      });

      setError("");
      setLoading(true);
      const res = await analyzeInventory(createAnalysisPayload(nextForm, parsedInventory[0]));
      setResult(normalizeAnalysis(res.data, parsedInventory[0]));
    } catch (err) {
      console.log(err);
      setError("CSV upload failed. Use columns like sku_id,current_stock,lead_time_days,shelf_capacity.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!result) return;

    const rows = [
      ["sku_id", "current_stock", "predicted_demand", "safety_stock", "reorder_point", "stock_buffer", "risk", "pending_orders", "incoming_stock"],
      [
        form.sku_id,
        result.currentStock,
        result.predictedDemand,
        result.safetyStock,
        result.reorderPoint,
        result.stockBuffer,
        result.risk,
        result.pendingOrders ?? "",
        result.incomingStock ?? ""
      ]
    ];
    const csv = rows.map(row => row.join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${form.sku_id}-inventory-report.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="dashboard">
      <TopNavbar
        inventory={inventory}
        selectedSku={form.sku_id}
      />

      {error && <div className="app-banner">{error}</div>}

      <div className="main">
        <LeftPanel
          form={form}
          setForm={setForm}
          onSubmit={handleSubmit}
          result={result}
          inventory={inventory}
          selectedInventory={selectedInventory}
          loading={loading}
          onCsvUpload={handleCsvUpload}
          uploadedFileName={uploadedFileName}
        />
        <MiddlePanel
          result={result}
          inventory={inventory}
          selectedSku={form.sku_id}
        />
        <RightPanel
          result={result}
          selectedInventory={selectedInventory}
          onExport={handleExport}
        />
      </div>

      <BottomPanel
        result={result}
        dashboardData={dashboardData}
        selectedInventory={selectedInventory}
      />
    </div>
  );
}

export default Dashboard;
