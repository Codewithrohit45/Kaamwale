import { useState } from 'react';
import { FiMail, FiPhone, FiMapPin, FiSend } from 'react-icons/fi';
import Button from '../../components/Button';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 transition-colors py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-black text-slate-800 dark:text-white mb-4">Get in Touch</h1>
          <p className="text-slate-600 dark:text-slate-400">Have questions? We're here to help you 24/7.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Info Cards */}
          <div className="space-y-6">
            {[
              { icon: <FiMail />, title: 'Email Us', desc: 'support@kaamwale.com', color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' },
              { icon: <FiPhone />, title: 'Call Us', desc: '+91 800-KAAM-WALE', color: 'text-teal-600 bg-teal-50 dark:bg-teal-900/20' },
              { icon: <FiMapPin />, title: 'Visit Us', desc: 'HSR Layout, Bengaluru, KA', color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${item.color}`}>
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">{item.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-xl">
              {submitted ? (
                <div className="text-center py-12 animate-in fade-in zoom-in">
                  <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">✓</div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Message Sent!</h3>
                  <p className="text-slate-500 mt-2">We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                      <input 
                        type="text" required
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500 dark:text-white"
                        placeholder="John Doe"
                        value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                      <input 
                        type="email" required
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500 dark:text-white"
                        placeholder="john@example.com"
                        value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Subject</label>
                    <input 
                      type="text" required
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500 dark:text-white"
                      placeholder="How can we help?"
                      value={form.subject} onChange={e => setForm({...form, subject: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Message</label>
                    <textarea 
                      rows="5" required
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500 dark:text-white"
                      placeholder="Tell us more about your inquiry..."
                      value={form.message} onChange={e => setForm({...form, message: e.target.value})}
                    ></textarea>
                  </div>
                  <Button type="submit" variant="primary" className="w-full py-4 flex items-center justify-center gap-2">
                    <FiSend /> Send Message
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
