import { Html } from "@react-three/drei";
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
  const maxVisibleBoxes = 24;
  const visibleBoxes = Math.max(1, Math.ceil(fillRatio * maxVisibleBoxes));
  const risk = analysis?.risk;
  const highRisk = risk === "HIGH";
  const moderateRisk = risk === "MODERATE";
  const shelfColor = highRisk && selected
    ? "#dc2626"
    : moderateRisk && selected
      ? "#d97706"
      : selected
        ? "#2563eb"
        : "#1f3b57";
  const unitsPerBox = Math.max(1, Math.round(currentStock / visibleBoxes));
  const positions = Array.from({ length: maxVisibleBoxes }, (_, index) => {
    const perShelf = 8;
    const shelf = Math.floor(index / perShelf);
    const shelfIndex = index % perShelf;
    const column = shelfIndex % 4;
    const depth = Math.floor(shelfIndex / 4);

    return [
      -1.12 + column * 0.75,
      0.86 + shelf * 1.08,
      -0.28 + depth * 0.56
    ];
  });

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
          color={highRisk && selected ? "#f97316" : moderateRisk && selected ? "#fbbf24" : palette[index % palette.length]}
          label={item?.sku_id || `SKU${index + 1}`}
          quantity={unitsPerBox}
          selected={selected}
          onFocus={onFocus}
        />
      ))}
      {selected && (
        <Html distanceFactor={13} position={[0, 3.82, 0.68]} center>
          <div className={`rack-tag ${
            highRisk
              ? "rack-tag-danger"
              : moderateRisk
                ? "rack-tag-warning"
                : "rack-tag-safe"
          }`}>
            <strong>{item?.sku_id}</strong>
            <span>{currentStock}u</span>
          </div>
        </Html>
      )}
      <mesh position={[0, 4.05, 0]}>
        <boxGeometry args={[3.4, 0.12, 1.1]} />
        <meshStandardMaterial
          color={highRisk && selected ? "#ef4444" : moderateRisk && selected ? "#f59e0b" : "#14b8a6"}
          emissive={highRisk && selected ? "#450a0a" : moderateRisk && selected ? "#451a03" : "#052e2b"}
          emissiveIntensity={0.35}
        />
      </mesh>
    </group>
  );
}

export default Rack;
