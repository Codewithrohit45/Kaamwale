import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useContext, useEffect } from 'react';
import { useToast } from '../../components/NotificationToast';
import Button from '../../components/Button';
import { FiMail, FiLock } from 'react-icons/fi';
import { AuthContext } from '../../context/AuthContext';

export default function Login() {
  const [role, setRole] = useState('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { login } = useContext(AuthContext);

  const from = location.state?.from?.pathname || (role === 'provider' ? '/provider/dashboard' : '/user/dashboard');
  const message = location.state?.message;

  useEffect(() => {
    if (message) {
      toast(message, 'info');
    }
  }, [message]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        // Redirect to where they were going, or dashboard
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800"></div>
      
      <div className="max-w-md w-full space-y-8 glass dark:glass-dark p-8 rounded-3xl relative z-10 transition-colors">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-800 dark:text-white">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
            Sign in to your account
          </p>
        </div>
        
        {/* Role Toggle */}
        <div className="flex p-1 bg-slate-200/50 dark:bg-slate-700/50 rounded-lg">
          <button 
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${role === 'user' ? 'bg-white dark:bg-slate-600 shadow text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            onClick={() => setRole('user')}
          >
            User
          </button>
          <button 
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${role === 'provider' ? 'bg-white dark:bg-slate-600 shadow text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            onClick={() => setRole('provider')}
          >
            Provider
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div className="relative">
              <FiMail className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 px-3 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white/80 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-teal-500"
                placeholder="Email address"
              />
            </div>
            <div className="relative">
              <FiLock className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
              <input
                type="password" required value={password} onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 px-3 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white/80 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-teal-500"
                placeholder="Password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded" />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 dark:text-slate-400">
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-teal-600 dark:text-teal-400 hover:underline">
                Forgot password?
              </Link>
            </div>
          </div>

          <Button type="submit" variant="primary" className="w-full py-3 text-lg rounded-xl" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
        
        <div className="text-center mt-4">
          <span className="text-sm text-slate-600 dark:text-slate-400">Don't have an account? </span>
          <Link to={`/signup?role=${role}`} className="font-medium text-teal-600 dark:text-teal-400 hover:underline text-sm">
            Sign up as {role}
          </Link>
        </div>
      </div>
    </div>
  );
}