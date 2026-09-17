let allIndiaData = null;
let trainsList = [];
let stationsList = [];
const trainsMap = new Map();
const stationsCodeMap = new Map();
const stationTrainsMap = new Map();
let isDataLoading = false;

// Comprehensive Master City Clusters & Station Aliases Map (Local city & satellite stations)
const CITY_CLUSTERS = {
  // Visakhapatnam / Vizag
  'VISAKHAPATNAM': ['VSKP', 'DVD', 'AKP', 'SCM', 'SCMN', 'MIPM'],
  'VISHAKAPATNAM': ['VSKP', 'DVD', 'AKP', 'SCM', 'SCMN', 'MIPM'],
  'VIZAG': ['VSKP', 'DVD', 'AKP', 'SCM', 'SCMN', 'MIPM'],
  'WALTAIR': ['VSKP', 'DVD', 'AKP'],
  'VSKP': ['VSKP', 'DVD', 'AKP', 'SCM', 'MIPM'],
  'DUVVADA': ['DVD', 'VSKP', 'AKP'],
  'DVD': ['DVD', 'VSKP', 'AKP'],
  'ANAKAPALLE': ['AKP', 'DVD', 'VSKP'],
  'AKP': ['AKP', 'DVD', 'VSKP'],

  // Rajahmundry
  'RAJAHMUNDRY': ['RJY', 'GVN', 'KVR', 'NDD', 'DWP', 'APT'],
  'RAJAMUNDRY': ['RJY', 'GVN', 'KVR', 'NDD', 'DWP', 'APT'],
  'GODAVARI': ['GVN', 'RJY', 'KVR'],
  'KOVVUR': ['KVR', 'RJY', 'GVN'],
  'RJY': ['RJY', 'GVN', 'KVR', 'NDD'],

  // Hyderabad / Secunderabad
  'HYDERABAD': ['SC', 'HYB', 'KCG', 'LPI', 'BMT', 'MJF', 'FM', 'CHZ', 'UR', 'HTCY'],
  'SECUNDERABAD': ['SC', 'HYB', 'KCG', 'LPI', 'BMT', 'MJF', 'FM', 'CHZ', 'UR', 'HTCY'],
  'KACHEGUDA': ['KCG', 'SC', 'HYB', 'LPI', 'MJF', 'FM'],
  'LINGAMPALLI': ['LPI', 'SC', 'HYB', 'KCG', 'BMT', 'HTCY'],
  'BEGUMPET': ['BMT', 'SC', 'HYB', 'LPI'],
  'MALKAJGIRI': ['MJF', 'SC', 'KCG'],
  'FALAKNUMA': ['FM', 'KCG', 'SC'],
  'CHARLAPALLI': ['CHZ', 'SC'],
  'SC': ['SC', 'HYB', 'KCG', 'LPI', 'BMT', 'MJF', 'FM', 'CHZ'],
  'HYB': ['HYB', 'SC', 'KCG', 'LPI'],
  'KCG': ['KCG', 'SC', 'HYB', 'LPI'],
  'LPI': ['LPI', 'SC', 'HYB', 'KCG'],

  // Vijayawada / Guntur / Tenali
  'VIJAYAWADA': ['BZA', 'RYP', 'KI', 'MAG', 'GNT', 'TEL'],
  'RAYANAPADU': ['RYP', 'BZA', 'KI', 'MAG'],
  'GUNTUR': ['GNT', 'BZA', 'TEL', 'MAG'],
  'TENALI': ['TEL', 'BZA', 'GNT', 'MAG'],
  'BZA': ['BZA', 'RYP', 'KI', 'MAG', 'GNT', 'TEL'],
  'GNT': ['GNT', 'BZA', 'TEL'],
  'TEL': ['TEL', 'BZA', 'GNT'],

  // Bengaluru / Bangalore
  'BENGALURU': ['SBC', 'YPR', 'SMVB', 'BNC', 'KJM', 'BNCE', 'YNK', 'BAND', 'WFD'],
  'BANGALORE': ['SBC', 'YPR', 'SMVB', 'BNC', 'KJM', 'BNCE', 'YNK', 'BAND', 'WFD'],
  'YESVANTPUR': ['YPR', 'SBC', 'SMVB', 'BNC', 'KJM', 'YNK', 'BAND'],
  'YESHWANTHPUR': ['YPR', 'SBC', 'SMVB', 'BNC', 'KJM', 'YNK'],
  'KRISHNARAJAPURAM': ['KJM', 'SBC', 'YPR', 'SMVB', 'BNC', 'WFD'],
  'YELAHANKA': ['YNK', 'SBC', 'YPR'],
  'SBC': ['SBC', 'YPR', 'SMVB', 'BNC', 'KJM', 'BNCE', 'YNK', 'BAND'],
  'YPR': ['YPR', 'SBC', 'SMVB', 'BNC', 'KJM', 'YNK', 'BAND'],
  'SMVB': ['SMVB', 'SBC', 'YPR', 'BNC', 'KJM', 'BAND'],
  'BNC': ['BNC', 'SBC', 'YPR', 'SMVB', 'KJM'],

  // Delhi / NCR
  'DELHI': ['NDLS', 'DLI', 'NZM', 'ANVT', 'DEE', 'DEC', 'GZB', 'GGN', 'FDB', 'DSA', 'SBB'],
  'NEW DELHI': ['NDLS', 'DLI', 'NZM', 'ANVT', 'DEE', 'DEC', 'GZB', 'GGN'],
  'NIZAMUDDIN': ['NZM', 'NDLS', 'DLI', 'ANVT', 'DEE', 'DEC', 'GZB'],
  'ANAND VIHAR': ['ANVT', 'NDLS', 'DLI', 'NZM', 'DEE', 'DEC', 'GZB'],
  'SARAI ROHILLA': ['DEE', 'NDLS', 'DLI', 'NZM', 'ANVT', 'DEC'],
  'GHAZIABAD': ['GZB', 'NDLS', 'DLI', 'ANVT'],
  'GURGAON': ['GGN', 'DEC', 'NDLS', 'DEE'],
  'GURUGRAM': ['GGN', 'DEC', 'NDLS', 'DEE'],
  'NDLS': ['NDLS', 'DLI', 'NZM', 'ANVT', 'DEE', 'DEC', 'GZB'],
  'DLI': ['DLI', 'NDLS', 'NZM', 'ANVT', 'DEE', 'DEC'],
  'NZM': ['NZM', 'NDLS', 'DLI', 'ANVT', 'DEE', 'DEC'],
  'ANVT': ['ANVT', 'NDLS', 'DLI', 'NZM', 'DEE', 'DEC'],
  'DEE': ['DEE', 'NDLS', 'DLI', 'NZM', 'DEC'],

  // Mumbai / MMR
  'MUMBAI': ['CSMT', 'MMCT', 'LTT', 'BDTS', 'DR', 'TNA', 'KYN', 'BVI', 'PNVL', 'BSR'],
  'BOMBAY': ['CSMT', 'MMCT', 'LTT', 'BDTS', 'DR', 'TNA', 'KYN', 'BVI', 'PNVL', 'BSR'],
  'DADAR': ['DR', 'DDR', 'CSMT', 'MMCT', 'LTT', 'BDTS', 'TNA'],
  'BANDRA': ['BDTS', 'MMCT', 'CSMT', 'DR', 'BVI', 'BSR'],
  'THANE': ['TNA', 'KYN', 'CSMT', 'LTT', 'DR', 'PNVL'],
  'KALYAN': ['KYN', 'TNA', 'CSMT', 'LTT', 'DR', 'PNVL'],
  'BORIVALI': ['BVI', 'BDTS', 'MMCT', 'BSR', 'DR'],
  'PANVEL': ['PNVL', 'CSMT', 'LTT', 'TNA', 'KYN'],
  'VASAI': ['BSR', 'BVI', 'BDTS', 'PNVL'],
  'CSMT': ['CSMT', 'MMCT', 'LTT', 'BDTS', 'DR', 'TNA', 'KYN', 'BVI'],
  'LTT': ['LTT', 'CSMT', 'MMCT', 'BDTS', 'DR', 'TNA', 'KYN', 'PNVL'],
  'BDTS': ['BDTS', 'MMCT', 'CSMT', 'DR', 'BVI', 'BSR'],
  'MMCT': ['MMCT', 'BDTS', 'CSMT', 'DR', 'BVI'],
  'DR': ['DR', 'CSMT', 'MMCT', 'LTT', 'BDTS', 'TNA'],

  // Kolkata
  'KOLKATA': ['HWH', 'SDAH', 'KOAA', 'SHM', 'SRC'],
  'CALCUTTA': ['HWH', 'SDAH', 'KOAA', 'SHM', 'SRC'],
  'HOWRAH': ['HWH', 'SDAH', 'KOAA', 'SHM', 'SRC'],
  'SEALDAH': ['SDAH', 'HWH', 'KOAA', 'SHM', 'SRC'],
  'SHALIMAR': ['SHM', 'HWH', 'SDAH', 'KOAA', 'SRC'],
  'SANTRAGACHI': ['SRC', 'HWH', 'SHM', 'SDAH', 'KOAA'],
  'HWH': ['HWH', 'SDAH', 'KOAA', 'SHM', 'SRC'],
  'SDAH': ['SDAH', 'HWH', 'KOAA', 'SHM', 'SRC'],
  'KOAA': ['KOAA', 'HWH', 'SDAH', 'SHM', 'SRC'],

  // Chennai
  'CHENNAI': ['MAS', 'MS', 'TBM', 'PER', 'AJJ', 'CGL'],
  'MADRAS': ['MAS', 'MS', 'TBM', 'PER', 'AJJ'],
  'EGMORE': ['MS', 'MAS', 'TBM', 'PER'],
  'TAMBARAM': ['TBM', 'MS', 'MAS', 'PER', 'CGL'],
  'PERAMBUR': ['PER', 'MAS', 'MS', 'TBM', 'AJJ'],
  'MAS': ['MAS', 'MS', 'TBM', 'PER', 'AJJ'],
  'MS': ['MS', 'MAS', 'TBM', 'PER'],
  'TBM': ['TBM', 'MS', 'MAS', 'CGL'],

  // Tirupati
  'TIRUPATI': ['TPTY', 'RU', 'TPW', 'CBR'],
  'RENIGUNTA': ['RU', 'TPTY', 'TPW'],
  'TPTY': ['TPTY', 'RU', 'TPW'],
  'RU': ['RU', 'TPTY', 'TPW'],

  // Goa
  'GOA': ['MAO', 'VSG', 'THVM', 'KRMI', 'PERN', 'CURI'],
  'MADGAON': ['MAO', 'VSG', 'THVM', 'KRMI', 'PERN'],
  'MARGAO': ['MAO', 'VSG', 'THVM', 'KRMI'],
  'VASCO': ['VSG', 'MAO', 'THVM', 'KRMI'],
  'THIVIM': ['THVM', 'MAO', 'KRMI', 'PERN'],
  'KARMALI': ['KRMI', 'MAO', 'THVM', 'PERN'],
  'MAO': ['MAO', 'VSG', 'THVM', 'KRMI'],

  // Ernakulam / Kochi
  'ERNAKULAM': ['ERS', 'ERN', 'AWY', 'TCR'],
  'KOCHI': ['ERS', 'ERN', 'AWY'],
  'COCHIN': ['ERS', 'ERN', 'AWY'],
  'ALUVA': ['AWY', 'ERS', 'ERN'],
  'THRISSUR': ['TCR', 'ERS', 'ERN', 'AWY'],
  'ERS': ['ERS', 'ERN', 'AWY'],
  'ERN': ['ERN', 'ERS', 'AWY'],

  // Thiruvananthapuram / Trivandrum
  'TRIVANDRUM': ['TVC', 'KCVL', 'VAK'],
  'THIRUVANANTHAPURAM': ['TVC', 'KCVL', 'VAK'],
  'KOCHUVELI': ['KCVL', 'TVC', 'VAK'],
  'TVC': ['TVC', 'KCVL', 'VAK'],

  // Bhubaneswar / Cuttack / Puri
  'BHUBANESWAR': ['BBS', 'CTC', 'KUR', 'PURI'],
  'CUTTACK': ['CTC', 'BBS', 'KUR'],
  'KHURDA': ['KUR', 'BBS', 'CTC', 'PURI'],
  'PURI': ['PURI', 'BBS', 'KUR', 'CTC'],
  'BBS': ['BBS', 'CTC', 'KUR', 'PURI'],

  // Coimbatore
  'COIMBATORE': ['CBE', 'CBF', 'TUP', 'PTJ'],
  'TIRUPPUR': ['TUP', 'CBE', 'CBF', 'PTJ'],
  'CBE': ['CBE', 'CBF', 'TUP', 'PTJ'],

  // Pune
  'PUNE': ['PUNE', 'CCH', 'KK', 'LNL', 'PMP'],
  'POONA': ['PUNE', 'CCH', 'KK', 'LNL'],
  'CHINCHWAD': ['CCH', 'PUNE', 'KK', 'PMP'],
  'LONAVALA': ['LNL', 'PUNE', 'CCH'],

  // Ahmedabad / Vadodara / Surat
  'AHMEDABAD': ['ADI', 'SBIB', 'SBT', 'GER', 'MAN'],
  'SABARMATI': ['SBIB', 'SBT', 'ADI', 'GER', 'MAN'],
  'SURAT': ['ST', 'UDN', 'BRC'],
  'VADODARA': ['BRC', 'ADI', 'ST'],
  'BARODA': ['BRC', 'ADI'],
  'ADI': ['ADI', 'SBIB', 'SBT', 'GER', 'MAN'],
  'ST': ['ST', 'UDN', 'BRC'],
  'BRC': ['BRC', 'ADI', 'ST'],

  // Jaipur
  'JAIPUR': ['JP', 'GADJ', 'DPA'],
  'DURGAPURA': ['DPA', 'JP', 'GADJ'],
  'JP': ['JP', 'GADJ', 'DPA'],

  // Lucknow
  'LUCKNOW': ['LKO', 'LJN', 'BNZ', 'ASH', 'AMG'],
  'CHARBAGH': ['LKO', 'LJN', 'BNZ', 'ASH'],
  'BADSHAHNAGAR': ['BNZ', 'LKO', 'LJN', 'ASH'],
  'LKO': ['LKO', 'LJN', 'BNZ', 'ASH'],
  'LJN': ['LJN', 'LKO', 'BNZ', 'ASH'],

  // Varanasi / Prayagraj
  'VARANASI': ['BSB', 'BSBS', 'DDU', 'PRYJ', 'PRRB'],
  'BANARAS': ['BSBS', 'BSB', 'DDU'],
  'MUGHALSARAI': ['DDU', 'BSB', 'BSBS'],
  'DEEN DAYAL': ['DDU', 'BSB', 'BSBS'],
  'ALLAHABAD': ['PRYJ', 'PRRB', 'NYN', 'SFG', 'BSB'],
  'PRAYAGRAJ': ['PRYJ', 'PRRB', 'NYN', 'SFG', 'BSB'],
  'BSB': ['BSB', 'BSBS', 'DDU'],
  'DDU': ['DDU', 'BSB', 'BSBS'],
  'PRYJ': ['PRYJ', 'PRRB', 'NYN', 'SFG'],

  // Patna
  'PATNA': ['PNBE', 'PPTA', 'DNR', 'RJPB', 'PNC'],
  'PATLIPUTRA': ['PPTA', 'PNBE', 'DNR', 'RJPB'],
  'DANAPUR': ['DNR', 'PNBE', 'PPTA', 'RJPB'],
  'PNBE': ['PNBE', 'PPTA', 'DNR', 'RJPB'],

  // Nagpur
  'NAGPUR': ['NGP', 'AJNI'],
  'NGP': ['NGP', 'AJNI'],

  // Kanpur
  'KANPUR': ['CNB', 'CPA', 'GOY'],
  'CNB': ['CNB', 'CPA', 'GOY'],

  // Bhopal
  'BHOPAL': ['BPL', 'RKMP', 'HBJ', 'SHRN'],
  'HABIBGANJ': ['RKMP', 'HBJ', 'BPL', 'SHRN'],
  'RANI KAMLAPATI': ['RKMP', 'HBJ', 'BPL', 'SHRN'],
  'BPL': ['BPL', 'RKMP', 'HBJ'],

  // Indore
  'INDORE': ['INDB', 'LMNR'],
  'INDB': ['INDB', 'LMNR'],

  // Guwahati
  'GUWAHATI': ['GHY', 'KYQ'],
  'GOWAHATI': ['GHY', 'KYQ'],
  'KAMAKHYA': ['KYQ', 'GHY'],
  'GHY': ['GHY', 'KYQ'],

  // Chandigarh
  'CHANDIGARH': ['CDG', 'SASN', 'UMB'],
  'MOHALI': ['SASN', 'CDG', 'UMB'],
  'AMBALA': ['UMB', 'CDG', 'SASN'],
  'CDG': ['CDG', 'SASN', 'UMB'],

  // Agra / Mathura
  'AGRA': ['AGC', 'AF', 'RKM', 'MTJ'],
  'MATHURA': ['MTJ', 'AGC', 'AF'],
  'AGC': ['AGC', 'AF', 'RKM', 'MTJ'],

  // Raipur / Durg / Bilaspur
  'RAIPUR': ['R', 'DURG', 'BSP'],
  'DURG': ['DURG', 'R', 'BSP'],
  'BILASPUR': ['BSP', 'R', 'DURG'],
  'R': ['R', 'DURG', 'BSP'],

  // Ranchi / Jamshedpur / Dhanbad
  'RANCHI': ['RNC', 'HTE', 'TATA', 'DHN'],
  'HATIA': ['HTE', 'RNC', 'TATA'],
  'TATANAGAR': ['TATA', 'RNC', 'HTE', 'DHN'],
  'JAMSHEDPUR': ['TATA', 'RNC', 'HTE'],
  'DHANBAD': ['DHN', 'TATA', 'RNC'],
  'RNC': ['RNC', 'HTE', 'TATA'],

  // Amritsar / Jalandhar / Ludhiana
  'AMRITSAR': ['ASR', 'JUC', 'LDH'],
  'JALANDHAR': ['JUC', 'ASR', 'LDH'],
  'LUDHIANA': ['LDH', 'ASR', 'JUC'],
  'ASR': ['ASR', 'JUC', 'LDH'],

  // Kakinada / Samalkot / Eluru / Nellore / Ongole
  'KAKINADA': ['CCT', 'COA', 'SLO'],
  'SAMALKOT': ['SLO', 'CCT', 'COA'],
  'ELURU': ['EE', 'BZA'],
  'TADEPALLIGUDEM': ['TDD', 'EE', 'RJY'],
  'NELLORE': ['NLR', 'GDR', 'OGL'],
  'ONGOLE': ['OGL', 'NLR', 'BZA'],
  'GUDUR': ['GDR', 'NLR', 'MAS']
};

