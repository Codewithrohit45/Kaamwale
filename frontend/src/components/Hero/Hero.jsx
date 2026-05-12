import { FaSearch } from "react-icons/fa";

const Hero = () => {
  return (
    <section className="min-h-screen flex items-center py-16 px-6 md:px-16 lg:px-24 relative overflow-hidden bg-[#06141B] text-white">

      {/* Background Glow */}
      <div className="absolute top-20 right-10 w-[400px] h-[400px] bg-cyan-400 opacity-10 blur-3xl rounded-full"></div>

      <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center">

        {/* LEFT CONTENT */}
        <div>

          {/* Small Heading */}
          <p className="text-cyan-400 text-lg font-semibold mb-5 tracking-wide">
            Find Trusted Local Workers Easily
          </p>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[80px] font-extrabold leading-tight mb-8">

            Hire Skilled

            <br />

            <span className="text-cyan-400">
              Workers
            </span>

            <br />

            Anytime,
            Anywhere

          </h1>

          {/* Description */}
          <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-xl">

            Connect with trusted electricians, plumbers,
            painters, carpenters, mechanics and many more
            skilled professionals in your city.

          </p>

          {/* Search Box */}
          <div className="bg-[#11212D] border border-cyan-900 rounded-2xl flex items-center p-2 mb-8 shadow-lg max-w-xl">

            <input
              type="text"
              placeholder="Search workers..."
              className="bg-transparent flex-1 px-4 py-3 outline-none text-white"
            />

            <button className="bg-cyan-400 text-black p-4 rounded-xl hover:bg-cyan-300 transition duration-300">
              <FaSearch />
            </button>

          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-5">

            <button className="bg-cyan-400 text-black px-8 py-4 rounded-xl font-bold hover:bg-cyan-300 transition duration-300 shadow-lg">
              Find Workers
            </button>

            <button className="border border-cyan-400 text-cyan-400 px-8 py-4 rounded-xl font-bold hover:bg-cyan-400 hover:text-black transition duration-300">
              Become Worker
            </button>

          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-10 mt-14">

            <div>
              <h2 className="text-3xl font-bold text-cyan-400">
                10K+
              </h2>

              <p className="text-slate-400">
                Active Workers
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-cyan-400">
                25K+
              </h2>

              <p className="text-slate-400">
                Happy Customers
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-cyan-400">
                4.9★
              </h2>

              <p className="text-slate-400">
                Ratings
              </p>
            </div>

          </div>

        </div>

        {/* RIGHT SIDE IMAGE */}
        <div className="relative flex justify-center items-center mt-10 md:mt-0">

          {/* Glow */}
          <div className="absolute w-[250px] md:w-[380px] h-[250px] md:h-[380px] bg-cyan-400 opacity-20 blur-3xl rounded-full"></div>

          {/* Image */}
          <img
            src="https://cdn-icons-png.flaticon.com/512/4140/4140048.png"
            alt="worker"
            className="relative z-10 w-[220px] sm:w-[280px] md:w-[340px] lg:w-[380px] object-contain"
          />

        </div>

      </div>

    </section>
  );
};

export default Hero;