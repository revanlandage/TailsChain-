import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyAdoptionsAPI } from "../utils/api";
import logo from "../assets/logo.jpeg";
import toast from "react-hot-toast";
import "./MyAdoptions.css";

const STATUS_INFO = {
  approved: { label: "Approved ✓", color: "green", icon: "🎉", msg: "Your adoption is complete and recorded on blockchain!" },
  pending:  { label: "Pending ⏳",  color: "yellow", icon: "⏳", msg: "Your request is under review." },
  rejected: { label: "Rejected ✗", color: "red",   icon: "❌", msg: "Unfortunately your request was not approved." },
};

export default function MyAdoptions() {
  const [adoptions, setAdoptions] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [selected,  setSelected]  = useState(null);

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const displayInitial = user?.name?.charAt(0).toUpperCase()
    || user?.email?.charAt(0).toUpperCase() || "U";

  useEffect(() => {
    const fetchAdoptions = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await getMyAdoptionsAPI();
        setAdoptions(data);
      } catch (err) {
        setError("Failed to load your adoptions.");
        toast.error("Could not connect to server");
      } finally {
        setLoading(false);
      }
    };
    fetchAdoptions();
  }, []);

  const approved = adoptions.filter(a => a.status === "approved").length;
  const pending  = adoptions.filter(a => a.status === "pending").length;
  const rejected = adoptions.filter(a => a.status === "rejected").length;

  return (
    <div className="myadopt-root">
      {/* HEADER */}
      <header className="myadopt-header">
        <div className="myadopt-header-inner">
          <div className="myadopt-logo" onClick={() => navigate("/dashboard")}>
            <img src={logo} alt="TailsChain" className="myadopt-logo-img" />
            <span className="myadopt-logo-text">TailsChain</span>
          </div>
          <div className="myadopt-header-right">
            <button className="back-dash-btn" onClick={() => navigate("/dashboard")}>← Dashboard</button>
            <div className="myadopt-avatar">{displayInitial}</div>
            <span className="myadopt-initial">{displayInitial}</span>
            <button className="myadopt-logout" onClick={() => { logout(); navigate("/auth"); }}>Logout</button>
          </div>
        </div>
        <nav className="myadopt-nav">
          <div className="myadopt-nav-inner">
            <button className="myadopt-nav-item active">🐾 My Adoptions</button>
          </div>
        </nav>
      </header>

      <main className="myadopt-main">
        {/* SUMMARY */}
        <div className="myadopt-summary">
          <div className="summary-card total">  <span className="summary-icon">🐾</span><div><strong>{adoptions.length}</strong><p>Total Requests</p></div></div>
          <div className="summary-card approved"><span className="summary-icon">🎉</span><div><strong>{approved}</strong><p>Approved</p></div></div>
          <div className="summary-card pending"> <span className="summary-icon">⏳</span><div><strong>{pending}</strong><p>Pending</p></div></div>
          <div className="summary-card rejected"><span className="summary-icon">❌</span><div><strong>{rejected}</strong><p>Rejected</p></div></div>
        </div>

        <h2 className="myadopt-title">My Adoption History</h2>

        {/* LOADING */}
        {loading && (
          <div className="myadopt-loading">
            {[1,2].map(i => <div key={i} className="adopt-skeleton" />)}
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div style={{textAlign:"center",padding:"40px",background:"#ffebee",borderRadius:8}}>
            <p style={{color:"#c62828",marginBottom:12}}>⚠️ {error}</p>
            <button onClick={() => window.location.reload()} style={{padding:"8px 20px",background:"#2874f0",color:"#fff",border:"none",borderRadius:4,cursor:"pointer",fontFamily:"Poppins,sans-serif",fontWeight:600}}>Retry</button>
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && adoptions.length === 0 && (
          <div className="myadopt-empty">
            <div className="empty-icon">🐾</div>
            <h3>No adoptions yet</h3>
            <p>You haven't adopted any animals yet. Browse and find your perfect companion!</p>
            <button className="browse-btn" onClick={() => navigate("/dashboard")}>Browse Animals →</button>
          </div>
        )}

        {/* ADOPTION CARDS */}
        {!loading && !error && adoptions.length > 0 && (
          <div className="adoption-cards">
            {adoptions.map(ad => {
              const info = STATUS_INFO[ad.status] || STATUS_INFO.pending;
              return (
                <div key={ad._id} className={`adoption-card status-${ad.status}`}>
                  <div className="adoption-card-left">
                    <div className="adoption-img-wrap">
                      <img src={ad.animal?.image} alt={ad.animal?.name} />
                      <span className={`ac-status-badge ${ad.status}`}>{info.label}</span>
                    </div>
                  </div>
                  <div className="adoption-card-body">
                    <div className="ac-top">
                      <div>
                        <h3 className="ac-animal-name">{ad.animal?.name}</h3>
                        <p className="ac-breed">{ad.animal?.breed} • {ad.animal?.category}</p>
                      </div>
                      <span className="ac-date">{new Date(ad.createdAt).toLocaleDateString("en-IN", {day:"numeric",month:"short",year:"numeric"})}</span>
                    </div>
                    <div className="ac-info-grid">
                      <div className="ac-info-item"><span>🎂 Age</span><strong>{ad.animal?.age} yr</strong></div>
                      <div className="ac-info-item"><span>⚥ Gender</span><strong>{ad.animal?.gender==="male"?"♂ Male":"♀ Female"}</strong></div>
                      <div className="ac-info-item"><span>💉 Vaccinated</span><strong className={ad.animal?.vaccinated?"green":"red"}>{ad.animal?.vaccinated?"Yes":"No"}</strong></div>
                      <div className="ac-info-item"><span>📍 City</span><strong>{ad.city}</strong></div>
                    </div>
                    <div className={`ac-status-bar ${ad.status}`}>
                      <span>{info.icon}</span><p>{info.msg}</p>
                    </div>
                    {ad.blockchainTxHash && (
                      <div className="ac-tx-row">
                        <span>🔗 Blockchain Tx:</span>
                        <code>{ad.blockchainTxHash}</code>
                      </div>
                    )}
                  </div>
                  <div className="adoption-card-right">
                    <button className="view-details-btn" onClick={() => setSelected(ad)}>View Details</button>
                    {ad.status === "approved" && <div className="adopted-badge-big">🏠<br/>Adopted!</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="myadopt-footer">
        <p>TailsChain — Blockchain Powered Animal Adoption | Made with ❤️ for Animals</p>
      </footer>

      {/* DETAIL MODAL */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📋 Adoption Details</h3>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="modal-animal-row">
                <img src={selected.animal?.image} alt="" />
                <div>
                  <h4>{selected.animal?.name}</h4>
                  <p>{selected.animal?.breed}</p>
                  <span className={`status-chip ${selected.status}`}>{STATUS_INFO[selected.status]?.label}</span>
                </div>
              </div>
              <div className="detail-grid">
                <div className="detail-row"><span>Adopter Name</span><strong>{selected.adopterName}</strong></div>
                <div className="detail-row"><span>City</span><strong>{selected.city}, {selected.state}</strong></div>
                <div className="detail-row"><span>Applied On</span><strong>{new Date(selected.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}</strong></div>
                <div className="detail-row"><span>Status</span><strong>{STATUS_INFO[selected.status]?.label}</strong></div>
                {selected.blockchainTxHash && (
                  <div className="detail-row full"><span>🔗 Blockchain Transaction</span><code>{selected.blockchainTxHash}</code></div>
                )}
                <div className="detail-row full"><span>Reason for Adoption</span><strong>{selected.reason}</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
