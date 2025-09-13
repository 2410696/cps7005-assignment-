import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import NavigationBar from "./components/NavigationBar";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Budgets from "./pages/Budgets";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Suggestions from "./pages/Suggestions";
import Reports from "./pages/Reports";

function App() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <Router>
      {user && <NavigationBar />}
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />

          <Route path="/expenses" element={user ? <Expenses /> : <Navigate to="/login" />} />
          <Route path="/budgets" element={user ? <Budgets /> : <Navigate to="/login" />} />
          <Route path="/suggestions" element={user ? <Suggestions /> : <Navigate to="/login" />} />
          <Route path="/reports" element={user ? <Reports /> : <Navigate to="/login" />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={<Navigate to="/" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
