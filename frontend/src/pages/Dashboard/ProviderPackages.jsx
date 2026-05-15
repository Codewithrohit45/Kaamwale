import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { FiPlus, FiTrash2, FiCheck, FiInfo } from 'react-icons/fi';
import Button from '../../components/Button';
import { useToast } from '../../components/NotificationToast';

export default function ProviderPackages() {
  const { user } = useContext(AuthContext);
  const toast = useToast();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.packages) setPackages(user.packages);
  }, [user]);

  const handleAddPackage = () => {
    setPackages([...packages, { name: '', price: '', description: '', features: [''] }]);
  };

  const handleRemovePackage = (index) => {
    setPackages(packages.filter((_, i) => i !== index));
  };

  const handlePackageChange = (index, field, value) => {
    const newPackages = [...packages];
    newPackages[index][field] = value;
    setPackages(newPackages);
  };

  const handleAddFeature = (pIndex) => {
    const newPackages = [...packages];
    newPackages[pIndex].features.push('');
    setPackages(newPackages);
  };

  const handleFeatureChange = (pIndex, fIndex, value) => {
    const newPackages = [...packages];
    newPackages[pIndex].features[fIndex] = value;
    setPackages(newPackages);
  };

  const handleRemoveFeature = (pIndex, fIndex) => {
    const newPackages = [...packages];
    newPackages[pIndex].features = newPackages[pIndex].features.filter((_, i) => i !== fIndex);
    setPackages(newPackages);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/providers/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ packages })
      });

      if (res.ok) {
        toast('Packages updated successfully!', 'success');
      } else {
        throw new Error('Failed to update packages');
      }
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Service Packages</h1>
          <p className="text-slate-500 dark:text-slate-400">Define tiered service levels for your customers.</p>
        </div>
        <Button variant="primary" onClick={handleAddPackage} className="flex items-center gap-2">
          <FiPlus /> Add Package
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {packages.map((pkg, pIndex) => (
          <div key={pIndex} className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm relative group transition-all hover:shadow-xl">
            <button 
              onClick={() => handleRemovePackage(pIndex)}
              className="absolute top-6 right-6 text-slate-400 hover:text-red-500 transition-colors"
            >
              <FiTrash2 size={20} />
            </button>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Package Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Standard"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-white"
                    value={pkg.name}
                    onChange={(e) => handlePackageChange(pIndex, 'name', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Price (₹)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 500"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-white"
                    value={pkg.price}
                    onChange={(e) => handlePackageChange(pIndex, 'price', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                <textarea 
                  rows="2"
                  placeholder="What's included in this tier?"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-white"
                  value={pkg.description}
                  onChange={(e) => handlePackageChange(pIndex, 'description', e.target.value)}
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex justify-between">
                  Features
                  <button onClick={() => handleAddFeature(pIndex)} className="text-teal-600 hover:text-teal-500 flex items-center gap-1">
                    <FiPlus size={14} /> Add
                  </button>
                </label>
                <div className="space-y-2 mt-2">
                  {pkg.features.map((feature, fIndex) => (
                    <div key={fIndex} className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="e.g. 24/7 Support"
                        className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-white"
                        value={feature}
                        onChange={(e) => handleFeatureChange(pIndex, fIndex, e.target.value)}
                      />
                      <button onClick={() => handleRemoveFeature(pIndex, fIndex)} className="text-slate-400 hover:text-red-500">
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {packages.length > 0 && (
        <div className="flex justify-end pt-8">
          <Button variant="primary" size="lg" onClick={handleSave} disabled={loading} className="px-12 py-4 text-lg rounded-2xl shadow-xl shadow-teal-500/20">
            {loading ? 'Saving Changes...' : 'Save Service Packages'}
          </Button>
        </div>
      )}

      {packages.length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border border-dashed border-slate-200 dark:border-slate-700">
          <FiInfo className="mx-auto text-slate-300 mb-4" size={48} />
          <p className="text-slate-500 dark:text-slate-400 text-lg mb-6">You haven't defined any service packages yet.</p>
          <Button variant="outline" onClick={handleAddPackage}>Create Your First Package</Button>
        </div>
      )}
    </div>
  );
}
