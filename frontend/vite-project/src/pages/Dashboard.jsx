import { useState } from "react";
import Header from "../components/layout/Header";
import LeftPanel from "../components/layout/LeftPanel";
import MiddlePanel from "../components/layout/MiddlePanel";
import RightPanel from "../components/layout/RightPanel";
import BottomPanel from "../components/layout/BottomPanel";
import { analyzeInventory } from "../api/api";
import "../styles/dashboard.css";

function Dashboard() {
  const [result, setResult] = useState(null);

  const handleSubmit = async (form) => {
    const res = await analyzeInventory(form);
    setResult(res.data);
  };

  return (
    <div className="dashboard">
      <Header />

      <div className="main">
        <LeftPanel onSubmit={handleSubmit} />
        <MiddlePanel />
        <RightPanel result={result} />
      </div>

      <BottomPanel />
    </div>
  );
}

export default Dashboard;