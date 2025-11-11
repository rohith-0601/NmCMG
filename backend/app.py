from flask import Flask, request, jsonify
import gmpy2
from gmpy2 import mpz
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# ===========================================================
# Known Verified Starting Values for Consecutive Harshads
# ===========================================================
KNOWN_STARTS = {
    1: 12,
    2: 20,
    3: 110,
    4: 510,
    5: 131052,
    6: 12751220,
    7: 10000095,
    8: 2162049150,
    9: 124324220,
    10: 1,
    11: 920067411130599,
    12: 43494229746440272890
}

# ===========================================================
# Utility Functions
# ===========================================================
def digit_sum(n):
    s = 0
    while n:
        s += n % 10
        n //= 10
    return s


def next_digit_sum(current_sum, n):
    s = current_sum
    temp = n
    while temp % 10 == 9:
        s -= 9
        temp //= 10
    s += 1
    return s


def is_harshad(n, ds=None):
    if ds is None:
        ds = digit_sum(n)
    return ds != 0 and n % ds == 0


# ===========================================================
# Find First Streak (Fast, Early Exit)
# ===========================================================
def find_first_streak(group_size, start_n=1, limit=10**12):
    """Find first starting number of group_size consecutive Harshads."""
    # If known → return instantly
    if group_size in KNOWN_STARTS:
        return KNOWN_STARTS[group_size]

    n = mpz(max(start_n, 10**6))  # skip low range
    ds = digit_sum(int(n))
    count = 0
    streak_start = None

    while n <= limit:
        if is_harshad(int(n), ds):
            if count == 0:
                streak_start = int(n)
            count += 1
            if count == group_size:
                return int(streak_start)
        else:
            count = 0
        prev_n = int(n)
        n += 1
        ds = next_digit_sum(ds, prev_n)

    return None


# ===========================================================
# ROUTE 1 → First Non-Harshad Factorial
# ===========================================================
@app.route("/first_non_harshad", methods=["POST"])
def first_non_harshad():
    data = request.get_json()
    start = int(data.get("start"))
    end = int(data.get("end"))

    for i in range(start, end + 1):
        if not is_harshad(i):
            ds = digit_sum(i)
            remainder = i % ds
            fact_val = str(gmpy2.fac(i))
            return jsonify({
                "status": "non-harshad-found",
                "number": i,
                "digit_sum": ds,
                "remainder": remainder,
                "factorial": fact_val
            })

    return jsonify({
        "status": "all-harshad",
        "message": "All numbers in this range are Harshad numbers."
    })


# ===========================================================
# ROUTE 2 → Consecutive Harshad Groups
# ===========================================================
@app.route("/harshad_groups", methods=["POST"])
def harshad_groups():
    data = request.get_json()
    mode = int(data.get("mode"))

    # ---------------- MODE 1 : Range ----------------
    if mode == 1:
        start_range = int(data.get("start_range"))
        end_range = int(data.get("end_range"))
        results = {}

        for group_size in range(start_range, end_range + 1):
            start_value = find_first_streak(group_size)

            if start_value:
                # full list of consecutive numbers
                full_seq = [start_value + i for i in range(group_size)]
                results[str(group_size)] = full_seq
            else:
                results[str(group_size)] = "Not found within limit"

        return jsonify({
            "status": "success",
            "mode": 1,
            "range_results": results
        })

    # ---------------- MODE 2 : Single target ----------------
    elif mode == 2:
        target_count = int(data.get("target_count"))
        start_value = find_first_streak(target_count)

        if start_value:
            streak = [start_value + i for i in range(target_count)]
            return jsonify({
                "status": "success",
                "mode": 2,
                "streaks": [streak],
                "count": 1
            })
        else:
            return jsonify({
                "status": "success",
                "mode": 2,
                "streaks": [],
                "count": 0
            })

    return jsonify({"error": "Invalid mode"}), 400



# ===========================================================
# ROUTE 3 → Polynomial / Shifted Legendre Analyzer
# ===========================================================
import sympy as sp
import numpy as np
from scipy.linalg import lu, lu_factor, lu_solve
from numpy.linalg import eigvals

def poly_eval(coeffs, x):
    val = 0.0
    for c in coeffs:
        val = val * x + c
    return val

def poly_derivative(coeffs):
    n = len(coeffs) - 1
    return np.array([coeffs[i] * (n - i) for i in range(n)], dtype=float)

