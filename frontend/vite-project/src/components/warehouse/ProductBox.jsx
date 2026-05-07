import { Html, useCursor } from "@react-three/drei";
import { useState } from "react";

function ProductBox({
  position,
  color,
  label,
  selected,
  quantity,
  onFocus
}) {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  return (
    <group position={position}>
      <mesh
        castShadow
        scale={selected ? 1.14 : hovered ? 1.08 : 1}
        onPointerOver={(event) => {
          event.stopPropagation();
          setHovered(true);
          onFocus?.(`${label}: ${quantity} units`);
        }}
        onPointerOut={(event) => {
          event.stopPropagation();
          setHovered(false);
          onFocus?.(null);
        }}
        onClick={(event) => {
          event.stopPropagation();
          onFocus?.(`${label} selected: ${quantity} units`);
        }}
      >
        <boxGeometry args={[0.66, 0.56, 0.66]} />
        <meshStandardMaterial
          color={color}
          emissive={selected || hovered ? color : "#000000"}
          emissiveIntensity={selected ? 0.25 : hovered ? 0.12 : 0}
          roughness={0.55}
        />
      </mesh>
      {selected && (
        <Html distanceFactor={12} position={[0, 0.62, 0]} center>
          <div className="box-tag">{label}</div>
        </Html>
      )}
    </group>
  );
}

export default ProductBox;
