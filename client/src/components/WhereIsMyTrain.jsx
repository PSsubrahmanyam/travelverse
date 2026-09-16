import React, { useState, useMemo } from 'react';
import {
  POPULAR_STATIONS,
  POPULAR_TRAINS,
  findTrainsBetweenStations,
  getLiveTrainStatus,
  getLiveStationBoard,
  getCoachComposition,
} from '../data/railwaysData';
import {
  Train,
  MapPin,
  ArrowRightLeft,
  Calendar,
  Clock,
  Search,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  Ticket,
  Users,
  Compass,
  Zap,
  Info,
  Layers,
  Bell,
  BellRing,
  Navigation,
  Gauge,
  X,
  Wifi,
  Radio,
} from 'lucide-react';

export default function WhereIsMyTrain({ initialFrom = 'VSKP', initialTo = 'RJY' }) {
  const [activeSubTab, setActiveSubTab] = useState('between'); // 'between' | 'live' | 'station' | 'pnr'

  // Tab 1 State: Trains Between Stations
  const [fromCode, setFromCode] = useState(initialFrom);
  const [toCode, setToCode] = useState(initialTo);
  const [journeyDate, setJourneyDate] = useState('today');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedQuota, setSelectedQuota] = useState('GN');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('ALL'); // 'ALL' | 'EARLY' | 'MORNING' | 'AFTERNOON' | 'NIGHT'
  const [selectedType, setSelectedType] = useState('ALL'); // 'ALL' | 'VANDE' | 'RAJDHANI' | 'SUPERFAST'
  const [sortBy, setSortBy] = useState('DEP_ASC'); // 'DEP_ASC' | 'DEP_DESC' | 'DURATION_ASC' | 'ARR_ASC'

  // Autocomplete search inputs
  const [fromSearch, setFromSearch] = useState('Visakhapatnam (VSKP)');
  const [toSearch, setToSearch] = useState('Rajahmundry (RJY)');
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  // Expanded Train Card Seat Grid Drawer state
  const [expandedSeatTrain, setExpandedSeatTrain] = useState(null);

  // Tab 2 State: Live Spotting
  const [liveTrainQuery, setLiveTrainQuery] = useState('12727');
  const [liveTrainData, setLiveTrainData] = useState(() => getLiveTrainStatus('12727'));
  const [isInsideTrainMode, setIsInsideTrainMode] = useState(true);

  // Tab 3 State: Live Station Board
  const [stationQuery, setStationQuery] = useState('RJY');
  const [stationBoardData, setStationBoardData] = useState(() => getLiveStationBoard('RJY'));



  // Coach Composition Modal State
  const [coachModalTrain, setCoachModalTrain] = useState(null);

  // Destination Arrival Alarm State
  const [alarmActive, setAlarmActive] = useState(false);

  // Station Autocomplete Filters
  const filteredFromStations = useMemo(() => {
    if (!fromSearch.trim()) return POPULAR_STATIONS.slice(0, 8);
    const q = fromSearch.toLowerCase().trim();
    return POPULAR_STATIONS.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q)
    ).slice(0, 10);
  }, [fromSearch]);

  const filteredToStations = useMemo(() => {
    if (!toSearch.trim()) return POPULAR_STATIONS.slice(0, 8);
    const q = toSearch.toLowerCase().trim();
    return POPULAR_STATIONS.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q)
    ).slice(0, 10);
  }, [toSearch]);

  // Swap From & To Stations
  const handleSwapStations = () => {
    const tempCode = fromCode;
    const tempSearch = fromSearch;
    setFromCode(toCode);
    setFromSearch(toSearch);
    setToCode(tempCode);
    setToSearch(tempSearch);
  };

  // Find Trains Between Stations (Authentic Schedule Only with Advanced Sorting & Filters)
  const searchResults = useMemo(() => {
    let list = findTrainsBetweenStations(fromCode, toCode);

    if (selectedClass !== 'ALL') {
      list = list.filter((t) => t.classes.includes(selectedClass));
    }

    if (selectedType !== 'ALL') {
      if (selectedType === 'VANDE') {
        list = list.filter((t) => t.name.includes('Vande Bharat') || t.name.includes('Tejas'));
      } else if (selectedType === 'RAJDHANI') {
        list = list.filter((t) => t.type.includes('Rajdhani') || t.type.includes('Shatabdi') || t.type.includes('Duronto'));
      } else if (selectedType === 'SUPERFAST') {
        list = list.filter((t) => t.type.includes('Superfast') || t.type.includes('Express'));
      }
    }

    if (selectedTimeSlot !== 'ALL') {
      list = list.filter((t) => {
        const [h] = (t.departureTime || '00:00').split(':').map(Number);
        if (selectedTimeSlot === 'EARLY') return h >= 0 && h < 6;
        if (selectedTimeSlot === 'MORNING') return h >= 6 && h < 12;
        if (selectedTimeSlot === 'AFTERNOON') return h >= 12 && h < 18;
        if (selectedTimeSlot === 'NIGHT') return h >= 18 && h <= 23;
        return true;
      });
    }

    const parseMins = (timeStr) => {
      if (!timeStr || timeStr === 'Source' || timeStr === 'Destination') return 0;
      const [h, m] = timeStr.split(':').map(Number);
      return (h || 0) * 60 + (m || 0);
    };

    const parseDur = (durStr) => {
      if (!durStr) return 0;
      const hMatch = durStr.match(/(\d+)h/);
      const mMatch = durStr.match(/(\d+)m/);
      const hrs = hMatch ? parseInt(hMatch[1]) : 0;
      const mins = mMatch ? parseInt(mMatch[1]) : 0;
      return hrs * 60 + mins;
    };

    return [...list].sort((a, b) => {
      const depA = parseMins(a.departureTime);
      const depB = parseMins(b.departureTime);
      const arrA = parseMins(a.arrivalTime);
      const arrB = parseMins(b.arrivalTime);
      const durA = parseDur(a.durationStr);
      const durB = parseDur(b.durationStr);

      if (sortBy === 'DEP_DESC') return depB - depA;
      if (sortBy === 'DURATION_ASC') return durA - durB;
      if (sortBy === 'ARR_ASC') return arrA - arrB;
      return depA - depB; // Default DEP_ASC
    });
  }, [fromCode, toCode, selectedClass, selectedType, selectedTimeSlot, sortBy]);

  // Handle Live Spotting Search
  const handleSearchLiveTrain = (e) => {
    if (e) e.preventDefault();
    if (!liveTrainQuery.trim()) return;
    const res = getLiveTrainStatus(liveTrainQuery);
    setLiveTrainData(res);
  };

  // Handle Station Board Search
  const handleSearchStationBoard = (e) => {
    if (e) e.preventDefault();
    if (!stationQuery.trim()) return;
    const res = getLiveStationBoard(stationQuery);
    setStationBoardData(res);
  };



  return (
    <section id="trains" className="bg-slate-900 text-white py-12 border-t border-slate-800 relative min-h-screen">
      
      {/* Dynamic Background Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center space-x-2 bg-amber-500/20 border border-amber-500/40 px-4 py-1.5 rounded-full text-xs font-bold text-amber-400 mb-3 backdrop-blur-md">
            <Train className="w-4 h-4 text-amber-400 animate-bounce" />
            <span>Where Is My Train • Real-Time IRCTC Portal</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Where Is My <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-sky-400 to-blue-400">Train</span>
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Find authentic Indian Railways train schedules, spot real-time train location, inspect coach positions & NTES live station boards.
          </p>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 max-w-5xl mx-auto bg-slate-950/80 p-2 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
          <button
            onClick={() => setActiveSubTab('between')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'between'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Trains Between Stations</span>
          </button>

          <button
            onClick={() => setActiveSubTab('station')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'station'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Live Station Board</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: TRAINS BETWEEN STATIONS                                             */}
        {/* ========================================================================= */}
        {activeSubTab === 'between' && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Search Box Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-5xl mx-auto relative z-20">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                
                {/* Source Station Picker */}
                <div className="lg:col-span-5 relative">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    From Station
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={fromSearch}
                      onChange={(e) => {
                        setFromSearch(e.target.value);
                        setShowFromDropdown(true);
                      }}
                      onFocus={() => setShowFromDropdown(true)}
                      placeholder="Type station name or code..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-white text-sm font-semibold focus:outline-none focus:border-amber-500 transition-all pr-8"
                    />
                    <MapPin className="w-4 h-4 text-amber-400 absolute right-3 top-3.5" />
                  </div>

                  {/* From Dropdown */}
                  {showFromDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 max-h-60 overflow-y-auto divide-y divide-slate-800">
                      {filteredFromStations.map((st) => (
                        <div
                          key={st.code}
                          onClick={() => {
                            setFromCode(st.code);
                            setFromSearch(`${st.name} (${st.code})`);
                            setShowFromDropdown(false);
                          }}
                          className="p-3 hover:bg-slate-800 cursor-pointer flex justify-between items-center transition-colors"
                        >
                          <div>
                            <span className="font-bold text-white text-sm block">{st.name}</span>
                            <span className="text-[11px] text-slate-400">{st.city}, {st.state}</span>
                          </div>
                          <span className="bg-amber-950 text-amber-400 font-mono text-xs font-bold px-2 py-0.5 rounded border border-amber-800">
                            {st.code}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Swap Button */}
                <div className="lg:col-span-2 flex justify-center py-2 lg:py-0">
                  <button
                    onClick={handleSwapStations}
                    title="Swap Source and Destination"
                    className="p-3 bg-slate-900 border border-slate-800 hover:border-amber-500 text-amber-400 hover:text-white rounded-full shadow-md transition-all transform hover:rotate-180 cursor-pointer"
                  >
                    <ArrowRightLeft className="w-5 h-5" />
                  </button>
                </div>

                {/* Destination Station Picker */}
                <div className="lg:col-span-5 relative">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    To Station
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={toSearch}
                      onChange={(e) => {
                        setToSearch(e.target.value);
                        setShowToDropdown(true);
                      }}
                      onFocus={() => setShowToDropdown(true)}
                      placeholder="Type station name or code..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-white text-sm font-semibold focus:outline-none focus:border-amber-500 transition-all pr-8"
                    />
                    <MapPin className="w-4 h-4 text-sky-400 absolute right-3 top-3.5" />
                  </div>

                  {/* To Dropdown */}
                  {showToDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 max-h-60 overflow-y-auto divide-y divide-slate-800">
                      {filteredToStations.map((st) => (
                        <div
                          key={st.code}
                          onClick={() => {
                            setToCode(st.code);
                            setToSearch(`${st.name} (${st.code})`);
                            setShowToDropdown(false);
                          }}
                          className="p-3 hover:bg-slate-800 cursor-pointer flex justify-between items-center transition-colors"
                        >
                          <div>
                            <span className="font-bold text-white text-sm block">{st.name}</span>
                            <span className="text-[11px] text-slate-400">{st.city}, {st.state}</span>
                          </div>
                          <span className="bg-sky-950 text-sky-400 font-mono text-xs font-bold px-2 py-0.5 rounded border border-sky-800">
                            {st.code}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Filters Strip */}
              <div className="mt-6 pt-6 border-t border-slate-800">
                
                {/* Additional Filters: Departure Time Slot & Sort By */}
                <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
                  
                  {/* Time Slots */}
                  <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                    <span className="text-slate-400 font-medium mr-1 flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1 text-amber-400" /> Dep Time:
                    </span>
                    {[
                      { code: 'ALL', label: 'All 24 Hours' },
                      { code: 'EARLY', label: '00:00 - 06:00 (Early)' },
                      { code: 'MORNING', label: '06:00 - 12:00 (Morning)' },
                      { code: 'AFTERNOON', label: '12:00 - 18:00 (Afternoon)' },
                      { code: 'NIGHT', label: '18:00 - 24:00 (Night)' },
                    ].map((slot) => (
                      <button
                        key={slot.code}
                        onClick={() => setSelectedTimeSlot(slot.code)}
                        className={`px-2.5 py-1 rounded-lg font-medium transition-all text-[11px] cursor-pointer ${
                          selectedTimeSlot === slot.code
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold'
                            : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                        }`}
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>

                  {/* Sort By Dropdown */}
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400 font-medium">Sort By:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-slate-900 border border-slate-800 text-amber-400 text-xs font-bold px-3 py-1 rounded-xl focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="DEP_ASC">Departure (00:00 ➔ 23:59 Earliest)</option>
                      <option value="DEP_DESC">Departure (23:59 ➔ 00:00 Latest)</option>
                      <option value="DURATION_ASC">Duration (Fastest First)</option>
                      <option value="ARR_ASC">Arrival Time (Earliest First)</option>
                    </select>
                  </div>

                </div>

              </div>

              {/* Popular Authentic Routes Quick Chips */}
              <div className="mt-4 pt-3 flex items-center space-x-2 text-xs overflow-x-auto">
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] flex-shrink-0">Popular Routes:</span>
                {[
                  { from: 'VSKP', fromName: 'Visakhapatnam (VSKP)', to: 'RJY', toName: 'Rajahmundry (RJY)' },
                  { from: 'VSKP', fromName: 'Visakhapatnam (VSKP)', to: 'SC', toName: 'Secunderabad (SC)' },
                  { from: 'NDLS', fromName: 'New Delhi (NDLS)', to: 'AGC', toName: 'Agra Cantt (AGC)' },
                  { from: 'HWH', fromName: 'Howrah (HWH)', to: 'MAS', toName: 'Chennai Central (MAS)' },
                  { from: 'MMCT', fromName: 'Mumbai Central (MMCT)', to: 'NDLS', toName: 'New Delhi (NDLS)' }
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setFromCode(chip.from);
                      setFromSearch(chip.fromName);
                      setToCode(chip.to);
                      setToSearch(chip.toName);
                    }}
                    className="bg-slate-900 hover:bg-slate-800 text-amber-400 px-3 py-1 rounded-full border border-slate-800 flex-shrink-0 font-medium transition-colors"
                  >
                    {chip.from} ➔ {chip.to}
                  </button>
                ))}
              </div>

            </div>

            {/* Train Results List */}
            <div className="max-w-5xl mx-auto space-y-4">
              
              <div className="flex items-center justify-between px-2">
                <h3 className="text-lg font-bold text-white flex items-center">
                  <Train className="w-5 h-5 text-amber-400 mr-2" />
                  Authentic IRCTC Trains ({searchResults.length} found)
                </h3>
                <span className="text-xs text-slate-400">
                  {fromCode} to {toCode}
                </span>
              </div>

              {searchResults.length === 0 ? (
                <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl text-center space-y-3">
                  <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
                  <h4 className="font-bold text-white">No Direct Train Found Between Selected Stations</h4>
                  <p className="text-xs text-slate-400">
                    Try selecting popular station pairs like <strong>VSKP to RJY</strong>, <strong>VSKP to SC</strong>, <strong>HWH to MAS</strong>, or <strong>NDLS to AGC</strong>.
                  </p>
                </div>
              ) : (
                searchResults.map((train) => (
                  <div
                    key={train.number}
                    className="bg-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-3xl p-6 transition-all duration-300 shadow-xl group space-y-4"
                  >
                    
                    {/* Header: Train Number, Name & Type */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="bg-amber-500 text-slate-950 font-mono font-black text-xs px-2.5 py-1 rounded-lg">
                            {train.number}
                          </span>
                          <h4 className="font-extrabold text-white text-base group-hover:text-amber-400 transition-colors">
                            {train.name}
                          </h4>
                        </div>
                        <span className="text-[11px] text-slate-400 mt-1 block">
                          Speed: <strong className="text-slate-300">{train.speed}</strong> • Type: <strong className="text-sky-400">{train.type}</strong>
                        </span>
                      </div>

                      {/* Running Days */}
                      <div className="flex items-center space-x-1">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                          const isRunning = train.days.includes(day);
                          return (
                            <span
                              key={day}
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                isRunning
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : 'bg-slate-900 text-slate-600'
                              }`}
                            >
                              {day[0]}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Route Timings Bar */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
                      
                      {/* From Departure */}
                      <div className="sm:col-span-4">
                        <span className="text-xl font-black text-white font-mono">{train.departureTime}</span>
                        <span className="text-xs font-bold text-amber-400 block">{train.fromStation} ({train.fromCode})</span>
                        <span className="text-[10px] text-slate-400">Platform #{train.fromPf}</span>
                      </div>

                      {/* Duration Line */}
                      <div className="sm:col-span-4 text-center space-y-1">
                        <span className="text-xs font-bold text-slate-400">{train.durationStr}</span>
                        <div className="relative flex items-center justify-center">
                          <div className="h-0.5 w-full bg-slate-800" />
                          <Train className="w-4 h-4 text-amber-400 absolute bg-slate-900 px-0.5" />
                        </div>
                        <span className="text-[10px] text-slate-500 block">{train.distanceKm} km</span>
                      </div>

                      {/* To Arrival */}
                      <div className="sm:col-span-4 text-right">
                        <span className="text-xl font-black text-white font-mono">{train.arrivalTime}</span>
                        <span className="text-xs font-bold text-sky-400 block">{train.toStation} ({train.toCode})</span>
                        <span className="text-[10px] text-slate-400">Platform #{train.toPf}</span>
                      </div>

                    </div>

                    {/* Action CTA Buttons */}
                    <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-900">
                      <button
                        onClick={() => setCoachModalTrain(train)}
                        className="bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs px-3.5 py-2 rounded-xl transition-all border border-slate-800 flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Layers className="w-3.5 h-3.5 text-amber-400" />
                        <span>Coach Layout</span>
                      </button>
                    </div>

                  </div>
                ))
              )}

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: LIVE STATION BOARD                                                */}
        {/* ========================================================================= */}
        {activeSubTab === 'station' && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Station Query Input Box */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-3xl mx-auto">
              <form onSubmit={handleSearchStationBoard} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={stationQuery}
                    onChange={(e) => setStationQuery(e.target.value)}
                    placeholder="Enter Station Code or City (e.g. RJY, VSKP, NDLS, BZA, MAS)..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3.5 text-white text-sm font-semibold focus:outline-none focus:border-amber-500 transition-all pl-10"
                  />
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
                </div>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-3.5 rounded-2xl text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center space-x-1.5 flex-shrink-0 cursor-pointer"
                >
                  <Clock className="w-4 h-4" />
                  <span>Get Station Board</span>
                </button>
              </form>

              {/* Quick Station Chips */}
              <div className="mt-3 flex items-center space-x-2 text-xs overflow-x-auto">
                <span className="text-slate-500 font-bold text-[10px]">Popular Stations:</span>
                {['RJY', 'VSKP', 'NDLS', 'BZA', 'MAS', 'HWH', 'SC', 'HYB', 'CSMT'].map((code) => (
                  <button
                    key={code}
                    onClick={() => {
                      setStationQuery(code);
                      setStationBoardData(getLiveStationBoard(code));
                    }}
                    className="bg-slate-900 hover:bg-slate-800 text-amber-400 px-2.5 py-0.5 rounded-full border border-slate-800 font-mono text-[11px] transition-colors"
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>

            {/* Station Board Display */}
            {stationBoardData && (
              <div className="max-w-4xl mx-auto space-y-6">
                
                <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl">
                  
                  <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-6">
                    <div>
                      <h3 className="text-xl font-extrabold text-white">
                        {stationBoardData.stationName} ({stationBoardData.stationCode})
                      </h3>
                      <p className="text-xs text-slate-400">
                        {stationBoardData.city}, {stationBoardData.state} • {stationBoardData.totalPlatforms} Platforms
                      </p>
                    </div>
                    <span className="bg-amber-950 text-amber-400 text-xs font-bold px-3 py-1 rounded-full border border-amber-800">
                      Live Next 4 Hours
                    </span>
                  </div>

                  <div className="space-y-4">
                    {stationBoardData.upcomingTrains.map((tr, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:border-slate-700 transition-all"
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="bg-amber-500 text-slate-950 font-mono font-black text-xs px-2 py-0.5 rounded">
                              {tr.trainNumber}
                            </span>
                            <span className="font-extrabold text-white text-sm">{tr.trainName}</span>
                          </div>
                          <span className="text-[11px] text-slate-400 block mt-1">
                            Destination: <strong className="text-slate-200">{tr.destination}</strong> • Platform #{tr.platform}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-mono font-bold text-white block">
                            Arr: {tr.arrTime} | Dep: {tr.depTime}
                          </span>
                          <span className={`text-[11px] font-bold block mt-0.5 ${
                            tr.isDelayed ? 'text-rose-400' : 'text-emerald-400'
                          }`}>
                            {tr.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>

              </div>
            )}

          </div>
        )}



      </div>

      {/* ========================================================================= */}
      {/* COACH COMPOSITION MODAL                                                    */}
      {/* ========================================================================= */}
      {coachModalTrain && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full space-y-6 shadow-2xl animate-fadeIn relative">
            
            <button
              onClick={() => setCoachModalTrain(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-amber-500 text-slate-950 font-mono font-black text-xs px-2 py-0.5 rounded">
                  {coachModalTrain.number}
                </span>
                <h3 className="font-extrabold text-white text-lg">{coachModalTrain.name}</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Coach Composition Diagram & Platform Standing Position
              </p>
            </div>

            {/* Coach Layout Horizontal Strip */}
            {(() => {
              const comp = getCoachComposition(coachModalTrain.type);
              return (
                <div className="space-y-4">
                  
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                      {comp.coaches.map((c, idx) => (
                        <div
                          key={idx}
                          className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-mono font-bold text-center border ${
                            c === 'ENG'
                              ? 'bg-rose-950 text-rose-400 border-rose-800'
                              : c.startsWith('B') || c.startsWith('A') || c.startsWith('H')
                              ? 'bg-sky-950 text-sky-400 border-sky-800'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          <span className="block text-[10px] opacity-75">{idx + 1}</span>
                          <span>{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-amber-950/40 border border-amber-800/60 p-3 rounded-xl text-xs text-amber-300 flex items-center space-x-2">
                    <Info className="w-4 h-4 flex-shrink-0 text-amber-400" />
                    <span>{comp.platformPosition}</span>
                  </div>

                </div>
              );
            })()}

          </div>
        </div>
      )}

    </section>
  );
}
