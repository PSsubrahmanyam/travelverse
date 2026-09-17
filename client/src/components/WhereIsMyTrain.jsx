import React, { useState, useEffect, useMemo } from 'react';
import {
  loadRailwayDataset,
  findTrainsBetweenStations,
  searchStations,
  getLiveStationBoard,
  getLiveTrainStatus,
} from '../data/railwaysData';
import {
  Train,
  MapPin,
  Clock,
  ArrowRightLeft,
  Search,
  Filter,
  Layers,
  Sparkles,
  ChevronRight,
  Info,
  X,
  ListOrdered,
  Calendar,
  ShieldCheck,
  Building,
  Navigation
} from 'lucide-react';

export default function WhereIsMyTrain({ initialFrom = '', initialTo = '' }) {
  const [activeTab, setActiveTab] = useState('between'); // 'between' | 'station' | 'coach'
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    loadRailwayDataset().then(() => {
      setRefreshCount((c) => c + 1);
    });
  }, []);

  // Tab 1 State: Trains Between Stations
  const [inputFrom, setInputFrom] = useState(initialFrom);
  const [inputTo, setInputTo] = useState(initialTo);
  const [trainQuery, setTrainQuery] = useState('');
  
  const [queryFrom, setQueryFrom] = useState(initialFrom);
  const [queryTo, setQueryTo] = useState(initialTo);
  const [queryTrain, setQueryTrain] = useState('');

  // Autocomplete dropdown states
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);

  // Sorting & Filtering
  const [sortBy, setSortBy] = useState('departure'); // 'departure' | 'duration' | 'name'
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'Vande Bharat' | 'Rajdhani' | 'Superfast'

  // Modal / Drawers State
  const [selectedRouteTrain, setSelectedRouteTrain] = useState(null);
  const [coachModalTrain, setCoachModalTrain] = useState(null);

  // Tab 2 State: Live Station Board
  const [boardStationInput, setBoardStationInput] = useState('NDLS');
  const [boardStationQuery, setBoardStationQuery] = useState('NDLS');
  const [boardSuggestions, setBoardSuggestions] = useState([]);

  // Handlers for Autocomplete
  const handleFromChange = (val) => {
    setInputFrom(val);
    if (val.trim().length >= 1) {
      setFromSuggestions(searchStations(val));
    } else {
      setFromSuggestions([]);
    }
  };

  const handleToChange = (val) => {
    setInputTo(val);
    if (val.trim().length >= 1) {
      setToSuggestions(searchStations(val));
    } else {
      setToSuggestions([]);
    }
  };

  const handleSwapStations = () => {
    const tempIn = inputFrom;
    setInputFrom(inputTo);
    setInputTo(tempIn);

    const tempQ = queryFrom;
    setQueryFrom(queryTo);
    setQueryTo(tempQ);
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setQueryFrom(inputFrom);
    setQueryTo(inputTo);
    setQueryTrain(trainQuery);
    setFromSuggestions([]);
    setToSuggestions([]);
  };

  const handleClearInputs = () => {
    setInputFrom('');
    setInputTo('');
    setTrainQuery('');
    setQueryFrom('');
    setQueryTo('');
    setQueryTrain('');
    setFromSuggestions([]);
    setToSuggestions([]);
  };

  // Find trains list
  const searchResults = useMemo(() => {
    let list = findTrainsBetweenStations(queryFrom, queryTo, queryTrain);

    // Apply Filter Type
    if (filterType !== 'ALL') {
      list = list.filter((t) => (t.type || '').toUpperCase().includes(filterType.toUpperCase()));
    }

    // Apply Sorting
    return [...list].sort((a, b) => {
      if (sortBy === 'departure') {
        return (a.departureTime || '00:00').localeCompare(b.departureTime || '00:00');
      }
      if (sortBy === 'duration') {
        return (a.intermediateCount || 0) - (b.intermediateCount || 0);
      }
      if (sortBy === 'name') {
        return (a.name || '').localeCompare(b.name || '');
      }
      return 0;
    });
  }, [queryFrom, queryTo, queryTrain, filterType, sortBy]);

  // Station Board Data
  const stationBoardData = useMemo(() => {
    return getLiveStationBoard(boardStationQuery);
  }, [boardStationQuery]);

  return (
    <section id="trains" className="bg-slate-900 text-white py-16 border-t border-slate-800 relative min-h-screen">
      
      {/* Dynamic Background Blur */}
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center space-x-2 text-amber-400 bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase mb-3">
            <Train className="w-4 h-4 text-amber-400 animate-bounce" />
            <span>Where Is My Train • All-India IRCTC Engine (5,200+ Trains)</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Where Is My <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-sky-400 to-blue-400">Train</span>
          </h2>
          <p className="text-slate-400 mt-2 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Search 5,207 authentic Indian Railways train schedules & 8,538 stations dynamically. Inspect full route schedules, arrival/departure boards, and coach layout maps.
          </p>
        </div>

        {/* Sub-Tabs Switcher */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-800/90 border border-slate-700/80 p-1.5 rounded-2xl flex flex-wrap gap-1 shadow-xl backdrop-blur-md">
            <button
              onClick={() => setActiveTab('between')}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'between'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Train className="w-4 h-4" />
              <span>Trains Between Stations & Search</span>
            </button>

            <button
              onClick={() => setActiveTab('station')}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'station'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>Station Live Board</span>
            </button>
          </div>
        </div>

        {/* TAB 1: TRAINS BETWEEN STATIONS & SEARCH */}
        {activeTab === 'between' && (
          <div className="space-y-8">
            
            {/* Search Box Form */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md max-w-4xl mx-auto">
              <form onSubmit={handleSearchSubmit} className="space-y-4">
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  
                  {/* From Station Input */}
                  <div className="md:col-span-5 relative">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      From Station (8,500+ Stations)
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-amber-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        value={inputFrom}
                        onChange={(e) => handleFromChange(e.target.value)}
                        placeholder="Search Station (e.g. VSKP, NDLS, HYB, SBC)..."
                        className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>

                    {/* From Autocomplete Dropdown */}
                    {fromSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-30 max-h-56 overflow-y-auto">
                        {fromSuggestions.map((st) => (
                          <div
                            key={st.code}
                            onClick={() => {
                              setInputFrom(`${st.name} (${st.code})`);
                              setFromSuggestions([]);
                            }}
                            className="px-4 py-2.5 hover:bg-slate-700 cursor-pointer flex justify-between items-center text-xs border-b border-slate-700/50"
                          >
                            <span className="font-bold text-white">{st.name}</span>
                            <span className="font-mono font-extrabold text-amber-400 bg-slate-900 px-2 py-0.5 rounded">{st.code}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Swap Button */}
                  <div className="md:col-span-2 flex justify-center pt-2 md:pt-4">
                    <button
                      type="button"
                      onClick={handleSwapStations}
                      className="p-2.5 bg-slate-700/80 hover:bg-amber-500 hover:text-slate-950 text-slate-300 rounded-xl transition-all shadow-md active:scale-90 cursor-pointer"
                      title="Swap From & To Stations"
                    >
                      <ArrowRightLeft className="w-4 h-4" />
                    </button>
                  </div>

                  {/* To Station Input */}
                  <div className="md:col-span-5 relative">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      To Station (8,500+ Stations)
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-sky-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        value={inputTo}
                        onChange={(e) => handleToChange(e.target.value)}
                        placeholder="Search Station (e.g. RJY, BZA, HWH, MAS)..."
                        className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
                      />
                    </div>

                    {/* To Autocomplete Dropdown */}
                    {toSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-30 max-h-56 overflow-y-auto">
                        {toSuggestions.map((st) => (
                          <div
                            key={st.code}
                            onClick={() => {
                              setInputTo(`${st.name} (${st.code})`);
                              setToSuggestions([]);
                            }}
                            className="px-4 py-2.5 hover:bg-slate-700 cursor-pointer flex justify-between items-center text-xs border-b border-slate-700/50"
                          >
                            <span className="font-bold text-white">{st.name}</span>
                            <span className="font-mono font-extrabold text-sky-400 bg-slate-900 px-2 py-0.5 rounded">{st.code}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

                {/* Direct Train Search Bar */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3 items-center">
                  <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={trainQuery}
                      onChange={(e) => setTrainQuery(e.target.value)}
                      placeholder="Or search by Train Number / Name (e.g. 12727, Godavari, Vande Bharat)..."
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div className="flex space-x-2 w-full sm:w-auto">
                    <button
                      type="submit"
                      className="flex-1 sm:flex-initial bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg text-xs flex items-center justify-center space-x-1.5 active:scale-95 cursor-pointer"
                    >
                      <Search className="w-4 h-4" />
                      <span>Search Trains</span>
                    </button>

                    {(inputFrom || inputTo || trainQuery || queryFrom || queryTo || queryTrain) && (
                      <button
                        type="button"
                        onClick={handleClearInputs}
                        className="bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold px-4 py-2.5 rounded-xl transition-all text-xs active:scale-95 cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

              </form>
            </div>

            {/* Filter & Sort Strip */}
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50">
              
              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-slate-400 font-bold mr-1 flex items-center">
                  <Filter className="w-3.5 h-3.5 mr-1 text-amber-400" />
                  Type:
                </span>
                {['ALL', 'Vande Bharat', 'Rajdhani', 'Superfast'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterType(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      filterType === cat
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Sorting Switcher */}
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-400 font-bold flex items-center">
                  <ListOrdered className="w-3.5 h-3.5 mr-1 text-sky-400" />
                  Sort By:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-800 text-white font-bold px-3 py-1 rounded-lg border border-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="departure">Departure Time</option>
                  <option value="duration">Stop Count / Duration</option>
                  <option value="name">Train Name</option>
                </select>
              </div>

            </div>

            {/* Train Results List */}
            <div className="max-w-4xl mx-auto space-y-4">
              
              <div className="flex justify-between items-center px-1">
                <h3 className="text-sm font-bold text-slate-300 flex items-center">
                  <Train className="w-4 h-4 text-amber-400 mr-2" />
                  <span>Matching All-India Trains ({searchResults.length} found)</span>
                </h3>
                {queryFrom && queryTo && (
                  <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-3 py-0.5 rounded-full border border-amber-500/20">
                    Route: {queryFrom} ➔ {queryTo}
                  </span>
                )}
              </div>

              {searchResults.length === 0 ? (
                <div className="text-center py-12 bg-slate-800/40 rounded-3xl border border-slate-700/50 p-6">
                  <Train className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <h4 className="font-bold text-white text-base">No Matching Trains Found</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                    Try searching for major junction codes (e.g. VSKP, NDLS, SBC, HYB, HWH, MAS) or clearing input fields to view all trains.
                  </p>
                  <button
                    onClick={handleClearInputs}
                    className="mt-4 bg-amber-500 text-slate-950 font-bold px-5 py-2 rounded-xl text-xs"
                  >
                    ✨ Show All National Trains
                  </button>
                </div>
              ) : (
                searchResults.map((train) => (
                  <div
                    key={train.number}
                    className="bg-slate-800/90 border border-slate-700/80 hover:border-amber-500/50 rounded-2xl p-5 sm:p-6 shadow-xl transition-all"
                  >
                    
                    {/* Header: Train Number, Name & Type */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-700/60 gap-2">
                      <div className="flex items-center space-x-3">
                        <span className="bg-amber-500 text-slate-950 font-mono text-xs font-black px-2.5 py-1 rounded-lg shadow-md">
                          #{train.number}
                        </span>
                        <div>
                          <h4 className="font-extrabold text-white text-base leading-tight">
                            {train.name}
                          </h4>
                          <span className="text-xs text-sky-400 font-semibold block mt-0.5">
                            Type: {train.type}
                          </span>
                        </div>
                      </div>

                      {/* Operational Days Badges */}
                      <div className="flex items-center space-x-1 text-[10px] font-bold">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                          const isRunning = (train.days || []).includes(day);
                          return (
                            <span
                              key={day}
                              className={`px-1.5 py-0.5 rounded ${
                                isRunning
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-slate-900 text-slate-600'
                              }`}
                            >
                              {day[0]}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Route Schedule Strip */}
                    <div className="grid grid-cols-12 gap-2 items-center py-5">
                      
                      {/* Departure */}
                      <div className="col-span-4 text-left">
                        <span className="text-2xl font-black text-white font-mono leading-none block">
                          {train.departureTime}
                        </span>
                        <span className="text-xs font-bold text-amber-400 block mt-1 truncate">
                          {train.fromStation} ({train.fromCode})
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          Platform #{train.fromPf}
                        </span>
                      </div>

                      {/* Distance & Duration Line */}
                      <div className="col-span-4 text-center">
                        <span className="text-xs font-bold text-slate-400 block">
                          {train.durationStr || 'Direct Route'}
                        </span>
                        <div className="relative flex items-center justify-center my-1">
                          <div className="h-0.5 bg-slate-700 w-full" />
                          <Train className="w-4 h-4 text-amber-400 absolute bg-slate-800 px-0.5" />
                        </div>
                        <span className="text-[10px] text-slate-500 block font-mono">
                          {train.schedule ? `${train.schedule.length} Total Stops` : 'Authentic IRCTC'}
                        </span>
                      </div>

                      {/* Arrival */}
                      <div className="col-span-4 text-right">
                        <span className="text-2xl font-black text-white font-mono leading-none block">
                          {train.arrivalTime}
                        </span>
                        <span className="text-xs font-bold text-sky-400 block mt-1 truncate">
                          {train.toStation} ({train.toCode})
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          Platform #{train.toPf}
                        </span>
                      </div>

                    </div>

                    {/* Action Footer */}
                    <div className="pt-3 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                      
                      <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Official IRCTC Verified Schedule</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedRouteTrain(train)}
                          className="bg-slate-700 hover:bg-slate-600 text-white font-bold px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer"
                        >
                          <Navigation className="w-3.5 h-3.5 text-amber-400" />
                          <span>View Route Stops</span>
                        </button>

                        <button
                          onClick={() => setCoachModalTrain(train)}
                          className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer shadow-md"
                        >
                          <Layers className="w-3.5 h-3.5" />
                          <span>Coach Layout</span>
                        </button>
                      </div>

                    </div>

                  </div>
                ))
              )}

            </div>

          </div>
        )}

        {/* TAB 2: STATION LIVE BOARD */}
        {activeTab === 'station' && (
          <div className="max-w-4xl mx-auto space-y-6">
            
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center">
                <Building className="w-5 h-5 text-amber-400 mr-2" />
                <span>Station Arrivals & Departures Board</span>
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Select any station across India to view all passing and departing train schedules in real-time.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <MapPin className="w-4 h-4 text-amber-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={boardStationInput}
                    onChange={(e) => {
                      setBoardStationInput(e.target.value);
                      if (e.target.value.trim().length >= 1) {
                        setBoardSuggestions(searchStations(e.target.value));
                      } else {
                        setBoardSuggestions([]);
                      }
                    }}
                    placeholder="Enter Station Code or Name (e.g. NDLS, VSKP, BZA, SBC, HWH)..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />

                  {boardSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-30 max-h-56 overflow-y-auto">
                      {boardSuggestions.map((st) => (
                        <div
                          key={st.code}
                          onClick={() => {
                            setBoardStationInput(`${st.name} (${st.code})`);
                            setBoardStationQuery(st.code);
                            setBoardSuggestions([]);
                          }}
                          className="px-4 py-2.5 hover:bg-slate-700 cursor-pointer flex justify-between items-center text-xs border-b border-slate-700/50"
                        >
                          <span className="font-bold text-white">{st.name}</span>
                          <span className="font-mono font-extrabold text-amber-400 bg-slate-900 px-2 py-0.5 rounded">{st.code}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    setBoardStationQuery(boardStationInput);
                    setBoardSuggestions([]);
                  }}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs shadow-md cursor-pointer"
                >
                  Load Station Board
                </button>
              </div>
            </div>

            {/* Live Station Board Card */}
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 shadow-xl">
              <div className="flex justify-between items-center pb-4 border-b border-slate-700/60">
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Live Board</span>
                  <h4 className="text-xl font-black text-white">{stationBoardData.stationName} ({stationBoardData.stationCode})</h4>
                </div>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold">
                  {stationBoardData.totalPassingTrains} Trains Scheduled
                </span>
              </div>

              <div className="mt-4 space-y-2">
                {stationBoardData.upcomingTrains.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No upcoming trains found for this station.</p>
                ) : (
                  stationBoardData.upcomingTrains.map((tr, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-slate-700/50 text-xs"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="bg-amber-500 text-slate-950 font-mono font-black text-xs px-2 py-0.5 rounded">
                          #{tr.trainNumber}
                        </span>
                        <div>
                          <span className="font-extrabold text-white block">{tr.trainName}</span>
                          <span className="text-[10px] text-sky-400 font-semibold">{tr.trainType}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-mono font-bold text-white block text-sm">{tr.dep || tr.arr}</span>
                        <span className="text-[10px] text-slate-400">Day {tr.day}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* FULL ROUTE SCHEDULE DRAWER MODAL */}
      {selectedRouteTrain && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
            
            <div className="p-5 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
              <div>
                <span className="bg-amber-500 text-slate-950 font-mono font-black text-xs px-2.5 py-0.5 rounded mr-2">
                  #{selectedRouteTrain.number}
                </span>
                <span className="font-extrabold text-white text-base">{selectedRouteTrain.name}</span>
              </div>

              <button
                onClick={() => setSelectedRouteTrain(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-2 flex-1">
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Complete Route Station Schedule ({selectedRouteTrain.schedule ? selectedRouteTrain.schedule.length : 0} Stops)
              </h5>

              {(selectedRouteTrain.schedule || []).map((st, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 bg-slate-700 text-amber-400 rounded-full flex items-center justify-center font-mono text-[10px] font-bold">
                      {i + 1}
                    </span>
                    <div>
                      <span className="font-bold text-white block">{st.name}</span>
                      <span className="font-mono text-[10px] text-amber-400 font-extrabold">{st.code}</span>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <span className="text-slate-300 block">Arr: <strong>{st.arr}</strong> | Dep: <strong>{st.dep}</strong></span>
                    <span className="text-[10px] text-slate-500">Day {st.day}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-800 border-t border-slate-700 text-right">
              <button
                onClick={() => setSelectedRouteTrain(null)}
                className="bg-amber-500 text-slate-950 font-bold px-6 py-2 rounded-xl text-xs"
              >
                Close Route View
              </button>
            </div>

          </div>
        </div>
      )}

      {/* COACH LAYOUT DRAWER MODAL */}
      {coachModalTrain && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-fadeIn">
            
            <div className="flex justify-between items-center pb-3 border-b border-slate-700">
              <div>
                <span className="text-xs text-amber-400 font-bold uppercase tracking-wider block">Coach Composition Map</span>
                <h4 className="text-lg font-extrabold text-white">#{coachModalTrain.number} - {coachModalTrain.name}</h4>
              </div>
              <button
                onClick={() => setCoachModalTrain(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Visual coach sequence from Engine to Guard Van:
              </p>

              <div className="flex flex-wrap gap-2 text-xs font-mono font-bold">
                {['ENG', 'GS', 'GS', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'B1', 'B2', 'B3', 'A1', 'H1', 'SLR'].map((c, i) => (
                  <span
                    key={i}
                    className={`px-3 py-2 rounded-xl border ${
                      c === 'ENG'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : c.startsWith('B') || c.startsWith('A') || c.startsWith('H')
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-700 text-right">
              <button
                onClick={() => setCoachModalTrain(null)}
                className="bg-amber-500 text-slate-950 font-bold px-6 py-2 rounded-xl text-xs"
              >
                Close Coach Map
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
}
