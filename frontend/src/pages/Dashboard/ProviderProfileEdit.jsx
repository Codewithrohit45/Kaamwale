import { useState, useEffect, useContext } from 'react';
import { FiUser, FiMail, FiPhone, FiMapPin, FiDollarSign, FiSave, FiUpload } from 'react-icons/fi';
import { AuthContext } from '../../context/AuthContext';
import Button from '../../components/Button';
import { useToast } from '../../components/NotificationToast';

export default function ProviderProfileEdit() {
  const { user } = useContext(AuthContext);
  const toast = useToast();
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', location: '', hourlyRate: '', category: '', image: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const providerId = user?._id || user?.id;
        const res = await fetch(`http://localhost:5000/api/providers/${providerId}`);
        const data = await res.json();
        if (res.ok) {
          setProfile({
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            location: data.location || '',
            hourlyRate: data.hourlyRate || '',
            category: data.category || '',
            image: data.image || '',
          });
        }
      } catch (err) {
        console.error('Fetch profile failed', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('http://localhost:5000/api/providers/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(profile)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = () => {
    window.cloudinary.openUploadWidget({
      cloudName: 'demo', // Use 'demo' for testing or provide your own
      uploadPreset: 'unsigned_preset', // Requires unsigned upload preset in Cloudinary
      sources: ['local', 'url', 'camera'],
      multiple: false,
      cropping: true,
      croppingAspectRatio: 1,
    }, (error, result) => {
      if (!error && result && result.event === "success") { 
        setProfile({ ...profile, image: result.info.secure_url });
        toast('Photo uploaded! Don\'t forget to save changes.', 'success');
      }
    });
  };

  if (loading) return <div className="text-center py-12"><p className="text-slate-500">Loading profile...</p></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Edit Profile</h1>
        <p className="text-slate-600 dark:text-slate-400">Update your professional information visible to customers.</p>
      </div>

      {/* Avatar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-6">
        <img
          src={profile.image || `https://ui-avatars.com/api/?name=${profile.name.replace(' ','+')}&background=14b8a6&color=fff&size=100`}
          alt=""
          className="w-20 h-20 rounded-2xl object-cover"
        />
        <div className="flex-1">
          <h3 className="font-bold text-slate-800 dark:text-white text-lg">{profile.name}</h3>
          <p className="text-teal-600 dark:text-teal-400 text-sm font-medium">{profile.category}</p>
          <div className="mt-2 flex gap-3">
            <button 
              type="button"
              onClick={handleUpload}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <FiUpload /> Change Photo
            </button>
            <input
              type="text"
              value={profile.image}
              onChange={(e) => setProfile({...profile, image: e.target.value})}
              placeholder="Or paste image URL"
              className="flex-1 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500 dark:bg-slate-700 dark:text-white text-xs"
            />
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 border border-slate-100 dark:border-slate-700 shadow-sm space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2"><FiUser size={14} /> Full Name</label>
            <input type="text" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} className="w-full border border-slate-200 dark:border-slate-600 rounded-lg p-3 outline-none focus:ring-2 focus:ring-teal-500 dark:bg-slate-700 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2"><FiMail size={14} /> Email</label>
            <input type="email" value={profile.email} disabled className="w-full border border-slate-200 dark:border-slate-600 rounded-lg p-3 outline-none bg-slate-50 dark:bg-slate-700/50 dark:text-slate-400 text-slate-500 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2"><FiPhone size={14} /> Phone</label>
            <input type="tel" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} className="w-full border border-slate-200 dark:border-slate-600 rounded-lg p-3 outline-none focus:ring-2 focus:ring-teal-500 dark:bg-slate-700 dark:text-white" placeholder="+91 9876543210" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2"><FiMapPin size={14} /> Location</label>
            <input type="text" value={profile.location} onChange={(e) => setProfile({...profile, location: e.target.value})} className="w-full border border-slate-200 dark:border-slate-600 rounded-lg p-3 outline-none focus:ring-2 focus:ring-teal-500 dark:bg-slate-700 dark:text-white" placeholder="Mumbai, Maharashtra" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2"><FiDollarSign size={14} /> Hourly Rate (₹)</label>
            <input type="number" value={profile.hourlyRate} onChange={(e) => setProfile({...profile, hourlyRate: Number(e.target.value)})} className="w-full border border-slate-200 dark:border-slate-600 rounded-lg p-3 outline-none focus:ring-2 focus:ring-teal-500 dark:bg-slate-700 dark:text-white" placeholder="500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Category</label>
            <select value={profile.category} onChange={(e) => setProfile({...profile, category: e.target.value})} className="w-full border border-slate-200 dark:border-slate-600 rounded-lg p-3 outline-none focus:ring-2 focus:ring-teal-500 dark:bg-slate-700 dark:text-white">
              {['Labour', 'Plumber', 'Electrician', 'Painter', 'Carpenter', 'Cleaner', 'Driver', 'Cook'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-teal-600 text-sm">{success}</p>}

        <Button variant="primary" className="w-full py-3 flex items-center justify-center gap-2" onClick={handleSave} disabled={saving}>
          <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
