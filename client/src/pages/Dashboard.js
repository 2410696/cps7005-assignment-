import React, { useEffect, useState } from "react";
import { Pie, Bar } from "react-chartjs-2";
import api from "../services/api";

import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  Title
} from "chart.js";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  Title
);

function Dashboard() {
  const [data, setData] = useState({ categoryData: {}, monthlyData: [], insights: [] });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get("/analytics");
      setData(res.data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
    }
  };

  const categories = Array.isArray(data.categoryData)
    ? data.categoryData.map((c) => ({ category: c._id, amount: c.total }))
    : Object.entries(data.categoryData || {}).map(([cat, amt]) => ({ category: cat, amount: amt }));

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-6">
          <h4>Spending by Category</h4>
          <Pie
            data={{
              labels: categories.map((c) => c.category),
              datasets: [
                {
                  data: categories.map((c) => c.amount),
                  backgroundColor: ["#007bff", "#28a745", "#ffc107", "#dc3545", "#6f42c1"],
                },
              ],
            }}
          />
        </div>

        <div className="col-md-6">
          <h4>Monthly Spending Trend</h4>
          <Bar
            data={{
              labels: data.monthlyData?.map((m) => m.month || `Month ${m._id}`),
              datasets: [
                {
                  label: "Spending ($)",
                  data: data.monthlyData?.map((m) => m.amount || m.total),
                  backgroundColor: "#007bff",
                },
              ],
            }}
          />
        </div>
      </div>

      {data.insights?.length > 0 && (
        <div className="row mt-4">
          <div className="col">
            <h4>Insights & Recommendations</h4>
            <ul className="list-group">
              {data.insights.map((ins, i) => (
                <li key={i} className="list-group-item">
                  {ins}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
