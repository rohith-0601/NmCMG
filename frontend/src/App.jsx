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
      <div
        style={{
          minHeight: "100vh",
          width: "100%",
          display: "flex",
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #334155 100%)",
          backgroundAttachment: "fixed",
          color: "#fff",
          fontFamily: "Inter, sans-serif",
          transition: "background 0.5s ease-in-out",
        }}
      >
        {/* 🔹 Left Vertical Navigation */}
        <div
          style={{
            width: "220px",
            height: "100vh",
            position: "fixed",
            left: 0,
            top: 0,
            background: "rgba(255,255,255,0.05)",
            borderRight: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            padding: "40px 20px",
            gap: "22px",
            backdropFilter: "blur(10px)",
          }}
        >
          <h5
            style={{
              fontWeight: 700,
              fontSize: "1.3rem",
              color: "#00e5ff",
              marginBottom: "20px",
            }}
          >

          </h5>

          {[
            { to: "/", short: "H", label: "Harshad" },
            { to: "/polynomial", short: "P", label: "Polynomial" },
            { to: "/gauss", short: "G", label: "Gauss–Legendre" },
            { to: "/diffeqn", short: "D", label: "Differential Eqn" },
          ].map(({ to, short, label }) => (
            <NavLink
              key={short}
              to={to}
              style={({ isActive }) => {
                return {
                  display: "flex",
                  color:"black",
                  alignItems: "center",
                  gap: "12px",
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  fontWeight: 600,
                  color: isActive ? "#00e5ff" : "#e2e8f0",
                  background: isActive
                    ? "rgba(0, 188, 212, 0.15)"
                    : "transparent",
                  textDecoration: "none",
                  boxShadow: isActive
                    ? "0 0 10px rgba(0, 229, 255, 0.3)"
                    : "none",
                  transition: "all 0.2s ease-in-out",
                };
              }}
            >
              {({ isActive }) => (
                <>
                  <div
                    style={{
                      backgroundColor: isActive ? "#00e5ff" : "#334155",
                      color: isActive ? "#0f172a" : "#f1f5f9",
                      width: "34px",
                      height: "34px",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "700",
                      fontSize: "1rem",
                      flexShrink: 0,
                      transition: "all 0.2s ease-in-out",
                    }}
                  >
                    {short}
                  </div>
                  <span style={{color:"white"}}>{label}</span>
                  
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* 🌍 Page Content */}
        <div
          style={{
            marginLeft: "240px",
            width: "calc(100% - 240px)",
            padding: "50px 40px",
          }}
        >
          <Routes>
            <Route path="/" element={<Harshad />} />
            <Route path="/polynomial" element={<Polynomial />} />
            <Route path="/gauss" element={<GaussLeg />} />
            <Route path="/diffeqn" element={<Diffeqn />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
