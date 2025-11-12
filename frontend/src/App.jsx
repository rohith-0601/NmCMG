import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Harshad from "./components/HarshadPages/Harshad";
import Polynomial from "./components/PolynomialPages/Polynomial";
import Diffeqn from "./components/DiffeqnPages/Diffeqn";
import GaussLeg from "./components/Gausspages/Guassleg";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="d-flex min-vh-100 bg-gradient">
        {/* Sidebar Navigation */}
        <nav className="sidebar d-flex flex-column bg-dark border-end shadow-lg">
          <div className="p-4 border-bottom border-secondary">
            <h4 className="text-cyan fw-bold mb-0">Numerical Methods</h4>
          </div>

          <ul className="nav flex-column p-3 gap-2">
            {[
              { to: "/", icon: "H", label: "Harshad" },
              { to: "/polynomial", icon: "P", label: "Polynomial" },
              { to: "/gauss", icon: "G", label: "Gauss–Legendre" },
              { to: "/diffeqn", icon: "D", label: "Differential Eqn" },
            ].map(({ to, icon, label }) => (
              <li className="nav-item" key={icon}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `nav-link d-flex align-items-center gap-3 rounded-3 px-3 py-2 ${
                      isActive ? "active-link" : "inactive-link"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div
                        className={`icon-box d-flex align-items-center justify-content-center rounded-2 ${
                          isActive ? "icon-active" : "icon-inactive"
                        }`}
                      >
                        {icon}
                      </div>
                      <span className="fw-semibold">{label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Main Content Area */}
        <main className="flex-grow-1 p-4 overflow-auto">
          <div className="container-fluid">
            <Routes>
              <Route path="/" element={<Harshad />} />
              <Route path="/polynomial" element={<Polynomial />} />
              <Route path="/gauss" element={<GaussLeg />} />
              <Route path="/diffeqn" element={<Diffeqn />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
