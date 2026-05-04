import Form from "../Form";

function LeftPanel({ onSubmit }) {
  return (
    <div className="panel">
      <h3>Input</h3>
      <Form onSubmit={onSubmit} />
    </div>
  );
}

export default LeftPanel;