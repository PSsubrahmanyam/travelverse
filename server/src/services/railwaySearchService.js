const path = require('path');
const fs = require('fs');

let dataset = null;
let trainsList = [];
let stationsList = [];
let trainsMap = new Map();
let stationsCodeMap = new Map();
let stationTrainsMap = new Map();

function initDataset() {
  if (dataset) return;

  const jsonPath = path.join(__dirname, '../data/allIndiaTrainsCompact.json');
  console.log('[Railway Engine] Loading Compact All-India Trains dataset from:', jsonPath);

  if (fs.existsSync(jsonPath)) {
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    dataset = JSON.parse(rawData);

    // Unpack Stations
    stationsList = dataset.st.map((st) => ({
      code: st.c,
      name: st.n
    }));

    stationsList.forEach((st) => {
      stationsCodeMap.set(st.code, st.name);
    });

    // Unpack Trains
    trainsList = dataset.tr.map((t) => {
      const schedule = t.sch.map((s) => {
        const stObj = dataset.st[s[0]] || { c: 'UNK', n: 'Unknown' };
        return {
          code: stObj.c,
          name: stObj.n,
          arr: s[1],
          dep: s[2],
          day: s[3]
        };
      });

      const first = schedule[0] || { code: '', name: '', dep: '00:00' };
      const last = schedule[schedule.length - 1] || { code: '', name: '', arr: '00:00' };

      let typeFull = 'Express';
      if (t.typ === 'VB') typeFull = 'Vande Bharat';
      else if (t.typ === 'RAJ') typeFull = 'Rajdhani';
      else if (t.typ === 'SHAT') typeFull = 'Shatabdi';
      else if (t.typ === 'DUR') typeFull = 'Duronto';
      else if (t.typ === 'SF') typeFull = 'Superfast Express';
      else if (t.typ === 'LOCAL') typeFull = 'Passenger / Local';

      const trainObj = {
        number: t.num,
        name: t.nam,
        type: typeFull,
        fromCode: first.code,
        fromStation: first.name,
        departureTime: first.dep,
        toCode: last.code,
        toStation: last.name,
        arrivalTime: last.arr,
        fromPf: (parseInt(t.num) % 9) + 1,
        toPf: (parseInt(t.num) % 8) + 1,
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        schedule: schedule
      };

      trainsMap.set(t.num, trainObj);

      schedule.forEach((st) => {
        if (!stationTrainsMap.has(st.code)) {
          stationTrainsMap.set(st.code, []);
        }
        stationTrainsMap.get(st.code).push({
          trainNumber: t.num,
          trainName: t.nam,
          trainType: typeFull,
          arr: st.arr,
          dep: st.dep,
          day: st.day
        });
      });

      return trainObj;
    });

    console.log(`[Railway Engine] Successfully loaded ${trainsList.length} trains and ${stationsList.length} stations.`);
  } else {
    console.error('[Railway Engine Error] allIndiaTrainsCompact.json dataset not found!');
  }
}

initDataset();

function resolveStationCode(query) {
  if (!query) return null;
  const clean = query.trim().toUpperCase();

  if (stationsCodeMap.has(clean)) return clean;

  for (const [code, name] of stationsCodeMap.entries()) {
    if (name.toUpperCase().includes(clean)) {
      return code;
    }
  }
  return clean;
}

function findTrainsBetweenStations(fromQuery = '', toQuery = '', query = '') {
  initDataset();
  if (!trainsList) return [];

  const fromCode = resolveStationCode(fromQuery);
  const toCode = resolveStationCode(toQuery);
  const qClean = query.trim().toUpperCase();

  if (qClean) {
    return trainsList
      .filter((t) => t.number.includes(qClean) || t.name.toUpperCase().includes(qClean))
      .slice(0, 50);
  }

  if (fromCode && toCode) {
    const matched = [];

    for (const train of trainsList) {
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
          fromPf: train.fromPf,
          toPf: train.toPf,
          durationStr: durStr,
          distanceKm: estDistanceKm,
          intermediateCount: intermediateStops - 1,
          days: train.days,
          schedule: train.schedule
        });
      }
    }

    return matched;
  }

  if (fromCode || toCode) {
    const targetCode = fromCode || toCode;
    const matched = [];

    for (const train of trainsList) {
      if (!train.schedule) continue;
      const idx = train.schedule.findIndex((s) => s.code === targetCode);
      if (idx !== -1) {
        matched.push(train);
      }
    }

    return matched.slice(0, 40);
  }

  return trainsList.slice(0, 50);
}

function searchStations(query = '') {
  initDataset();
  if (!query || !stationsList) return [];

  const qClean = query.trim().toUpperCase();
  const results = [];

  for (const st of stationsList) {
    if (st.code.startsWith(qClean) || st.name.toUpperCase().includes(qClean)) {
      results.push(st);
      if (results.length >= 25) break;
    }
  }

  return results;
}

function getLiveStationBoard(stationQuery) {
  initDataset();
  const code = resolveStationCode(stationQuery) || 'NDLS';
  const stationName = stationsCodeMap.get(code) || stationQuery;

  const passing = stationTrainsMap.get(code) || [];

  return {
    stationCode: code,
    stationName: stationName,
    totalPassingTrains: passing.length,
    upcomingTrains: passing.slice(0, 20)
  };
}

function getLiveTrainStatus(trainNumber) {
  initDataset();
  const defaultTrain = trainsList[0] || { schedule: [] };
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

module.exports = {
  findTrainsBetweenStations,
  searchStations,
  getLiveStationBoard,
  getLiveTrainStatus,
};
