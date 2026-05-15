import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { FiUploadCloud, FiCheckCircle, FiXCircle, FiInfo } from 'react-icons/fi';
import Button from '../../components/Button';

export default function ProviderKYC() {
  const { user } = useContext(AuthContext);
  const [documentType, setDocumentType] = useState('aadhaar');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError('');

    try {
      // Simulation of file upload - in reality, you'd upload to Cloudinary/S3 here
      const documentUrl = `https://res.cloudinary.com/demo/image/upload/v1/kyc_docs/simulated_${user._id}.jpg`;

      const res = await fetch('http://localhost:5000/api/providers/kyc', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ documentUrl, documentType })
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json();
        throw new Error(data.message || 'Failed to submit KYC');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  if (user?.kyc?.status === 'verified') {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-10 text-center border border-teal-100 dark:border-teal-900/30">
        <div className="w-20 h-20 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiCheckCircle size={40} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Verified Professional</h2>
        <p className="text-slate-500 dark:text-slate-400">Your identity has been verified. A trust badge is now visible on your profile.</p>
      </div>
    );
  }

  if (success || user?.kyc?.status === 'pending') {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-10 text-center border border-indigo-100 dark:border-indigo-900/30">
        <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiInfo size={40} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Verification Pending</h2>
        <p className="text-slate-500 dark:text-slate-400">We've received your documents. Our team will review them within 24-48 hours.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
      <div className="p-8 md:p-12">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Identity Verification</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8">Upload a government-issued ID to get a verification badge and increase your bookings.</p>

        {user?.kyc?.status === 'rejected' && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-8 flex gap-3 items-center">
            <FiXCircle className="text-red-500 shrink-0" size={20} />
            <div>
              <p className="text-sm font-bold text-red-800 dark:text-red-400">Previous Submission Rejected</p>
              <p className="text-xs text-red-600 dark:text-red-300">Reason: {user.kyc.rejectedReason}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Document Type</label>
            <select 
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-white transition-all"
            >
              <option value="aadhaar">Aadhaar Card</option>
              <option value="pan">PAN Card</option>
              <option value="voter_id">Voter ID Card</option>
              <option value="driving_license">Driving License</option>
            </select>
          </div>

          <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-10 text-center hover:border-teal-500 transition-colors cursor-pointer group">
            <FiUploadCloud size={48} className="mx-auto text-slate-400 group-hover:text-teal-500 mb-4 transition-colors" />
            <p className="text-slate-600 dark:text-slate-400 font-medium">Click to upload or drag and drop</p>
            <p className="text-slate-400 text-xs mt-1">PNG, JPG or PDF (max. 5MB)</p>
            <input type="file" className="hidden" />
          </div>

          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

          <Button 
            type="submit" 
            variant="primary" 
            className="w-full py-4 text-lg rounded-xl shadow-lg shadow-teal-500/20"
            disabled={uploading}
          >
            {uploading ? 'Submitting...' : 'Submit for Verification'}
          </Button>
        </form>
      </div>
    </div>
  );
}
