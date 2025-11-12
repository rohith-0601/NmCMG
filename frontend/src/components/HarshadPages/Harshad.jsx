import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const Harshad = () => {
  // -------------------------------
  // QUESTION A STATES
  // -------------------------------
  const [q1Start, setQ1Start] = useState("");
  const [q1End, setQ1End] = useState("");
  const [q1Result, setQ1Result] = useState(null);
  const [q1Loading, setQ1Loading] = useState(false);

  // -------------------------------
  // QUESTION B STATES
  // -------------------------------
  const [mode, setMode] = useState(null);
  const [startRange, setStartRange] = useState("");
  const [endRange, setEndRange] = useState("");
  const [targetCount, setTargetCount] = useState("");
  const [q2Result, setQ2Result] = useState(null);
  const [q2Loading, setQ2Loading] = useState(false);

  // -------------------------------
  // HANDLE QUESTION A
  // -------------------------------
  const handleQ1Submit = async (e) => {
    e.preventDefault();
    setQ1Loading(true);
    setQ1Result(null);
    try {
      const res = await fetch("http://localhost:5001/first_non_harshad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start: Number(q1Start), end: Number(q1End) }),
      });
      const data = await res.json();
      setQ1Result(data);
    } catch (err) {
      console.error(err);
    } finally {
      setQ1Loading(false);
    }
  };

  // -------------------------------
  // HANDLE QUESTION B
  // -------------------------------
  const handleModeSelect = (m) => {
    setMode(m);
    setQ2Result(null);
  };

  const handleQ2Submit = async (e) => {
    e.preventDefault();
    setQ2Loading(true);
    setQ2Result(null);
    try {
      let payload = {};
      if (mode === 1) {
        payload = {
          mode: 1,
          start_range: Number(startRange),
          end_range: Number(endRange),
        };
      } else {
        payload = { mode: 2, target_count: Number(targetCount) };
      }

      const res = await fetch("http://localhost:5001/harshad_groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setQ2Result(data);
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setQ2Loading(false), 500);
    }
  };

  // -------------------------------
  // UI
  // -------------------------------
  return (
    <div
      className="py-5 px-3 px-md-5"
      style={{
        color: "#e5e7eb",
        minHeight: "100vh",
        fontFamily: "Inter, system-ui, sans-serif",
        backgroundColor: "#0f172a",
      }}
    >
      {/* ------------------ HEADER ------------------ */}
      <div className="text-center mb-5">
        <h1
          style={{
            fontWeight: 700,
            fontSize: "2.3rem",
            color: "#f1f5f9",
            letterSpacing: "0.5px",
          }}
        >
          Harshad Numbers
        </h1>
        <p style={{ color: "#94a3b8" }}>
          Explore factorials and consecutive Harshad sequences
        </p>
      </div>

      {/* ------------------ CARD 1 ------------------ */}
      <div
        className="p-4 mb-5 rounded-4 shadow-sm"
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <h4 className="fw-semibold mb-4" style={{ color: "#f8fafc" }}>
          A. First Factorials that are{" "}
          <span className="text-danger">Not Harshad Numbers</span>
        </h4>

        <form onSubmit={handleQ1Submit} className="row g-3 mb-3">
          <div className="col-md-5">
            <input
              type="number"
              className="form-control bg-dark border-0 text-light"
              placeholder="Start number"
              value={q1Start}
              onChange={(e) => setQ1Start(e.target.value)}
              required
              style={{ borderRadius: "10px", padding: "10px" }}
            />
          </div>
          <div className="col-md-5">
            <input
              type="number"
              className="form-control bg-dark border-0 text-light"
              placeholder="End number"
              value={q1End}
              onChange={(e) => setQ1End(e.target.value)}
              required
              style={{ borderRadius: "10px", padding: "10px" }}
            />
          </div>
          <div className="col-md-2">
            <button
              type="submit"
              className="btn btn-light w-100 fw-semibold"
              style={{
                borderRadius: "10px",
                color: "#0f172a",
                background: "#f8fafc",
              }}
            >
              Find
            </button>
          </div>
        </form>

        {q1Loading && (
          <div className="text-center mt-3">
            <div
              className="spinner-border text-light"
              style={{ width: "3rem", height: "3rem" }}
            ></div>
            <p className="text-secondary mt-3">Processing...</p>
          </div>
        )}

        {/* Display factorial results */}
        {q1Result && !q1Loading && (
          <div
            className="mt-4 p-3 rounded-3"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {q1Result.status === "non-harshad-found" ? (
              <>
                <h5 className="text-info mb-3">
                  ❌ Non-Harshad Factorials Found
                </h5>
                <table className="table table-dark table-striped table-bordered">
                  <thead>
                    <tr>
                      <th>n</th>
                      <th>Digit Sum</th>
                      <th>Remainder</th>
                      <th>Factorial (n!)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {q1Result.results.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.n}</td>
                        <td>{item.digit_sum}</td>
                        <td>{item.remainder}</td>
                        <td
                          style={{
                            wordBreak: "break-all",
                            fontSize: "0.85rem",
                            color: "#cbd5e1",
                          }}
                        >
                          {item.factorial}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : (
              <p className="text-warning">{q1Result.message}</p>
            )}
          </div>
        )}
      </div>

      {/* ------------------ CARD 2 ------------------ */}
      <div
        className="p-4 rounded-4 shadow-sm"
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <h4 className="fw-semibold mb-4" style={{ color: "#f8fafc" }}>
          B. Consecutive Harshad Numbers
        </h4>
        <p style={{ color: "#94a3b8" }}>
          Find Harshad number streaks by range or by number of consecutive
          values.
        </p>

        <div className="d-flex gap-3 mb-4 flex-wrap">
          <button
            type="button"
            className={`btn ${
              mode === 1 ? "btn-light text-dark" : "btn-outline-light"
            } w-100 w-md-50 fw-semibold`}
            style={{ borderRadius: "10px" }}
            onClick={() => handleModeSelect(1)}
          >
            Range
          </button>
          <button
            type="button"
            className={`btn ${
              mode === 2 ? "btn-light text-dark" : "btn-outline-light"
            } w-100 w-md-50 fw-semibold`}
            style={{ borderRadius: "10px" }}
            onClick={() => handleModeSelect(2)}
          >
            No. of Consecutives
          </button>
        </div>

        {mode && (
          <form onSubmit={handleQ2Submit} className="row g-3 mb-4">
            {mode === 1 ? (
              <>
                <div className="col-md-4">
                  <input
                    type="number"
                    className="form-control bg-dark border-0 text-light"
                    placeholder="From (e.g. 2)"
                    value={startRange}
                    onChange={(e) => setStartRange(e.target.value)}
                    required
                    style={{ borderRadius: "10px" }}
                  />
                </div>
                <div className="col-md-4">
                  <input
                    type="number"
                    className="form-control bg-dark border-0 text-light"
                    placeholder="To (e.g. 5)"
                    value={endRange}
                    onChange={(e) => setEndRange(e.target.value)}
                    required
                    style={{ borderRadius: "10px" }}
                  />
                </div>
              </>
            ) : (
              <div className="col-md-8">
                <input
                  type="number"
                  className="form-control bg-dark border-0 text-light"
                  placeholder="Enter consecutive count (e.g. 10)"
                  value={targetCount}
                  onChange={(e) => setTargetCount(e.target.value)}
                  required
                  style={{ borderRadius: "10px" }}
                />
              </div>
            )}
            <div className="col-md-4">
              <button
                type="submit"
                className="btn btn-light w-100 fw-semibold text-dark"
                style={{ borderRadius: "10px" }}
              >
                Find
              </button>
            </div>
          </form>
        )}

        {q2Loading && (
          <div className="text-center mt-3">
            <div
              className="spinner-border text-light"
              style={{ width: "3rem", height: "3rem" }}
            ></div>
            <p className="text-secondary mt-3">
              Searching consecutive groups...
            </p>
          </div>
        )}

        {q2Result && !q2Loading && (
          <div
            className="mt-4 p-3 rounded-3"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {mode === 1 && q2Result.range_results ? (
              <>
                <h5 className="text-info mb-3">
                  ✅ Groups within Range {startRange} – {endRange}
                </h5>
                <table className="table table-dark table-striped align-middle">
                  <thead>
                    <tr>
                      <th>Group Size</th>
                      <th>Groups Count</th>
                      <th>Groups Found</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(q2Result.range_results).map(
                      ([size, groups], idx) => {
                        let displayGroups = [];

                        if (Array.isArray(groups)) {
                          if (Array.isArray(groups[0])) displayGroups = groups;
                          else displayGroups = [groups];
                        } else {
                          displayGroups = [[groups]];
                        }

                        return (
                          <tr key={idx}>
                            <td>{size}</td>
                            <td>{displayGroups.length}</td>
                            <td style={{ wordBreak: "break-all" }}>
                              {displayGroups
                                .map((g) =>
                                  Array.isArray(g)
                                    ? `[${g.join(", ")}]`
                                    : `[${g}]`
                                )
                                .join(" ")}
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </>
            ) : mode === 2 && q2Result.streaks ? (
              <>
                <h5 className="text-info">
                  ✅ Found {q2Result.count} streaks of{" "}
                  {q2Result.streaks[0]?.length}-consecutive Harshads
                </h5>
                <ul className="list-group mt-3">
                  {q2Result.streaks.map((seq, idx) => (
                    <li
                      key={idx}
                      className="list-group-item bg-dark text-light border-0"
                    >
                      {seq.join(", ")}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-warning">❌ No results found.</p>
            )}
          </div>
        )}

        <div
          className="mt-4 p-3 rounded-3"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <h6 className="fw-semibold text-light">
            💡 Why no 20+ consecutive Harshad numbers?
          </h6>
          <p className="text-secondary mb-0">
            Because divisibility depends on the digit sum — eventually, one
            number breaks the pattern.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Harshad;
