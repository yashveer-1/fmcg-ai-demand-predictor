function TopNavbar({
  inventory,
  selectedSku
}) {
  const totalStock = inventory.reduce(
    (sum, item) => sum + (Number(item.current_stock) || 0),
    0
  );

  return (
    <div className="top-navbar">
      <div className="logo-section">
        <h2>FMCG Inventory Dashboard</h2>
        <span>Warehouse shelf intelligence</span>
      </div>

      <div className="nav-summary" aria-label="Dashboard summary">
        <div>
          <span>Selected SKU</span>
          <strong>{selectedSku}</strong>
        </div>
        <div>
          <span>Total Stock</span>
          <strong>{totalStock || "--"}</strong>
        </div>
        <div>
          <span>SKU Count</span>
          <strong>{inventory.length || "--"}</strong>
        </div>
      </div>
    </div>
  );
}

export default TopNavbar;
