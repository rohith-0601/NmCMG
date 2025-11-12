import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
);

// ------------------ UI helpers ------------------
const PrettyPre = ({ children }) => (
  <pre className="code-block">{children}</pre>
);

const InlineArray = ({ arr }) => {
  if (!arr) return <PrettyPre>None</PrettyPre>;
  if (!Array.isArray(arr)) return <PrettyPre>{String(arr)}</PrettyPre>;
  return (
    <PrettyPre>
      [
      {arr
        .map((x) => (Number.isFinite(x) ? x.toFixed(6) : String(x)))
        .join(", ")}
      ]
    </PrettyPre>
  );
};

const MatrixTable = ({ title, mat }) => (
  <div className="mb-4">
    <h6 className="text-cyan mb-3 fw-bold">{title}</h6>
    <div className="table-responsive matrix-container">
      <table className="table table-dark table-bordered table-sm mb-0 matrix-table">
        <tbody>
          {Array.isArray(mat) &&
            mat.map((row, i) => (
              <tr key={i}>
                {row.map((v, j) => (
                  <td key={j} className="matrix-cell">
                    {Number.isFinite(v) ? v.toFixed(6) : String(v)}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  </div>
);

const SectionDivider = () => <div className="section-divider my-4"></div>;

const GaussLeg = () => {
  const [n, setN] = useState(4);
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState(null);
  const [error, setError] = useState(null);

  const runPipeline = async (e) => {
    e && e.preventDefault();
    setLoading(true);
    setError(null);
    setResp(null);
    try {
      const res = await fetch("http://localhost:5001/gauss_legendre", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ n: Number(n) }),
      });
      const data = await res.json();
      if (data.status === "success") setResp(data);
      else setError(data.message || "Server error");
    } catch (err) {
      console.error(err);
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  // ------------------ Chart setup ------------------
  const chartData = resp
    ? {
        labels: resp.roots_gw.map((x) => x.toFixed(4)),
        datasets: [
          {
            label: "Golub–Welsch Weights",
            data: resp.weights_gw,
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59,130,246,0.3)",
            tension: 0.35,
            pointRadius: 5,
            fill: false,
          },
          {
            label: "Lagrange Weights",
            data: resp.weights_lag,
            borderColor: "#f87171",
            backgroundColor: "rgba(248,113,113,0.3)",
            tension: 0.35,
            pointStyle: "triangle",
            pointRadius: 5,
            fill: false,
          },
        ],
      }
    : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#f8fafc",
          font: { size: 14, weight: 600 },
          padding: 15,
        },
      },
      tooltip: {
        mode: "nearest",
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        titleColor: "#06b6d4",
        bodyColor: "#e2e8f0",
        borderColor: "rgba(6, 182, 212, 0.5)",
        borderWidth: 1,
        padding: 12,
        displayColors: true,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Roots (ξ)",
          color: "#cbd5e1",
          font: { size: 14, weight: 600 },
          padding: { top: 10 },
        },
        ticks: { color: "#94a3b8", font: { size: 12 } },
        grid: { color: "rgba(255,255,255,0.05)" },
      },
      y: {
        title: {
          display: true,
          text: "Weights (w)",
          color: "#cbd5e1",
          font: { size: 14, weight: 600 },
          padding: { bottom: 10 },
        },
        ticks: { color: "#94a3b8", font: { size: 12 } },
        grid: { color: "rgba(255,255,255,0.05)" },
      },
    },
  };

  return (
    <div className="gauss-page">
      <div className="container-fluid px-4 py-5" style={{ maxWidth: "1400px" }}>
        {/* Header */}
        <div className="text-center mb-5 header-section">
          <h1 className="display-4 fw-bold text-gradient mb-3">
            Gauss–Legendre Collocation
          </h1>
          <p className="lead text-muted mb-0">
            Compare Golub–Welsch and Lagrange-based numerical weights
          </p>
        </div>

        {/* Input Card */}
        <div className="card input-card shadow-lg mb-5">
          <div className="card-body p-4">
            <form onSubmit={runPipeline}>
              <div className="row g-3 align-items-end">
                <div className="col-lg-3 col-md-5">
                  <label className="form-label fw-semibold text-light mb-2">
                    <i className="bi bi-sliders me-2"></i>
                    Order (n)
                  </label>
                  <input
                    type="number"
                    className="form-control form-control-lg"
                    value={n}
                    min={2}
                    max={64}
                    onChange={(e) => setN(e.target.value)}
                    placeholder="Enter order (2-64)"
                  />
                </div>
                <div className="col-lg-3 col-md-5">
                  <button
                    type="submit"
                    className="btn btn-gradient btn-lg w-100 d-flex align-items-center justify-content-center gap-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                        ></span>
                        <span>Running...</span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-play-circle-fill"></i>
                        <span>Run Analysis</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>

            {!resp && !loading && (
              <div className="info-card mt-4">
                <div className="d-flex align-items-start gap-3">
                  <i className="bi bi-info-circle-fill text-info fs-4 mt-1"></i>
                  <div>
                    <h6 className="fw-bold text-white mb-3">
                      Analysis Overview
                    </h6>
                    <ul className="list-unstyled mb-0 text-muted">
                      <li className="mb-2 d-flex align-items-center">
                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                        <span>
                          Computes shifted Legendre polynomial coefficients
                        </span>
                      </li>
                      <li className="mb-2 d-flex align-items-center">
                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                        <span>
                          Generates Gauss nodes and weights (Golub–Welsch)
                        </span>
                      </li>
                      <li className="mb-2 d-flex align-items-center">
                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                        <span>Computes Lagrange interpolated weights</span>
                      </li>
                      <li className="mb-2 d-flex align-items-center">
                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                        <span>Builds derivative matrices A₁ and B</span>
                      </li>
                      <li className="mb-0 d-flex align-items-center">
                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                        <span>Plots Weights vs Roots for both methods</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="alert alert-danger mt-3 mb-0 d-flex align-items-center gap-2">
                <i className="bi bi-exclamation-triangle-fill"></i>
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        {resp && (
          <>
            {/* Main Results Card */}
            <div className="card result-card shadow-lg mb-4">
              <div className="card-header border-0">
                <div className="d-flex align-items-center gap-3">
                  <span className="badge-custom badge-info">
                    <i className="bi bi-clipboard-data"></i>
                  </span>
                  <h5 className="mb-0 fw-bold text-white">
                    Analysis Results for n = {resp.n}
                  </h5>
                </div>
              </div>
              <div className="card-body p-4">
                {/* Polynomial Coefficients */}
                <div className="result-section">
                  <h6
                    className="text-cyan mb-3 fw-bold text-uppercase"
                    style={{ fontSize: "0.9rem", letterSpacing: "0.5px" }}
                  >
                    <i className="bi bi-1-circle-fill me-2"></i>
                    Polynomial Coefficients (Highest → Lowest)
                  </h6>
                  <InlineArray arr={resp.coeffs} />
                </div>

                <SectionDivider />

                {/* Golub-Welsch Results */}
                <div className="result-section">
                  <h6
                    className="text-cyan mb-3 fw-bold text-uppercase"
                    style={{ fontSize: "0.9rem", letterSpacing: "0.5px" }}
                  >
                    <i className="bi bi-2-circle-fill me-2"></i>
                    Roots and Weights (Golub–Welsch)
                  </h6>
                  <PrettyPre>
                    {resp.roots_gw
                      .map(
                        (r, i) =>
                          `Root[${String(i + 1).padStart(
                            2,
                            " "
                          )}] = ${r.toFixed(6)}    W = ${resp.weights_gw[
                            i
                          ].toFixed(6)}`
                      )
                      .join("\n")}
                  </PrettyPre>
                </div>

                <SectionDivider />

                {/* Lagrange Results */}
                <div className="result-section">
                  <h6
                    className="text-cyan mb-3 fw-bold text-uppercase"
                    style={{ fontSize: "0.9rem", letterSpacing: "0.5px" }}
                  >
                    <i className="bi bi-3-circle-fill me-2"></i>
                    Weights (Lagrange Integration)
                  </h6>
                  <PrettyPre>
                    {resp.weights_lag
                      .map(
                        (w, i) =>
                          `Root[${String(i + 1).padStart(
                            2,
                            " "
                          )}] = ${resp.roots_gw[i].toFixed(
                            6
                          )}    W = ${w.toFixed(6)}`
                      )
                      .join("\n")}
                  </PrettyPre>
                </div>

                <SectionDivider />

                {/* Matrices */}
                <div className="result-section">
                  <h6
                    className="text-cyan mb-4 fw-bold text-uppercase"
                    style={{ fontSize: "0.9rem", letterSpacing: "0.5px" }}
                  >
                    <i className="bi bi-4-circle-fill me-2"></i>
                    Derivative Matrices
                  </h6>
                  <div className="row g-4">
                    <div className="col-lg-6">
                      <div className="matrix-wrapper">
                        <MatrixTable title="Matrix A₁ (y′)" mat={resp.A1} />
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="matrix-wrapper">
                        <MatrixTable title="Matrix B (y″)" mat={resp.B} />
                      </div>
                    </div>
                  </div>
                </div>

                <SectionDivider />

                {/* Collocation Points */}
                <div className="result-section">
                  <h6
                    className="text-cyan mb-3 fw-bold text-uppercase"
                    style={{ fontSize: "0.9rem", letterSpacing: "0.5px" }}
                  >
                    <i className="bi bi-5-circle-fill me-2"></i>
                    Collocation Points (x)
                  </h6>
                  <InlineArray arr={resp.x_nodes} />
                </div>
              </div>
            </div>

            {/* Chart Card */}
            <div className="card result-card shadow-lg mb-4">
              <div className="card-header border-0">
                <div className="d-flex align-items-center gap-3">
                  <span className="badge-custom badge-warning">
                    <i className="bi bi-graph-up"></i>
                  </span>
                  <h5 className="mb-0 fw-bold text-white">
                    Weights vs Roots Comparison
                  </h5>
                </div>
              </div>
              <div className="card-body p-4">
                <div className="chart-container">
                  <Line
                    key={JSON.stringify(resp.roots_gw)}
                    data={chartData}
                    options={chartOptions}
                  />
                </div>
              </div>
            </div>

            {/* Logs Card */}
            <div className="card result-card shadow-lg">
              <div className="card-header border-0">
                <div className="d-flex align-items-center gap-3">
                  <span className="badge-custom badge-secondary">
                    <i className="bi bi-terminal-fill"></i>
                  </span>
                  <h5 className="mb-0 fw-bold text-white">Computation Logs</h5>
                </div>
              </div>
              <div className="card-body p-4">
                <PrettyPre>{resp.logs.join("\n")}</PrettyPre>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GaussLeg;
