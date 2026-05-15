import { useState, useEffect, useContext } from 'react';
import { FiCalendar, FiTrash2, FiPlus, FiClock } from 'react-icons/fi';
import { AuthContext } from '../../context/AuthContext';
import Button from '../../components/Button';

const ALL_TIME_SLOTS = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'
];

export default function ProviderAvailability() {
  const { user } = useContext(AuthContext);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [workingHours, setWorkingHours] = useState([...ALL_TIME_SLOTS]);
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [blockDate, setBlockDate] = useState('');
  const [blockTime, setBlockTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const providerId = user?._id || user?.id;
        if (!providerId) return;

        const res = await fetch(`http://localhost:5000/api/providers/${providerId}`);
        const data = await res.json();

        if (res.ok) {
          if (data.unavailableDates) setUnavailableDates(data.unavailableDates);
          if (data.workingHours && data.workingHours.length > 0) setWorkingHours(data.workingHours);
          if (data.blockedSlots) setBlockedSlots(data.blockedSlots);
        }
      } catch (err) {
        console.error('Failed to fetch availability', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  // Toggle a time slot on/off
  const toggleTimeSlot = (slot) => {
    if (workingHours.includes(slot)) {
      if (workingHours.length <= 1) {
        setError('You must have at least one working time slot.');
        return;
      }
      setWorkingHours(workingHours.filter(h => h !== slot));
    } else {
      setWorkingHours([...workingHours, slot].sort((a, b) => {
        const toMin = (t) => { const [time, period] = t.split(' '); let [h, m] = time.split(':').map(Number); if (period === 'PM' && h !== 12) h += 12; if (period === 'AM' && h === 12) h = 0; return h * 60 + m; };
        return toMin(a) - toMin(b);
      }));
    }
    setError('');
  };

  // Add blocked full day
  const handleAddDate = () => {
    if (!selectedDate) { setError('Please select a date.'); return; }
    if (unavailableDates.includes(selectedDate)) { setError('This date is already blocked.'); return; }
    setUnavailableDates([...unavailableDates, selectedDate].sort());
    setSelectedDate('');
    setError('');
  };

  const handleRemoveDate = (dateToRemove) => {
    setUnavailableDates(unavailableDates.filter(d => d !== dateToRemove));
  };

  // Add a blocked specific slot
  const handleAddBlockedSlot = () => {
    if (!blockDate || !blockTime) { setError('Please select both a date and time.'); return; }
    const exists = blockedSlots.some(s => s.date === blockDate && s.time === blockTime);
    if (exists) { setError('This slot is already blocked.'); return; }
    setBlockedSlots([...blockedSlots, { date: blockDate, time: blockTime }].sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)));
    setBlockDate('');
    setBlockTime('');
    setError('');
  };

  const handleRemoveBlockedSlot = (idx) => {
    setBlockedSlots(blockedSlots.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('http://localhost:5000/api/providers/availability', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ unavailableDates, workingHours, blockedSlots })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess('Availability updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save availability');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12"><p className="text-slate-500">Loading your schedule...</p></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 dark:bg-slate-900 transition-colors pb-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Manage Availability</h1>
        <p className="text-slate-600 dark:text-slate-400">Set your working hours, block dates, or disable specific time slots.</p>
      </div>

      {/* SECTION 1: Working Time Slots */}
      <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
          <FiClock className="text-teal-500" /> Working Time Slots
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Toggle the time slots you are generally available for bookings. Active slots appear in teal.
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3">
          {ALL_TIME_SLOTS.map(slot => {
            const active = workingHours.includes(slot);
            return (
              <button
                key={slot}
                onClick={() => toggleTimeSlot(slot)}
                className={`py-3 px-2 rounded-xl text-sm font-semibold transition-all duration-200 border-2 ${
                  active
                    ? 'bg-teal-50 dark:bg-teal-900/30 border-teal-500 text-teal-700 dark:text-teal-300 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 text-slate-400 dark:text-slate-500 line-through opacity-60'
                }`}
              >
                {slot}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* SECTION 2: Block Full Days */}
        <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
            <FiCalendar className="text-red-500" /> Block Full Days
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Block entire days when you're on vacation or unavailable.
          </p>

          <div className="flex gap-3 mb-4">
            <input
              type="date"
              min={today}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="flex-1 border border-slate-200 dark:border-slate-600 rounded-lg p-3 outline-none focus:ring-2 focus:ring-teal-500 dark:bg-slate-700 dark:text-white"
            />
            <Button variant="primary" onClick={handleAddDate} className="flex items-center gap-2">
              <FiPlus /> Add
            </Button>
          </div>

          {unavailableDates.length === 0 ? (
            <div className="text-center py-6 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
              <p className="text-slate-500 dark:text-slate-400 text-sm">No blocked days. You're available every day!</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
              {unavailableDates.map(dateStr => {
                const formatted = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
                return (
                  <div key={dateStr} className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30">
                    <p className="font-medium text-slate-800 dark:text-white text-sm">{formatted}</p>
                    <button onClick={() => handleRemoveDate(dateStr)} className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION 3: Block Specific Time Slots */}
        <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
            <FiClock className="text-amber-500" /> Block Specific Slots
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Block a specific time on a specific date (e.g., "May 20 at 2:00 PM").
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="date"
              min={today}
              value={blockDate}
              onChange={(e) => setBlockDate(e.target.value)}
              className="flex-1 border border-slate-200 dark:border-slate-600 rounded-lg p-3 outline-none focus:ring-2 focus:ring-teal-500 dark:bg-slate-700 dark:text-white"
            />
            <select
              value={blockTime}
              onChange={(e) => setBlockTime(e.target.value)}
              className="flex-1 border border-slate-200 dark:border-slate-600 rounded-lg p-3 outline-none focus:ring-2 focus:ring-teal-500 dark:bg-slate-700 dark:text-white"
            >
              <option value="">Select time</option>
              {workingHours.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <Button variant="primary" onClick={handleAddBlockedSlot} className="flex items-center gap-2">
              <FiPlus /> Add
            </Button>
          </div>

          {blockedSlots.length === 0 ? (
            <div className="text-center py-6 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
              <p className="text-slate-500 dark:text-slate-400 text-sm">No specific slots blocked.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
              {blockedSlots.map((slot, idx) => {
                const formatted = new Date(slot.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                return (
                  <div key={idx} className="flex justify-between items-center p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/30">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-slate-800 dark:text-white">{formatted}</span>
                      <span className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full font-semibold">{slot.time}</span>
                    </div>
                    <button onClick={() => handleRemoveBlockedSlot(idx)} className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Save Bar */}
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          {workingHours.length} active time slots &bull; {unavailableDates.length} blocked days &bull; {blockedSlots.length} blocked slots
        </p>
        <div className="flex items-center gap-4">
          {success && <p className="text-teal-600 text-sm font-medium">{success}</p>}
          <Button variant="primary" className="px-8 py-3" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save All Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
