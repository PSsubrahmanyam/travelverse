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
  Navigation,
  CheckCircle2,
  AlertCircle,
  CalendarDays,
  Check,
  RefreshCw
} from 'lucide-react';

export default function WhereIsMyTrain({ initialFrom = '', initialTo = '' }) {
  const [activeTab, setActiveTab] = useState('between'); // 'between' | 'station'
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    loadRailwayDataset().then(() => {
      setRefreshCount((c) => c + 1);
    });
  }, []);

  // Today's date calculations
  const todayDateObj = new Date();
  const getIsoDateStr = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const todayStr = getIsoDateStr(todayDateObj);
  
  const tomorrowDateObj = new Date(todayDateObj);
  tomorrowDateObj.setDate(tomorrowDateObj.getDate() + 1);
  const tomorrowStr = getIsoDateStr(tomorrowDateObj);

  const dayAfterDateObj = new Date(todayDateObj);
  dayAfterDateObj.setDate(dayAfterDateObj.getDate() + 2);
  const dayAfterStr = getIsoDateStr(dayAfterDateObj);

  // Tab 1 State: Trains Between Stations
  const [inputFrom, setInputFrom] = useState(initialFrom);
  const [inputTo, setInputTo] = useState(initialTo);
  const [trainQuery, setTrainQuery] = useState('');
  
  const [queryFrom, setQueryFrom] = useState(initialFrom);
  const [queryTo, setQueryTo] = useState(initialTo);
  const [queryTrain, setQueryTrain] = useState('');

  // Date Selection State
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [onlyShowRunningOnDate, setOnlyShowRunningOnDate] = useState(true);

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

  // Date Info Helper
  const getDayInfo = (dateStr) => {
    if (!dateStr) return { dayShort: 'Thu', dayFull: 'Thursday', label: 'Today', dateStr: todayStr };
    const d = new Date(dateStr + 'T00:00:00');
    const daysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const daysFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayIdx = d.getDay();
    const dayShort = daysShort[dayIdx] || 'Thu';
    const dayFull = daysFull[dayIdx] || 'Thursday';

    let label = `${dayShort}, ${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
    if (dateStr === todayStr) label = `Today (${dayShort})`;
    else if (dateStr === tomorrowStr) label = `Tomorrow (${dayShort})`;
    else if (dateStr === dayAfterStr) label = `Day After (${dayShort})`;

    return { dayShort, dayFull, label, dateStr };
  };

  const currentDayInfo = useMemo(() => getDayInfo(selectedDate), [selectedDate]);

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

  // Find trains list with date filtering
  const allMatchedTrains = useMemo(() => {
    return findTrainsBetweenStations(queryFrom, queryTo, queryTrain);
  }, [queryFrom, queryTo, queryTrain]);

  const searchResults = useMemo(() => {
    let list = [...allMatchedTrains];

    // Filter by Running Day if toggle is enabled
    if (onlyShowRunningOnDate) {
      list = list.filter((t) => (t.days || []).includes(currentDayInfo.dayShort));
    }

    // Apply Filter Type
    if (filterType !== 'ALL') {
      list = list.filter((t) => (t.type || '').toUpperCase().includes(filterType.toUpperCase()));
    }

    // Apply Sorting
    return list.sort((a, b) => {
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
  }, [allMatchedTrains, onlyShowRunningOnDate, currentDayInfo, filterType, sortBy]);

  // Station Board Data
  const stationBoardData = useMemo(() => {
    return getLiveStationBoard(boardStationQuery);
  }, [boardStationQuery]);

  const popularRoutes = [
    { from: 'Visakhapatnam (VSKP)', to: 'Rajahmundry (RJY)' },
    { from: 'Hyderabad (SC)', to: 'Bengaluru (SBC)' },
    { from: 'Delhi (NDLS)', to: 'Mumbai (CSMT)' },
    { from: 'Chennai (MAS)', to: 'Hyderabad (SC)' },
    { from: 'Vijayawada (BZA)', to: 'Visakhapatnam (VSKP)' },
    { from: 'Goa (MAO)', to: 'Mumbai (CSMT)' }
  ];

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <section id="trains" className="bg-slate-950 text-white py-16 border-t border-slate-800/80 relative min-h-screen">
      
      {/* Dynamic Background Lighting Effects */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 left-1/4 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Formal Executive Banner Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center space-x-2 text-amber-400 bg-gradient-to-r from-amber-500/10 via-amber-400/20 to-amber-500/10 border border-amber-500/30 px-5 py-2 rounded-full text-xs font-bold tracking-wider uppercase mb-4 shadow-lg backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Official IRCTC Smart Railway Portal • 5,207 Trains Registered</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Where Is My <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-sky-400">Train</span>
          </h2>
          <p className="text-slate-400 mt-3 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-medium">
            Search authentic Indian Railways train schedules across 8,538 stations. Inspect date-specific train availability, running frequency, full route schedules, and coach maps.
          </p>
        </div>

        {/* Formal Sub-Tabs Switcher */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl flex flex-wrap gap-1 shadow-2xl backdrop-blur-md">
            <button
              onClick={() => setActiveTab('between')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'between'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Train className="w-4 h-4" />
              <span>Trains & Date Availability Search</span>
            </button>

            <button
              onClick={() => setActiveTab('station')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'station'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>Live Station Board</span>
            </button>
          </div>
        </div>

        {/* TAB 1: TRAINS BETWEEN STATIONS & DATE AVAILABILITY */}
        {activeTab === 'between' && (
          <div className="space-y-8">
            
            {/* Formal Search & Date Selector Form */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md max-w-4xl mx-auto">
              <form onSubmit={handleSearchSubmit} className="space-y-6">
                
                {/* Station Input Controls */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  
                  {/* From Station Input */}
                  <div className="md:col-span-5 relative">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span>From Station</span>
                      <span className="text-amber-400 font-normal text-[10px]">8,500+ IRCTC Stations</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-amber-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        value={inputFrom}
                        onChange={(e) => handleFromChange(e.target.value)}
                        placeholder="Search City or Station (e.g. Visakhapatnam, VSKP, HYB)..."
                        className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-10 pr-3 py-3 text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/80 focus:border-amber-400 transition-all shadow-inner"
                      />
                    </div>

                    {/* From Autocomplete Dropdown */}
                    {fromSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl z-40 max-h-60 overflow-y-auto">
                        {fromSuggestions.map((st) => (
                          <div
                            key={st.code}
                            onClick={() => {
                              setInputFrom(`${st.name} (${st.code})`);
                              setFromSuggestions([]);
                            }}
                            className="px-4 py-2.5 hover:bg-slate-800 cursor-pointer flex justify-between items-center text-xs border-b border-slate-800/80 transition-colors"
                          >
                            <span className="font-bold text-white">{st.name}</span>
                            <span className="font-mono font-extrabold text-amber-400 bg-slate-950 px-2.5 py-0.5 rounded border border-amber-500/20">{st.code}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Swap Station Button */}
                  <div className="md:col-span-2 flex justify-center pt-2 md:pt-4">
                    <button
                      type="button"
                      onClick={handleSwapStations}
                      className="p-3 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer border border-slate-700/60"
                      title="Swap From & To Stations"
                    >
                      <ArrowRightLeft className="w-4 h-4" />
                    </button>
                  </div>

                  {/* To Station Input */}
                  <div className="md:col-span-5 relative">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span>To Station</span>
                      <span className="text-sky-400 font-normal text-[10px]">Destination Hub</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-sky-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        value={inputTo}
                        onChange={(e) => handleToChange(e.target.value)}
                        placeholder="Search Destination (e.g. Rajahmundry, RJY, SBC)..."
                        className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-10 pr-3 py-3 text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400/80 focus:border-sky-400 transition-all shadow-inner"
                      />
                    </div>

                    {/* To Autocomplete Dropdown */}
                    {toSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl z-40 max-h-60 overflow-y-auto">
                        {toSuggestions.map((st) => (
                          <div
                            key={st.code}
                            onClick={() => {
                              setInputTo(`${st.name} (${st.code})`);
                              setToSuggestions([]);
                            }}
                            className="px-4 py-2.5 hover:bg-slate-800 cursor-pointer flex justify-between items-center text-xs border-b border-slate-800/80 transition-colors"
                          >
                            <span className="font-bold text-white">{st.name}</span>
                            <span className="font-mono font-extrabold text-sky-400 bg-slate-950 px-2.5 py-0.5 rounded border border-sky-500/20">{st.code}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

                {/* Formal Travel Date Selector Section */}
                <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center space-x-2 text-slate-300 text-xs font-bold uppercase tracking-wider">
                      <CalendarDays className="w-4 h-4 text-amber-400" />
                      <span>Select Date of Journey</span>
                    </div>
                    <div className="text-xs text-amber-400 font-semibold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 inline-flex items-center space-x-1 self-start sm:self-auto">
                      <span>Operating Day:</span>
                      <span className="font-bold text-white">{currentDayInfo.dayFull} ({currentDayInfo.label})</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    
                    {/* Quick Date Pills */}
                    <div className="sm:col-span-8 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedDate(todayStr)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                          selectedDate === todayStr
                            ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                        }`}
                      >
                        {selectedDate === todayStr && <Check className="w-3.5 h-3.5" />}
                        <span>Today (17 Sep)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedDate(tomorrowStr)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                          selectedDate === tomorrowStr
                            ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                        }`}
                      >
                        {selectedDate === tomorrowStr && <Check className="w-3.5 h-3.5" />}
                        <span>Tomorrow (18 Sep)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedDate(dayAfterStr)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                          selectedDate === dayAfterStr
                            ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                        }`}
                      >
                        {selectedDate === dayAfterStr && <Check className="w-3.5 h-3.5" />}
                        <span>Sat (19 Sep)</span>
                      </button>
                    </div>

                    {/* Custom Calendar Picker */}
                    <div className="sm:col-span-4 relative">
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
                      />
                    </div>

                  </div>

                  {/* Operational Day Filter Toggle */}
                  <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-800/80">
                    <label className="inline-flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={onlyShowRunningOnDate}
                        onChange={(e) => setOnlyShowRunningOnDate(e.target.checked)}
                        className="rounded border-slate-700 text-amber-500 focus:ring-amber-400 w-4 h-4"
                      />
                      <span className="text-slate-300 font-medium">
                        Only display trains operating on <span className="font-bold text-amber-400">{currentDayInfo.dayFull} ({currentDayInfo.dayShort})</span>
                      </span>
                    </label>

                    <span className="text-[11px] text-slate-500 hidden sm:inline">
                      {onlyShowRunningOnDate ? 'Filtering out non-operational trains' : 'Showing all route trains'}
                    </span>
                  </div>
                </div>

                {/* Direct Train Search Bar & Form Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={trainQuery}
                      onChange={(e) => setTrainQuery(e.target.value)}
                      placeholder="Or search by Train Number / Name (e.g. 12727, Godavari, Vande Bharat)..."
                      className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div className="flex space-x-2 w-full sm:w-auto">
                    <button
                      type="submit"
                      className="flex-1 sm:flex-initial px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer flex items-center justify-center space-x-2"
                    >
                      <Search className="w-4 h-4" />
                      <span>Search Trains</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleClearInputs}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-bold text-xs rounded-xl transition-all border border-slate-700/60 cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

              </form>

              {/* Popular Route Shortcuts */}
              <div className="mt-6 pt-4 border-t border-slate-800/80">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Popular All-India Trunk Corridors:
                </div>
                <div className="flex flex-wrap gap-2">
                  {popularRoutes.map((rt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setInputFrom(rt.from);
                        setInputTo(rt.to);
                        setQueryFrom(rt.from);
                        setQueryTo(rt.to);
                      }}
                      className="px-3 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-[11px] text-slate-300 hover:text-amber-400 font-medium rounded-lg transition-all cursor-pointer"
                    >
                      {rt.from.split(' ')[0]} → {rt.to.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Results Filter & Sorting Toolbar */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl backdrop-blur-md">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
                  <Train className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <span>Available Trains</span>
                    <span className="bg-amber-500 text-slate-950 font-black px-2.5 py-0.5 rounded-full text-xs">
                      {searchResults.length}
                    </span>
                  </h3>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Operating on <span className="text-amber-400 font-semibold">{currentDayInfo.dayFull} ({currentDayInfo.label})</span>
                    {allMatchedTrains.length > searchResults.length && (
                      <span className="text-slate-500 ml-1">({allMatchedTrains.length} total route trains)</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                
                {/* Type Filter */}
                <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="ALL" className="bg-slate-900 text-white">All Train Types</option>
                    <option value="Vande Bharat" className="bg-slate-900 text-white">Vande Bharat</option>
                    <option value="Rajdhani" className="bg-slate-900 text-white">Rajdhani / Shatabdi</option>
                    <option value="Superfast" className="bg-slate-900 text-white">Superfast Express</option>
                    <option value="Express" className="bg-slate-900 text-white">Express</option>
                    <option value="Local" className="bg-slate-900 text-white">Passenger / Local</option>
                  </select>
                </div>

                {/* Sort By */}
                <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
                  <ListOrdered className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="departure" className="bg-slate-900 text-white">Sort by Departure</option>
                    <option value="duration" className="bg-slate-900 text-white">Sort by Fastest / Least Stops</option>
                    <option value="name" className="bg-slate-900 text-white">Sort by Train Name</option>
                  </select>
                </div>

              </div>
            </div>

            {/* Train Results Cards List */}
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {searchResults.map((train) => {
                  const runsToday = (train.days || []).includes(currentDayInfo.dayShort);

                  return (
                    <div
                      key={train.number}
                      className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-3xl p-6 transition-all duration-300 shadow-xl backdrop-blur-md relative overflow-hidden group"
                    >
                      
                      {/* Top Row: Train Number, Name, Type, and Day Status */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4 mb-4">
                        <div className="flex items-center space-x-3">
                          <span className="font-mono text-sm font-black bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 px-3 py-1 rounded-lg shadow-sm">
                            #{train.number}
                          </span>
                          <div>
                            <h4 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                              {train.name}
                            </h4>
                            <span className="text-xs text-slate-400 font-medium">
                              {train.type} • Platform {train.fromPf}
                            </span>
                          </div>
                        </div>

                        {/* Operational Day Badge */}
                        <div className="flex items-center space-x-2">
                          {runsToday ? (
                            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center space-x-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Runs on {currentDayInfo.dayShort} ({currentDayInfo.label})</span>
                            </span>
                          ) : (
                            <span className="bg-slate-800 text-slate-400 border border-slate-700 px-3 py-1 rounded-full text-xs font-medium inline-flex items-center space-x-1.5">
                              <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
                              <span>Off-Schedule on {currentDayInfo.dayShort}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Middle Row: Journey Timeline */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center mb-6">
                        
                        {/* Departure Station */}
                        <div className="md:col-span-4 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
                          <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1">
                            Departure ({train.fromCode})
                          </div>
                          <div className="text-2xl font-black text-white">
                            {train.departureTime}
                          </div>
                          <div className="text-xs font-semibold text-slate-300 truncate mt-0.5">
                            {train.fromStation}
                          </div>
                        </div>

                        {/* Duration & Distance Center Indicator */}
                        <div className="md:col-span-4 text-center py-2">
                          <div className="text-xs font-bold text-slate-300 mb-1">
                            {train.durationStr} • {train.distanceKm} km
                          </div>
                          <div className="relative flex items-center justify-center my-2">
                            <div className="w-full h-0.5 bg-slate-800 relative">
                              <div className="absolute top-1/2 left-0 w-2.5 h-2.5 bg-amber-400 rounded-full -translate-y-1/2 shadow-md shadow-amber-400/50" />
                              <div className="absolute top-1/2 right-0 w-2.5 h-2.5 bg-sky-400 rounded-full -translate-y-1/2 shadow-md shadow-sky-400/50" />
                            </div>
                          </div>
                          <div className="text-[11px] font-medium text-slate-400">
                            {train.intermediateCount} Intermediate Stop{train.intermediateCount !== 1 ? 's' : ''}
                          </div>
                        </div>

                        {/* Arrival Station */}
                        <div className="md:col-span-4 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80 text-right">
                          <div className="text-[10px] font-bold text-sky-400 uppercase tracking-wider mb-1">
                            Arrival ({train.toCode})
                          </div>
                          <div className="text-2xl font-black text-white">
                            {train.arrivalTime}
                          </div>
                          <div className="text-xs font-semibold text-slate-300 truncate mt-0.5">
                            {train.toStation}
                          </div>
                        </div>

                      </div>

                      {/* Bottom Row: Days Frequency Pills & Action Buttons */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
                        
                        {/* Weekly Days Pills */}
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
                            Runs:
                          </span>
                          {daysOfWeek.map((day) => {
                            const isRunDay = (train.days || []).includes(day);
                            return (
                              <span
                                key={day}
                                className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                                  isRunDay
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                    : 'bg-slate-950 text-slate-600 border border-slate-800'
                                }`}
                              >
                                {day}
                              </span>
                            );
                          })}
                        </div>

                        {/* Interactive Buttons */}
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => setSelectedRouteTrain(train)}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-white font-bold text-xs rounded-xl transition-all border border-slate-700/60 cursor-pointer flex items-center space-x-1.5"
                          >
                            <Navigation className="w-3.5 h-3.5" />
                            <span>View Full Route</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setCoachModalTrain(train)}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-white font-bold text-xs rounded-xl transition-all border border-slate-700/60 cursor-pointer flex items-center space-x-1.5"
                          >
                            <Layers className="w-3.5 h-3.5" />
                            <span>Coach Position</span>
                          </button>
                        </div>

                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-12 text-center max-w-2xl mx-auto shadow-2xl">
                <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-400">
                  <Calendar className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  No Operating Trains Found on {currentDayInfo.dayFull}
                </h3>
                <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto leading-relaxed">
                  {onlyShowRunningOnDate
                    ? `No trains on this specific route run on ${currentDayInfo.dayFull} (${currentDayInfo.dateStr}). Try toggling off the date filter to see trains operating on other days.`
                    : 'Try modifying your search criteria or searching for neighboring stations.'}
                </p>
                {onlyShowRunningOnDate && (
                  <button
                    type="button"
                    onClick={() => setOnlyShowRunningOnDate(false)}
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer inline-flex items-center space-x-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Show All Trains Across All Days</span>
                  </button>
                )}
              </div>
            )}

          </div>
        )}

        {/* TAB 2: LIVE STATION BOARD */}
        {activeTab === 'station' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setBoardStationQuery(boardStationInput);
                }}
                className="space-y-4"
              >
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Enter Station Name or Code for Live Arrival/Departure Board
                </label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Building className="w-4 h-4 text-amber-400 absolute left-3.5 top-3.5" />
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
                      placeholder="Enter Station (e.g. VSKP, NDLS, SC, HWH, MAS)..."
                      className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-10 pr-3 py-3 text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />

                    {/* Autocomplete Dropdown */}
                    {boardSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl z-40 max-h-56 overflow-y-auto">
                        {boardSuggestions.map((st) => (
                          <div
                            key={st.code}
                            onClick={() => {
                              setBoardStationInput(`${st.name} (${st.code})`);
                              setBoardStationQuery(st.code);
                              setBoardSuggestions([]);
                            }}
                            className="px-4 py-2.5 hover:bg-slate-800 cursor-pointer flex justify-between items-center text-xs border-b border-slate-800/80"
                          >
                            <span className="font-bold text-white">{st.name}</span>
                            <span className="font-mono font-extrabold text-amber-400 bg-slate-950 px-2 py-0.5 rounded">{st.code}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs sm:text-sm rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
                  >
                    View Station Board
                  </button>
                </div>
              </form>
            </div>

            {/* Station Board Content */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-4 mb-6">
                <div>
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Live Station Board
                  </div>
                  <h3 className="text-2xl font-black text-white mt-1">
                    {stationBoardData.stationName} ({stationBoardData.stationCode})
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400 font-medium">Total Passing Trains</div>
                  <div className="text-xl font-mono font-extrabold text-sky-400">
                    {stationBoardData.totalPassingTrains} Trains
                  </div>
                </div>
              </div>

              {stationBoardData.upcomingTrains.length > 0 ? (
                <div className="space-y-3">
                  {stationBoardData.upcomingTrains.map((tr, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950/80 border border-slate-800/80 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 hover:border-amber-500/40 transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-xs font-bold bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-lg border border-amber-500/20">
                          #{tr.trainNumber}
                        </span>
                        <div>
                          <div className="text-sm font-bold text-white">{tr.trainName}</div>
                          <div className="text-xs text-slate-400">{tr.trainType}</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-xs font-mono">
                        <div>
                          <span className="text-slate-500 text-[10px] uppercase block">Arr</span>
                          <span className="text-emerald-400 font-bold">{tr.arr || 'Source'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] uppercase block">Dep</span>
                          <span className="text-sky-400 font-bold">{tr.dep || 'Terminus'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-400 text-sm">
                  No passing trains found for station code {stationBoardData.stationCode}.
                </div>
              )}
            </div>

          </div>
        )}

        {/* MODAL / DRAWER: ROUTE SCHEDULE */}
        {selectedRouteTrain && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex justify-end animate-fade-in">
            <div className="bg-slate-900 border-l border-slate-800 w-full max-w-2xl h-full overflow-y-auto p-6 sm:p-8 flex flex-col justify-between shadow-2xl">
              <div>
                <div className="flex justify-between items-start border-b border-slate-800 pb-4 mb-6">
                  <div>
                    <span className="font-mono text-xs font-bold bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded mb-2 inline-block">
                      #{selectedRouteTrain.number}
                    </span>
                    <h3 className="text-2xl font-black text-white">{selectedRouteTrain.name}</h3>
                    <p className="text-slate-400 text-xs mt-1">
                      {selectedRouteTrain.type} • Full Station Schedule
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedRouteTrain(null)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Route Schedule Stops Table */}
                <div className="space-y-3">
                  {(selectedRouteTrain.schedule || []).map((st, idx) => {
                    const isBoarding = st.code === selectedRouteTrain.fromCode;
                    const isAlighting = st.code === selectedRouteTrain.toCode;

                    return (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                          isBoarding || isAlighting
                            ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                            : 'bg-slate-950/60 border-slate-800/80 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="font-mono font-bold text-slate-500 text-[11px] w-6">
                            {idx + 1}
                          </span>
                          <div>
                            <div className="font-bold text-white flex items-center space-x-2">
                              <span>{st.name}</span>
                              <span className="font-mono text-[10px] text-amber-400 bg-slate-900 px-1.5 py-0.5 rounded">
                                {st.code}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500">Day {st.day}</div>
                          </div>
                        </div>

                        <div className="flex space-x-4 font-mono text-right">
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase">Arr</span>
                            <span>{st.arr}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase">Dep</span>
                            <span>{st.dep}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800 mt-6">
                <button
                  onClick={() => setSelectedRouteTrain(null)}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-xl cursor-pointer"
                >
                  Close Schedule
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL / DRAWER: COACH POSITION MAP */}
        {coachModalTrain && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl relative">
              <div className="flex justify-between items-start border-b border-slate-800 pb-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                    <Layers className="w-5 h-5 text-sky-400" />
                    <span>Coach Position & Layout Map</span>
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">
                    #{coachModalTrain.number} - {coachModalTrain.name}
                  </p>
                </div>
                <button
                  onClick={() => setCoachModalTrain(null)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Coach Rake Diagram */}
              <div className="space-y-4">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Engine & Coach Rake Layout (Front to Rear):
                </div>

                <div className="flex overflow-x-auto gap-2 pb-4 pt-2">
                  <div className="bg-amber-500 text-slate-950 font-black px-4 py-3 rounded-xl min-w-[70px] text-center text-xs shadow-lg">
                    ENG
                  </div>
                  <div className="bg-slate-800 text-slate-300 font-bold px-3 py-3 rounded-xl min-w-[60px] text-center text-xs border border-slate-700">
                    SLR
                  </div>
                  <div className="bg-sky-500/20 text-sky-300 font-bold px-3 py-3 rounded-xl min-w-[60px] text-center text-xs border border-sky-500/30">
                    GEN
                  </div>
                  <div className="bg-indigo-500/20 text-indigo-300 font-bold px-3 py-3 rounded-xl min-w-[60px] text-center text-xs border border-indigo-500/30">
                    S1
                  </div>
                  <div className="bg-indigo-500/20 text-indigo-300 font-bold px-3 py-3 rounded-xl min-w-[60px] text-center text-xs border border-indigo-500/30">
                    S2
                  </div>
                  <div className="bg-indigo-500/20 text-indigo-300 font-bold px-3 py-3 rounded-xl min-w-[60px] text-center text-xs border border-indigo-500/30">
                    S3
                  </div>
                  <div className="bg-indigo-500/20 text-indigo-300 font-bold px-3 py-3 rounded-xl min-w-[60px] text-center text-xs border border-indigo-500/30">
                    S4
                  </div>
                  <div className="bg-emerald-500/20 text-emerald-300 font-bold px-3 py-3 rounded-xl min-w-[60px] text-center text-xs border border-emerald-500/30">
                    B1
                  </div>
                  <div className="bg-emerald-500/20 text-emerald-300 font-bold px-3 py-3 rounded-xl min-w-[60px] text-center text-xs border border-emerald-500/30">
                    B2
                  </div>
                  <div className="bg-emerald-500/20 text-emerald-300 font-bold px-3 py-3 rounded-xl min-w-[60px] text-center text-xs border border-emerald-500/30">
                    B3
                  </div>
                  <div className="bg-purple-500/20 text-purple-300 font-bold px-3 py-3 rounded-xl min-w-[60px] text-center text-xs border border-purple-500/30">
                    A1
                  </div>
                  <div className="bg-amber-500/20 text-amber-300 font-bold px-3 py-3 rounded-xl min-w-[60px] text-center text-xs border border-amber-500/30">
                    H1
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-400 pt-2">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-amber-400 font-bold">ENG</span>: Locomotive Engine
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-indigo-400 font-bold">S1-S4</span>: Sleeper Class
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-emerald-400 font-bold">B1-B3</span>: AC 3-Tier
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-purple-400 font-bold">A1/H1</span>: AC 2-Tier / 1st Class
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800 mt-6 text-right">
                <button
                  onClick={() => setCoachModalTrain(null)}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Close Coach Map
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
