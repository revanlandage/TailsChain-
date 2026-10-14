import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.jpeg";
import toast from "react-hot-toast";
import "./AnimalDetail.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const STEPS = ["Animal Details", "Adoption Form", "Success"];

export default function AnimalDetail() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const { user }  = useAuth();

  const [animal,     setAnimal]     = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [step,       setStep]       = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const displayInitial = user?.name?.charAt(0).toUpperCase()
    || user?.email?.charAt(0).toUpperCase() || "U";

  const [form, setForm] = useState({
    adopterName:    user?.name  || "",
    address:        "",
    age:            "",
    city:           user?.city  || "",
    state:          user?.state || "",
    phone:          user?.phone || "",
    email:          user?.email || "",
    childrenInHome: "",
    childrenAges:   "",
    otherAnimals:   "",
    reason:         "",
  });

  useEffect(() => {
    if (!id) return;
    const fetchAnimal = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res   = await fetch(`${API_URL}/animals/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data  = await res.json();
        if (!res.ok) throw new Error(data.message);
        setAnimal(data);
      } catch (err) {
        setError(err.message || "Could not load animal.");
        toast.error("Could not load animal details");
      } finally {
        setLoading(false);
      }
    };
    fetchAnimal();
  }, [id]);

  const handleFormChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (parseInt(form.age) < 18) {
      toast.error("You must be at least 18 years old to adopt.");
      return;
    }
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(`${API_URL}/adoptions`, {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify({
          animalId: animal._id,
          ...form,
          age: parseInt(form.age),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Application submitted successfully!");
      setStep(2);
    } catch (err) {
      toast.error(err.message || "Failed to submit form");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="detail-loading">
      <div className="paw-spin">🐾</div>
      <p>Loading...</p>
    </div>
  );

  if (error) return (
    <div className="detail-loading">
      <p style={{color:"#ff6161",fontSize:"18px"}}>⚠️ {error}</p>
      <button onClick={() => navigate("/dashboard")}
        style={{marginTop:16,padding:"10px 24px",background:"#2874f0",color:"#fff",border:"none",borderRadius:4,cursor:"pointer",fontFamily:"Poppins,sans-serif",fontWeight:600}}>
        ← Back to Dashboard
      </button>
    </div>
  );

  if (!animal) return null;

  return (
    <div className="detail-root">

      {/* TOPBAR */}
      <header className="detail-topbar">
        <div className="detail-topbar-inner">
          <button className="back-btn" onClick={() => navigate("/dashboard")}>← Back</button>
          <div className="detail-logo-wrap">
            <img src={logo} alt="TailsChain" className="detail-logo-img" />
            <span className="detail-logo-name">TailsChain</span>
          </div>
          <span className="detail-user">👤 {displayInitial}</span>
        </div>
      </header>

      {/* STEP BAR */}
      <div className="step-bar">
        {STEPS.map((s, i) => (
          <div key={i} className={`step-item ${i === step ? "active" : ""} ${i < step ? "done" : ""}`}>
            <div className="step-circle">{i < step ? "✓" : i + 1}</div>
            <span>{s}</span>
            {i < STEPS.length - 1 && <div className="step-line" />}
          </div>
        ))}
      </div>

      <div className="detail-main">

        {/* STEP 0: ANIMAL DETAILS */}
        {step === 0 && (
          <div className="detail-layout">
            <div className="detail-img-col">
              <div className="detail-img-wrap">
                <img
                  src={animal.image}
                  alt={animal.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://placehold.co/500x350/2874f0/white?text=${animal.name}`;
                  }}
                />
                <div className={`status-ribbon ${animal.isAdopted ? "adopted" : "available"}`}>
                  {animal.isAdopted ? "🔴 Already Adopted" : "🟢 Available for Adoption"}
                </div>
              </div>
            </div>
            <div className="detail-info-col">
              <div className="detail-card">
                <h1 className="animal-main-name">{animal.name}</h1>
                <p className="animal-subtitle">
                  {animal.breed} • {animal.category?.charAt(0).toUpperCase() + animal.category?.slice(1)}
                </p>
                <div className="info-block">
                  <div className="info-row">
                    <span className="info-label">🟢 Adoption Status</span>
                    <span className={`info-value status-val ${animal.isAdopted ? "red" : "green"}`}>
                      {animal.isAdopted ? "Already Adopted" : "Available"}
                    </span>
                  </div>
                  <div className="info-row"><span className="info-label">📛 Name</span><span className="info-value">{animal.name}</span></div>
                  <div className="info-row"><span className="info-label">🎂 Age</span><span className="info-value">{animal.age} Year{animal.age > 1 ? "s" : ""}</span></div>
                  <div className="info-row"><span className="info-label">🐾 Breed</span><span className="info-value">{animal.breed}</span></div>
                  <div className="info-row">
                    <span className="info-label">⚥ Gender</span>
                    <span className="info-value">{animal.gender === "male" ? "♂ Male" : "♀ Female"}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">💉 Vaccinated</span>
                    <span className={`info-value ${animal.vaccinated ? "green" : "red"}`}>
                      {animal.vaccinated ? "✓ Yes, Vaccinated" : "✗ Not Vaccinated"}
                    </span>
                  </div>
                  {animal.weight         && <div className="info-row"><span className="info-label">⚖️ Weight</span><span className="info-value">{animal.weight}</span></div>}
                  {animal.color          && <div className="info-row"><span className="info-label">🎨 Color</span><span className="info-value">{animal.color}</span></div>}
                  <div className="info-row"><span className="info-label">❤️ Health Status</span><span className="info-value green">{animal.healthStatus || "Healthy"}</span></div>
                  {animal.specialNeeds   && <div className="info-row"><span className="info-label">🩺 Special Needs</span><span className="info-value">{animal.specialNeeds}</span></div>}
                  {animal.shelterLocation && <div className="info-row"><span className="info-label">📍 Location</span><span className="info-value">{animal.shelterLocation}</span></div>}
                  {animal.description    && <div className="info-row"><span className="info-label">📝 About</span><span className="info-value" style={{fontWeight:400,fontSize:"13px"}}>{animal.description}</span></div>}
                </div>
                {!animal.isAdopted
                  ? <button className="adopt-main-btn" onClick={() => setStep(1)}>🐾 Adopt {animal.name}</button>
                  : <div className="adopted-msg">This animal has already found a loving home 💕</div>
                }
              </div>
            </div>
          </div>
        )}

        {/* STEP 1: ADOPTION FORM */}
        {step === 1 && (
          <div className="form-wrapper">
            <div className="form-card">
              <div className="form-header">
                <h2>🐾 Adoption Application Form</h2>
                <p>Adopting: <strong>{animal.name}</strong> ({animal.breed})</p>
              </div>
              <form className="adoption-form" onSubmit={handleFormSubmit}>
                <div className="form-section-title">Personal Information</div>
                <div className="aform-row"><label>Name of Adopter <span className="req">*</span></label><input name="adopterName" type="text" placeholder="Your full name" value={form.adopterName} onChange={handleFormChange} required /></div>
                <div className="aform-row"><label>Address <span className="req">*</span></label><input name="address" type="text" placeholder="Full home address" value={form.address} onChange={handleFormChange} required /></div>
                <div className="aform-row"><label>Age <span className="req">*</span> <span className="note">(Must be 18+)</span></label><input name="age" type="number" placeholder="Your age (minimum 18)" value={form.age} onChange={handleFormChange} min="18" required /></div>
                <div className="aform-row"><label>City <span className="req">*</span></label><input name="city" type="text" placeholder="Your city" value={form.city} onChange={handleFormChange} required /></div>
                <div className="aform-row"><label>State <span className="req">*</span></label><input name="state" type="text" placeholder="Your state" value={form.state} onChange={handleFormChange} required /></div>
                <div className="aform-row"><label>Phone Number <span className="req">*</span></label><input name="phone" type="tel" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={handleFormChange} required /></div>
                <div className="aform-row"><label>Email Address <span className="req">*</span></label><input name="email" type="email" placeholder="your@email.com" value={form.email} onChange={handleFormChange} required /></div>
                <div className="form-section-title" style={{marginTop:20}}>Household Information</div>
                <div className="aform-row"><label>Name of Children Living in Home</label><input name="childrenInHome" type="text" placeholder="e.g. Rahul, Priya (or 'None')" value={form.childrenInHome} onChange={handleFormChange} /></div>
                <div className="aform-row"><label>Children's Ages</label><input name="childrenAges" type="text" placeholder="e.g. 8, 12 (or 'None')" value={form.childrenAges} onChange={handleFormChange} /></div>
                <div className="aform-row">
                  <label>Do You Have Other Animals in Home? <span className="req">*</span></label>
                  <select name="otherAnimals" value={form.otherAnimals} onChange={handleFormChange} required>
                    <option value="">-- Select --</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
                <div className="aform-row"><label>Why Do You Want to Adopt {animal.name}? <span className="req">*</span></label>
                  <textarea name="reason" rows={4} placeholder="Tell us your reason for adoption..." value={form.reason} onChange={handleFormChange} required />
                </div>
                <div className="form-actions">
                  <button type="button" className="back-form-btn" onClick={() => setStep(0)}>← Back</button>
                  <button type="submit" className="submit-details-btn" disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit Application →"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* STEP 2: SUCCESS */}
        {step === 2 && (
          <div className="wallet-wrapper">
            <div className="wallet-card">
              <div className="success-box">
                <div className="success-icon">🎉</div>
                <h2>Application Submitted!</h2>
                <p>{animal.name}'s adoption request has been sent successfully!</p>
                <div className="tx-details">
                  <div className="tx-row"><span>Animal</span><strong>{animal.name}</strong></div>
                  <div className="tx-row"><span>Breed</span><strong>{animal.breed}</strong></div>
                  <div className="tx-row"><span>Applicant</span><strong>{form.adopterName}</strong></div>
                  <div className="tx-row"><span>Status</span><span className="tx-confirmed">✓ Under Review</span></div>
                </div>
                <p style={{fontSize:"13px",color:"#878787",marginBottom:"20px",lineHeight:"1.6"}}>
                  We will contact you at <strong>{form.email}</strong> within 2-3 working days.
                </p>
                <div style={{display:"flex",gap:"12px",justifyContent:"center",flexWrap:"wrap"}}>
                  <button className="home-btn" onClick={() => navigate("/dashboard")}>← Dashboard</button>
                  <button className="home-btn" style={{background:"#26a541"}} onClick={() => navigate("/my-adoptions")}>🐾 My Adoptions</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
