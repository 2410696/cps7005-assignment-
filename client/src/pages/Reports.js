import React from "react";
import API from "../services/api";
import { Button, Card, Row, Col } from "react-bootstrap";

function downloadBlob(data, filename, mime) {
  const blob = new Blob([data], { type: mime });
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(link.href);
}

function Reports() {
  const downloadCSV = async () => {
    try {
      const res = await API.get("/reports/csv", { responseType: "blob" });
      downloadBlob(res.data, "smartspend_report.csv", "text/csv;charset=utf-8;");
    } catch (err) {
      console.error(err);
      alert("Failed to download CSV report");
    }
  };

  const downloadPDF = async () => {
    try {
      const res = await API.get("/reports/pdf", { responseType: "blob" });
      downloadBlob(res.data, "smartspend_report.pdf", "application/pdf");
    } catch (err) {
      console.error(err);
      alert("Failed to download PDF report");
    }
  };

  return (
    <div className="mt-4">
      <Card className="p-4 shadow">
        <h3>Download Reports</h3>
        <p>Export your financial data as CSV or PDF.</p>
        <Row>
          <Col md={6}>
            <Button variant="primary" className="w-100" onClick={downloadCSV}>
              Download CSV
            </Button>
          </Col>
          <Col md={6}>
            <Button variant="secondary" className="w-100" onClick={downloadPDF}>
              Download PDF
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  );
}

export default Reports;
