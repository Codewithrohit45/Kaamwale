import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiShield, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import Button from '../../components/Button';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: email, 2: otp + new password, 3: success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      setMessage(data.message);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setStep(3);
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800"></div>

      <div className="max-w-md w-full space-y-6 glass dark:glass-dark p-8 rounded-3xl relative z-10 transition-colors">
        
        {/* Step 3: Success */}
        {step === 3 ? (
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiCheckCircle size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Password Reset!</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8">Your password has been successfully updated. You can now sign in with your new password.</p>
            <Button variant="primary" className="w-full py-3 rounded-xl" onClick={() => navigate('/login')}>
              Go to Login
            </Button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                {step === 1 ? <FiMail size={28} /> : <FiShield size={28} />}
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                {step === 1 ? 'Forgot Password?' : 'Enter Reset Code'}
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {step === 1 
                  ? "No worries! Enter your email and we'll send you a reset code."
                  : `We sent a 6-digit code to ${email}`
                }
              </p>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center gap-2 justify-center">
              <div className={`h-1.5 w-16 rounded-full transition-colors ${step >= 1 ? 'bg-teal-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
              <div className={`h-1.5 w-16 rounded-full transition-colors ${step >= 2 ? 'bg-teal-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
              <div className={`h-1.5 w-16 rounded-full transition-colors ${step >= 3 ? 'bg-teal-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}
            {message && (
              <div className="bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 p-3 rounded-lg text-sm text-center">
                {message}
              </div>
            )}

            {/* Step 1: Email */}
            {step === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div className="relative">
                  <FiMail className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 px-3 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white/80 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-teal-500 outline-none focus:ring-2"
                    placeholder="Enter your email address"
                  />
                </div>
                <Button type="submit" variant="primary" className="w-full py-3 text-lg rounded-xl" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Code'}
                </Button>
              </form>
            )}

            {/* Step 2: OTP + New Password */}
            {step === 2 && (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div className="relative">
                  <FiShield className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-10 px-3 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white/80 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-teal-500 outline-none focus:ring-2 text-center text-xl tracking-[0.5em] font-mono"
                    placeholder="000000"
                  />
                </div>
                <div className="relative">
                  <FiLock className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 px-3 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white/80 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-teal-500 outline-none focus:ring-2"
                    placeholder="New password (min 6 chars)"
                  />
                </div>
                <div className="relative">
                  <FiLock className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 px-3 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white/80 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-teal-500 outline-none focus:ring-2"
                    placeholder="Confirm new password"
                  />
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="flex-1 py-3 rounded-xl" onClick={() => setStep(1)} disabled={loading}>
                    Back
                  </Button>
                  <Button type="submit" variant="primary" className="flex-1 py-3 rounded-xl" disabled={loading || otp.length < 6}>
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </Button>
                </div>
                <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                  Didn't get the code?{' '}
                  <button type="button" onClick={handleSendOtp} className="text-teal-600 dark:text-teal-400 hover:underline font-medium">
                    Resend
                  </button>
                </p>
              </form>
            )}

            {/* Back to login */}
            <div className="text-center">
              <Link to="/login" className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 font-medium transition-colors">
                <FiArrowLeft size={14} /> Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
