function RightPanel({ result, selectedInventory, onExport }) {
  const displayRisk = {
    HIGH: "HIGH RISK",
    MODERATE: "MODERATE RISK",
    LOW: "LOW RISK"
  };
  const riskLevel =
    result
      ? displayRisk[result.risk] ?? "LOW RISK"
      : selectedInventory
        ? "READY"
        : "NO DATA";

  const recommendation =
    result
      ? result.risk === "HIGH"
        ? `Order ${Math.ceil(result.stockoutGap || 0)} units above current stock buffer.`
        : result.risk === "MODERATE"
          ? `Maintain watch: buffer is ${Math.max(Math.round(result.stockBuffer || 0), 0)} units above reorder point.`
          : "Inventory levels are healthy for the selected lead time."
      : "Run inventory analysis to calculate demand and reorder point.";

  return (
    <div className="panel right-panel">
      <div className="panel-heading">
        <p className="eyebrow">Decision Layer</p>
        <h2 className="panel-title">Analysis</h2>
      </div>
      <div className="analysis-card">
        <span className="analysis-label">
          Risk Level
        </span>
        <h1
          className={
            riskLevel === "HIGH RISK"
              ? "risk-high"
              : riskLevel === "MODERATE RISK"
                ? "risk-moderate"
                : riskLevel === "NO DATA"
                  ? "risk-muted"
                  : "risk-safe"
          }
        >
          {riskLevel}
        </h1>
      </div>
      <div className="analysis-card">
        <span className="analysis-label">
          Predicted Demand
        </span>
        <h2>
          {result
            ? Math.round(result.predictedDemand)
            : "--"}
        </h2>
        {result?.predictionSource && (
          <small>{result.predictionSource === "ml" ? "ML forecast" : "Estimated fallback"}</small>
        )}
      </div>
      <div className="analysis-card">
        <span className="analysis-label">
          Current Inventory
        </span>
        <h2>
          {result
            ? result.currentStock
            : selectedInventory?.current_stock ?? "--"}
        </h2>
      </div>
      <div className="recommendation-box">
        <p className="recommendation-title">
          Recommendation
        </p>
        <p className="recommendation-text">
          {recommendation}
        </p>
      </div>
      <div
        className={
          riskLevel === "HIGH RISK"
            ? "alert-box danger"
            : riskLevel === "MODERATE RISK"
              ? "alert-box warning"
              : "alert-box safe"
        }
      >
        {riskLevel === "HIGH RISK"
          ? "Restock Required"
          : riskLevel === "MODERATE RISK"
            ? "Monitor Buffer"
            : "Inventory Stable"}
      </div>
      <button
        className="export-btn"
        disabled={!result}
        onClick={onExport}
      >
        Export CSV
      </button>
    </div>
  );
}

export default RightPanel;
