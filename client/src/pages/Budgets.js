import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Card, Form, Button, ListGroup, Alert } from "react-bootstrap";

function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [form, setForm] = useState({ category: "", limit: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const res = await api.get("/budgets");
      setBudgets(res.data);
    } catch (err) {
      setError("Failed to load budgets");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/budgets", form);
      setForm({ category: "", limit: "" });
      fetchBudgets();
    } catch (err) {
      setError("Failed to add budget");
    }
  };

  const handleEdit = async (id, currentLimit) => {
    const newLimit = prompt("Enter new limit:", currentLimit);
    if (newLimit) {
      try {
        await api.put(`/budgets/${id}`, { limit: newLimit });
        fetchBudgets();
      } catch (err) {
        setError("Failed to update budget");
      }
    }
  };

  return (
    <div className="container mt-4">
      <Card className="p-4 mb-4 shadow">
        <h3>Add Budget</h3>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Control
              type="text"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Limit</Form.Label>
            <Form.Control
              type="number"
              value={form.limit}
              onChange={(e) => setForm({ ...form, limit: e.target.value })}
              required
            />
          </Form.Group>
          <Button type="submit" className="w-100">
            Add Budget
          </Button>
        </Form>
      </Card>

      <Card className="p-4 shadow">
        <h3>Your Budgets</h3>
        <ListGroup>
          {budgets.map((b) => (
            <ListGroup.Item
              key={b._id}
              className="d-flex justify-content-between align-items-center"
            >
              <span>
                {b.category} — ${b.limit}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleEdit(b._id, b.limit)}
              >
                Edit
              </Button>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card>
    </div>
  );
}

export default Budgets;
