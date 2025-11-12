import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

// --- Utility: format polynomial for readable display ---
const formatPolynomial = (expr) => {
  if (!expr) return "";
  return expr
    .replace(/\*\*3/g, "³")
    .replace(/\*\*2/g, "²")
    .replace(/\*\*1/g, "")
    .replace(/\*/g, "")
    .replace(/-/g, "−")
    .replace(/\+/g, " + ")
    .replace(/  +/g, " ")
    .trim();
};

// --- Small reusable UI blocks ---
const PrettyPre = ({ children }) => (
  <pre className="code-block">
    {children}
  </pre>
);

const InlineArray = ({ arr }) => {
  if (!arr) return <PrettyPre>None</PrettyPre>;
  if (!Array.isArray(arr)) return <PrettyPre>{String(arr)}</PrettyPre>;
  return (
    <PrettyPre>
      [
      {arr
        .map((x) =>
          Number.isFinite(x)
            ? Number(x).toFixed(6)
            : typeof x === "object"
            ? JSON.stringify(x)
            : String(x)
        )
        .join(", ")}
      ]
    </PrettyPre>
  );
};

const MatrixTable = ({ mat }) => {
  if (!Array.isArray(mat)) return <PrettyPre>{String(mat)}</PrettyPre>;
  return (
    <div className="table-responsive matrix-container">
      <table className="table table-dark table-bordered table-sm mb-0 matrix-table">
        <tbody>
          {mat.map((row, i) => (
            <tr key={i}>
              {row.map((v, j) => (
                <td key={j} className="matrix-cell">
                  {Number.isFinite(v) ? Number(v).toFixed(6) : String(v)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const AnswerCard = ({ label, title, children, badgeColor = "primary" }) => (
  <div className="card result-card shadow-lg mb-4">
    <div className="card-header border-0 d-flex align-items-center gap-3">
      <span className={`badge-custom badge-${badgeColor}`}>
        {label}
      </span>
      <h5 className="mb-0 fw-bold text-white">{title}</h5>
    </div>
    <div className="card-body">
      {children}
    </div>
  </div>
);

// --- Main Component ---
const Polynomial = () => {
  const [n, setN] = useState(100);
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState(null);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e && e.preventDefault();
    setLoading(true);
    setError(null);
    setResp(null);
    try {
      const res = await fetch("http://localhost:5001/legendre_pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ n: Number(n) }),
      });
      const data = await res.json();
      if (data.status === "success") {
        const result = data.result ?? data;
        setResp(result);
      } else setError("Server returned an error response");
    } catch (err) {
      console.error(err);
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="polynomial-page">
      <div className="container py-5">
        {/* Header Section */}
        <div className="text-center mb-5 header-section">
          <h1 className="display-4 fw-bold text-gradient mb-3">
            Modified Legendre Polynomial
          </h1>
          <p className="lead text-muted">
            Explore shifted Legendre polynomials and their numerical properties
          </p>
        </div>

        {/* Input Card */}
        <div className="card input-card shadow-lg mb-5">
          <div className="card-body p-4">
            <form onSubmit={submit}>
              <div className="row g-3 align-items-end">
                <div className="col-md-4 col-lg-3">
                  <label className="form-label fw-semibold text-light">
                    Legendre Order (n)
                  </label>
                  <input
                    type="number"
                    className="form-control form-control-lg"
                    value={n}
                    min={0}
                    onChange={(e) => setN(e.target.value)}
                    placeholder="Enter value"
                  />
                </div>
                <div className="col-md-4 col-lg-3">
                  <button
                    type="submit"
                    className="btn btn-gradient btn-lg w-100 d-flex align-items-center justify-content-center gap-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-play-fill"></i>
                        Run Pipeline
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
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
            <AnswerCard
              label="A"
              title={`Shifted Legendre Polynomial P*ₙ(x), n = ${n}`}
              badgeColor="info"
            >
              <div className="mb-4">
                <h6 className="text-cyan mb-3">Pretty Form</h6>
                <PrettyPre>
                  {formatPolynomial(
                    resp.P_shifted_pretty ??
                      resp.P_shifted_str ??
                      resp.polynomial
                  )}
                </PrettyPre>
              </div>

              <div className="mb-4">
                <h6 className="text-cyan mb-3">One-Line Form</h6>
                <PrettyPre>
                  {formatPolynomial(resp.P_shifted_str ?? resp.polynomial)}
                </PrettyPre>
              </div>

              <div>
                <h6 className="text-cyan mb-3">Coefficients (Highest → Lowest)</h6>
                <InlineArray arr={resp.coeffs_high ?? resp.coeffs} />
              </div>
            </AnswerCard>

            <AnswerCard
              label="B"
              title="Companion Matrix (Frobenius Form)"
              badgeColor="success"
            >
              <MatrixTable mat={resp.companion_matrix ?? resp.A} />
            </AnswerCard>

            <AnswerCard
              label="C"
              title="Roots = Eigenvalues (via LU Decomposition)"
              badgeColor="warning"
            >
              <div className="mb-4">
                <h6 className="text-cyan mb-3">Eigenvalues</h6>
                <InlineArray arr={resp.eigenvalues ?? resp.roots} />
              </div>

              <h6 className="text-cyan mb-3">LU Decomposition</h6>
              <div className="row g-4">
                {[
                  { title: "P Matrix", data: resp.P_lu },
                  { title: "L Matrix", data: resp.L_lu },
                  { title: "U Matrix", data: resp.U_lu },
                ].map(({ title, data }, idx) => (
                  <div className="col-lg-4" key={idx}>
                    <div className="matrix-wrapper">
                      <div className="matrix-title">{title}</div>
                      <MatrixTable mat={data} />
                    </div>
                  </div>
                ))}
              </div>
            </AnswerCard>

            <AnswerCard
              label="D"
              title={`Solution of A·x = b (b = {1,2,…,${n}})`}
              badgeColor="danger"
            >
              <div className="row g-4">
                <div className="col-md-6">
                  <h6 className="text-cyan mb-3">b Vector</h6>
                  <InlineArray
                    arr={
                      resp.b_vector ??
                      Array.from({ length: Number(n) }, (_, i) => i + 1)
                    }
                  />
                </div>
                <div className="col-md-6">
                  <h6 className="text-cyan mb-3">Determinant det(A)</h6>
                  <PrettyPre>{String(resp.determinant ?? resp.det)}</PrettyPre>
                </div>
              </div>

              <div className="mt-4">
                <h6 className="text-cyan mb-3">Solution Vector x</h6>
                <InlineArray
                  arr={resp.x_solution ?? resp.solution ?? resp.x}
                />
              </div>
            </AnswerCard>

            <AnswerCard
              label="E"
              title="Newton–Raphson: Smallest & Largest Roots"
              badgeColor="secondary"
            >
              <div className="row g-4 mb-4">
                <div className="col-md-6">
                  <div className="stat-box">
                    <div className="stat-label">Smallest Root</div>
                    <div className="stat-value">{String(resp.newton_smallest ?? "-")}</div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="stat-box">
                    <div className="stat-label">Largest Root</div>
                    <div className="stat-value">{String(resp.newton_largest ?? "-")}</div>
                  </div>
                </div>
              </div>

              <div>
                <h6 className="text-cyan mb-3">Iteration Logs</h6>
                <PrettyPre>
                  {(resp.newton_logs ?? resp.logs ?? []).join("\n")}
                </PrettyPre>
              </div>
            </AnswerCard>

            {/* Summary Card */}
            <div className="card summary-card shadow-lg">
              <div className="card-body">
                <h5 className="fw-bold text-white mb-4">
                  <i className="bi bi-clipboard-data me-2"></i>
                  Summary
                </h5>
                <div className="row g-3">
                  <div className="col-md-4">
                    <div className="summary-item">
                      <span className="summary-label">Degree</span>
                      <span className="summary-value">
                        {resp.coeffs_high?.length
                          ? resp.coeffs_high.length - 1
                          : "?"}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="summary-item">
                      <span className="summary-label">Eigenvalues</span>
                      <span className="summary-value">
                        {resp.eigenvalues?.length ?? "?"}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="summary-item">
                      <span className="summary-label">Determinant</span>
                      <span className="summary-value">
                        {String(resp.determinant ?? "-")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Polynomial;
