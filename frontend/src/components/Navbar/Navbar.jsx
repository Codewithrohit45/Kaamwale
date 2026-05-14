import { useContext } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-[#06141B] text-white px-8 py-5 border-b border-cyan-950">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <Link to="/">
          <h1 className="text-4xl font-extrabold text-cyan-400 tracking-wide">
            KaamWale
          </h1>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="hover:text-cyan-400 transition duration-300 text-lg"
          >
            Home
          </Link>

          {user ? (
            <>
              {user.role === 'admin' && (
                 <Link to="/admin/dashboard" className="hover:text-cyan-400 transition duration-300 text-lg">Admin Dashboard</Link>
              )}
              {user.role === 'provider' && (
                 <Link to="/provider/dashboard" className="hover:text-cyan-400 transition duration-300 text-lg">Dashboard</Link>
              )}
              {user.role === 'user' && (
                 <Link to="/user/dashboard" className="hover:text-cyan-400 transition duration-300 text-lg">Dashboard</Link>
              )}
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-red-400 transition duration-300"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hover:text-cyan-400 transition duration-300 text-lg"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-cyan-400 text-black px-6 py-2 rounded-xl font-bold hover:bg-cyan-300 transition duration-300"
              >
                Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;