import React, { useEffect, useState } from "react";
import API from "../services/api";
import { Card, ListGroup, Alert } from "react-bootstrap";

function Suggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const res = await API.get("/suggestions");
      setSuggestions(res.data.suggestions);
    } catch (err) {
      setError("Failed to load suggestions");
    }
  };

  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="mt-4">
      <Card className="p-4 shadow">
        <h3>Automated Savings Suggestions</h3>
        <ListGroup variant="flush" className="mt-3">
          {suggestions.map((s, i) => (
            <ListGroup.Item key={i}>{s}</ListGroup.Item>
          ))}
        </ListGroup>
      </Card>
    </div>
  );
}

export default Suggestions;
