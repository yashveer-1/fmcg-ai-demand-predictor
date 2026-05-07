function TopNavbar({
  activeTab,
  setActiveTab,
  inventory,
  selectedSku,
  onSelectSku
}) {
  const tabs = ["Overview", "Demand", "Inventory", "Warehouse", "Analytics"];
  const skuList = (inventory.length
    ? inventory
    : [{ sku_id: "SKU1" }, { sku_id: "SKU2" }, { sku_id: "SKU3" }]
  ).filter((item, index, list) =>
    list.findIndex(nextItem => nextItem.sku_id === item.sku_id) === index
  );

  return (
    <div className="top-navbar">
      <div className="logo-section">
        <h2>FMCG Inventory Dashboard</h2>
      </div>

      <div className="nav-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? "nav-btn active-nav" : "nav-btn"}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="sku-nav" aria-label="SKU list">
        {skuList.map((item) => (
          <button
            key={item.sku_id}
            className={selectedSku === item.sku_id ? "sku-chip active-sku" : "sku-chip"}
            onClick={() => onSelectSku(item.sku_id)}
          >
            {item.sku_id}
          </button>
        ))}
      </div>
    </div>
  );
}

export default TopNavbar;
