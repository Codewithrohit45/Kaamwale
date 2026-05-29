import { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiUser, FiMail, FiPhone, FiMapPin, FiSave, FiUpload, FiCalendar } from 'react-icons/fi';
import { AuthContext } from '../../context/AuthContext';
import Button from '../../components/Button';
import { useToast } from '../../components/NotificationToast';
import UserDashboard from './UserDashboard';

export default function UserProfileEdit() {
  const { user } = useContext(AuthContext);
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'bookings';

  const [profile, setProfile] = useState({ name: '', email: '', phone: '', image: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/auth/profile`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setProfile({
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            image: data.image || '',
          });
        }
      } catch (err) {
        console.error('Fetch profile failed', err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchProfile();
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(profile)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast('Profile updated successfully!', 'success');
    } catch (err) {
      setError(err.message || 'Failed to save profile');
      toast('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = () => {
    window.cloudinary.openUploadWidget({
      cloudName: 'demo',
      uploadPreset: 'unsigned_preset',
      sources: ['local', 'url', 'camera'],
      multiple: false,
      cropping: true,
      croppingAspectRatio: 1,
    }, (error, result) => {
      if (!error && result && result.event === "success") { 
        setProfile({ ...profile, image: result.info.secure_url });
        toast('Photo uploaded! Save to apply.', 'success');
      }
    });
  };

  if (loading) return <div className="text-center py-12"><p className="text-slate-500">Loading profile...</p></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      {/* Dynamic Header */}
      <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
          My Account
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          {activeTab === 'bookings' 
            ? 'Track your ongoing services, booking history, and manage payments.' 
            : 'Update your personal profile information, contact number, and avatar.'}
        </p>
      </div>

      {/* Premium Tab Bar Navigation */}
      <div className="flex gap-2 border-b border-slate-250 dark:border-slate-750 pb-px">
        <button
          onClick={() => setSearchParams({ tab: 'bookings' })}
          className={`pb-4 px-6 font-semibold text-sm transition-all relative flex items-center gap-2 ${
            activeTab === 'bookings'
              ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-500 font-bold scale-102'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FiCalendar size={16} /> My Bookings
        </button>
        <button
          onClick={() => setSearchParams({ tab: 'settings' })}
          className={`pb-4 px-6 font-semibold text-sm transition-all relative flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-500 font-bold scale-102'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FiUser size={16} /> Profile Settings
        </button>
      </div>

      {activeTab === 'bookings' ? (
        <div className="animate-in fade-in duration-300">
          <UserDashboard hideHeader={true} />
        </div>
      ) : (
        <div className="max-w-3xl space-y-8 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-6">
            <img
              src={profile.image || `https://ui-avatars.com/api/?name=${profile.name.replace(' ','+')}&background=random&color=fff&size=100`}
              alt=""
              className="w-20 h-20 rounded-full object-cover border-4 border-slate-50 dark:border-slate-700"
            />
            <div className="flex-1">
              <h3 className="font-bold text-slate-800 dark:text-white text-lg">{profile.name}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Customer Account</p>
              <div className="mt-2 flex gap-3">
                <button 
                  type="button"
                  onClick={handleUpload}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  <FiUpload /> Change Photo
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 border border-slate-100 dark:border-slate-700 shadow-sm space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
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
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button variant="primary" className="w-full py-3 flex items-center justify-center gap-2" onClick={handleSave} disabled={saving}>
              <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
