import { NavLink, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();
  const showBrand = location.pathname !== "/";

  return (
    <>
      <nav className={`rg-navbar ${showBrand ? "has-brand" : "no-brand"}`}>
        {showBrand && (
          <NavLink to="/" className="rg-brand" end>
            🛣️ RoadGuard AI
          </NavLink>
        )}
        <div className="rg-nav-links">
          <NavLink to="/" end className={({ isActive }) => isActive ? "rg-nav-link active" : "rg-nav-link"}>
            Home
          </NavLink>
          <NavLink to="/reports" className={({ isActive }) => isActive ? "rg-nav-link active" : "rg-nav-link"}>
            Reports
          </NavLink>
        </div>
      </nav>
      <style>{`
        .rg-navbar {
          width: 100%;
          min-height: 68px;
          padding: 14px 7%;
          background: #0b1220;
          color: #ffffff;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          position: relative;
          z-index: 1000;
          box-sizing: border-box;
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        .rg-navbar.no-brand { justify-content: flex-end; }
        .rg-brand {
          color: #ffffff;
          text-decoration: none;
          font-size: 19px;
          font-weight: 800;
          white-space: nowrap;
        }
        .rg-nav-links { display: flex; gap: 8px; align-items: center; }
        .rg-nav-link {
          color: #cbd5e1;
          text-decoration: none;
          padding: 10px 16px;
          border-radius: 9px;
          font-size: 14px;
          font-weight: 650;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .rg-nav-link:hover { background: #1e293b; color: #ffffff; }
        .rg-nav-link.active { background: #e0f2fe; color: #075985; }
        @media (max-width: 520px) {
          .rg-navbar { padding: 13px 5%; align-items: flex-start; flex-direction: column; gap: 10px; }
          .rg-nav-links { width: 100%; }
          .rg-nav-link { flex: 1; text-align: center; }
        }
      `}</style>
    </>
  );
}

export default Navbar;
