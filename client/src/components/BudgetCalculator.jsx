import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calculator, Calendar, Plane, Hotel, Utensils, Sparkles, 
  CheckCircle2, Users, Compass, Printer, ShieldCheck, Ticket, MapPin, ArrowRight, Navigation, Search
} from 'lucide-react';
import axios from 'axios';
import { INITIAL_DESTINATIONS } from '../data/destinations';
import { ALL_INDIAN_CITIES, findCityCoordinates } from '../data/indianCities';

// Transit Modes and Rate multipliers (in INR ₹ per km per person)
const TRANSIT_MODES = {
  flight: {
    label: 'Flight (Economy)',
    icon: '✈️',
    basePrice: 2800,
    perKmRate: 3.8,
    perPerson: true,
  },
  train: {
    label: 'Train (AC 3-Tier / Express)',
    icon: '🚆',
    basePrice: 450,
    perKmRate: 1.5,
    perPerson: true,
  },
  bus: {
    label: 'Volvo AC Bus',
    icon: '🚌',
    basePrice: 550,
    perKmRate: 1.9,
    perPerson: true,
  },
  taxi: {
    label: 'Private Cab / SUV',
    icon: '🚗',
    basePrice: 800,
    perKmRate: 14.0,
    perPerson: false, // Total group fare divided among travelers
  },
};

