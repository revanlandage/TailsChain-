import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import logo from "../assets/logo.jpeg";
import "./Auth.css";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "", city: "", state: "",
  });
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Returns only first letter of name or email
  const getDisplayInitial = (name, email) => {
    if (name) return name.charAt(0).toUpperCase();
    if (email) return email.charAt(0).toUpperCase();
    return "U";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login(form.email, form.password);
        toast.success("Welcome back! 🐾");
      } else {
        await register(form);
        toast.success("Account created! Welcome! 🎉");
      }
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <div className="auth-left">
        <div className="auth-brand">
          <img src={logo} alt="TailsChain" className="auth-logo-img" />
          <h1>TailsChain</h1>
          <p>India's Most Trusted<br />Animal Adoption Platform</p>
          <ul className="auth-perks">
            <li>✓ Blockchain verified adoptions</li>
            <li>✓ 1000+ animals find homes monthly</li>
            <li>✓ Secure & transparent process</li>
            <li>✓ Lifetime adoption records</li>
          </ul>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-tabs">
            <button className={`auth-tab ${isLogin ? "active" : ""}`} onClick={() => setIsLogin(true)}>Login</button>
            <button className={`auth-tab ${!isLogin ? "active" : ""}`} onClick={() => setIsLogin(false)}>Sign Up</button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-group">
                <label>Full Name</label>
                <input name="name" type="text" placeholder="Enter your full name" value={form.name} onChange={handleChange} required />
              </div>
            )}
            <div className="form-group">
              <label>Email Address</label>
              <input name="email" type="email" placeholder="Enter your email" value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input name="password" type="password" placeholder="Enter your password" value={form.password} onChange={handleChange} required />
            </div>
            {!isLogin && (
              <>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input name="phone" type="tel" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={handleChange} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    <input name="city" type="text" placeholder="Your city" value={form.city} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <input name="state" type="text" placeholder="Your state" value={form.state} onChange={handleChange} />
                  </div>
                </div>
              </>
            )}
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Please wait..." : isLogin ? "Login" : "Create Account"}
            </button>
            {isLogin && (
              <p className="auth-terms">
                By continuing, you agree to TailsChain's <span>Terms of Use</span> and <span>Privacy Policy</span>
              </p>
            )}
          </form>

          <div className="auth-switch">
            {isLogin ? (
              <p>New to TailsChain? <button onClick={() => setIsLogin(false)}>Create an account</button></p>
            ) : (
              <p>Already have an account? <button onClick={() => setIsLogin(true)}>Login</button></p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
