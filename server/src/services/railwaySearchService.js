const path = require('path');
const fs = require('fs');

let dataset = null;
let trainsMap = new Map();
let stationsMap = new Map();
let stationTrainsMap = new Map();

function initDataset() {
  if (dataset) return;

  const jsonPath = path.join(__dirname, '../data/allIndiaTrains.json');
  console.log('[Railway Engine] Loading All-India Trains dataset from:', jsonPath);

  if (fs.existsSync(jsonPath)) {
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    dataset = JSON.parse(rawData);

    // Build Maps
    dataset.trains.forEach((train) => {
      trainsMap.set(train.number, train);

      // Build Station -> Trains Map
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

    dataset.stations.forEach((st) => {
      stationsMap.set(st.code, st.name);
    });

    console.log(`[Railway Engine] Successfully loaded ${dataset.trains.length} trains and ${dataset.stations.length} stations.`);
  } else {
    console.error('[Railway Engine Error] allIndiaTrains.json dataset not found!');
  }
}

// Ensure initialized
initDataset();

// Helper: Resolve Station Code from Code or Name
function resolveStationCode(query) {
  if (!query) return null;
  const clean = query.trim().toUpperCase();

  if (stationsMap.has(clean)) return clean;

  // Search by station name match
  for (const [code, name] of stationsMap.entries()) {
    if (name.toUpperCase().includes(clean)) {
      return code;
    }
  }
  return clean;
}

// 1. Search Trains Between Stations or Search Query
function findTrainsBetweenStations(fromQuery = '', toQuery = '', query = '') {
  initDataset();

  if (!dataset || !dataset.trains) return [];

  const fromCode = resolveStationCode(fromQuery);
  const toCode = resolveStationCode(toQuery);
  const qClean = query.trim().toUpperCase();

  // Case A: Query specified (Search by train number or train name)
  if (qClean) {
    return dataset.trains
      .filter((t) => t.number.includes(qClean) || t.name.toUpperCase().includes(qClean))
      .slice(0, 50);
  }

  // Case B: Both From and To stations specified
  if (fromCode && toCode) {
    const matched = [];

    for (const train of dataset.trains) {
      if (!train.schedule) continue;

      const fromIdx = train.schedule.findIndex((s) => s.code === fromCode);
      const toIdx = train.schedule.findIndex((s) => s.code === toCode);

      if (fromIdx !== -1 && toIdx !== -1 && fromIdx < toIdx) {
        const fromStop = train.schedule[fromIdx];
        const toStop = train.schedule[toIdx];

        // Calculate travel duration estimate
        const intermediateStops = toIdx - fromIdx;
        const estDistanceKm = intermediateStops * 48; // avg ~48km between stops
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

  // Case C: Single Station specified (From only or To only)
  if (fromCode || toCode) {
    const targetCode = fromCode || toCode;
    const matched = [];

    for (const train of dataset.trains) {
      if (!train.schedule) continue;
      const idx = train.schedule.findIndex((s) => s.code === targetCode);
      if (idx !== -1) {
        matched.push(train);
      }
    }

    return matched.slice(0, 40);
  }

  // Case D: Empty inputs -> Return top featured trains
  return dataset.trains.slice(0, 50);
}

// 2. Station Autocomplete Search
function searchStations(query = '') {
  initDataset();
  if (!query || !dataset) return [];

  const qClean = query.trim().toUpperCase();
  const results = [];

  for (const st of dataset.stations) {
    if (st.code.startsWith(qClean) || st.name.toUpperCase().includes(qClean)) {
      results.push(st);
      if (results.length >= 25) break;
    }
  }

  return results;
}

// 3. Get Live Station Board
function getLiveStationBoard(stationQuery) {
  initDataset();
  const code = resolveStationCode(stationQuery) || 'NDLS';
  const stationName = stationsMap.get(code) || stationQuery;

  const passing = stationTrainsMap.get(code) || [];

  return {
    stationCode: code,
    stationName: stationName,
    totalPassingTrains: passing.length,
    upcomingTrains: passing.slice(0, 15)
  };
}

// 4. Get Live Train Status
function getLiveTrainStatus(trainNumber) {
  initDataset();
  const train = trainsMap.get(trainNumber) || dataset.trains[0];

  const totalStops = train.schedule.length;
  const currentIdx = Math.floor(totalStops * 0.4);
  const currentStop = train.schedule[currentIdx] || train.schedule[0];
  const nextStop = train.schedule[currentIdx + 1] || train.schedule[totalStops - 1];

  return {
    trainNumber: train.number,
    trainName: train.name,
    trainType: train.type,
    status: 'Running On Time',
    delayMinutes: 0,
    currentStation: currentStop.name,
    currentCode: currentStop.code,
    nextStation: nextStop.name,
    nextCode: nextStop.code,
    platform: (parseInt(train.number) % 6) + 1,
    schedule: train.schedule
  };
}

module.exports = {
  findTrainsBetweenStations,
  searchStations,
  getLiveStationBoard,
  getLiveTrainStatus,
};
