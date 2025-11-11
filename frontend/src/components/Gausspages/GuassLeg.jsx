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

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

// ------------------ UI helpers ------------------
const PrettyPre = ({ children }) => (
  <pre
    style={{
      whiteSpace: "pre-wrap",
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 10,
      padding: "10px 14px",
      color: "#e2e8f0",
      fontSize: "0.9rem",
      overflowX: "auto",
    }}
  >
    {children}
  </pre>
);

const InlineArray = ({ arr }) => {
  if (!arr) return <PrettyPre>None</PrettyPre>;
  if (!Array.isArray(arr)) return <PrettyPre>{String(arr)}</PrettyPre>;
  return (
    <PrettyPre>
      [{arr.map((x) => (Number.isFinite(x) ? x.toFixed(6) : String(x))).join(", ")}]
    </PrettyPre>
  );
};

const MatrixTable = ({ title, mat }) => (
  <div className="mb-4">
    <h6 className="fw-semibold text-secondary mb-2">{title}</h6>
    <div className="table-responsive">
      <table className="table table-dark table-bordered table-sm mb-0 align-middle">
        <tbody>
          {Array.isArray(mat) &&
            mat.map((row, i) => (
              <tr key={i}>
                {row.map((v, j) => (
                  <td
                    key={j}
                    style={{
                      textAlign: "right",
                      fontFamily: "monospace",
                      fontSize: "0.85rem",
                      padding: "4px 8px",
                    }}
                  >
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
        labels: { color: "#f8fafc" },
      },
      tooltip: { mode: "nearest" },
    },
    scales: {
      x: {
        title: { display: true, text: "Roots (ξ)", color: "#cbd5e1" },
        ticks: { color: "#94a3b8" },
        grid: { color: "rgba(255,255,255,0.05)" },
      },
      y: {
        title: { display: true, text: "Weights (w)", color: "#cbd5e1" },
        ticks: { color: "#94a3b8" },
        grid: { color: "rgba(255,255,255,0.05)" },
      },
    },
  };

  return (
    <div
      className="py-5 px-3 px-md-5"
      style={{
        color: "#e5e7eb",
        minHeight: "100vh",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <div className="text-center mb-5">
        <h1
          style={{
            fontWeight: 700,
            fontSize: "2.3rem",
            color: "#f1f5f9",
          }}
        >
          Gauss–Legendre Collocation & Integration
        </h1>
        <p style={{ color: "#94a3b8" }}>
          Compare Golub–Welsch and Lagrange-based numerical weights
        </p>
      </div>

      {/* Input Card */}
      <div
        className="p-4 mb-5 rounded-4 shadow-sm"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <form
          onSubmit={runPipeline}
          className="d-flex flex-wrap align-items-center gap-3"
        >
          <div>
            <label className="form-label mb-1" style={{ color: "#cbd5e1" }}>
              Order (n)
            </label>
            <input
              type="number"
              className="form-control bg-dark border-0 text-light"
              value={n}
              min={2}
              max={64}
              onChange={(e) => setN(e.target.value)}
              style={{
                width: "120px",
                borderRadius: "10px",
                padding: "8px 10px",
              }}
            />
          </div>
          <button
            type="submit"
            className="btn btn-light fw-semibold text-dark"
            style={{
              borderRadius: "10px",
              padding: "8px 20px",
              height: "42px",
            }}
            disabled={loading}
          >
            {loading ? "Running..." : "Run Analysis"}
          </button>
          {loading && (
            <div className="spinner-border text-light" role="status"></div>
          )}
        </form>

        {!resp && !loading && (
          <div className="mt-4">
            <p className="fw-semibold mb-2" style={{ color: "#cbd5e1" }}>
              This analysis performs:
            </p>
            <ul className="small text-secondary mb-0">
              <li>Computes shifted Legendre polynomial coefficients.</li>
              <li>Generates Gauss nodes and weights (Golub–Welsch).</li>
              <li>Computes Lagrange interpolated weights.</li>
              <li>Builds derivative matrices A₁ and B.</li>
              <li>Plots Weights vs Roots for both methods.</li>
            </ul>
          </div>
        )}
      </div>

      {error && (
        <div className="alert alert-danger py-2 px-3">{error}</div>
      )}

      {/* Results */}
      {resp && (
        <div
          className="p-4 rounded-4 shadow-sm"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <h5 className="fw-bold text-light mb-4">Results for n = {resp.n}</h5>

          <h6 className="text-secondary small mb-2">
            Polynomial Coefficients (highest → lowest)
          </h6>
          <InlineArray arr={resp.coeffs} />

          <h6 className="text-secondary mt-3 mb-2">
            Roots and Weights (Golub–Welsch)
          </h6>
          <PrettyPre>
            {resp.roots_gw
              .map(
                (r, i) =>
                  `Root[${i + 1}] = ${r.toFixed(6)},  W = ${resp.weights_gw[
                    i
                  ].toFixed(6)}`
              )
              .join("\n")}
          </PrettyPre>

          <h6 className="text-secondary mt-3 mb-2">
            Weights (Lagrange Integration)
          </h6>
          <PrettyPre>
            {resp.weights_lag
              .map(
                (w, i) =>
                  `Root[${i + 1}] = ${resp.roots_gw[i].toFixed(
                    6
                  )},  W = ${w.toFixed(6)}`
              )
              .join("\n")}
          </PrettyPre>

          <MatrixTable title="Matrix A₁ (y′)" mat={resp.A1} />
          <MatrixTable title="Matrix B (y″)" mat={resp.B} />

          <h6 className="fw-semibold mt-3 mb-2 text-light">
            Collocation Points (x)
          </h6>
          <InlineArray arr={resp.x_nodes} />

          <div className="my-5">
            <h5 className="fw-bold mb-3 text-light">
              Weights vs Roots Comparison
            </h5>
            <div
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                padding: 25,
                width: "100%",
                height: "500px",
              }}
            >
              <Line
                key={JSON.stringify(resp.roots_gw)}
                data={chartData}
                options={chartOptions}
              />
            </div>
          </div>

          <h6 className="fw-semibold mt-4 text-light">Computation Logs</h6>
          <PrettyPre>{resp.logs.join("\n")}</PrettyPre>
        </div>
      )}
    </div>
  );
};

export default GaussLeg;
