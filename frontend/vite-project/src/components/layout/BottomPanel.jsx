function BottomPanel({ result, dashboardData, selectedInventory }) {
  const shelfCapacity = result?.shelfCapacity ?? selectedInventory?.shelf_capacity ?? 200;
  const currentStock = result?.currentStock ?? selectedInventory?.current_stock ?? 0;
  const predictedDemand = result?.predictedDemand ?? 0;

  const shelfUtilization = shelfCapacity
    ? ((currentStock / shelfCapacity) * 100).toFixed(1)
    : 0;

  const demandFulfillment = predictedDemand
    ? Math.min(
        (currentStock / predictedDemand) *
        100,
        100
      ).toFixed(1)
    : 0;

  const health =
    result
      ? result.risk === "LOW"
        ? "HEALTHY"
        : result.risk === "MODERATE"
          ? "WATCH"
          : "CRITICAL"
      : "N/A";
  const leadTimePassed = (result?.leadTimeDays ?? selectedInventory?.lead_time_days ?? 0) <= 4;
  const capacityPassed = Number(shelfUtilization) <= 95;
  const reorderPassed = result ? result.currentStock >= result.reorderPoint : true;
  const pendingOrders = result?.pendingOrders ?? selectedInventory?.pending_orders ?? dashboardData?.totals?.pending_orders ?? 0;
  const incomingStock = result?.incomingStock ?? selectedInventory?.incoming_stock ?? dashboardData?.totals?.incoming_stock ?? 0;

  return (
    <div className="bottom">
      <div className="panel bottom-card">
        <h3 className="bottom-title">Utilization</h3>
        <div className="stat-card">
          <span>Shelf Utilization</span>
          <h1>{shelfUtilization}%</h1>
          <div className="bar">
            <div
              className="fill blue"
              style={{ width: `${Math.min(shelfUtilization, 100)}%` }}
            />
          </div>
        </div>
        <div className="stat-card">
          <span>Demand Fulfillment</span>
          <h1>{demandFulfillment}%</h1>
          <div className="bar">
            <div
              className="fill green"
              style={{ width: `${Math.min(demandFulfillment, 100)}%` }}
            />
          </div>
        </div>
        <div className="health-box">
          <span>Inventory Health</span>
          <p
            className={
              health === "HEALTHY"
                ? "health-good"
                : health === "WATCH"
                  ? "health-moderate"
                  : "health-bad"
            }
          >
            {health}
          </p>
        </div>
      </div>
      <div className="panel bottom-card constraint-panel">
        <h3 className="bottom-title">Constraint Check</h3>
        <div className="constraint-item">
          <span>Lead Time</span>
          <p className={leadTimePassed ? "passed" : "failed"}>{leadTimePassed ? "Passed" : "Review"}</p>
        </div>
        <div className="constraint-item">
          <span>Shelf Capacity</span>
          <p className={capacityPassed ? "passed" : "failed"}>{capacityPassed ? "Passed" : "Review"}</p>
        </div>
        <div className="constraint-item">
          <span>Reorder Logic</span>
          <p className={reorderPassed ? "passed" : "failed"}>{reorderPassed ? "Passed" : "Restock"}</p>
        </div>
        <div className="constraint-item">
          <span>Stock Validation</span>
          <p className={currentStock >= 0 ? "passed" : "failed"}>{currentStock >= 0 ? "Passed" : "Invalid"}</p>
        </div>
      </div>
      <div className="panel bottom-card">
        <h3 className="bottom-title">Orders</h3>
        <div className="order-box">
          <span>Pending Orders</span>
          <h2>{pendingOrders}</h2>
        </div>
        <div className="order-box">
          <span>Incoming Stock</span>
          <h2>{incomingStock}</h2>
        </div>
        <div className={
          result?.risk === "HIGH"
            ? "priority-box"
            : result?.risk === "MODERATE"
              ? "priority-box watch"
              : "priority-box calm"
        }>
          {result?.risk === "HIGH"
            ? "HIGH PRIORITY"
            : result?.risk === "MODERATE"
              ? "BUFFER WATCH"
              : "NORMAL PRIORITY"}
        </div>
      </div>
    </div>
  );
}

export default BottomPanel;