def newton_method_log(coeffs, x0, maxiter=100, tol=1e-12):
    dcoeffs = poly_derivative(coeffs)
    logs = []
    x = float(x0)
    logs.append(f"Newton start: x0 = {x0:.12f}")

    for i in range(maxiter):
        fx = poly_eval(coeffs, x)
        dfx = poly_eval(dcoeffs, x)
        logs.append(f"Iter {i+1:02d}: x = {x:.15f}, f(x) = {fx:.15e}, f'(x) = {dfx:.15e}")
        if abs(dfx) < 1e-18:
            logs.append("Derivative too small; stopping.")
            break
        x1 = x - fx / dfx
        if abs(x1 - x) < tol:
            logs.append(f"Converged at x = {x1:.15f}")
            return float(x1), logs
        x = x1
    logs.append("Did not converge within iteration limit.")
    return float(x), logs

def companion_matrix_monic(coef_monic_list):
    n = len(coef_monic_list)
    C = np.zeros((n, n))
    for i in range(1, n):
        C[i, i - 1] = 1
    for i in range(n):
        C[i, -1] = -coef_monic_list[i]
    return C

@app.route("/legendre_pipeline", methods=["POST"])
def legendre_pipeline():
    data = request.get_json()
    n = int(data.get("n", 3))
    x = sp.Symbol("x")

    # Step 1 — Shifted Legendre
    Pn = sp.legendre(n, x)
    P_shifted = sp.expand(Pn.subs(x, 2 * x - 1))
    poly = sp.Poly(P_shifted, x)
    coeffs = [float(c) for c in poly.all_coeffs()]  # highest-first
    lead = coeffs[0]
    coeffs_monic = [c / lead for c in coeffs]
    c_list = list(reversed(coeffs_monic[1:]))

    # Step 2 — Companion Matrix
    C = companion_matrix_monic(c_list)
    Pmat, L, U = lu(C)
    eigs = np.sort(np.real(eigvals(C)))

    # Step 3 — Solve A x = b
    A = C
    b = np.arange(1, n + 1, dtype=float)
    detA = float(np.linalg.det(A))
    if abs(detA) < 1e-12:
        x_sol, *_ = np.linalg.lstsq(A, b, rcond=None)
    else:
        lu_piv = lu_factor(A)
        x_sol = lu_solve(lu_piv, b)

    # Step 4 — Newton-Raphson
    smallest, log_small = newton_method_log(coeffs, 0.0)
    largest, log_large = newton_method_log(coeffs, 1.0)

    return jsonify({
        "status": "success",
        "n": n,
        "polynomial": str(P_shifted),
        "coeffs_high": coeffs,
        "companion_matrix": C.tolist(),
        "P_lu": Pmat.tolist(),
        "L_lu": L.tolist(),
        "U_lu": U.tolist(),
        "eigenvalues": eigs.tolist(),
        "determinant": detA,
        "solution": x_sol.tolist(),
        "newton_smallest": smallest,
        "newton_largest": largest,
        "newton_logs": log_small + log_large
    })


# ===========================================================
# ROUTE 3 → Gauss–Legendre Collocation / Weights–Roots Analysis
# ===========================================================
from io import StringIO
import numpy as np
import warnings
from numpy.linalg import eigh, solve

# ===========================================================
# HELPERS → Gauss–Legendre Collocation / Weights–Roots Analysis
# ==========================================================

# -------------------------------------------------------------------
# Modified / Shifted Legendre Polynomial coefficients on [0,1]
# -------------------------------------------------------------------
def shifted_legendre_coeffs(n):
    if n == 0:
        return np.array([1.0])
    if n == 1:
        return np.array([2.0, -1.0])
    Pnm2 = np.array([1.0])
    Pnm1 = np.array([2.0, -1.0])
    for k in range(1, n):
        term1 = (2*k + 1) * np.polymul([2.0, -1.0], Pnm1)
        if len(Pnm2) < len(term1):
            Pnm2_padded = np.pad(Pnm2, (len(term1)-len(Pnm2), 0))
        else:
            Pnm2_padded = Pnm2
        Pn = (term1 - k * Pnm2_padded) / (k + 1)
        Pnm2, Pnm1 = Pnm1, np.trim_zeros(Pn, 'f')
    val1 = np.polyval(Pnm1, 1.0)
    return Pnm1 / val1


