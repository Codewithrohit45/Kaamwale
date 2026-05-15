import { Link, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useState, useContext } from 'react';
import Button from '../../components/Button';
import { FiUser, FiMail, FiLock, FiPhone, FiUploadCloud, FiKey } from 'react-icons/fi';
import { AuthContext } from '../../context/AuthContext';

export default function Signup() {
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') || 'user';
  const navigate = useNavigate();
  const location = useLocation();
  const { register, sendOtp } = useContext(AuthContext);

  const from = location.state?.from || (role === 'provider' ? '/provider/dashboard' : '/user/dashboard');

  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '', category: 'Labour', rate: '', otp: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSendOtp = async () => {
    if (!formData.email) {
      setError('Email is required to send OTP');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await sendOtp(formData.email, formData.phone);
      setSuccess(`OTP sent successfully to ${formData.email} ${formData.phone ? '& ' + formData.phone : ''}!`);
      setStep(role === 'provider' ? 4 : 2); // Jump to OTP step
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Flow for Provider: Step 1 (Basic) -> Step 2 (Service) -> Step 3 (Verification Docs) -> Step 4 (OTP)
    // Flow for User: Step 1 (Basic) -> Step 2 (OTP)

    if (role === 'provider' && step < 3) {
      setStep(step + 1);
    } else if (role === 'provider' && step === 3) {
      // Reached end of forms, send OTP
      handleSendOtp();
    } else if (role === 'user' && step === 1) {
      // Reached end of User form, send OTP
      handleSendOtp();
    } else {
      // Final submit (OTP Verification)
      setLoading(true);
      try {
        await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: role,
          phone: formData.phone,
          category: formData.category,
          hourlyRate: formData.rate,
          otp: formData.otp
        });
        navigate(from, { replace: true });
      } catch (err) {
        setError(err.message || 'Registration failed');
      } finally {
        setLoading(false);
      }
    }
  };

  const currentStepLabel = role === 'provider' ? (step === 4 ? 'Verify OTP' : (step === 3 ? 'Send OTP' : 'Next Step')) : (step === 2 ? 'Verify & Register' : 'Send OTP');

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800"></div>
      
      <div className="max-w-md w-full space-y-8 glass dark:glass-dark p-8 rounded-3xl relative z-10 transition-colors">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-800 dark:text-white">
            Join <span className="text-teal-600 dark:text-teal-400">Kaamwale</span>
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
            {role === 'provider' ? 'Create a provider account and start earning' : 'Create an account to book professionals'}
          </p>
        </div>
        
        {/* Role Toggle (Only visible on Step 1) */}
        {step === 1 && (
          <div className="flex p-1 bg-slate-200/50 dark:bg-slate-700/50 rounded-lg">
            <Link to="/signup?role=user" className={`flex-1 text-center py-2 rounded-md text-sm font-medium transition-colors ${role !== 'provider' ? 'bg-white dark:bg-slate-600 shadow text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
              I need services
            </Link>
            <Link to="/signup?role=provider" className={`flex-1 text-center py-2 rounded-md text-sm font-medium transition-colors ${role === 'provider' ? 'bg-white dark:bg-slate-600 shadow text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
              I am a provider
            </Link>
          </div>
        )}

        {/* Step Indicator for Providers */}
        {role === 'provider' && step < 4 && (
          <div className="flex justify-center gap-2 mt-4">
            {[1, 2, 3].map(s => (
              <div key={s} className={`h-2 flex-1 rounded-full ${step >= s ? 'bg-teal-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-3 rounded-lg text-sm text-center">
            {success}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          
          {step === 1 && (
            <div className="space-y-4">
              <div className="relative">
                <FiUser className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                <input
                  name="name" type="text" required
                  className="w-full pl-10 px-3 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white/80 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-teal-500"
                  placeholder="Full Name" value={formData.name} onChange={handleChange}
                />
              </div>
              <div className="relative">
                <FiMail className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                <input
                  name="email" type="email" required
                  className="w-full pl-10 px-3 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white/80 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-teal-500"
                  placeholder="Email address" value={formData.email} onChange={handleChange}
                />
              </div>
              <div className="relative">
                <FiLock className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                <input
                  name="password" type="password" required
                  className="w-full pl-10 px-3 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white/80 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-teal-500"
                  placeholder="Password" value={formData.password} onChange={handleChange}
                />
              </div>
              <div className="relative">
                <FiPhone className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                <input
                  name="phone" type="tel" required
                  className="w-full pl-10 px-3 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white/80 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-teal-500"
                  placeholder="Mobile Number" value={formData.phone} onChange={handleChange}
                />
              </div>
            </div>
          )}

          {step === 2 && role === 'provider' && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 dark:text-white">Service Details</h3>
              <div>
                <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Primary Service</label>
                <select name="category" value={formData.category} onChange={handleChange} className="w-full px-3 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white/80 dark:bg-slate-800 text-slate-900 dark:text-white">
                  <option value="Labour">Labour</option>
                  <option value="Plumber">Plumber</option>
                  <option value="Electrician">Electrician</option>
                  <option value="Carpenter">Carpenter</option>
                  <option value="Tutor">Tutor</option>
                  <option value="Painter">Painter</option>
                  <option value="Mechanic">Mechanic</option>
                  <option value="AC Repair">AC Repair</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Hourly Rate (₹)</label>
                <input
                  name="rate" type="number" required
                  className="w-full px-3 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white/80 dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="e.g. 350" value={formData.rate} onChange={handleChange}
                />
              </div>
            </div>
          )}

          {step === 3 && role === 'provider' && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 dark:text-white">Verification</h3>
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors">
                <FiUploadCloud size={32} className="mx-auto text-teal-500 mb-2" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Upload Govt ID (Aadhar/PAN)</p>
                <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 5MB</p>
              </div>
            </div>
          )}

          {/* OTP Step */}
          {((role === 'provider' && step === 4) || (role === 'user' && step === 2)) && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 dark:text-white text-center">Enter OTP</h3>
              <p className="text-sm text-slate-500 text-center mb-4">We sent a 6-digit code to {formData.email} & {formData.phone}</p>
              <div className="relative">
                <FiKey className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                <input
                  name="otp" type="text" required maxLength="6"
                  className="w-full pl-10 px-3 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white/80 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-teal-500 text-center tracking-widest text-lg font-bold"
                  placeholder="------" value={formData.otp} onChange={handleChange}
                />
              </div>
              <div className="text-center text-sm">
                <button type="button" onClick={handleSendOtp} className="text-teal-600 font-medium hover:underline">
                  Resend OTP
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            {step > 1 && (
              <Button type="button" variant="outline" className="flex-1 py-3" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            )}
            <Button type="submit" variant="primary" className="flex-1 py-3" disabled={loading}>
              {loading ? 'Processing...' : currentStepLabel}
            </Button>
          </div>
        </form>
        
        {step === 1 && (
          <div className="text-center mt-4">
            <span className="text-sm text-slate-600 dark:text-slate-400">Already have an account? </span>
            <Link to="/login" className="font-medium text-teal-600 dark:text-teal-400 hover:underline text-sm">
              Sign in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}