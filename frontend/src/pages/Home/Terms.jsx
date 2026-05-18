export default function Terms() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 transition-colors">
      <h1 className="text-4xl font-black text-slate-800 dark:text-white mb-8">Terms & Conditions</h1>
      <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-slate-600 dark:text-slate-400">
        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the Kaamwale platform, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">2. Service Bookings</h2>
          <p>
            Kaamwale acts as a marketplace connecting customers with independent service providers. We do not employ providers directly. Users are responsible for verifying the suitability of providers for their specific needs.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">3. Payments & Cancellations</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Payments are held by Kaamwale until work completion is verified by OTP.</li>
            <li>Cancellations by customers may attract a convenience fee if done after worker acceptance.</li>
            <li>Platform fees are non-refundable once the service has commenced.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">4. Dispute Resolution</h2>
          <p>
            In case of unsatisfactory work, customers must raise a dispute through the platform within 24 hours of work completion. Admin decisions on disputes are final and binding.
          </p>
        </section>

        <p className="pt-8 text-sm italic">Last updated: May 2026</p>
      </div>
    </div>
  );
}
