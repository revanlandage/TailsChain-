import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAnimalsAPI, createDonationOrderAPI, verifyDonationAPI } from "../utils/api";
import logo from "../assets/logo.jpeg";
import toast from "react-hot-toast";
import "./Dashboard.css";

const CATEGORIES = [
  { key: "all",   label: "All",    icon: "🐾" },
  { key: "cat",   label: "Cats",   icon: "🐱" },
  { key: "dog",   label: "Dogs",   icon: "🐶" },
  { key: "other", label: "Others", icon: "🐦" },
];

export default function Dashboard() {
  const [animals,         setAnimals]         = useState([]);
  const [filtered,        setFiltered]        = useState([]);
  const [activeCategory,  setActiveCategory]  = useState("all");
  const [search,          setSearch]          = useState("");
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState(null);
  const [dropdownOpen,    setDropdownOpen]    = useState(false);
  const [showDonation,    setShowDonation]    = useState(false);
  const [donationAmt,     setDonationAmt]     = useState(500);
  const [donating,        setDonating]        = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Show only first letter
  const displayInitial = user?.name?.charAt(0).toUpperCase()
    || user?.email?.charAt(0).toUpperCase()
    || "U";

  // Fetch animals from backend
  const fetchAnimals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getAnimalsAPI();
      setAnimals(data);
      setFiltered(data);
    } catch (err) {
      setError("Failed to load animals. Please try again.");
      toast.error("Could not connect to server");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAnimals(); }, [fetchAnimals]);

  // Filter by category + search
  useEffect(() => {
    let list = activeCategory === "all"
      ? animals
      : animals.filter(a => a.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.breed.toLowerCase().includes(q)
      );
    }
    setFiltered(list);
  }, [activeCategory, animals, search]);

  const handleDonate = async (amount) => {
    setDonating(true);
    try {
      const { data } = await createDonationOrderAPI(amount);

      const options = {
        key:         process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount:      data.amount,
        currency:    data.currency,
        name:        "TailsChain",
        description: "Donation for Animal Adoption Platform",
        image:       "/logo192.png",
        order_id:    data.orderId,
        handler: async (response) => {
          try {
            const verify = await verifyDonationAPI({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            });
            if (verify.data.success) {
              toast.success("🐾 Thank you for your donation! You are amazing!");
              setShowDonation(false);
            }
          } catch {
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name:  user?.name  || "",
          email: user?.email || "",
        },
        theme: { color: "#2874f0" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error("Could not initiate payment. Try again.");
    } finally {
      setDonating(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  const counts = {
    all:   animals.length,
    cat:   animals.filter(a => a.category === "cat").length,
    dog:   animals.filter(a => a.category === "dog").length,
    other: animals.filter(a => a.category === "other").length,
  };

  const adopted    = animals.filter(a => a.isAdopted).length;
  const available  = animals.filter(a => !a.isAdopted).length;

  return (
    <div className="dash-root">
      {/* ===== HEADER ===== */}
      <header className="dash-header">
        <div className="dash-header-inner">
          <div className="dash-logo" onClick={() => navigate("/dashboard")}>
            <img src={logo} alt="TailsChain" className="dash-logo-img" />
            <span className="dash-logo-text">TailsChain</span>
          </div>

          <div className="dash-search-bar">
            <input
              type="text"
              placeholder="Search animals by name or breed..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button className="search-btn">🔍</button>
          </div>

          <div className="dash-header-right">
            {/* Avatar with dropdown */}
            <div className="avatar-wrapper" onClick={() => setDropdownOpen(!dropdownOpen)}>
              <div className="dash-avatar">{displayInitial}</div>
              <span className="dash-username">{displayInitial}</span>
              <span className="avatar-arrow">{dropdownOpen ? "▲" : "▼"}</span>

              {dropdownOpen && (
                <div className="avatar-dropdown" onClick={e => e.stopPropagation()}>
                  <div className="dropdown-header">
                    <div className="dropdown-avatar">{displayInitial}</div>
                    <div>
                      <p className="dropdown-name">{user?.name || "User"}</p>
                      <p className="dropdown-email">{user?.email}</p>
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item" onClick={() => { setDropdownOpen(false); navigate("/my-adoptions"); }}>
                    🐾 My Adoptions
                  </button>
                  <button className="dropdown-item logout" onClick={() => { setDropdownOpen(false); handleLogout(); }}>
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CATEGORY NAV */}
        <nav className="dash-nav">
          <div className="dash-nav-inner">
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                className={`dash-nav-item ${activeCategory === cat.key ? "active" : ""}`}
                onClick={() => setActiveCategory(cat.key)}
              >
                <span>{cat.icon}</span>
                <span className="nav-label">{cat.label}</span>
                <span className="nav-count">({counts[cat.key]})</span>
              </button>
            ))}
          </div>
        </nav>
      </header>

      {/* BANNER */}
      <div className="dash-banner">
        <div className="dash-banner-content">
          <h2>Give a Forever Home 🏠</h2>
          <p>Every animal deserves love. Adopt, don't shop.</p>
        </div>
        <div className="dash-banner-stats">
          <div className="stat-item"><span>{available}</span><p>Available</p></div>
          <div className="stat-item"><span>{adopted}</span><p>Adopted</p></div>
          <div className="stat-item"><span>100%</span><p>Vaccinated</p></div>
        </div>
        <button className="donate-btn" onClick={() => setShowDonation(true)}>
          💝 Support Us
        </button>
      </div>

      {/* DONATION MODAL */}
      {showDonation && (
        <div className="donation-overlay" onClick={() => setShowDonation(false)}>
          <div className="donation-modal" onClick={e => e.stopPropagation()}>
            <button className="donation-close" onClick={() => setShowDonation(false)}>✕</button>
            <div className="donation-icon">💝</div>
            <h2>Support TailsChain</h2>
            <p>Your donation helps us connect more animals with loving homes.</p>
            <div className="donation-amounts">
              {[100, 250, 500, 1000].map(amt => (
                <button
                  key={amt}
                  className={`donation-amt-btn ${donationAmt === amt ? "selected" : ""}`}
                  onClick={() => setDonationAmt(amt)}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
            <div className="donation-custom">
              <label>Or enter custom amount</label>
              <input
                type="number"
                placeholder="Enter amount in ₹"
                value={donationAmt}
                onChange={e => setDonationAmt(parseInt(e.target.value))}
                min="1"
              />
            </div>
            <button
              className="donation-pay-btn"
              onClick={() => handleDonate(donationAmt)}
              disabled={donating || !donationAmt}
            >
              {donating ? "Processing..." : `Donate ₹${donationAmt} 💝`}
            </button>
            <p className="donation-note">🔒 100% Secure payment via Razorpay</p>
          </div>
        </div>
      )}

      {/* MAIN */}
      <main className="dash-main">
        <div className="dash-section-header">
          <h3>
            {CATEGORIES.find(c => c.key === activeCategory)?.icon}{" "}
            {CATEGORIES.find(c => c.key === activeCategory)?.label}
            {search && ` — "${search}"`}
          </h3>
          <span className="dash-count">{filtered.length} animals</span>
        </div>

        {/* ERROR STATE */}
        {error && (
          <div className="dash-error">
            <p>⚠️ {error}</p>
            <button onClick={fetchAnimals}>Retry</button>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="loading-grid">
            {[...Array(8)].map((_, i) => <div key={i} className="skeleton-card" />)}
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && filtered.length === 0 && (
          <div className="dash-empty">
            <p>🐾</p>
            <h3>No animals found</h3>
            <p>Try a different category or search term</p>
          </div>
        )}

        {/* ANIMAL GRID */}
        {!loading && !error && filtered.length > 0 && (
          <div className="animal-grid">
            {filtered.map(animal => (
              <div
                key={animal._id}
                className="animal-card"
                onClick={() => navigate(`/animal/${animal._id}`)}
              >
                <div className="animal-card-img-wrap">
                  <img
  src={animal.image}
  alt={animal.name}
  
  onError={(e) => {
    e.target.onerror = null;
    e.target.src = `https://placedog.net/400/300?id=${animal.name}`;
  }}
/>
                  {animal.isAdopted
                    ? <div className="adopted-badge">Adopted ✓</div>
                    : <div className="available-badge">Available</div>}
                </div>
                <div className="animal-card-body">
                  <h4 className="animal-card-name">{animal.name}</h4>
                  <p className="animal-card-breed">{animal.breed}</p>
                  <div className="animal-card-tags">
                    <span className={`tag tag-gender ${animal.gender}`}>
                      {animal.gender === "male" ? "♂ Male" : "♀ Female"}
                    </span>
                    <span className="tag tag-age">🎂 {animal.age}yr</span>
                    {animal.vaccinated && <span className="tag tag-vax">💉 Vaccinated</span>}
                  </div>
                  <button className={`animal-card-btn ${animal.isAdopted ? "adopted" : ""}`}>
                    {animal.isAdopted ? "Already Adopted" : "View & Adopt →"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="dash-footer">
        <p>TailsChain — Blockchain Powered Animal Adoption Platform | Made with ❤️ for Animals</p>
      </footer>
    </div>
  );
}
