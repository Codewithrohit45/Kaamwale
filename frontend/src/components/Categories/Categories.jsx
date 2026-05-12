import {
  FaBolt,
  FaPaintRoller,
  FaTools,
  FaFan,
  FaWrench,
} from "react-icons/fa";

import { GiWoodBeam } from "react-icons/gi";

const services = [
  {
    title: "Electrician",
    icon: <FaBolt />,
  },
  {
    title: "Painter",
    icon: <FaPaintRoller />,
  },
  {
    title: "Plumber",
    icon: <FaTools />,
  },
  {
    title: "AC Repair",
    icon: <FaFan />,
  },
  {
    title: "Mechanic",
    icon: <FaWrench />,
  },
  {
    title: "Carpenter",
    icon: <GiWoodBeam />,
  },
];

const Categories = () => {
  return (
    <section className="bg-[#06141B] text-white py-24 px-6 md:px-16">

      {/* Heading */}
      <div className="text-center mb-16">

        <p className="text-cyan-400 font-semibold text-lg mb-4">
          Popular Services
        </p>

        <h2 className="text-4xl md:text-5xl font-bold">
          Explore Categories
        </h2>

      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">

        {services.map((service, index) => (
          <div
            key={index}
            className="bg-[#11212D] border border-cyan-950 rounded-3xl p-10 hover:border-cyan-400 hover:scale-105 transition duration-300 shadow-lg hover:shadow-cyan-500/20 cursor-pointer"
          >

            {/* Icon */}
            <div className="text-5xl text-cyan-400 mb-6">
              {service.icon}
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold mb-3">
              {service.title}
            </h3>

            {/* Description */}
            <p className="text-slate-400 leading-relaxed">
              Find trusted and verified {service.title.toLowerCase()}
              professionals near your area easily.
            </p>

          </div>
        ))}

      </div>

    </section>
  );
};

export default Categories;