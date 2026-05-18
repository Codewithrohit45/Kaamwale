export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 transition-colors">
      <h1 className="text-4xl font-black text-slate-800 dark:text-white mb-8">Privacy Policy</h1>
      <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-slate-600 dark:text-slate-400">
        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us when you create an account, such as your name, email, phone number, and KYC documents (for providers). We also collect <strong>Geolocation data</strong> to facilitate proximity-based matching and job verification.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">2. How We Use Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>To facilitate service bookings between customers and providers.</li>
            <li>To verify provider locations via geofencing for job integrity.</li>
            <li>To process payments and payouts through third-party processors.</li>
            <li>To improve our matching algorithms and user experience.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">3. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your personal information. Financial data is encrypted and handled by PCI-DSS compliant partners like Razorpay.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">4. Your Rights</h2>
          <p>
            You have the right to access, correct, or delete your personal data at any time through your account settings or by contacting our support team.
          </p>
        </section>

        <p className="pt-8 text-sm italic">Last updated: May 2026</p>
      </div>
    </div>
  );
}
