import React, { useState, useEffect } from "react";
import API from "../services/api";
import { Form, Button, Table, Alert, Card } from "react-bootstrap";

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    date: ""
  });
  const [error, setError] = useState("");

  // Fetch expenses on load
  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await API.get("/expenses");
      setExpenses(res.data);
    } catch (err) {
      setError("Failed to load expenses");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await API.post("/expenses", formData);
      fetchExpenses(); // refresh table
      setFormData({ category: "", amount: "", date: "" });
    } catch (err) {
      setError("Failed to add expense");
    }
  };

  return (
    <div className="mt-4">
      <Card className="p-4 mb-4 shadow">
        <h3 className="mb-3">Add Expense</h3>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Control
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Amount</Form.Label>
            <Form.Control
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Date</Form.Label>
            <Form.Control
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Button type="submit" variant="primary" className="w-100">
            Add Expense
          </Button>
        </Form>
      </Card>

      <Card className="p-4 shadow">
        <h3 className="mb-3">Your Expenses</h3>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Category</th>
              <th>Amount</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length > 0 ? (
              expenses.map((exp) => (
                <tr key={exp._id}>
                  <td>{exp.category}</td>
                  <td>${exp.amount}</td>
                  <td>{new Date(exp.date).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center">
                  No expenses recorded
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}

export default Expenses;
