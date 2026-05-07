import { Text } from "@react-three/drei";

function Labels({ selectedSku, result }) {
  const riskLabel = result?.risk === "HIGH" ? "Restock lane active" : "Stock flow normal";

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
        color={result?.risk === "HIGH" ? "#fecaca" : "#bbf7d0"}
        anchorX="center"
      >
        {riskLabel}
      </Text>

    </>
  );
}

export default Labels;
