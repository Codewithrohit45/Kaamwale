import { FiCheckCircle, FiUsers, FiShield, FiHeart } from 'react-icons/fi';

export default function About() {
  return (
    <div className="bg-white dark:bg-slate-900 transition-colors">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-teal-500/10 to-indigo-500/10 dark:from-teal-900/20 dark:to-indigo-900/20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-black text-slate-800 dark:text-white mb-6">
            Empowering <span className="text-teal-600">Local Talent</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Kaamwale is on a mission to bridge the gap between skilled workers and those who need them. We believe in trust, transparency, and the power of the local economy.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { icon: <FiUsers />, title: 'Community First', desc: 'We prioritize the growth and well-being of our service provider community.' },
            { icon: <FiShield />, title: 'Unmatched Trust', desc: 'With geofencing and OTP verification, we ensure every job is real and verified.' },
            { icon: <FiHeart />, title: 'Social Impact', desc: 'We help local workers earn a professional living with dignity and fair pay.' }
          ].map((val, i) => (
            <div key={i} className="text-center group">
              <div className="w-16 h-16 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                {val.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">{val.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{val.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-6">Why We Started Kaamwale</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              In many cities, finding a reliable plumber or a skilled mason is a game of chance. For workers, finding consistent jobs is an everyday struggle. Kaamwale was born out of the need to organize this informal sector.
            </p>
            <div className="space-y-4">
              {['100% Verified Providers', 'Fair Pricing Engine', 'Secure Escrow Payments', 'Instant Dispute Resolution'].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <FiCheckCircle className="text-teal-600" />
                  <span className="font-medium text-slate-700 dark:text-slate-200">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 relative">
            <div className="aspect-video bg-gradient-to-br from-teal-400 to-indigo-600 rounded-3xl shadow-2xl overflow-hidden flex items-center justify-center text-white text-4xl font-black italic">
              K.
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl flex flex-col items-center justify-center">
              <p className="text-3xl font-black text-teal-600">50k+</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Workers</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
