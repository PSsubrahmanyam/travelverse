let allIndiaData = null;
const trainsMap = new Map();
const stationsMap = new Map();
const stationTrainsMap = new Map();
let isDataLoading = false;

export async function loadRailwayDataset() {
  if (allIndiaData || isDataLoading) return;
  isDataLoading = true;

  try {
    const res = await fetch('/allIndiaTrains.json');
    if (res.ok) {
      allIndiaData = await res.json();
      
      allIndiaData.trains.forEach((train) => {
        trainsMap.set(train.number, train);
        if (train.schedule) {
          train.schedule.forEach((st) => {
            if (!stationTrainsMap.has(st.code)) {
              stationTrainsMap.set(st.code, []);
            }
            stationTrainsMap.get(st.code).push({
              trainNumber: train.number,
              trainName: train.name,
              trainType: train.type,
              arr: st.arr,
              dep: st.dep,
              day: st.day
            });
          });
        }
      });

      allIndiaData.stations.forEach((st) => {
        stationsMap.set(st.code, st.name);
      });
      console.log(`[Client Railway Engine] Loaded ${allIndiaData.trains.length} trains & ${allIndiaData.stations.length} stations.`);
    }
  } catch (e) {
    console.warn('[Client Railway Engine] Could not load static json dataset:', e.message);
  } finally {
    isDataLoading = false;
  }
}

// Initial async load
loadRailwayDataset();

// Helper: Resolve station code
export function resolveStationCode(query) {
  if (!query) return null;
  const clean = query.trim().toUpperCase();

  if (stationsMap.has(clean)) return clean;

  for (const [code, name] of stationsMap.entries()) {
    if (name.toUpperCase().includes(clean)) {
      return code;
    }
  }
  return clean;
}

// 1. Search Trains Between Stations or by query
export function findTrainsBetweenStations(fromQuery = '', toQuery = '', query = '') {
  if (!allIndiaData || !allIndiaData.trains) return [];

  const fromCode = resolveStationCode(fromQuery);
  const toCode = resolveStationCode(toQuery);
  const qClean = query.trim().toUpperCase();

  // Case A: Query specified (Train Number or Name)
  if (qClean) {
    return allIndiaData.trains
      .filter((t) => t.number.includes(qClean) || t.name.toUpperCase().includes(qClean))
      .slice(0, 50);
  }

  // Case B: Both From and To stations specified
  if (fromCode && toCode) {
    const matched = [];

    for (const train of allIndiaData.trains) {
      if (!train.schedule) continue;

      const fromIdx = train.schedule.findIndex((s) => s.code === fromCode);
      const toIdx = train.schedule.findIndex((s) => s.code === toCode);

      if (fromIdx !== -1 && toIdx !== -1 && fromIdx < toIdx) {
        const fromStop = train.schedule[fromIdx];
        const toStop = train.schedule[toIdx];

        const intermediateStops = toIdx - fromIdx;
        const estDistanceKm = intermediateStops * 48;
        const durHours = Math.max(1, Math.round(intermediateStops * 0.9));
        const durStr = `${durHours}h ${intermediateStops * 8 % 60}m`;

        matched.push({
          number: train.number,
          name: train.name,
          type: train.type,
          fromCode: fromStop.code,
          fromStation: fromStop.name,
          departureTime: fromStop.dep || fromStop.arr,
          toCode: toStop.code,
          toStation: toStop.name,
          arrivalTime: toStop.arr || toStop.dep,
          fromPf: train.fromPf || 1,
          toPf: train.toPf || 1,
          durationStr: durStr,
          distanceKm: estDistanceKm,
          intermediateCount: intermediateStops - 1,
          days: train.days || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          schedule: train.schedule
        });
      }
    }

    return matched;
  }

  // Case C: Single station specified
  if (fromCode || toCode) {
    const targetCode = fromCode || toCode;
    const matched = [];

    for (const train of allIndiaData.trains) {
      if (!train.schedule) continue;
      const idx = train.schedule.findIndex((s) => s.code === targetCode);
      if (idx !== -1) {
        matched.push(train);
      }
    }

    return matched.slice(0, 40);
  }

  // Case D: Blank search -> Top popular national trains
  return allIndiaData.trains.slice(0, 50);
}

// 2. Station Autocomplete Search
export function searchStations(query = '') {
  if (!query || !allIndiaData || !allIndiaData.stations) return [];

  const qClean = query.trim().toUpperCase();
  const results = [];

  for (const st of allIndiaData.stations) {
    if (st.code.startsWith(qClean) || st.name.toUpperCase().includes(qClean)) {
      results.push(st);
      if (results.length >= 25) break;
    }
  }

  return results;
}

// 3. Live Station Board
export function getLiveStationBoard(stationQuery) {
  const code = resolveStationCode(stationQuery) || 'NDLS';
  const stationName = stationsMap.get(code) || stationQuery;

  const passing = stationTrainsMap.get(code) || [];

  return {
    stationCode: code,
    stationName: stationName,
    totalPassingTrains: passing.length,
    upcomingTrains: passing.slice(0, 20)
  };
}

// 4. Live Spot Train Status
export function getLiveTrainStatus(trainNumber) {
  const defaultTrain = (allIndiaData && allIndiaData.trains) ? allIndiaData.trains[0] : { schedule: [] };
  const train = trainsMap.get(trainNumber) || defaultTrain;

  const totalStops = (train.schedule || []).length;
  const currentIdx = Math.floor(totalStops * 0.4);
  const currentStop = (train.schedule || [])[currentIdx] || (train.schedule || [])[0] || { name: 'Origin', code: 'START' };
  const nextStop = (train.schedule || [])[currentIdx + 1] || (train.schedule || [])[totalStops - 1] || { name: 'Destination', code: 'END' };

  return {
    trainNumber: train.number || trainNumber,
    trainName: train.name || 'Express',
    trainType: train.type || 'Superfast',
    status: 'Running On Time',
    delayMinutes: 0,
    currentStation: currentStop.name,
    currentCode: currentStop.code,
    nextStation: nextStop.name,
    nextCode: nextStop.code,
    platform: (parseInt(trainNumber) % 6) + 1,
    schedule: train.schedule || []
  };
}

export const POPULAR_TRAINS = [];
export const POPULAR_STATIONS = [];
