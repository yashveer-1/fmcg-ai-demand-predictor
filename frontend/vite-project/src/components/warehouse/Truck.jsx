import { useCursor } from "@react-three/drei";
import { useState } from "react";

function Truck({ incomingStock = 0, risk = "LOW", onFocus }) {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);
  const active = risk === "HIGH";

  return (
    <group
      position={[8, 1, 2.8]}
      rotation={[0, -0.2, 0]}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
        onFocus?.(`Dispatch: ${incomingStock || 0} incoming units`);
      }}
      onPointerOut={(event) => {
        event.stopPropagation();
        setHovered(false);
        onFocus?.(null);
      }}
    >

      <mesh castShadow>

        <boxGeometry args={[4, 2, 2]} />

        <meshStandardMaterial
          color={active ? "#ef4444" : "#2563eb"}
          emissive={hovered ? "#0f766e" : "#000000"}
          emissiveIntensity={hovered ? 0.18 : 0}
          roughness={0.5}
        />

      </mesh>

      <mesh castShadow position={[2.5, 0.3, 0]}>

        <boxGeometry args={[1.5, 1.5, 2]} />

        <meshStandardMaterial color={active ? "#b91c1c" : "#1d4ed8"} roughness={0.45} />

      </mesh>

      {[
        [-1.2, -1, 1],
        [1.2, -1, 1],
        [-1.2, -1, -1],
        [1.2, -1, -1]
      ].map((pos, i) => (

        <mesh key={i} castShadow position={pos} rotation={[Math.PI / 2, 0, 0]}>

          <cylinderGeometry args={[0.4, 0.4, 0.4, 32]} />

          <meshStandardMaterial color="#020617" roughness={0.7} />

        </mesh>

      ))}

      <mesh position={[-0.3, 0.15, 1.04]}>
        <boxGeometry args={[2.4, 0.12, 0.04]} />
        <meshStandardMaterial color="#e2e8f0" emissive="#334155" emissiveIntensity={0.25} />
      </mesh>

    </group>
  );
}

export default Truck;
