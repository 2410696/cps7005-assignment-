import React, { useState } from "react";
import API from "../services/api";
import { Dropdown, Spinner } from "react-bootstrap";
import { Bell } from "react-bootstrap-icons";

function Reminder() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const res = await API.get("/reminders");
      setReminders(res.data.reminders || []); 
    } catch (err) {
      console.error("Failed to fetch reminders", err);
      setReminders([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dropdown align="end" onToggle={(isOpen) => isOpen && fetchReminders()}>
      <Dropdown.Toggle
        variant="outline-light"
        id="dropdown-basic"
        className="d-flex align-items-center"
      >
        <Bell size={20} />
      </Dropdown.Toggle>

      <Dropdown.Menu style={{ minWidth: "280px", maxHeight: "300px", overflowY: "auto" }}>
        {loading ? (
          <Dropdown.Item className="text-center">
            <Spinner animation="border" size="sm" /> Loading...
          </Dropdown.Item>
        ) : reminders.length > 0 ? (
          reminders.map((rem, i) => (
            <Dropdown.Item key={i}>
              {rem.message}
              <br />
              <small className="text-muted">
                {new Date(rem.date).toLocaleString()}
              </small>
            </Dropdown.Item>
          ))
        ) : (
          <Dropdown.Item>No reminders yet</Dropdown.Item>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default Reminder;
