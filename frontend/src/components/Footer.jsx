import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiMail } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <span className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">
              Kaamwale
            </span>
            <p className="mt-4 text-sm text-slate-400">
              Connecting you with reliable, skilled local professionals for all your daily needs.
            </p>
            <div className="mt-6 flex space-x-4">
              <a href="#" className="hover:text-teal-400 transition-colors"><FiFacebook size={20} /></a>
              <a href="#" className="hover:text-teal-400 transition-colors"><FiTwitter size={20} /></a>
              <a href="#" className="hover:text-teal-400 transition-colors"><FiInstagram size={20} /></a>
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/search?category=Labour" className="hover:text-teal-400 transition-colors">Labour</Link></li>
              <li><Link to="/search?category=Plumber" className="hover:text-teal-400 transition-colors">Plumber</Link></li>
              <li><Link to="/search?category=Electrician" className="hover:text-teal-400 transition-colors">Electrician</Link></li>
              <li><Link to="/search?category=Carpenter" className="hover:text-teal-400 transition-colors">Carpenter</Link></li>
              <li><Link to="/search?category=Tutor" className="hover:text-teal-400 transition-colors">Tutor</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-teal-400 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-teal-400 transition-colors">Contact</Link></li>
              <li><Link to="/privacy" className="hover:text-teal-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-teal-400 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Stay Updated</h3>
            <p className="text-sm text-slate-400 mb-4">Subscribe to our newsletter for the latest offers.</p>
            <form className="flex" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-l-md focus:outline-none focus:ring-1 focus:ring-teal-500 text-sm"
              />
              <button type="submit" className="px-3 py-2 bg-teal-600 text-white rounded-r-md hover:bg-teal-500 transition-colors">
                <FiMail size={18} />
              </button>
            </form>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} Kaamwale. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