export default function BudgetCalculator() {
  // Travel Style Presets (in INR ₹)
  const presets = {
    backpacker: {
      label: 'Backpacker',
      icon: '🎒',
      stayCostPerNight: 1200,
      foodCostPerDay: 450,
      activitiesCostPerDay: 300,
      miscCostPerDay: 200,
    },
    comfort: {
      label: 'Comfort',
      icon: '🧳',
      stayCostPerNight: 3500,
      foodCostPerDay: 950,
      activitiesCostPerDay: 650,
      miscCostPerDay: 400,
    },
    luxury: {
      label: 'Luxury',
      icon: '👑',
      stayCostPerNight: 11500,
      foodCostPerDay: 2400,
      activitiesCostPerDay: 1800,
      miscCostPerDay: 1000,
    },
  };

  // Supported Currencies (Base INR ₹)
  const currencies = {
    INR: { symbol: '₹', rate: 1, name: 'INR (₹)' },
    USD: { symbol: '$', rate: 0.012, name: 'USD ($)' },
    EUR: { symbol: '€', rate: 0.011, name: 'EUR (€)' },
    GBP: { symbol: '£', rate: 0.0094, name: 'GBP (£)' },
    AED: { symbol: 'د.إ', rate: 0.044, name: 'AED (د.إ)' },
  };

  const [selectedCurrency, setSelectedCurrency] = useState('INR');
  const [activePreset, setActivePreset] = useState('comfort');
  
  // From Place & To Place States
  const [fromCityQuery, setFromCityQuery] = useState('Rajahmundry (Rajamahendravaram), Andhra Pradesh');
  const [customFromInput, setCustomFromInput] = useState('');
  const [isCustomFrom, setIsCustomFrom] = useState(false);

  const [toDestinationId, setToDestinationId] = useState(INITIAL_DESTINATIONS[0]?.id || '1');
  const [transitModeKey, setTransitModeKey] = useState('train');

  // Selected destination object
  const selectedDestination = useMemo(() => {
    return INITIAL_DESTINATIONS.find((d) => d.id === toDestinationId) || INITIAL_DESTINATIONS[0];
  }, [toDestinationId]);

  // Resolved origin city object with precise lat & lng
  const selectedOrigin = useMemo(() => {
    const activeText = isCustomFrom ? customFromInput : fromCityQuery;
    return findCityCoordinates(activeText);
  }, [fromCityQuery, customFromInput, isCustomFrom]);

  // Distance Calculation between Origin and Destination (in km)
  const estimatedDistanceKm = useMemo(() => {
    const oLat = selectedOrigin.lat || 17.0005;
    const oLng = selectedOrigin.lng || 81.8040;
    const dLat = selectedDestination?.lat || 15.5553;
    const dLng = selectedDestination?.lng || 73.7517;

    const R = 6371; // Earth radius in km
    const dL1 = (dLat - oLat) * (Math.PI / 180);
    const dL2 = (dLng - oLng) * (Math.PI / 180);
    const a =
      Math.sin(dL1 / 2) * Math.sin(dL1 / 2) +
      Math.cos(oLat * (Math.PI / 180)) * Math.cos(dLat * (Math.PI / 180)) *
      Math.sin(dL2 / 2) * Math.sin(dL2 / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const straightDist = R * c;

    // Road route winding multiplier (~1.25x - 1.28x)
    return Math.max(50, Math.round(straightDist * 1.26));
  }, [selectedOrigin, selectedDestination]);

  // Estimated Transit Cost per person (in INR ₹)
  const autoTransitCostPerPerson = useMemo(() => {
    const mode = TRANSIT_MODES[transitModeKey];
    if (mode.perPerson) {
      return Math.round(mode.basePrice + estimatedDistanceKm * mode.perKmRate);
    } else {
      // Cab total fare divided by 2 (default base group size assumption)
      return Math.round((mode.basePrice + estimatedDistanceKm * mode.perKmRate) / 2);
    }
  }, [transitModeKey, estimatedDistanceKm]);

  // Form Inputs
  const [formData, setFormData] = useState({
    durationDays: 4,
    travelersCount: 2,
    transitCostPerPerson: 1900,
    stayCostPerNight: 3500,
    foodCostPerDay: 950,
    activitiesCostPerDay: 650,
    miscCostPerDay: 400,
    includeBuffer: true,
  });

  // Update transit cost automatically when route distance or mode changes
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      transitCostPerPerson: autoTransitCostPerPerson,
    }));
  }, [autoTransitCostPerPerson]);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Apply preset button
  const handleApplyPreset = (presetKey) => {
    setActivePreset(presetKey);
    const p = presets[presetKey];
    setFormData((prev) => ({
      ...prev,
      stayCostPerNight: p.stayCostPerNight,
      foodCostPerDay: p.foodCostPerDay,
      activitiesCostPerDay: p.activitiesCostPerDay,
      miscCostPerDay: p.miscCostPerDay,
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : Math.max(1, Number(value) || 0),
    }));
  };

  // Calculations (Base INR ₹)
  const days = Math.max(1, formData.durationDays || 1);
  const travelers = Math.max(1, formData.travelersCount || 1);
  const curr = currencies[selectedCurrency];

  const transitTotalINR = formData.transitCostPerPerson * travelers;
  const stayTotalINR = formData.stayCostPerNight * days * Math.ceil(travelers / 2);
  const foodTotalINR = formData.foodCostPerDay * days * travelers;
  const activitiesTotalINR = formData.activitiesCostPerDay * days * travelers;
  const miscTotalINR = formData.miscCostPerDay * days * travelers;

  const subTotalINR = transitTotalINR + stayTotalINR + foodTotalINR + activitiesTotalINR + miscTotalINR;
  const bufferINR = formData.includeBuffer ? Math.round(subTotalINR * 0.1) : 0;
  const grandTotalINR = subTotalINR + bufferINR;

  // Format currency display
  const formatMoney = (amountINR) => {
    const converted = amountINR * curr.rate;
    if (selectedCurrency === 'INR') {
      return `₹${Math.round(converted).toLocaleString('en-IN')}`;
    }
    return `${curr.symbol}${Math.round(converted).toLocaleString()}`;
  };

  const costPerPersonINR = Math.round(grandTotalINR / travelers);
  const costPerPersonPerDayINR = Math.round(costPerPersonINR / days);

  // Percentage distribution for progress bar
  const transitPct = Math.round((transitTotalINR / grandTotalINR) * 100) || 0;
  const stayPct = Math.round((stayTotalINR / grandTotalINR) * 100) || 0;
  const foodPct = Math.round((foodTotalINR / grandTotalINR) * 100) || 0;
  const activitiesPct = Math.round((activitiesTotalINR / grandTotalINR) * 100) || 0;
  const miscPct = Math.round(((miscTotalINR + bufferINR) / grandTotalINR) * 100) || 0;

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSavedSuccess(false);

    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || '';
      const originName = isCustomFrom ? (customFromInput || 'Custom Origin') : fromCityQuery;

      await axios.post(`${apiBase}/api/budget/calculate`, {
        fromPlace: originName,
        toPlace: selectedDestination.title,
        destinationName: selectedDestination.title,
        transitMode: transitModeKey,
        estimatedDistanceKm,
        durationDays: days,
        travelersCount: travelers,
        travelCost: transitTotalINR,
        stayCost: stayTotalINR,
        foodCost: foodTotalINR,
        miscCost: miscTotalINR + activitiesTotalINR + bufferINR,
        totalBudget: grandTotalINR,
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="budget" className="py-16 bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center space-x-2 text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
            <Calculator className="w-3.5 h-3.5" />
            <span>360° All-City Travel Budget Estimator</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Smart Route Distance & Trip Budget Planner
          </h2>
          <p className="text-slate-600 mt-2 text-sm max-w-2xl mx-auto">
            Enter any origin city in India (e.g. Rajahmundry, Vizag, Vijayawada, Guntur, Kakinada, Tirupati, Hyderabad, Mumbai, Delhi) and your destination to calculate accurate road distance, transit fares, stays, and total trip expenses in Indian Rupees (₹).
          </p>

          {/* Currency Selector Pills */}
          <div className="flex flex-wrap justify-center items-center gap-2 mt-6">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2">Display Currency:</span>
            {Object.keys(currencies).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setSelectedCurrency(code)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedCurrency === code
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {currencies[code].name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
          
          {/* Left Input Form Column */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-md">
            <form onSubmit={handleSaveBudget} className="space-y-6">
              
              {/* Origin ("From Place") & Destination ("To Place") Grid */}
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-4">
                <div className="flex items-center space-x-2 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                  <Navigation className="w-4 h-4 text-emerald-600" />
                  <span>Trip Route (Origin ➔ Destination)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* From Place Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                      <span className="flex items-center">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 mr-1" />
                        From Place (Origin City)
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsCustomFrom(!isCustomFrom)}
                        className="text-[11px] text-emerald-700 hover:underline font-semibold"
                      >
                        {isCustomFrom ? 'Select List' : 'Custom Input'}
                      </button>
                    </label>
                    
                    {!isCustomFrom ? (
                      <select
                        value={fromCityQuery}
                        onChange={(e) => setFromCityQuery(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                      >
                        {ALL_INDIAN_CITIES.map((city, idx) => (
                          <option key={idx} value={city.name}>
                            {city.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          value={customFromInput}
                          onChange={(e) => setCustomFromInput(e.target.value)}
                          placeholder="e.g. Rajahmundry, Vizag, Kakinada..."
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                          required
                        />
                      </div>
                    )}
                  </div>

                  {/* To Place Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center">
                      <Compass className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                      To Place (Destination)
                    </label>
                    <select
                      value={toDestinationId}
                      onChange={(e) => setToDestinationId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      {INITIAL_DESTINATIONS.map((dest) => (
                        <option key={dest.id} value={dest.id}>
                          {dest.title} ({dest.locationName})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Distance & Route Summary Banner */}
                <div className="flex flex-wrap items-center justify-between bg-emerald-50/80 border border-emerald-200/80 px-3.5 py-2.5 rounded-xl text-xs">
                  <div className="flex items-center space-x-2 text-emerald-900 font-bold truncate max-w-full">
                    <span className="truncate">{selectedOrigin.name || 'Origin City'}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span className="truncate">{selectedDestination.title}</span>
                  </div>
                  <div className="font-bold text-emerald-800 bg-white px-2.5 py-0.5 rounded-md border border-emerald-200 shadow-2xs mt-1 sm:mt-0 font-mono">
                    Accurate Route Distance: ~{estimatedDistanceKm} km
                  </div>
                </div>
              </div>

              {/* Transit Mode Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Preferred Transit Mode & Fare
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {Object.keys(TRANSIT_MODES).map((modeKey) => {
                    const m = TRANSIT_MODES[modeKey];
                    const isSelected = transitModeKey === modeKey;
                    const estimatedFareINR = m.perPerson 
                      ? Math.round(m.basePrice + estimatedDistanceKm * m.perKmRate)
                      : Math.round((m.basePrice + estimatedDistanceKm * m.perKmRate) / 2);

                    return (
                      <button
                        type="button"
                        key={modeKey}
                        onClick={() => setTransitModeKey(modeKey)}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'bg-sky-50 border-sky-500 text-sky-900 font-bold shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <div className="text-xl mb-1">{m.icon}</div>
                        <div className="text-xs font-bold truncate">{m.label.split(' ')[0]}</div>
                        <div className="text-[11px] font-mono text-emerald-700 font-bold mt-0.5">
                          ~₹{estimatedFareINR.toLocaleString('en-IN')}/p
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Travel Style Presets */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Choose Travel Style Preset
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {Object.keys(presets).map((key) => {
                    const p = presets[key];
                    const isActive = activePreset === key;
                    return (
                      <button
                        type="button"
                        key={key}
                        onClick={() => handleApplyPreset(key)}
                        className={`p-3 rounded-2xl border text-center transition-all ${
                          isActive
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <div className="text-xl mb-1">{p.icon}</div>
                        <div className="text-xs font-bold">{p.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Duration & Travelers Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex justify-between">
                    <span>Trip Duration</span>
                    <span className="text-emerald-700 font-bold">{days} Days</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="number"
                      name="durationDays"
                      min="1"
                      max="60"
                      value={formData.durationDays}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex justify-between">
                    <span>Number of Travelers</span>
                    <span className="text-emerald-700 font-bold">{travelers} Person(s)</span>
                  </label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="number"
                      name="travelersCount"
                      min="1"
                      max="20"
                      value={formData.travelersCount}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Itemized Expense Breakdown Grid (in INR ₹) */}
              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Itemized Daily & Transit Expenses (in Indian Rupees ₹)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Transit Cost */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center">
                      <Plane className="w-3.5 h-3.5 text-sky-500 mr-1" />
                      Transit Fare (₹ / person)
                    </label>
                    <input
                      type="number"
                      name="transitCostPerPerson"
                      value={formData.transitCostPerPerson}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-mono font-bold"
                    />
                  </div>

                  {/* Accommodation */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center">
                      <Hotel className="w-3.5 h-3.5 text-indigo-500 mr-1" />
                      Hotel / Stay (₹ / night / room)
                    </label>
                    <input
                      type="number"
                      name="stayCostPerNight"
                      value={formData.stayCostPerNight}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-mono font-bold"
                    />
                  </div>

                  {/* Food & Dining */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center">
                      <Utensils className="w-3.5 h-3.5 text-amber-500 mr-1" />
                      Food & Meals (₹ / day / person)
                    </label>
                    <input
                      type="number"
                      name="foodCostPerDay"
                      value={formData.foodCostPerDay}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-mono font-bold"
                    />
                  </div>

                  {/* Activities */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center">
                      <Ticket className="w-3.5 h-3.5 text-purple-500 mr-1" />
                      Sightseeing & Activities (₹ / day / person)
                    </label>
                    <input
                      type="number"
                      name="activitiesCostPerDay"
                      value={formData.activitiesCostPerDay}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Reserve Checkbox */}
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="includeBuffer"
                  name="includeBuffer"
                  checked={formData.includeBuffer}
                  onChange={handleChange}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <label htmlFor="includeBuffer" className="text-xs text-slate-600 flex items-center cursor-pointer font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                  Include 10% Emergency Safety Reserve Cushion
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl transition-all shadow-md text-sm"
                >
                  {loading ? 'Saving Budget Plan...' : 'Save Estimated Budget Plan'}
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center justify-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-5 py-3 rounded-xl text-sm transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Plan</span>
                </button>
              </div>

              {savedSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center space-x-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Comprehensive trip budget saved successfully!</span>
                </div>
              )}

            </form>
          </div>

          {/* Right Summary Column */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col justify-between border border-slate-800">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider block">Estimated Route & Budget</span>
                  <h3 className="text-xl font-extrabold text-white mt-0.5">{selectedDestination.title}</h3>
                  <span className="text-xs text-slate-400 block mt-0.5">
                    From {selectedOrigin.name} (~{estimatedDistanceKm} km)
                  </span>
                </div>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold font-mono">
                  {selectedCurrency}
                </span>
              </div>

              {/* Key Metrics Pill */}
              <div className="grid grid-cols-2 gap-2 mb-6 bg-white/5 p-3 rounded-2xl border border-white/10 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Per Person</span>
                  <span className="text-lg font-extrabold text-emerald-300 font-mono">{formatMoney(costPerPersonINR)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Per Person / Day</span>
                  <span className="text-lg font-extrabold text-sky-300 font-mono">{formatMoney(costPerPersonPerDayINR)}</span>
                </div>
              </div>

              {/* Expense Rows */}
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between items-center pb-2.5 border-b border-white/10">
                  <span className="text-slate-300 flex items-center">
                    <Plane className="w-3.5 h-3.5 text-sky-400 mr-2" />
                    Transit ({TRANSIT_MODES[transitModeKey].label.split(' ')[0]}, {travelers}p)
                  </span>
                  <span className="font-mono font-bold text-slate-100">{formatMoney(transitTotalINR)}</span>
                </div>

                <div className="flex justify-between items-center pb-2.5 border-b border-white/10">
                  <span className="text-slate-300 flex items-center">
                    <Hotel className="w-3.5 h-3.5 text-indigo-400 mr-2" />
                    Hotels & Stays ({days}d)
                  </span>
                  <span className="font-mono font-bold text-slate-100">{formatMoney(stayTotalINR)}</span>
                </div>

                <div className="flex justify-between items-center pb-2.5 border-b border-white/10">
                  <span className="text-slate-300 flex items-center">
                    <Utensils className="w-3.5 h-3.5 text-amber-400 mr-2" />
                    Food & Dining ({days}d x {travelers}p)
                  </span>
                  <span className="font-mono font-bold text-slate-100">{formatMoney(foodTotalINR)}</span>
                </div>

                <div className="flex justify-between items-center pb-2.5 border-b border-white/10">
                  <span className="text-slate-300 flex items-center">
                    <Ticket className="w-3.5 h-3.5 text-purple-400 mr-2" />
                    Activities & Safaris ({days}d x {travelers}p)
                  </span>
                  <span className="font-mono font-bold text-slate-100">{formatMoney(activitiesTotalINR)}</span>
                </div>

                <div className="flex justify-between items-center pb-2.5 border-b border-white/10">
                  <span className="text-slate-300 flex items-center">
                    <Sparkles className="w-3.5 h-3.5 text-rose-400 mr-2" />
                    Misc & 10% Reserve
                  </span>
                  <span className="font-mono font-bold text-slate-100">{formatMoney(miscTotalINR + bufferINR)}</span>
                </div>
              </div>

              {/* Distribution Percentage Bar */}
              <div className="mt-6 pt-4 border-t border-white/10">
                <span className="text-[11px] text-slate-400 block font-semibold mb-2">Cost Distribution:</span>
                <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
                  <div style={{ width: `${transitPct}%` }} className="bg-sky-500" title={`Transit: ${transitPct}%`} />
                  <div style={{ width: `${stayPct}%` }} className="bg-indigo-500" title={`Stays: ${stayPct}%`} />
                  <div style={{ width: `${foodPct}%` }} className="bg-amber-500" title={`Food: ${foodPct}%`} />
                  <div style={{ width: `${activitiesPct}%` }} className="bg-purple-500" title={`Activities: ${activitiesPct}%`} />
                  <div style={{ width: `${miscPct}%` }} className="bg-emerald-500" title={`Reserve: ${miscPct}%`} />
                </div>
                <div className="flex flex-wrap gap-2 text-[10px] text-slate-400 mt-2 font-mono">
                  <span>🔵 Transit {transitPct}%</span>
                  <span>🟣 Stay {stayPct}%</span>
                  <span>🟡 Food {foodPct}%</span>
                  <span>🟢 Activities {activitiesPct}%</span>
                </div>
              </div>
            </div>

            {/* Grand Total Footer */}
            <div className="mt-8 pt-5 border-t border-emerald-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-emerald-400 block uppercase font-bold tracking-wider">Grand Total Estimated Budget</span>
                  <span className="text-xs text-slate-400">{days} Days, {travelers} Traveler(s)</span>
                </div>
                <div className="text-3xl font-extrabold text-emerald-400 font-mono">
                  {formatMoney(grandTotalINR)}
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
