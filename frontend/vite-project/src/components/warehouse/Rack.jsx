import ProductBox from "./ProductBox";

const palette = ["#38bdf8", "#34d399", "#f59e0b", "#fb7185", "#a78bfa", "#22d3ee"];

function Rack({
  position,
  item,
  selected,
  analysis,
  onFocus
}) {
  const currentStock = analysis?.currentStock ?? item?.current_stock ?? 0;
  const capacity = analysis?.shelfCapacity ?? item?.shelf_capacity ?? 200;
  const fillRatio = capacity ? Math.min(currentStock / capacity, 1) : 0;
  const visibleBoxes = Math.max(1, Math.ceil(fillRatio * 6));
  const risk = analysis?.risk === "HIGH";
  const shelfColor = risk && selected ? "#dc2626" : selected ? "#2563eb" : "#1f3b57";
  const positions = [
    [-1, 0.9, 0],
    [0, 0.9, 0],
    [1, 0.9, 0],
    [-1, 2.2, 0],
    [0, 2.2, 0],
    [1, 2.2, 0]
  ];

  return (
    <group position={position}>
      <mesh castShadow position={[-1.5, 2, 0]}>
        <boxGeometry args={[0.1, 4, 1]} />
        <meshStandardMaterial color={selected ? "#93c5fd" : "#64748b"} metalness={0.35} roughness={0.35} />
      </mesh>
      <mesh castShadow position={[1.5, 2, 0]}>
        <boxGeometry args={[0.1, 4, 1]} />
        <meshStandardMaterial color={selected ? "#93c5fd" : "#64748b"} metalness={0.35} roughness={0.35} />
      </mesh>
      {[0.5, 1.8, 3.1].map((y, i) => (
        <mesh key={i} castShadow position={[0, y, 0]}>
          <boxGeometry args={[3.2, 0.1, 1]} />
          <meshStandardMaterial color={shelfColor} metalness={0.2} roughness={0.42} />
        </mesh>
      ))}
      {positions.slice(0, visibleBoxes).map((boxPosition, index) => (
        <ProductBox
          key={boxPosition.join("-")}
          position={boxPosition}
          color={risk && selected ? "#f97316" : palette[index]}
          label={item?.sku_id || `SKU${index + 1}`}
          quantity={Math.round(currentStock / visibleBoxes)}
          selected={selected}
          onFocus={onFocus}
        />
      ))}
      <mesh position={[0, 4.05, 0]}>
        <boxGeometry args={[3.4, 0.12, 1.1]} />
        <meshStandardMaterial color={risk && selected ? "#ef4444" : "#14b8a6"} emissive={risk && selected ? "#450a0a" : "#052e2b"} emissiveIntensity={0.35} />
      </mesh>
    </group>
  );
}

export default Rack;
