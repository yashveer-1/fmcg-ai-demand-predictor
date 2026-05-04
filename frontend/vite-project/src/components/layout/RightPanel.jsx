import ResultCard from "../ResultCard";

function RightPanel({ result }) {
  return (
    <div className="panel">
      <h3>Analysis</h3>
      <ResultCard result={result} />
    </div>
  );
}

export default RightPanel;