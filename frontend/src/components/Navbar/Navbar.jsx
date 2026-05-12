import { Link } from "react-router-dom";

const Navbar = () => {
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

          <Link
            to="/login"
            className="hover:text-cyan-400 transition duration-300 text-lg"
          >
            Login
          </Link>

          <Link
            to="/signup"
            className="bg-cyan-400 text-black px-6 py-3 rounded-xl font-bold hover:bg-cyan-300 transition duration-300"
          >
            Signup
          </Link>

        </div>

      </div>

    </nav>
  );
};

export default Navbar;