import Floor from "./Floor";
import Rack from "./Rack";
import Truck from "./Truck";
import Labels from "./Labels";

function WarehouseScene({
  inventory,
  result,
  selectedSku,
  onZoneFocus
}) {
  const rackInventory = inventory.length
    ? inventory
    : [
        { sku_id: "SKU1", current_stock: 100, shelf_capacity: 180 },
        { sku_id: "SKU2", current_stock: 80, shelf_capacity: 160 },
        { sku_id: "SKU3", current_stock: 120, shelf_capacity: 220 }
      ];
  const rackPositions = [-5, 0, 5];

  return (
    <>

      <Floor />

      {rackInventory.map((item, index) => (
        <Rack
          key={item.sku_id}
          position={[rackPositions[index] ?? index * 4 - 5, 0, -1.2]}
          item={item}
          selected={item.sku_id === selectedSku}
          analysis={item.sku_id === selectedSku ? result : null}
          onFocus={onZoneFocus}
        />
      ))}

      <Truck
        incomingStock={result?.incomingStock}
        risk={result?.risk}
        onFocus={onZoneFocus}
      />

      <Labels
        selectedSku={selectedSku}
        result={result}
      />

    </>
  );
}

export default WarehouseScene;
