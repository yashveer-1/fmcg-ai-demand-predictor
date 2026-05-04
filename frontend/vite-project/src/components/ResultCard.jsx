function ResultCard({ result }) {
  if (!result) return <p>No data</p>;

  return (
    <div>
      <p>Demand: {result.predictedDemand}</p>
      <p>Safety Stock: {result.safetyStock}</p>
      <p>ROP: {result.reorderPoint}</p>
      <p>Stock: {result.currentStock}</p>

      <p style={{ color: result.risk === "HIGH" ? "red" : "green" }}>
        Risk: {result.risk}
      </p>
    </div>
  );
}

export default ResultCard;