import React, { useState } from "react";
import { Eye, EyeOff, User, Mail, Lock, AlertCircle, CheckCircle2, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../lib/api";
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';


export default function Signup() {

  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [] });
  const [fieldErrors, setFieldErrors] = useState({});
  const [showEmailSent, setShowEmailSent] = useState(false);


  // Password strength checker
  const checkPasswordStrength = (password) => {
    const checks = [
      { test: password.length >= 8, message: "At least 8 characters" },
      { test: /[A-Z]/.test(password), message: "One uppercase letter" },
      { test: /[a-z]/.test(password), message: "One lowercase letter" },
      { test: /\d/.test(password), message: "One number" },
      { test: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password), message: "One special character" }
    ];
    
    const score = checks.filter(check => check.test).length;
    const feedback = checks.map(check => ({ ...check, passed: check.test }));
    
    return { score, feedback };
  };

  // Username validation
  const validateUsername = (name) => {
    if (name.length < 3) return "Username must be at least 3 characters";
    if (name.length > 20) return "Username must be less than 20 characters";
    if (!/^[a-zA-Z0-9_]+$/.test(name)) return "Username can only contain letters, numbers, and underscores";
    return "";
  };

  // Email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value.trimStart() }));
    setError("");

    // Real-time validation
    const errors = { ...fieldErrors };
    
    if (name === "name") {
      const nameError = validateUsername(value);
      if (nameError) errors.name = nameError;
      else delete errors.name;
    }
    
    if (name === "email") {
      const emailError = validateEmail(value);
      if (emailError) errors.email = emailError;
      else delete errors.email;
    }
    
    if (name === "password") {
      setPasswordStrength(checkPasswordStrength(value));
      if (form.confirmPassword && value !== form.confirmPassword) {
        errors.confirmPassword = "Passwords don't match";
      } else {
        delete errors.confirmPassword;
      }
    }
    
    if (name === "confirmPassword") {
      if (value !== form.password) {
        errors.confirmPassword = "Passwords don't match";
      } else {
        delete errors.confirmPassword;
      }
    }
    
    setFieldErrors(errors);
  };

  const handleEmailSignup = async (e) => {

    e.preventDefault();
    setLoading(true);
    setError("");

    const { name, email, password, confirmPassword }= form;
    const trimmedname = name.trim();
    const trimmedEmail = email.trim();

    const  errors = {};

    const nameError = validateUsername(trimmedname);
    if (nameError) errors.name = nameError;

    const emailError = validateEmail(trimmedEmail);
    if (emailError) errors.email = emailError;

    if (password !== confirmPassword) {
      errors.confirmPassword =  "Passwords don't match";
    }
    if (passwordStrength.score < 3) {
      errors.password = "Password is too weak";
    }

    if (Object.keys(errors).length > 0 ){
      setFieldErrors(errors);
      setLoading(false);
      return;
    }      

    try {
      await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: trimmedname,
          email: trimmedEmail,
          password: password}),
      });
      // Assuming the API returns a success response
      setShowEmailSent(true);
      window.scrollTo({top: 0, behavior: "smooth"});
      setForm({name: "", email: "",password: "", confirmPassword: ""});
      setPasswordStrength({ score: 0, feedback: [] });
      setFieldErrors({});
      navigate("/");
    } catch (err) {
      console.error("Signup error:", err);
      setError("Failed to create account. "+ err.message);
    } finally {
      setLoading(false);
    }
  };

  
  const handleGoogleSuccess = async (credentialResponse) => {
  try {
    const idToken = credentialResponse.credential; // ✅ This is what you need

    const res = await axios.post(`${API_BASE_URL}/api/auth/google`, {
      tokenId: idToken, // ✅ Now this is correct
    });

    const { token, user } = res.data;
    localStorage.setItem("token", token);
    console.log("✅ Logged in user:", user);
    navigate("/home");
  } catch (err) {
    console.error("Google signup error:", err);
    setError("Google signup failed: " + err.message);
  }
};


  const getPasswordStrengthColor = () => {
    if (passwordStrength.score <= 2) return "bg-red-500";
    if (passwordStrength.score === 3) return "bg-yellow-500";
    if (passwordStrength.score === 4) return "bg-green-400";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength.score <= 2) return "Weak";
    if (passwordStrength.score === 3) return "Fair";
    if (passwordStrength.score === 4) return "Good";
    return "Strong";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-lime-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-lime-600 rounded-2xl mb-4">
            <User className="w-8 h-8 text-jungle" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-lime-600 bg-clip-text text-transparent">
            Create Account
          </h1>
          <p className="text-gray-600 mt-2">Join our community today</p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 space-y-6">
          {/* Success Message */}
          {showEmailSent && (
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
              <Send className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm">Account Created Successfully!</h3>
                <p className="text-sm mt-1">
                  We've sent a verification email to your inbox. Please check your email and click the verification link to activate your account at <strong>Hillersonsconsultancysite.com</strong>.
                </p>
                <p className="text-xs mt-2 text-green-600">
                  Don't see the email? Check your spam folder or{" "}
                  <button className="underline hover:no-underline"
                  onClick={() => {
                    alert("Verification email resent! Please check your inbox.");
                  }}
                  >
                  resend verification email
                  </button>.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="space-y-5">
            {/* Username Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  required
                  className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    fieldErrors.name 
                      ? 'border-red-300 bg-red-50/50' 
                      : form.name && !fieldErrors.name 
                        ? 'border-green-300 bg-green-50/50' 
                        : 'border-gray-200 hover:border-gray-300'
                  }`}
                />
                {form.name && !fieldErrors.name && (
                  <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
              {fieldErrors.name && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {fieldErrors.name}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    fieldErrors.email 
                      ? 'border-red-300 bg-red-50/50' 
                      : form.email && !fieldErrors.email 
                        ? 'border-green-300 bg-green-50/50' 
                        : 'border-gray-200 hover:border-gray-300'
                  }`}
                />
                {form.email && !fieldErrors.email && (
                  <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
              {fieldErrors.email && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  required
                  className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    fieldErrors.password 
                      ? 'border-red-300 bg-red-50/50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {form.password && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      />
                    </div>
                    <span className={`text-xs font-medium ${
                      passwordStrength.score <= 2 ? 'text-red-600' :
                      passwordStrength.score === 3 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-1 text-xs">
                    {passwordStrength.feedback.map((item, index) => (
                      <div key={index} className={`flex items-center gap-1 ${
                        item.passed ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          item.passed ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                        {item.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {fieldErrors.password && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                  className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    fieldErrors.confirmPassword 
                      ? 'border-red-300 bg-red-50/50' 
                      : form.confirmPassword && form.password === form.confirmPassword
                        ? 'border-green-300 bg-green-50/50' 
                        : 'border-gray-200 hover:border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                {form.confirmPassword && form.password === form.confirmPassword && (
                  <CheckCircle2 className="absolute right-10 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleEmailSignup}
              disabled={loading || Object.keys(fieldErrors).length > 0 || passwordStrength.score < 3 || !form.name || !form.email || !form.password || !form.confirmPassword}
              className="w-full bg-gradient-to-r from-green-500 to-lime-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 hover:from-green-500 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account...
                </div>
              ) : (
                "Create Account"
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gray-300" />
            <span className="text-sm text-gray-500 bg-white px-3 rounded-full">or</span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gray-300" />
          </div>

          {/* Google Signup */}
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              console.error("Google login failed");
              setError("Google login failed");
           }}
         />

          {/* Login Link */}
          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
          Log in
        </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          By creating an account, you agree to our{" "}
          <Link to='/terms' className="underline hover:text-gray-700">Terms of Service</Link>
          {" "}and{" "}
          <Link to='/privacy' className="underline hover:text-gray-700">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
