import React, { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal, Plus, Check, MapPin, Sparkles, X, AlertCircle } from 'lucide-react';
import { getCities, updateTrip } from '../../services/tripApi';
import { Trip, Destination } from '../../types/trip';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface CityDiscoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  onTripUpdated: (updatedTrip: Trip) => void;
}

export const CityDiscoveryModal: React.FC<CityDiscoveryModalProps> = ({
  isOpen,
  onClose,
  trip,
  onTripUpdated
}) => {
  const [cities, setCities] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedCost, setSelectedCost] = useState('All');
  const [selectedPopularity, setSelectedPopularity] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  
  // Action state
  const [addingCityId, setAddingCityId] = useState<string | null>(null);
  const [addSuccessMsg, setAddSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchCities = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getCities();
        setCities(data);
      } catch (err: any) {
        console.error(err);
        setError('Failed to load discoverable cities. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    if (isOpen) {
      fetchCities();
    }
  }, [isOpen]);

  // Extract unique countries for filter dropdown
  const countries = useMemo(() => {
    const list = cities.map(c => c.country);
    return ['All', ...Array.from(new Set(list))];
  }, [cities]);

  // Check if a city is already in this trip
  const isCityInTrip = (cityName: string) => {
    return (trip.destinations || []).some(
      dest => dest.city.toLowerCase() === cityName.toLowerCase()
    );
  };

  // Filter & Search Logic
  const filteredCities = useMemo(() => {
    return cities.filter(c => {
      const matchesSearch = 
        c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.region && c.region.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCountry = selectedCountry === 'All' || c.country === selectedCountry;
      const matchesCost = selectedCost === 'All' || c.costIndex === Number(selectedCost);
      const matchesPopularity = selectedPopularity === 'All' || c.popularity === selectedPopularity;

      return matchesSearch && matchesCountry && matchesCost && matchesPopularity;
    });
  }, [cities, searchQuery, selectedCountry, selectedCost, selectedPopularity]);

  const handleAddCity = async (city: Destination) => {
    if (isCityInTrip(city.city)) return;
    
    setAddingCityId(city.id);
    setError(null);
    try {
      const newDest = {
        id: 'dest-' + Math.random().toString(36).substr(2, 9),
        city: city.city,
        country: city.country,
        region: city.region || '',
        costIndex: city.costIndex || 3,
        popularity: city.popularity || 'Medium',
        image: city.image || '',
        description: city.description || ''
      };

      const updatedDestinations = [...(trip.destinations || []), newDest];
      
      const updated = await updateTrip(trip.id, {
        destinations: updatedDestinations
      });

      onTripUpdated(updated);
      setAddSuccessMsg(`Successfully added ${city.city} to your trip stops!`);
      setTimeout(() => setAddSuccessMsg(null), 3000);
    } catch (err: any) {
      console.error(err);
      setError(`Failed to add stop: ${err.message || 'Error occurred.'}`);
    } finally {
      setAddingCityId(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Discover City Stops"
      size="lg"
      footer={
        <Button variant="outline" size="sm" onClick={onClose} className="font-semibold">
          Close
        </Button>
      }
    >
      <div className="flex flex-col gap-4 text-left">
        {/* Search and Filters Header */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by city name, country, or region..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
              >
                <X size={12} />
              </button>
            )}
          </div>
          <Button
            variant={showFilters ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 py-2.5 px-3"
          >
            <SlidersHorizontal size={14} />
            <span className="hidden sm:inline">Filters</span>
          </Button>
        </div>

        {/* Collapsible Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 border border-slate-100 rounded-xl p-3.5 animate-in slide-in-from-top-2 duration-200">
            {/* Country Filter */}
            <div className="flex flex-col gap-1 text-left">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Country</label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-1.5 text-xs bg-white focus:outline-none"
              >
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            {/* Cost Index Filter */}
            <div className="flex flex-col gap-1 text-left">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Cost Index</label>
              <select
                value={selectedCost}
                onChange={(e) => setSelectedCost(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-1.5 text-xs bg-white focus:outline-none"
              >
                <option value="All">All Cost Indexes</option>
                <option value="1">1/5 (Budget Friendly)</option>
                <option value="2">2/5 (Moderate)</option>
                <option value="3">3/5 (Average)</option>
                <option value="4">4/5 (Premium)</option>
                <option value="5">5/5 (Luxury)</option>
              </select>
            </div>

            {/* Popularity Filter */}
            <div className="flex flex-col gap-1 text-left">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Popularity</label>
              <select
                value={selectedPopularity}
                onChange={(e) => setSelectedPopularity(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-1.5 text-xs bg-white focus:outline-none"
              >
                <option value="All">All Popularity</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Very High">Very High</option>
              </select>
            </div>
          </div>
        )}

        {/* Global Alerts inside Modal */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle size={14} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        {addSuccessMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700 text-xs font-semibold flex items-center gap-2">
            <Check size={14} className="flex-shrink-0" />
            <span>{addSuccessMsg}</span>
          </div>
        )}

        {/* Cities List/Grid */}
        <div className="max-h-[50vh] overflow-y-auto pr-1 flex flex-col gap-3">
          {isLoading ? (
            // Loading Skeletons
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border border-slate-100 rounded-xl p-3 flex gap-3 animate-pulse bg-slate-50/30">
                <div className="w-20 h-20 bg-slate-200 rounded-lg flex-shrink-0" />
                <div className="flex-1 flex flex-col gap-2 pt-1">
                  <div className="h-4 w-1/3 bg-slate-200 rounded" />
                  <div className="h-3 w-1/4 bg-slate-200 rounded" />
                  <div className="h-3 w-3/4 bg-slate-200 rounded mt-1" />
                </div>
              </div>
            ))
          ) : filteredCities.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-4">
              <MapPin size={28} className="text-slate-300 mb-2" />
              <h4 className="font-bold text-xs text-slate-700 mb-0.5">No cities matched your filters</h4>
              <p className="text-[10px] text-slate-400">Try broadening your search term or clearing active dropdown options.</p>
            </div>
          ) : (
            filteredCities.map((city) => {
              const added = isCityInTrip(city.city);
              const isAdding = addingCityId === city.id;
              
              return (
                <div 
                  key={city.id} 
                  className={`border rounded-xl p-3 flex gap-3 hover:border-slate-200 transition-colors bg-white ${
                    added ? 'border-indigo-100 bg-indigo-50/5' : 'border-slate-100'
                  }`}
                >
                  {/* City image representation */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                    <img 
                      src={city.image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=100&q=80'} 
                      alt={city.city} 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=100&q=80';
                      }}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between text-left">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-extrabold text-slate-800 text-xs">{city.city}</h4>
                        <span className="text-[9px] font-semibold text-slate-400">({city.country})</span>
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md">
                          {city.region}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {city.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 font-semibold">
                        <span className="flex items-center gap-0.5">
                          💰 Cost: {'★'.repeat(city.costIndex || 3)}{'☆'.repeat(5 - (city.costIndex || 3))}
                        </span>
                        <span className="flex items-center gap-0.5">
                          🔥 {city.popularity}
                        </span>
                      </div>

                      <Button
                        variant={added ? 'outline' : 'primary'}
                        size="sm"
                        disabled={added || isAdding}
                        isLoading={isAdding}
                        onClick={() => handleAddCity(city)}
                        leftIcon={added ? <Check size={12} /> : <Plus size={12} />}
                        className="py-1 px-2.5 text-[10px] font-bold"
                      >
                        {added ? 'Staged' : 'Add Stop'}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
};
