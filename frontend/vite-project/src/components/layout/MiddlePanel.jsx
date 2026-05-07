import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, Environment, PerspectiveCamera } from "@react-three/drei";
import { Suspense, useMemo, useState } from "react";

import WarehouseScene from "../warehouse/WarehouseScene";

import "../../styles/warehouse.css";

function MiddlePanel({ result, inventory, selectedSku }) {
  const [activeZone, setActiveZone] = useState(null);
  const sceneSummary = useMemo(() => {
    const selectedItem = inventory.find(item => item.sku_id === selectedSku);
    const stock = result?.currentStock ?? selectedItem?.current_stock ?? 0;
    const capacity = result?.shelfCapacity ?? selectedItem?.shelf_capacity ?? 200;

    return {
      stock,
      capacity,
      utilization: capacity ? Math.round((stock / capacity) * 100) : 0,
      risk: result?.risk || "LOW"
    };
  }, [inventory, result, selectedSku]);

  return (
    <div className="panel middle-panel">

      <div className="warehouse-header">
        <div>
          <p className="eyebrow">Interactive Layout</p>
          <h2 className="panel-title">3D Warehouse</h2>
        </div>

        <div className="scene-stats">
          <span>{selectedSku}</span>
          <strong>{sceneSummary.utilization}% full</strong>
        </div>
      </div>

      <div className="visual-box">
        <div className="scene-overlay">
          <span>{activeZone || "Drag to orbit, scroll to zoom, select boxes"}</span>
        </div>

        <Canvas shadows dpr={[1, 2]}>
          <PerspectiveCamera makeDefault position={[7, 6, 12]} fov={46} />

          <color attach="background" args={["#06101d"]} />
          <ambientLight intensity={0.55} />

          <directionalLight
            castShadow
            position={[8, 12, 8]}
            intensity={1.8}
            shadow-mapSize={[1024, 1024]}
          />
          <pointLight position={[-6, 4, -5]} intensity={1.2} color="#14b8a6" />

          <Environment preset="warehouse" />

          <Grid
            args={[30, 30]}
            cellSize={1}
            cellThickness={1}
            sectionSize={5}
            fadeDistance={50}
            fadeStrength={1.5}
          />

          <Suspense fallback={null}>
            <WarehouseScene
              inventory={inventory}
              result={result}
              selectedSku={selectedSku}
              onZoneFocus={setActiveZone}
            />
          </Suspense>

          <OrbitControls
            enableDamping
            dampingFactor={0.08}
            minDistance={7}
            maxDistance={22}
            maxPolarAngle={Math.PI / 2.05}
            target={[0, 1.8, 0]}
          />

        </Canvas>

      </div>

    </div>
  );
}

export default MiddlePanel;
