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
  <pre
    style={{
      whiteSpace: "pre-wrap",
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      color: "#e2e8f0",
      borderRadius: 10,
      padding: "10px 14px",
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
    <div
      className="table-responsive"
      style={{ maxHeight: "400px", overflowY: "auto" }}
    >
      <table className="table table-dark table-bordered table-sm mb-0 align-middle">
        <tbody>
          {mat.map((row, i) => (
            <tr key={i}>
              {row.map((v, j) => (
                <td
                  key={j}
                  style={{
                    textAlign: "right",
                    fontFamily: "monospace",
                    padding: "5px 8px",
                    fontSize: "0.85rem",
                  }}
                >
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

const AnswerCard = ({ label, title, children }) => (
  <div
    className="mb-4 p-4 rounded-4 shadow-sm"
    style={{
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.1)",
    }}
  >
    <div className="d-flex align-items-center mb-3">
      <span
        className="badge me-2"
        style={{
          backgroundColor: "#3b82f6",
          fontSize: "0.8rem",
          padding: "6px 10px",
        }}
      >
        {label}
      </span>
      <h6 className="fw-semibold mb-0" style={{ color: "#f1f5f9" }}>
        {title}
      </h6>
    </div>
    <div>{children}</div>
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
          Modified Legendre Polynomial
        </h1>
        <p style={{ color: "#94a3b8" }}>
          Explore shifted Legendre polynomials and their numerical properties
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
        <form onSubmit={submit} className="d-flex flex-wrap align-items-center gap-3">
          <div>
            <label className="form-label mb-1" style={{ color: "#cbd5e1" }}>
              Legendre order (n)
            </label>
            <input
              type="number"
              className="form-control bg-dark border-0 text-light"
              value={n}
              min={0}
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
          >
            Run Pipeline
          </button>
          {loading && (
            <div className="spinner-border text-light" role="status"></div>
          )}
        </form>
        {error && (
          <div className="alert alert-danger mt-3 mb-0 py-2 px-3">
            {error}
          </div>
        )}
      </div>

      {/* Results */}
      {resp && (
        <>
          <AnswerCard
            label="A"
            title={`Shifted Legendre polynomial  P*ₙ(x),  n = ${n}`}
          >
            <h6 className="text-secondary small mb-2">Pretty form</h6>
            <PrettyPre>
              {formatPolynomial(
                resp.P_shifted_pretty ??
                  resp.P_shifted_str ??
                  resp.polynomial
              )}
            </PrettyPre>

            <h6 className="text-secondary small mt-3 mb-2">One-line form</h6>
            <PrettyPre>
              {formatPolynomial(resp.P_shifted_str ?? resp.polynomial)}
            </PrettyPre>

            <h6 className="text-secondary small mt-3 mb-2">
              Coefficients (highest → lowest)
            </h6>
            <InlineArray arr={resp.coeffs_high ?? resp.coeffs} />
          </AnswerCard>

          <AnswerCard
            label="B"
            title="Companion matrix (Frobenius form)"
          >
            <MatrixTable mat={resp.companion_matrix ?? resp.A} />
          </AnswerCard>

          <AnswerCard
            label="C"
            title="Roots = Eigenvalues (via LU decomposition)"
          >
            <h6 className="text-secondary small mb-2">Eigenvalues</h6>
            <InlineArray arr={resp.eigenvalues ?? resp.roots} />

            <h6 className="text-secondary small mt-3 mb-2">LU Decomposition</h6>
            <div className="row g-3">
              <div className="col-md-4">
                <h6 className="text-muted small">P</h6>
                <MatrixTable mat={resp.P_lu} />
              </div>
              <div className="col-md-4">
                <h6 className="text-muted small">L</h6>
                <MatrixTable mat={resp.L_lu} />
              </div>
              <div className="col-md-4">
                <h6 className="text-muted small">U</h6>
                <MatrixTable mat={resp.U_lu} />
              </div>
            </div>
          </AnswerCard>

          <AnswerCard
            label="D"
            title={`Solution of A·x = b  (b = {1,2,…,${n}})`}
          >
            <h6 className="text-secondary small mb-2">b vector</h6>
            <InlineArray
              arr={
                resp.b_vector ??
                Array.from({ length: Number(n) }, (_, i) => i + 1)
              }
            />

            <h6 className="text-secondary small mt-3 mb-2">Determinant det(A)</h6>
            <PrettyPre>{String(resp.determinant ?? resp.det)}</PrettyPre>

            <h6 className="text-secondary small mt-3 mb-2">
              Solution vector x
            </h6>
            <InlineArray
              arr={resp.x_solution ?? resp.solution ?? resp.x}
            />
          </AnswerCard>

          <AnswerCard
            label="E"
            title="Newton–Raphson smallest & largest roots"
          >
            <div className="row">
              <div className="col-md-6">
                <h6 className="text-muted small">Smallest</h6>
                <PrettyPre>{String(resp.newton_smallest ?? "-")}</PrettyPre>
              </div>
              <div className="col-md-6">
                <h6 className="text-muted small">Largest</h6>
                <PrettyPre>{String(resp.newton_largest ?? "-")}</PrettyPre>
              </div>
            </div>

            <h6 className="text-secondary small mt-3 mb-2">
              Iteration logs
            </h6>
            <PrettyPre>
              {(resp.newton_logs ?? resp.logs ?? []).join("\n")}
            </PrettyPre>
          </AnswerCard>

          <div
            className="p-4 rounded-4 shadow-sm mt-4"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <h6 className="fw-semibold text-light mb-3">Summary</h6>
            <ul className="mb-0 text-secondary small">
              <li>
                Degree: {resp.coeffs_high?.length
                  ? resp.coeffs_high.length - 1
                  : "?"}
              </li>
              <li>
                Eigenvalues: {resp.eigenvalues?.length ?? "?"}
              </li>
              <li>Determinant: {String(resp.determinant ?? "-")}</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default Polynomial;
