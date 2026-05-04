import { useState } from "react";

function Form({ onSubmit }) {
  const [form, setForm] = useState({
    sku_id: "SKU1",
    region: "Delhi",
    day: 10,
    month: 1,
    promotion: 1
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <select name="sku_id" onChange={handleChange}>
        <option>SKU1</option>
        <option>SKU2</option>
        <option>SKU3</option>
      </select>

      <select name="region" onChange={handleChange}>
        <option>Delhi</option>
        <option>Bangalore</option>
        <option>Mumbai</option>
      </select>

      <button onClick={() => onSubmit(form)}>Analyze</button>
    </div>
  );
}

export default Form;