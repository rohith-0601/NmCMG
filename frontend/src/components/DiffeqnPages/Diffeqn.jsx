import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  LogarithmicScale,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  LogarithmicScale,
  CategoryScale,
  Tooltip,
  Legend
);

// ------------------ Pretty Printer ------------------
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

const Diffeqn = () => {
  const [n, setN] = useState(32);
  const [etaMax, setEtaMax] = useState(5.0);
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState(null);
  const [error, setError] = useState(null);

  const runSolver = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResp(null);
    try {
      const res = await fetch("http://localhost:5001/diffeqn_solver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ n: Number(n), eta_max: Number(etaMax) }),
      });
      const data = await res.json();
      if (data.status === "success") setResp(data.result);
      else setError(data.message || "Server error");
    } catch (err) {
      console.error(err);
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  // --- Chart: f_num vs f_exact ---
  const chartData1 =
    resp && {
      labels: resp.eta.map((v) => v.toFixed(3)),
      datasets: [
        {
          label: "Collocation Solution (f_num)",
          data: resp.f_num,
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59,130,246,0.3)",
          tension: 0.3,
          pointRadius: 3,
          fill: false,
        },
        {
          label: "Analytical erf(η)",
          data: resp.f_exact,
          borderColor: "#f87171",
          backgroundColor: "rgba(248,113,113,0.3)",
          borderDash: [5, 5],
          tension: 0.3,
          pointRadius: 0,
          fill: false,
        },
      ],
    };

  // --- Chart: Error vs η ---
  const chartData2 =
    resp && {
      labels: resp.eta.map((v) => v.toFixed(3)),
      datasets: [
        {
          label: "Absolute Error |f_num - f_exact|",
          data: resp.error,
          borderColor: "#fbbf24",
          backgroundColor: "rgba(251,191,36,0.4)",
          tension: 0.3,
          pointRadius: 3,
          fill: false,
        },
      ],
    };

  const chartOptions = (logY = false) => ({
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
        title: { display: true, text: "η", color: "#cbd5e1" },
        ticks: { color: "#94a3b8" },
        grid: { color: "rgba(255,255,255,0.05)" },
      },
      y: {
        title: {
          display: true,
          text: logY ? "Error (log scale)" : "f(η)",
          color: "#cbd5e1",
        },
        type: logY ? "logarithmic" : "linear",
        ticks: {
          color: "#94a3b8",
          callback: (val) =>
            logY && val > 0 ? Number(val).toExponential(1) : val,
        },
        grid: { color: "rgba(255,255,255,0.05)" },
      },
    },
  });

  // ------------------ UI ------------------
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
          Gauss–Legendre Collocation ODE Solver
        </h1>
        <p style={{ color: "#94a3b8" }}>
          Numerical vs analytical solution of f″ + 2ηf′ = 0
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
          onSubmit={runSolver}
          className="d-flex flex-wrap align-items-center gap-3"
        >
          <div>
            <label className="form-label mb-1" style={{ color: "#cbd5e1" }}>
              Nodes (n)
            </label>
            <input
              type="number"
              className="form-control bg-dark border-0 text-light"
              value={n}
              min={4}
              max={128}
              onChange={(e) => setN(e.target.value)}
              style={{
                width: "120px",
                borderRadius: "10px",
                padding: "8px 10px",
              }}
            />
          </div>
          <div>
            <label className="form-label mb-1" style={{ color: "#cbd5e1" }}>
              ηₘₐₓ
            </label>
            <input
              type="number"
              className="form-control bg-dark border-0 text-light"
              value={etaMax}
              step="0.1"
              onChange={(e) => setEtaMax(e.target.value)}
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
            {loading ? "Running..." : "Run Solver"}
          </button>
          {loading && (
            <div className="spinner-border text-light" role="status"></div>
          )}
        </form>

        {!resp && !loading && (
          <div className="mt-4">
            <p className="fw-semibold mb-2" style={{ color: "#cbd5e1" }}>
              This solver performs Gauss–Legendre collocation for the ODE:
            </p>
            <PrettyPre>f″ + 2ηf′ = 0,   f(0) = 0,   f(∞) = 1</PrettyPre>
          </div>
        )}
      </div>

      {error && (
        <div className="alert alert-danger py-2 px-3">{error}</div>
      )}

      {resp && (
        <div
          className="p-4 rounded-4 shadow-sm"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <h5 className="fw-bold text-light mb-3">Results (n = {resp.n})</h5>

          <PrettyPre>
            {`η_max = ${resp.eta_max}
Max abs error = ${resp.max_error.toExponential(4)}
Mean abs error = ${resp.mean_error.toExponential(4)}`}
          </PrettyPre>

          <h6 className="fw-semibold mt-3 text-light">Logs</h6>
          <PrettyPre>{resp.logs.join("\n")}</PrettyPre>

          <div className="my-5">
            <h5 className="fw-bold text-light mb-3">
              f(η): Numerical vs Analytical
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
                key={`chart1-${resp.n}-${resp.eta_max}`}
                data={chartData1}
                options={chartOptions(false)}
              />
            </div>
          </div>

          <div className="my-5">
            <h5 className="fw-bold text-light mb-3">
              Error vs η (Log Scale)
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
                key={`chart2-${resp.n}-${resp.eta_max}`}
                data={chartData2}
                options={chartOptions(true)}
              />
            </div>
          </div>

          <h6 className="fw-semibold mt-3 text-light">η Nodes</h6>
          <PrettyPre>
            [{resp.eta.map((v) => v.toFixed(3)).join(", ")}]
          </PrettyPre>
        </div>
      )}
    </div>
  );
};

export default Diffeqn;