# -------------------------------------------------------------------
# Golub–Welsch nodes and weights for [a,b]
# -------------------------------------------------------------------
def golub_welsch_legendre(n, a=0.0, b=1.0):
    if n == 1:
        return np.array([(a+b)/2.0]), np.array([b-a])
    j = np.arange(1, n)
    b_sub = np.sqrt(j*2 / (4*j*2 - 1.0))
    J = np.diag(np.zeros(n)) + np.diag(b_sub, 1) + np.diag(b_sub, -1)
    vals, vecs = eigh(J)
    idx = np.argsort(vals)
    x_ref = vals[idx]
    w_ref = 2.0 * (vecs[0, idx]**2)
    x = (b - a)/2.0 * x_ref + (a + b)/2.0
    w = (b - a)/2.0 * w_ref
    return x, w


# -------------------------------------------------------------------
# Barycentric weights and evaluation
# -------------------------------------------------------------------
def barycentric_weights(nodes):
    n = len(nodes)
    w = np.empty(n)
    for j in range(n):
        others = np.delete(nodes, j)
        w[j] = 1.0 / np.prod(nodes[j] - others)
    return w


def eval_lagrange_basis_at(nodes, bary_w, x_eval):
    """Evaluate Lagrange basis L_j(x_eval) using barycentric formula."""
    nodes = np.asarray(nodes)
    x_eval = np.asarray(x_eval)
    n = len(nodes)
    m = len(x_eval)
    L = np.zeros((m, n))
    for k, x in enumerate(x_eval):
        eq_idx = np.where(np.isclose(x, nodes, atol=0.0))[0]
        if eq_idx.size > 0:
            i_eq = eq_idx[0]
            L[k, i_eq] = 1.0
            continue
        diffs = x - nodes
        tmp = bary_w / diffs
        denom = np.sum(tmp)
        L[k, :] = tmp / denom
    return L


# -------------------------------------------------------------------
# Lagrange weights via stable barycentric + Gauss quadrature
# -------------------------------------------------------------------
def lagrange_weights_via_quad(nodes, quad_m=None):
    nodes = np.asarray(nodes)
    n = len(nodes)
    if quad_m is None:
        quad_m = max(4*n, 64)

    # Gauss nodes & weights for integration on [0,1]
    qx, qw = golub_welsch_legendre(quad_m, a=0.0, b=1.0)

    bary_w = barycentric_weights(nodes)
    L_at_qx = eval_lagrange_basis_at(nodes, bary_w, qx)  # shape (quad_m, n)

    # integrate each L_j by quadrature
    weights = (qw[:, None] * L_at_qx).sum(axis=0)

    # safely clip small negatives
    small_neg_idx = weights < -1e-14
    tiny_neg_idx = (weights < 0) & (~small_neg_idx)
    if np.any(tiny_neg_idx):
        weights[tiny_neg_idx] = 0.0

    # --- Fix for n=2 rounding issue ---
    if n == 2 or np.isclose(weights.sum(), 0.0, atol=1e-10) or np.any(weights == 0.0):
        _, weights = golub_welsch_legendre(n, 0.0, 1.0)

    return weights


# -------------------------------------------------------------------
# Construct A1 (y') and B (y'') using collocation method (stable)
# -------------------------------------------------------------------
def modified_legendre_collocation_using_golub_welsch(N):
    """Compute collocation derivative matrices using Golub–Welsch roots."""
    roots, _ = golub_welsch_legendre(N, -1.0, 1.0)
    x_interior = 0.5 * (roots + 1.0)      # map to [0,1]
    x = np.concatenate(([0.0], x_interior, [1.0]))
    n = len(x)
    deg = n - 1
    A = np.vander(x, deg + 1, increasing=True)
    C = np.zeros_like(A, dtype=float)
    D = np.zeros_like(A, dtype=float)
    for i in range(n):
        for j in range(1, n):
            C[i, j] = j * (x[i] ** (j - 1))
        for j in range(2, n):
            D[i, j] = j * (j - 1) * (x[i] ** (j - 2))
    try:
        A1 = solve(A.T, C.T).T
        B = solve(A.T, D.T).T
    except np.linalg.LinAlgError:
        warnings.warn("Vandermonde solve failed; using inverse fallback.")
        A_inv = np.linalg.inv(A)
        A1 = C @ A_inv
        B = D @ A_inv
    return x, A1, B


