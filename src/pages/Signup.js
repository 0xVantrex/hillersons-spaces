import React, { useState } from "react";
import { Eye, EyeOff, User, Mail, Lock, AlertCircle, CheckCircle2, Send } from "lucide-react";
import { Link } from "react-router-dom";

export default function Signup() {
  const [form, setForm] = useState({ username: "", email: "", password: "", confirmPassword: "" });
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
  const validateUsername = (username) => {
    if (username.length < 3) return "Username must be at least 3 characters";
    if (username.length > 20) return "Username must be less than 20 characters";
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return "Username can only contain letters, numbers, and underscores";
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
    setForm(f => ({ ...f, [name]: value }));
    setError("");

    // Real-time validation
    const errors = { ...fieldErrors };
    
    if (name === "username") {
      const usernameError = validateUsername(value);
      if (usernameError) errors.username = usernameError;
      else delete errors.username;
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

    try {
      // Validate all fields
      const errors = {};
      
      const usernameError = validateUsername(form.username);
      if (usernameError) errors.username = usernameError;
      
      const emailError = validateEmail(form.email);
      if (emailError) errors.email = emailError;
      
      if (passwordStrength.score < 3) {
        errors.password = "Password is too weak";
      }
      
      if (form.password !== form.confirmPassword) {
        errors.confirmPassword = "Passwords don't match";
      }
      
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        setLoading(false);
        return;
      }

      // Simulate API call with email sending
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success message about email verification
      setShowEmailSent(true);
      
      // Reset form on success
      setForm({ username: "", email: "", password: "", confirmPassword: "" });
      setPasswordStrength({ score: 0, feedback: [] });
      setFieldErrors({});
      
    } catch (err) {
      console.error("Signup error:", err);
      setError("Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError("");
    
    try {
      // Simulate Google OAuth
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert("Google signup successful!");
    } catch (err) {
      console.error("Google signup error:", err);
      setError("Failed to sign up with Google. Please try again.");
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
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
                  <button className="underline hover:no-underline">resend verification email</button>.
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
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  required
                  className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    fieldErrors.username 
                      ? 'border-red-300 bg-red-50/50' 
                      : form.username && !fieldErrors.username 
                        ? 'border-green-300 bg-green-50/50' 
                        : 'border-gray-200 hover:border-gray-300'
                  }`}
                />
                {form.username && !fieldErrors.username && (
                  <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
              {fieldErrors.username && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {fieldErrors.username}
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
              disabled={loading || Object.keys(fieldErrors).length > 0 || passwordStrength.score < 3}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-lg hover:shadow-xl"
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
          <button
            onClick={handleGoogleSignup}
            disabled={loading}
            className="w-full bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all duration-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm hover:shadow-md flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

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
          <button className="underline hover:text-gray-700">Terms of Service</button>
          {" "}and{" "}
          <button className="underline hover:text-gray-700">Privacy Policy</button>
        </p>
      </div>
    </div>
  );
}