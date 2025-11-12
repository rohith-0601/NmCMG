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
  <pre className="code-block">{children}</pre>
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
        labels: { color: "#f8fafc", font: { size: 13, weight: 600 } },
      },
      tooltip: { mode: "nearest" },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "η",
          color: "#cbd5e1",
          font: { size: 13, weight: 600 },
        },
        ticks: { color: "#94a3b8" },
        grid: { color: "rgba(255,255,255,0.05)" },
      },
      y: {
        title: {
          display: true,
          text: logY ? "Error (log scale)" : "f(η)",
          color: "#cbd5e1",
          font: { size: 13, weight: 600 },
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
    <div className="diffeqn-page">
      <div className="container py-5">
        {/* Header */}
        <div className="text-center mb-5 header-section">
          <h1 className="display-4 fw-bold text-gradient mb-3">
            Gauss–Legendre ODE Solver
          </h1>
          <p className="lead text-muted">
            Numerical vs analytical solution of f″ + 2ηf′ = 0
          </p>
        </div>

        {/* Input Card */}
        <div className="card input-card shadow-lg mb-5">
          <div className="card-body p-4">
            <form onSubmit={runSolver}>
              <div className="row g-3 align-items-end">
                <div className="col-md-3">
                  <label className="form-label fw-semibold text-light">
                    Nodes (n)
                  </label>
                  <input
                    type="number"
                    className="form-control form-control-lg"
                    value={n}
                    min={4}
                    max={128}
                    onChange={(e) => setN(e.target.value)}
                    placeholder="e.g., 32"
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold text-light">
                    ηₘₐₓ
                  </label>
                  <input
                    type="number"
                    className="form-control form-control-lg"
                    value={etaMax}
                    step="0.1"
                    onChange={(e) => setEtaMax(e.target.value)}
                    placeholder="e.g., 5.0"
                  />
                </div>
                <div className="col-md-3">
                  <button
                    type="submit"
                    className="btn btn-gradient btn-lg w-100 d-flex align-items-center justify-content-center gap-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm"></span>
                        Running...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-calculator"></i>
                        Run Solver
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>

            {!resp && !loading && (
              <div className="ode-info mt-4">
                <h6 className="fw-bold text-white mb-3">
                  <i className="bi bi-function me-2"></i>
                  Differential Equation
                </h6>
                <div className="equation-box">
                  <p className="mb-2 text-center text-white fs-5">
                    f″ + 2ηf′ = 0
                  </p>
                  <p className="mb-0 text-center text-muted">
                    Boundary Conditions: f(0) = 0, f(∞) = 1
                  </p>
                </div>
                <div className="mt-3 text-muted small">
                  <i className="bi bi-info-circle me-2"></i>
                  This solver uses Gauss–Legendre collocation to numerically solve
                  the ODE and compares it with the analytical solution using the
                  error function.
                </div>
              </div>
            )}

            {error && (
              <div className="alert alert-danger mt-3 mb-0 d-flex align-items-center gap-2">
                <i className="bi bi-exclamation-triangle-fill"></i>
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        {resp && (
          <>
            {/* Summary Card */}
            <div className="card result-card shadow-lg mb-4">
              <div className="card-header border-0">
                <div className="d-flex align-items-center gap-3">
                  <span className="badge-custom badge-success">Summary</span>
                  <h5 className="mb-0 fw-bold text-white">
                    Results (n = {resp.n})
                  </h5>
                </div>
              </div>
              <div className="card-body p-4">
                <div className="row g-4">
                  <div className="col-md-4">
                    <div className="stat-box">
                      <div className="stat-label">ηₘₐₓ</div>
                      <div className="stat-value">{resp.eta_max}</div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="stat-box">
                      <div className="stat-label">Max Abs Error</div>
                      <div className="stat-value text-warning">
                        {resp.max_error.toExponential(4)}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="stat-box">
                      <div className="stat-label">Mean Abs Error</div>
                      <div className="stat-value text-info">
                        {resp.mean_error.toExponential(4)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart 1: Numerical vs Analytical */}
            <div className="card result-card shadow-lg mb-4">
              <div className="card-header border-0">
                <div className="d-flex align-items-center gap-3">
                  <span className="badge-custom badge-info">
                    <i className="bi bi-graph-up"></i>
                  </span>
                  <h5 className="mb-0 fw-bold text-white">
                    f(η): Numerical vs Analytical
                  </h5>
                </div>
              </div>
              <div className="card-body p-4">
                <div className="chart-container">
                  <Line
                    key={`chart1-${resp.n}-${resp.eta_max}`}
                    data={chartData1}
                    options={chartOptions(false)}
                  />
                </div>
              </div>
            </div>

            {/* Chart 2: Error Analysis */}
            <div className="card result-card shadow-lg mb-4">
              <div className="card-header border-0">
                <div className="d-flex align-items-center gap-3">
                  <span className="badge-custom badge-warning">
                    <i className="bi bi-exclamation-triangle"></i>
                  </span>
                  <h5 className="mb-0 fw-bold text-white">
                    Error vs η (Log Scale)
                  </h5>
                </div>
              </div>
              <div className="card-body p-4">
                <div className="chart-container">
                  <Line
                    key={`chart2-${resp.n}-${resp.eta_max}`}
                    data={chartData2}
                    options={chartOptions(true)}
                  />
                </div>
              </div>
            </div>

            {/* Nodes Display */}
            <div className="card result-card shadow-lg mb-4">
              <div className="card-header border-0">
                <div className="d-flex align-items-center gap-3">
                  <span className="badge-custom badge-secondary">Data</span>
                  <h5 className="mb-0 fw-bold text-white">η Nodes</h5>
                </div>
              </div>
              <div className="card-body p-4">
                <PrettyPre>
                  [{resp.eta.map((v) => v.toFixed(3)).join(", ")}]
                </PrettyPre>
              </div>
            </div>

            {/* Logs Card */}
            <div className="card result-card shadow-lg">
              <div className="card-header border-0">
                <div className="d-flex align-items-center gap-3">
                  <span className="badge-custom badge-danger">
                    <i className="bi bi-terminal"></i>
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

export default Diffeqn;