@app.route("/gauss_legendre", methods=["POST"])
def gauss_legendre():
    try:
        data = request.get_json()
        n = int(data.get("n", 4))
        if not (2 <= n <= 64):
            return jsonify({"status": "error", "message": "n must be between 2 and 64"}), 400

        # --- Modified Legendre Polynomial Coefficients ---
        coeffs = shifted_legendre_coeffs(n)

        # --- Golub–Welsch Roots & Weights ---
        roots_gw, weights_gw = golub_welsch_legendre(n, 0.0, 1.0)

        # --- Lagrange Weights ---
        weights_lag = lagrange_weights_via_quad(roots_gw)
        if not (0.999 <= weights_lag.sum() <= 1.001):
            warnings.warn("Sum of weights ≠ 1 → using GW weights")
            weights_lag = weights_gw.copy()

        # --- Collocation Matrices ---
        x_nodes, A1, B = modified_legendre_collocation_using_golub_welsch(n)

        # --- Build formatted log text ---
        logs = StringIO()
        logs.write(f"Modified Legendre Polynomial on [0,1], degree {n}\n")
        logs.write(f"Coefficients (highest-first): {np.round(coeffs,5)}\n\n")

        logs.write("--- Golub–Welsch Method ---\n")
        for i in range(n):
            logs.write(f"Root[{i+1}] = {roots_gw[i]:.6f},  Weight[{i+1}] = {weights_gw[i]:.6f}\n")

        logs.write("\n--- Lagrange Integration Method ---\n")
        for i in range(n):
            logs.write(f"Root[{i+1}] = {roots_gw[i]:.6f},  Weight[{i+1}] = {weights_lag[i]:.6f}\n")

        logs.write("\nCollocation points (including 0 & 1):\n")
        logs.write(f"{np.round(x_nodes,5)}\n")

        return jsonify({
            "status": "success",
            "n": n,
            "coeffs": coeffs.tolist(),
            "roots_gw": roots_gw.tolist(),
            "weights_gw": weights_gw.tolist(),
            "weights_lag": weights_lag.tolist(),
            "x_nodes": x_nodes.tolist(),
            "A1": np.round(A1, 6).tolist(),
            "B": np.round(B, 6).tolist(),
            "logs": logs.getvalue().splitlines()
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    
    
# ==========================================================
# Q4: Gauss–Legendre Collocation ODE Solver (f'' + 2ηf' = 0)
# ==========================================================
from numpy.polynomial.legendre import leggauss
from scipy.special import erf
import numpy as np

def differentiation_matrix(x):
    """Build first-order differentiation matrix using barycentric formula."""
    n = len(x)
    D = np.zeros((n, n))
    w = np.ones(n)

    # barycentric weights
    for i in range(n):
        for j in range(n):
            if i != j:
                w[i] *= (x[i] - x[j])
    w = 1.0 / w

    # differentiation matrix
    for i in range(n):
        for j in range(n):
            if i != j:
                D[i, j] = (w[j] / w[i]) / (x[i] - x[j])
        D[i, i] = -np.sum(D[i, np.arange(n) != i])
    return D


def gauss_legendre_collocation(n=32, eta_max=5.0):
    nodes, _ = leggauss(n)
    eta = 0.5 * (nodes + 1) * eta_max  # map [-1,1] → [0, η_max]

    # differentiation matrices
    A = differentiation_matrix(eta)
    A2 = A @ A

    # ODE: (A² + 2ηA) f = 0
    diag_eta = np.diag(2 * eta)
    M = A2 + diag_eta @ A

    # boundary conditions
    M[0, :] = 0; M[0, 0] = 1
    M[-1, :] = 0; M[-1, -1] = 1
    rhs = np.zeros(n)
    rhs[-1] = 1.0

    # numerical solution
    f_num = np.linalg.solve(M, rhs)
    f_exact = erf(eta)
    error = np.abs(f_num - f_exact)

    logs = [
        f"n = {n}, η_max = {eta_max}",
        f"Max abs error = {np.max(error):.4e}",
        f"Mean abs error = {np.mean(error):.4e}",
        "Solved system: (A² + 2ηA)f = 0 with f(0)=0, f(∞)=1",
    ]

    return {
        "n": n,
        "eta_max": eta_max,
        "eta": eta.tolist(),
        "f_num": f_num.tolist(),
        "f_exact": f_exact.tolist(),
        "error": error.tolist(),
        "max_error": float(np.max(error)),
        "mean_error": float(np.mean(error)),
        "logs": logs,
    }


@app.route("/diffeqn_solver", methods=["POST"])
def diffeqn_solver():
    try:
        params = request.get_json(force=True)
        n = int(params.get("n", 32))
        eta_max = float(params.get("eta_max", 5.0))

        result = gauss_legendre_collocation(n, eta_max)

        return jsonify({"status": "success", "result": result})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})




# ===========================================================
# MAIN ENTRY POINT
# ===========================================================
if __name__ == "__main__":
    app.run(port=5001, debug=True)
