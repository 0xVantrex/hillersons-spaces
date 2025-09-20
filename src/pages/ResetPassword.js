import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle2, Shield, ArrowRight, KeyRound } from 'lucide-react';
import axios from 'axios';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Password strength checker
  const checkPasswordStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    return strength;
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(checkPasswordStrength(newPassword));
    setError("");
    setMessage("");
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 2) return "bg-red-500";
    if (passwordStrength <= 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthText = () => {
    if (passwordStrength <= 2) return "Weak";
    if (passwordStrength <= 3) return "Medium";
    return "Strong";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    // Validation
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(`http://localhost:5000/api/auth/reset-password/${token}`, { password }
      );
      
      
      setSuccess(true);
      setMessage(res.data.message);
      
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      console.error('Reset password error:', err.response || err.message ||err);
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-lime-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-gradient-to-r from-green-400/20 to-lime-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-4 -right-4 w-96 h-96 bg-gradient-to-r from-lime-400/20 to-green-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-600 to-lime-600 rounded-3xl mb-6 shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <KeyRound className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-lime-600 bg-clip-text text-transparent mb-2">
            Reset Password
          </h1>
          <p className="text-gray-600">Create a new secure password</p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-8 space-y-6 transform hover:shadow-3xl transition-all duration-300">
          
          {/* Success State */}
          {success && (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-100 to-lime-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600 animate-bounce" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-900">Password Reset Successful!</h3>
                <p className="text-gray-600">Your password has been updated successfully.</p>
                <p className="text-sm text-gray-500">Redirecting to login page...</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-green-600 to-lime-600 h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
              </div>
            </div>
          )}

          {!success && (
            <>
              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl text-red-700 animate-shake">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Success Message */}
              {message && !error && (
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-lime-50 border border-green-200 rounded-2xl text-green-700">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{message}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* New Password Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">New Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors duration-200" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={handlePasswordChange}
                      placeholder="Enter your new password"
                      required
                      className="w-full pl-12 pr-14 py-4 border-2 border-gray-200 rounded-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 bg-white/50 backdrop-blur-sm hover:bg-white/70"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Password strength</span>
                        <span className={`text-xs font-medium ${passwordStrength <= 2 ? 'text-red-600' : passwordStrength <= 3 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {getStrengthText()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
                          style={{width: `${(passwordStrength / 5) * 100}%`}}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Confirm Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors duration-200" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your new password"
                      required
                      className={`w-full pl-12 pr-14 py-4 border-2 rounded-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/20 bg-white/50 backdrop-blur-sm hover:bg-white/70 ${
                        confirmPassword && password !== confirmPassword
                          ? 'border-red-300 bg-red-50/50 focus:border-red-500'
                          : confirmPassword && password === confirmPassword
                            ? 'border-green-300 bg-green-50/50 focus:border-green-500'
                            : 'border-gray-200 hover:border-gray-300 focus:border-green-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      Passwords do not match
                    </p>
                  )}
                  {confirmPassword && password === confirmPassword && (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Passwords match
                    </p>
                  )}
                </div>

                {/* Password Requirements */}
                <div className="bg-gray-50/50 rounded-2xl p-4 space-y-2">
                  <h4 className="text-sm font-semibold text-gray-700">Password Requirements:</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li className={`flex items-center gap-2 ${password.length >= 8 ? 'text-green-600' : ''}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      At least 8 characters long
                    </li>
                    <li className={`flex items-center gap-2 ${/[A-Z]/.test(password) ? 'text-green-600' : ''}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${/[A-Z]/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      Contains uppercase letter
                    </li>
                    <li className={`flex items-center gap-2 ${/[0-9]/.test(password) ? 'text-green-600' : ''}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${/[0-9]/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      Contains number
                    </li>
                  </ul>
                </div>

                {/* Reset Button */}
                <button
                  type="submit"
                  disabled={loading || password.length < 6 || password !== confirmPassword}
                  className="w-full bg-gradient-to-r from-green-600 to-lime-600 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 hover:from-green-700 hover:to-lime-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-green-500/30 shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 group"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Resetting Password...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Shield className="w-5 h-5" />
                      Reset Password
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  )}
                </button>
              </form>
            </>
          )}

          {/* Back to Login */}
          <div className="text-center pt-4 border-t border-gray-200">
            <Link 
              to="/login"
              className="text-sm text-green-600 hover:text-green-700 hover:underline font-medium transition-colors duration-200 flex items-center justify-center gap-1"
            >
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default ResetPassword;