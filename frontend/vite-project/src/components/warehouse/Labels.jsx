import { Text } from "@react-three/drei";

function Labels({ selectedSku, result }) {
  const riskLabel = result?.risk === "HIGH"
    ? "Restock lane active"
    : result?.risk === "MODERATE"
      ? "Buffer watch active"
      : "Stock flow normal";
  const labelColor = result?.risk === "HIGH"
    ? "#fecaca"
    : result?.risk === "MODERATE"
      ? "#fde68a"
      : "#bbf7d0";

  return (
    <>

      <Text
        position={[0, 4.8, -1.2]}
        fontSize={0.46}
        color="white"
        anchorX="center"
      >
        {selectedSku} Rack Zone
      </Text>

      <Text
        position={[8, 3.1, 2.8]}
        fontSize={0.38}
        color={labelColor}
        anchorX="center"
      >
        {riskLabel}
      </Text>

    </>
  );
}

export default Labels;
