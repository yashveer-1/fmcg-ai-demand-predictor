function LeftPanel({
  form,
  setForm,
  onSubmit,
  result,
  inventory,
  selectedInventory,
  loading,
  onCsvUpload,
  uploadedFileName
}) {
  const skuList = (inventory.length
    ? inventory
    : [{ sku_id: "SKU1" }, { sku_id: "SKU2" }, { sku_id: "SKU3" }]
  ).filter((item, index, list) =>
    list.findIndex(nextItem => nextItem.sku_id === item.sku_id) === index
  );

  const handleChange = (e) => {
    const selectedItem = e.target.name === "sku_id"
      ? inventory.find(item => item.sku_id === e.target.value)
      : null;
    const nextForm = {
      ...form,
      [e.target.name]: e.target.value,
      ...(selectedItem
        ? {
            region: selectedItem.region ?? form.region,
            day: selectedItem.day ?? form.day,
            month: selectedItem.month ?? form.month,
            promotion: selectedItem.promotion ?? form.promotion
          }
        : {})
    };

    setForm(nextForm);

    if (e.target.name === "sku_id") {
      onSubmit(nextForm);
    }
  };

  const stock = result?.currentStock ?? selectedInventory?.current_stock ?? 0;
  const capacity = result?.shelfCapacity ?? selectedInventory?.shelf_capacity ?? 200;
  const utilization = capacity ? Math.min((stock / capacity) * 100, 100) : 0;
  const status = result
    ? result.risk === "HIGH"
      ? "Restock Required"
      : result.risk === "MODERATE"
        ? "Buffer Watch"
        : "Shelf Stable"
    : "Select a SKU to analyze";

  return (
    <div className="panel left-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Shelf Controls</p>
          <h2 className="panel-title">SKU Details</h2>
        </div>
      </div>

      <div className="sku-picker">
        {skuList.map((item) => (
          <button
            key={item.sku_id}
            className={form.sku_id === item.sku_id ? "sku-option active-sku" : "sku-option"}
            onClick={() => {
              const nextForm = {
                ...form,
                sku_id: item.sku_id,
                region: item.region ?? form.region,
                day: item.day ?? form.day,
                month: item.month ?? form.month,
                promotion: item.promotion ?? form.promotion
              };
              setForm(nextForm);
              onSubmit(nextForm);
            }}
          >
            {item.sku_id}
          </button>
        ))}
      </div>

      <div className="form-grid">
        <div className="field-group">
          <label htmlFor="promotion">Promo</label>
          <select
            id="promotion"
            name="promotion"
            value={form.promotion}
            onChange={handleChange}
            className="input-box"
          >
            <option value="1">Active</option>
            <option value="0">Off</option>
          </select>
        </div>

        <div className="field-group">
          <label htmlFor="day">Day</label>
          <input
            id="day"
            min="1"
            max="31"
            name="day"
            type="number"
            value={form.day}
            onChange={handleChange}
            className="input-box"
          />
        </div>

        <div className="field-group">
          <label htmlFor="month">Month</label>
          <input
            id="month"
            min="1"
            max="12"
            name="month"
            type="number"
            value={form.month}
            onChange={handleChange}
            className="input-box"
          />
        </div>
      </div>

      <div className={`status-box ${
        result?.risk === "HIGH"
          ? "status-danger"
          : result?.risk === "MODERATE"
            ? "status-warning"
            : "status-good"
      }`}>
        <span>{status}</span>
        <strong>{form.sku_id}</strong>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <p>Current Stock</p>
          <h3>{stock}</h3>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${utilization}%` }}
            />
          </div>
        </div>

        <div className="metric-card">
          <p>Predicted Demand</p>
          <h3>{result ? result.predictedDemand : "--"}</h3>
          <div className="progress-bar">
            <div
              className="progress-fill red"
              style={{
                width: result
                  ? `${Math.min(result.predictedDemand, 100)}%`
                  : "0%"
              }}
            />
          </div>
        </div>

        <div className="metric-card">
          <p>Safety Stock</p>
          <h3>{result ? result.safetyStock : "--"}</h3>
        </div>

        <div className="metric-card">
          <p>ROP</p>
          <h3>{result ? result.reorderPoint : "--"}</h3>
        </div>
      </div>

      <button
        className="analyze-btn"
        disabled={loading}
        onClick={() => onSubmit(form)}
      >
        {loading ? "Analyzing..." : "Analyze Shelf"}
      </button>

      <div className="upload-card">
        <div>
          <p className="upload-title">Upload CSV</p>
          <span>{uploadedFileName || "sku_id,current_stock,lead_time_days"}</span>
        </div>
        <label className="file-button">
          Choose File
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={onCsvUpload}
          />
        </label>
      </div>
    </div>
  );
}

export default LeftPanel;
