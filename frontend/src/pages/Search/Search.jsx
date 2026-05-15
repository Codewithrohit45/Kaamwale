import { useSearchParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FiFilter, FiSearch, FiMapPin, FiList, FiMap, FiStar } from 'react-icons/fi';
import { MdVerified } from 'react-icons/md';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import ServiceCard from '../../components/ServiceCard';
import Button from '../../components/Button';

// Fix for default Leaflet marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});


export default function Search() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const loc = searchParams.get('loc') || '';
  const categoryParam = searchParams.get('category') || '';

  const [search, setSearch] = useState(q);
  const [location, setLocation] = useState(loc);
  const [category, setCategory] = useState(categoryParam);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('recommended');
  const [useGPS, setUseGPS] = useState(false);
  const [userCoords, setUserCoords] = useState(null);
  const [radius, setRadius] = useState(5000); // 5km
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (useGPS && !userCoords) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => { setUseGPS(false); alert('Location access denied'); }
      );
    }
  }, [useGPS]);

  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true);
      try {
        let url = 'http://localhost:5000/api/providers?';
        if (category) url += `category=${category}&`;
        if (search) url += `search=${search}&`;
        if (minPrice) url += `minPrice=${minPrice}&`;
        if (maxPrice) url += `maxPrice=${maxPrice}&`;
        if (minRating) url += `minRating=${minRating}&`;
        if (verifiedOnly) url += `verifiedOnly=true&`;
        if (sortBy) url += `sortBy=${sortBy}&`;
        
        if (useGPS && userCoords) {
          url += `lat=${userCoords.lat}&lng=${userCoords.lng}&radius=${radius}&`;
        } else if (location) {
          url += `location=${location}&`;
        }
        
        const res = await fetch(url);
        const data = await res.json();
        
        // Map backend locationCoords to lat/lng for Leaflet
        const formattedData = data.map(p => ({
          ...p,
          lat: p.locationCoords?.coordinates[1] || 19.0760,
          lng: p.locationCoords?.coordinates[0] || 72.8777,
        }));
        
        setProviders(formattedData);
      } catch (error) {
        console.error('Failed to fetch providers', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProviders();
  }, [category, location, search, minPrice, maxPrice, sortBy, userCoords, radius, useGPS]);

  const filteredProviders = providers; // Filtering is handled by backend now

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 dark:bg-slate-900 transition-colors min-h-screen">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Filters Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm sticky top-24 transition-colors">
            <div className="flex items-center gap-2 mb-6 text-slate-800 dark:text-white font-bold text-lg">
              <FiFilter /> Filters
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Proximity Search</label>
                <div className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Near Me (GPS)</span>
                  <button 
                    onClick={() => setUseGPS(!useGPS)}
                    className={`w-10 h-6 rounded-full transition-colors relative ${useGPS ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${useGPS ? 'left-5' : 'left-1'}`}></div>
                  </button>
                </div>
                {useGPS && (
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500">
                      <span>Radius</span>
                      <span>{radius / 1000} km</span>
                    </div>
                    <input 
                      type="range" 
                      min="1000" 
                      max="50000" 
                      step="1000"
                      value={radius}
                      onChange={(e) => setRadius(e.target.value)}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Category</label>
                <select 
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  <option value="Labour">Labour</option>
                  <option value="Mason">Mason</option>
                  <option value="Plumber">Plumber</option>
                  <option value="Electrician">Electrician</option>
                  <option value="Carpenter">Carpenter</option>
                  <option value="Tutor">Tutor</option>
                  <option value="Painter">Painter</option>
                  <option value="Mechanic">Mechanic</option>
                  <option value="AC Repair">AC Repair</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Location</label>
                <div className="relative">
                  <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="City or Area"
                    disabled={useGPS}
                    className={`w-full pl-9 pr-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-teal-500 ${useGPS ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white'}`}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Price Range (₹/hr)</label>
                <div className="flex gap-2 items-center">
                  <input 
                    type="number" 
                    placeholder="Min"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <span className="text-slate-400">-</span>
                  <input 
                    type="number" 
                    placeholder="Max"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Sort By</label>
                <select 
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="recommended">Recommended</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Min Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map(r => (
                    <button 
                      key={r}
                      onClick={() => setMinRating(minRating == r ? '' : r)}
                      className={`flex-1 py-2 rounded-lg border text-sm font-bold transition-all ${minRating == r ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-amber-500'}`}
                    >
                      {r}+ ⭐
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <MdVerified className="text-blue-500" />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Verified Only</span>
                </div>
                <button 
                  onClick={() => setVerifiedOnly(!verifiedOnly)}
                  className={`w-10 h-6 rounded-full transition-colors relative ${verifiedOnly ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${verifiedOnly ? 'left-5' : 'left-1'}`}></div>
                </button>
              </div>

              <button 
                onClick={() => { setCategory(''); setLocation(''); setMinPrice(''); setMaxPrice(''); setMinRating(''); setVerifiedOnly(false); setSortBy('recommended'); setSearch(''); }}
                className="w-full py-2 text-sm font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm mb-6 flex flex-col sm:flex-row gap-4 transition-colors">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Search providers or services..." 
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex bg-slate-100 dark:bg-slate-900 rounded-xl p-1">
              <button 
                onClick={() => setViewMode('list')}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              >
                <FiList /> List
              </button>
              <button 
                onClick={() => setViewMode('map')}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${viewMode === 'map' ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              >
                <FiMap /> Map
              </button>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">{filteredProviders.length} Providers Found</h2>
          </div>

          {viewMode === 'list' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredProviders.length > 0 ? (
                filteredProviders.map(provider => (
                  <ServiceCard key={provider._id || provider.id} provider={provider} />
                ))
              ) : (
                <div className="col-span-full py-12 text-center text-slate-500 dark:text-slate-400">
                  No providers found matching your criteria. Try adjusting your filters.
                </div>
              )}
            </div>
          ) : (
            <div className="h-[600px] w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm z-0">
              <MapContainer center={[19.0760, 72.8777]} zoom={11} scrollWheelZoom={true} className="h-full w-full">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {filteredProviders.map(provider => (
                  <Marker key={provider._id} position={[provider.lat, provider.lng]}>
                    <Popup>
                      <div className="w-48">
                        <img src={provider.image} className="w-full h-24 object-cover rounded-lg mb-2" alt="" />
                        <h3 className="font-bold text-slate-800">{provider.name}</h3>
                        <p className="text-teal-600 text-sm">{provider.category}</p>
                        <p className="text-slate-600 text-xs my-1">{provider.location}</p>
                        <Link to={`/provider/${provider._id}`} className="text-teal-600 text-sm font-semibold hover:underline mt-2 inline-block">View Profile &rarr;</Link>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