function normalizeName(str) {
  if (!str) return '';
  return str.toUpperCase()
    .replace(/VISHAKAPATNAM/g, 'VISAKHAPATNAM')
    .replace(/RAJAMUNDRY/g, 'RAJAHMUNDRY')
    .replace(/BANGALORE/g, 'BENGALURU')
    .replace(/CALCUTTA/g, 'KOLKATA')
    .replace(/MADRAS/g, 'CHENNAI')
    .replace(/TRIVANDRUM/g, 'THIRUVANANTHAPURAM')
    .replace(/COCHIN/g, 'KOCHI')
    .replace(/BARODA/g, 'VADODARA')
    .replace(/PRAYAGRAJ/g, 'ALLAHABAD')
    .replace(/MUGHALSARAI/g, 'DEEN DAYAL')
    .replace(/GOWAHATI/g, 'GUWAHATI')
    .replace(/[^A-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getTrainRunningDays(numStr, nameStr) {
  const nameUpper = (nameStr || '').toUpperCase();
  const numInt = parseInt(numStr) || 0;
  const daysMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (nameUpper.includes('WEEKLY') || nameUpper.includes('WKLY') || nameUpper.includes('1 DAY')) {
    return [daysMap[numInt % 7]];
  }
  if (nameUpper.includes('BI-WEEKLY') || nameUpper.includes('BI WEEKLY') || nameUpper.includes('BIWEEKLY') || nameUpper.includes('2 DAYS')) {
    return [daysMap[numInt % 7], daysMap[(numInt + 3) % 7]];
  }
  if (nameUpper.includes('TRI-WEEKLY') || nameUpper.includes('TRI WEEKLY') || nameUpper.includes('TRIWEEKLY') || nameUpper.includes('3 DAYS')) {
    return [daysMap[numInt % 7], daysMap[(numInt + 2) % 7], daysMap[(numInt + 4) % 7]];
  }
  if (nameUpper.includes('HUMSAFAR') || nameUpper.includes('SUVIDHA') || nameUpper.includes('SPL') || nameUpper.includes('SPECIAL')) {
    if (numInt % 2 === 0) {
      return [daysMap[numInt % 7]];
    } else {
      return [daysMap[numInt % 7], daysMap[(numInt + 4) % 7]];
    }
  }
  if (nameUpper.includes('SAMPARK KRANTI') || nameUpper.includes('GARIB RATH') || nameUpper.includes('AC EXP')) {
    return [daysMap[numInt % 7], daysMap[(numInt + 2) % 7], daysMap[(numInt + 5) % 7]];
  }

  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
}

export async function loadRailwayDataset() {
  if (allIndiaData || isDataLoading) return;
  isDataLoading = true;

  try {
    const res = await fetch('/allIndiaTrainsCompact.json');
    if (res.ok) {
      allIndiaData = await res.json();
      
      // Unpack Stations
      stationsList = allIndiaData.st.map((st) => ({
        code: st.c,
        name: st.n
      }));

      stationsList.forEach((st) => {
        stationsCodeMap.set(st.code, st.name);
      });

      // Unpack Trains
      trainsList = allIndiaData.tr.map((t) => {
        const schedule = t.sch.map((s) => {
          const stObj = allIndiaData.st[s[0]] || { c: 'UNK', n: 'Unknown' };
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

        const runningDays = getTrainRunningDays(t.num, t.nam);

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
          days: runningDays,
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

      console.log(`[Client Railway Engine] Loaded ${trainsList.length} trains & ${stationsList.length} stations.`);
    }
  } catch (e) {
    console.warn('[Client Railway Engine] Could not load static json dataset:', e.message);
  } finally {
    isDataLoading = false;
  }
}

// Initial async load
loadRailwayDataset();

export function resolveStationCodes(query) {
  if (!query) return [];
  const rawClean = query.trim().toUpperCase();
  const codes = [];

  // 1. Extract explicit code inside parentheses e.g. "VISAKHAPATNAM JN (VSKP)"
  const parenMatch = query.match(/\(([^)]+)\)/);
  if (parenMatch && parenMatch[1]) {
    const extractedCode = parenMatch[1].trim().toUpperCase();
    codes.push(extractedCode);
    if (CITY_CLUSTERS[extractedCode]) {
      CITY_CLUSTERS[extractedCode].forEach((c) => {
        if (!codes.includes(c)) codes.push(c);
      });
    }
  }

  // 2. Direct city cluster map match
  if (CITY_CLUSTERS[rawClean]) {
    CITY_CLUSTERS[rawClean].forEach((c) => {
      if (!codes.includes(c)) codes.push(c);
    });
  }

  const normClean = normalizeName(query);
  if (CITY_CLUSTERS[normClean]) {
    CITY_CLUSTERS[normClean].forEach((c) => {
      if (!codes.includes(c)) codes.push(c);
    });
  }

  // 3. Exact code match in dataset
  if (stationsCodeMap.has(rawClean)) {
    if (!codes.includes(rawClean)) codes.push(rawClean);
    for (const [, list] of Object.entries(CITY_CLUSTERS)) {
      if (list.includes(rawClean)) {
        list.forEach((c) => {
          if (!codes.includes(c)) codes.push(c);
        });
      }
    }
  }

  // 4. Substring / Fuzzy match on station name or code
  for (const st of stationsList) {
    const stNorm = normalizeName(st.name);
    if (
      st.code === rawClean ||
      st.name.toUpperCase().includes(rawClean) ||
      (normClean.length >= 3 && stNorm.includes(normClean))
    ) {
      if (!codes.includes(st.code)) codes.push(st.code);
      for (const [, list] of Object.entries(CITY_CLUSTERS)) {
        if (list.includes(st.code)) {
          list.forEach((c) => {
            if (!codes.includes(c)) codes.push(c);
          });
        }
      }
    }
  }

  return codes;
}

export function resolvePrimaryStationCode(query) {
  const codes = resolveStationCodes(query);
  if (codes.length === 0) return query ? query.trim().toUpperCase() : 'NDLS';
  return codes[0];
}

export function findTrainsBetweenStations(fromQuery = '', toQuery = '', query = '') {
  if (!trainsList || trainsList.length === 0) return [];

  const qClean = query.trim().toUpperCase();

  if (qClean) {
    return trainsList
      .filter((t) => t.number.includes(qClean) || t.name.toUpperCase().includes(qClean))
      .slice(0, 50);
  }

  if (fromQuery && toQuery) {
    const fromCodes = resolveStationCodes(fromQuery);
    const toCodes = resolveStationCodes(toQuery);
    const matched = [];

    for (const train of trainsList) {
      if (!train.schedule) continue;

      let bestFromIdx = -1;
      let bestToIdx = -1;

      // Priority Station Matching: Select primary / exact requested station first
      for (const fCode of fromCodes) {
        const fIdx = train.schedule.findIndex((s) => s.code === fCode);
        if (fIdx !== -1) {
          for (const tCode of toCodes) {
            const tIdx = train.schedule.findIndex((s) => s.code === tCode);
            if (tIdx !== -1 && fIdx < tIdx) {
              bestFromIdx = fIdx;
              bestToIdx = tIdx;
              break;
            }
          }
          if (bestFromIdx !== -1) break;
        }
      }

      if (bestFromIdx !== -1 && bestToIdx !== -1) {
        const fromStop = train.schedule[bestFromIdx];
        const toStop = train.schedule[bestToIdx];

        const intermediateStops = bestToIdx - bestFromIdx;
        const estDistanceKm = intermediateStops * 42;
        const durHours = Math.max(1, Math.round(intermediateStops * 0.8));
        const durStr = `${durHours}h ${(intermediateStops * 7) % 60}m`;

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

  if (fromQuery || toQuery) {
    const targetCodes = resolveStationCodes(fromQuery || toQuery);
    const matched = [];

    for (const train of trainsList) {
      if (!train.schedule) continue;
      const idx = train.schedule.findIndex((s) => targetCodes.includes(s.code));
      if (idx !== -1) {
        matched.push(train);
      }
    }

    return matched.slice(0, 50);
  }

  return trainsList.slice(0, 50);
}

export function searchStations(query = '') {
  if (!query || !stationsList) return [];

  const rawClean = query.trim().toUpperCase();
  const normClean = normalizeName(query);
  const results = [];
  const addedCodes = new Set();

  // 1. Check if query matches a major city cluster keyword
  for (const [key, list] of Object.entries(CITY_CLUSTERS)) {
    if (key === rawClean || key === normClean) {
      list.forEach((c) => {
        if (!addedCodes.has(c)) {
          const stName = stationsCodeMap.get(c);
          if (stName) {
            results.push({ code: c, name: stName });
            addedCodes.add(c);
          }
        }
      });
      break;
    }
  }

  // 2. Direct code prefix match
  for (const st of stationsList) {
    if (addedCodes.has(st.code)) continue;
    if (st.code.startsWith(rawClean)) {
      results.push(st);
      addedCodes.add(st.code);
      if (results.length >= 30) break;
    }
  }

  // 3. Station name match
  if (results.length < 30) {
    for (const st of stationsList) {
      if (addedCodes.has(st.code)) continue;
      const stNorm = normalizeName(st.name);
      if (st.name.toUpperCase().includes(rawClean) || (normClean.length >= 3 && stNorm.includes(normClean))) {
        results.push(st);
        addedCodes.add(st.code);
        if (results.length >= 30) break;
      }
    }
  }

  return results;
}

export function getLiveStationBoard(stationQuery) {
  const code = resolvePrimaryStationCode(stationQuery);
  const stationName = stationsCodeMap.get(code) || stationQuery;

  const passing = stationTrainsMap.get(code) || [];

  return {
    stationCode: code,
    stationName: stationName,
    totalPassingTrains: passing.length,
    upcomingTrains: passing.slice(0, 25)
  };
}

export function getLiveTrainStatus(trainNumber) {
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

export const POPULAR_TRAINS = [];
export const POPULAR_STATIONS = [];
