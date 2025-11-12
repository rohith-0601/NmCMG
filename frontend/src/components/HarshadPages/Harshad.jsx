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

  return (
    <div className="harshad-page">
      <div className="container py-5">
        {/* Header */}
        <div className="text-center mb-5 header-section">
          <h1 className="display-4 fw-bold text-gradient mb-3">
            Harshad Numbers
          </h1>
          <p className="lead text-muted">
            Explore factorials and consecutive Harshad sequences
          </p>
        </div>

        {/* Question A - Non-Harshad Factorials */}
        <div className="card question-card shadow-lg mb-5">
          <div className="card-header border-0">
            <div className="d-flex align-items-center gap-3">
              <span className="badge-question">A</span>
              <h4 className="mb-0 fw-bold text-white">
                First Factorials that are{" "}
                <span className="text-danger">Not Harshad Numbers</span>
              </h4>
            </div>
          </div>
          <div className="card-body p-4">
            <form onSubmit={handleQ1Submit}>
              <div className="row g-3 mb-3">
                <div className="col-lg-5">
                  <label className="form-label text-light fw-semibold mb-2">
                    Start Number
                  </label>
                  <input
                    type="number"
                    className="form-control form-control-lg"
                    placeholder="e.g., 1"
                    value={q1Start}
                    onChange={(e) => setQ1Start(e.target.value)}
                    required
                  />
                </div>
                <div className="col-lg-5">
                  <label className="form-label text-light fw-semibold mb-2">
                    End Number
                  </label>
                  <input
                    type="number"
                    className="form-control form-control-lg"
                    placeholder="e.g., 100"
                    value={q1End}
                    onChange={(e) => setQ1End(e.target.value)}
                    required
                  />
                </div>
                <div className="col-lg-2 d-flex align-items-end">
                  <button
                    type="submit"
                    className="btn btn-gradient btn-lg w-100"
                    disabled={q1Loading}
                  >
                    {q1Loading ? (
                      <span className="spinner-border spinner-border-sm"></span>
                    ) : (
                      "Find"
                    )}
                  </button>
                </div>
              </div>
            </form>

            {q1Loading && (
              <div className="text-center py-5 loading-state">
                <div className="spinner-border text-cyan mb-3" style={{ width: "3rem", height: "3rem" }}></div>
                <p className="text-muted">Processing factorials...</p>
              </div>
            )}

            {q1Result && !q1Loading && (
              <div className="result-box mt-4">
                {q1Result.status === "non-harshad-found" ? (
                  <>
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <i className="bi bi-x-circle-fill text-danger fs-4"></i>
                      <h5 className="mb-0 text-white fw-bold">
                        Non-Harshad Factorials Found
                      </h5>
                    </div>
                    <div className="table-responsive">
                      <table className="table table-dark table-hover align-middle modern-table">
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
                              <td className="fw-bold text-cyan">{item.n}</td>
                              <td>{item.digit_sum}</td>
                              <td className="text-warning">{item.remainder}</td>
                              <td className="factorial-cell">{item.factorial}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="alert alert-warning d-flex align-items-center gap-2 mb-0">
                    <i className="bi bi-info-circle-fill"></i>
                    {q1Result.message}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Question B - Consecutive Harshad Numbers */}
        <div className="card question-card shadow-lg">
          <div className="card-header border-0">
            <div className="d-flex align-items-center gap-3 mb-3">
              <span className="badge-question badge-success">B</span>
              <h4 className="mb-0 fw-bold text-white">
                Consecutive Harshad Numbers
              </h4>
            </div>
            <p className="text-muted mb-0">
              Find Harshad number streaks by range or by number of consecutive values
            </p>
          </div>
          <div className="card-body p-4">
            {/* Mode Selection */}
            <div className="btn-group mode-selector w-100 mb-4" role="group">
              <button
                type="button"
                className={`btn btn-lg ${mode === 1 ? "active" : ""}`}
                onClick={() => handleModeSelect(1)}
              >
                <i className="bi bi-sliders me-2"></i>
                Range Mode
              </button>
              <button
                type="button"
                className={`btn btn-lg ${mode === 2 ? "active" : ""}`}
                onClick={() => handleModeSelect(2)}
              >
                <i className="bi bi-123 me-2"></i>
                Consecutive Count
              </button>
            </div>

            {mode && (
              <form onSubmit={handleQ2Submit}>
                <div className="row g-3 mb-3">
                  {mode === 1 ? (
                    <>
                      <div className="col-md-5">
                        <label className="form-label text-light fw-semibold">
                          From
                        </label>
                        <input
                          type="number"
                          className="form-control form-control-lg"
                          placeholder="e.g., 2"
                          value={startRange}
                          onChange={(e) => setStartRange(e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-md-5">
                        <label className="form-label text-light fw-semibold">
                          To
                        </label>
                        <input
                          type="number"
                          className="form-control form-control-lg"
                          placeholder="e.g., 5"
                          value={endRange}
                          onChange={(e) => setEndRange(e.target.value)}
                          required
                        />
                      </div>
                    </>
                  ) : (
                    <div className="col-md-10">
                      <label className="form-label text-light fw-semibold">
                        Consecutive Count
                      </label>
                      <input
                        type="number"
                        className="form-control form-control-lg"
                        placeholder="e.g., 10"
                        value={targetCount}
                        onChange={(e) => setTargetCount(e.target.value)}
                        required
                      />
                    </div>
                  )}
                  <div className="col-md-2 d-flex align-items-end">
                    <button
                      type="submit"
                      className="btn btn-gradient btn-lg w-100"
                      disabled={q2Loading}
                    >
                      {q2Loading ? (
                        <span className="spinner-border spinner-border-sm"></span>
                      ) : (
                        "Find"
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {q2Loading && (
              <div className="text-center py-5 loading-state">
                <div className="spinner-border text-cyan mb-3" style={{ width: "3rem", height: "3rem" }}></div>
                <p className="text-muted">Searching consecutive groups...</p>
              </div>
            )}

            {q2Result && !q2Loading && (
              <div className="result-box mt-4">
                {mode === 1 && q2Result.range_results ? (
                  <>
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <i className="bi bi-check-circle-fill text-success fs-4"></i>
                      <h5 className="mb-0 text-white fw-bold">
                        Groups within Range {startRange} – {endRange}
                      </h5>
                    </div>
                    <div className="table-responsive">
                      <table className="table table-dark table-hover align-middle modern-table">
                        <thead>
                          <tr>
                            <th>Group Size</th>
                            <th>Count</th>
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
                                  <td className="fw-bold text-cyan">{size}</td>
                                  <td className="text-success">{displayGroups.length}</td>
                                  <td className="groups-cell">
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
                    </div>
                  </>
                ) : mode === 2 && q2Result.streaks ? (
                  <>
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <i className="bi bi-check-circle-fill text-success fs-4"></i>
                      <h5 className="mb-0 text-white fw-bold">
                        Found {q2Result.count} streaks of{" "}
                        {q2Result.streaks[0]?.length}-consecutive Harshads
                      </h5>
                    </div>
                    <div className="streaks-container">
                      {q2Result.streaks.map((seq, idx) => (
                        <div key={idx} className="streak-item">
                          <span className="streak-badge">#{idx + 1}</span>
                          <span className="streak-values">{seq.join(", ")}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="alert alert-warning d-flex align-items-center gap-2 mb-0">
                    <i className="bi bi-x-circle-fill"></i>
                    No results found
                  </div>
                )}
              </div>
            )}

            {/* Info Box */}
            <div className="info-box mt-4">
              <div className="d-flex gap-3">
                <i className="bi bi-lightbulb-fill text-warning fs-4"></i>
                <div>
                  <h6 className="fw-bold text-white mb-2">
                    Why no 20+ consecutive Harshad numbers?
                  </h6>
                  <p className="text-muted mb-0">
                    Because divisibility depends on the digit sum — eventually, one
                    number breaks the pattern.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Harshad;
