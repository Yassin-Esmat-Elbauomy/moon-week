import type { DayNumber, NasaScienceCardData, ScientificTermDefinition } from '../types/game';

export const SCIENTIFIC_TERMS: Record<string, ScientificTermDefinition> = {
  Sol: {
    term: 'Sol',
    shortTitle: 'Solar Operational Day',
    kidExplanation:
      'On Mars and in lunar outpost schedules, scientists call one operational day cycle a Sol. Inside our South Pole base, each Mission Day runs from 06:00 to 22:00 with artificial Earth-like lighting so the crew keeps a healthy body clock!',
  },
  'Radiation Dose (mSv)': {
    term: 'Radiation Dose (mSv)',
    shortTitle: 'Millisievert (Radiation Absorption)',
    kidExplanation:
      'A millisievert (mSv) measures how much energy from space radiation actually reaches inside a sheltered habitat. Space satellites measure raw particle storms outside, while thick water walls and crater rock reduce the dose inside the base.',
  },
  'Capillary Action': {
    term: 'Capillary Action',
    shortTitle: 'Surface-Tension Water Climbing',
    kidExplanation:
      'Capillary action happens when water sticks to tiny spaces inside a porous sponge or wick and climbs upward by itself without electric pumps—just like a paper towel soaking up a spill!',
  },
  'Coronal Mass Ejection (CME)': {
    term: 'Coronal Mass Ejection (CME)',
    shortTitle: 'Giant Solar Plasma Cloud',
    kidExplanation:
      'A Coronal Mass Ejection is a huge bubble of magnetized gas and fast-moving protons blasted off the Sun. When aimed toward the Earth-Moon system, it can disturb radio signals and increase radiation outside lunar habitats.',
  },
  'Light-Time Delay': {
    term: 'Light-Time Delay',
    shortTitle: '1.3-Second Earth–Moon Radio Travel',
    kidExplanation:
      'Even at the speed of light (300,000 km per second), radio waves need 1.3 seconds to cross the 384,400 km gap from Earth to the Moon—and another 1.3 seconds back, creating a 2.6-second wait for every reply from Abd-Elrahman!',
  },
  Microgravity: {
    term: 'Microgravity',
    shortTitle: 'Very Weak Gravity Environment',
    kidExplanation:
      'On the International Space Station, astronauts float in microgravity, where water forms spheres instead of draining downward. On the Moon, gravity is one-sixth of Earth’s (1.62 m/s²), so water still moves differently than on Earth.',
  },
};

export const VERIFIED_NASA_DATASETS: Record<DayNumber, NasaScienceCardData> = {
  1: {
    day: 1,
    source: 'NASA LRO / Artemis',
    datasetTitle: 'LRO LOLA & Diviner — Shackleton Crater Rim Topography & Thermal Map',
    recordId: 'LRO-DIVINER-SHACKLETON-2023',
    liveStatus: 'verified_cache',
    satelliteObservation:
      'NASA Lunar Reconnaissance Orbiter (LRO) Diviner radiometer maps record ~220 K (-53°C) average temperatures and >90% annual illumination along elevated Shackleton Crater rim ridges, versus 40–110 K (-233°C to -163°C) inside Permanently Shadowed Regions (PSRs).',
    scientificInterpretation:
      'Because the Moon’s spin axis tilts only ~1.5°, high south-polar ridges stay in near-continuous sunlight ideal for solar arrays, while deep crater floors stay permanently cold enough to trap ancient water-ice crystals.',
    gameSimulationRule:
      'Sunlit Ridge grants +6 Power/day solar generation but faces open storm exposure (-10 Shielding in Sol 4 storms). Crater Shadow Rim grants +15 Water on landing and +10 natural terrain Shielding in storms, at -4 Power/day.',
    whyThisMatters:
      'Real NASA Artemis III landing-site planners balance sunlight for solar power against nearby permanently shadowed craters that could supply drinking water, oxygen, and rocket fuel.',
    rawMetrics: [
      { label: 'Ridge Temp (LRO Diviner)', value: '~220 K (-53°C)' },
      { label: 'PSR Floor Temp', value: '40–110 K (-233°C to -163°C)' },
      { label: 'Lunar Gravity', value: '1.62 m/s² (1/6 Earth)' },
      { label: 'Earth–Moon Radio Delay', value: '1.3 s one-way / 2.6 s round-trip' },
    ],
  },
  2: {
    day: 2,
    source: 'NASA OSDR (Veggie/PONDS)',
    datasetTitle:
      'ISS Veggie & PONDS Capillary Crop Studies (OSD-655 / OSD-780) + CSA Space Food Toolkit',
    recordId: 'OSD-655 / OSD-780 / CSA-FOOD',
    liveStatus: 'verified_cache',
    satelliteObservation:
      'NASA Open Science Data Repository studies OSD-655 and OSD-780 archived pick-and-eat lettuce and dwarf tomato growth inside ISS Veggie hardware using Passive Orbital Nutrient Delivery System (PONDS) capillary mats versus actively circulated root modules, paired with the Canadian Space Agency (CSA) "Food Production on the Moon and in Remote Areas" educational engineering benchmarks.',
    scientificInterpretation:
      'Active pumps circulate aerated water quickly for fast crop yield, but rely on continuous electricity. PONDS units use surface tension and adhesion inside porous wicking matrices to deliver water with zero electrical draw, trading speed and needing hands-on clogging checks.',
    gameSimulationRule:
      'Active Pumping Hydroponics yields +8 Life Support and +8 Food/day while drawing -8 Power/day—and stalls (-15 Life Support, -15 Food) if Power drops below 25. Capillary PONDS draws 0 Power/day but needs manual tending (+8 Crew Fatigue/day, -6 Crew Readiness/day on Sols 3–6).',
    whyThisMatters:
      'Astronauts on long lunar stays need fresh salads, balanced nutrition, and oxygen from plants—and lessons from NASA Veggie/PONDS and the CSA Space Food Toolkit also advance sustainable farming in harsh, remote communities here on Earth.',
    rawMetrics: [
      { label: 'OSDR Study IDs', value: 'OSD-655 & OSD-780' },
      { label: 'Hardware + Partner', value: 'ISS Veggie/PONDS + CSA Toolkit' },
      { label: 'Passive Pump Power', value: '0 W (Capillary Wicking)' },
      { label: 'Active Pump Vulnerability', value: 'Stalls if Power < 25%' },
    ],
  },
  3: {
    day: 3,
    source: 'NASA LRO / Artemis',
    datasetTitle: 'Lunar South Pole Regolith Dust Charging & Eclipse Power Thermal Budgeting',
    recordId: 'LRO-LAMP-DUST-POWER-03',
    liveStatus: 'verified_cache',
    satelliteObservation:
      'NASA LRO and surface dust experiments measure electrostatically charged lunar regolith grains clinging to solar panels and radiator fins, cutting photovoltaic efficiency while crater-rim shadows plunge external temperatures below -160°C.',
    scientificInterpretation:
      'Without an atmosphere, static electricity lifts fine sharp moon dust onto solar cells, and batteries lose capacity rapidly when heaters are starved—forcing engineers to choose between immediate cabin warmth, reserve battery banks, or running regulators above rated limits.',
    gameSimulationRule:
      'Sweeping dust restores array output. Choosing Battery Storage (+15 Power, 100% Rover Battery) buffers the Sol 4 Solar Storm surge but cools the cabin overnight (+15 Crew Fatigue). Overclocking risks a Sol 7 power junction fault.',
    whyThisMatters:
      'Real lunar rovers and habitats need careful power budgets and dust-mitigation shields because cold shadows can freeze unheated electronics while overdriven power buses can trip critical breakers.',
    rawMetrics: [
      { label: 'Solar Cell Dust Loss', value: 'Up to 18–25% uncleaned' },
      { label: 'Shadow Thermal Drop', value: '-160°C external ambient' },
      { label: 'Battery Surge Margin', value: 'Buffers Sol 4 Storm Bus' },
      { label: 'Overclock Risk Flag', value: 'Sol 7 Junction Fault Risk' },
    ],
  },
  4: {
    day: 4,
    source: 'NASA DONKI',
    datasetTitle:
      'NASA DONKI Solar Flare (FLR) & OSDR RadLab Absorbed Dosimetry Calibration',
    recordId: '2024-05-14T16:51:00-FLR-001 (X8.7 / AR13664)',
    liveStatus: 'verified_cache',
    satelliteObservation:
      'NOAA/GOES X-ray sensors and SOHO coronagraphs recorded in NASA DONKI observed an X8.7 solar flare peaking at 16:51 UTC on May 14, 2024 from active region AR13664, driving a Coronal Mass Ejection (CME) faster than 1,400 km/s and elevated >10 MeV satellite proton flux, contrasted with internal absorbed dose rates cataloged in NASA OSDR RadLab.',
    scientificInterpretation:
      'CRITICAL DISTINCTION: Satellite X-ray class (X8.7) and space proton counts measure external space weather outside the Moon—NOT the internal millisievert (mSv) dose inside a shielded base! Water-filled radiation walls, habitat shielding thickness (modeled via OSDR RadLab dosimetry data), and crater cliffs absorb incoming protons before they reach the crew.',
    gameSimulationRule:
      'Max Water-Wall Shielding protects crew (+15 Shielding, modified +10 on Crater Shadow or -10 on Sunlit Ridge) at a -25 Power cost—triggering an Unbuffered Storm Bus Overload (Power < 25) if Active Pumps lack Sol 3 Battery Storage.',
    whyThisMatters:
      'Because the Moon lacks Earth’s protective magnetic field and thick air, NASA space weather forecasters pair DONKI external storm alerts with OSDR RadLab dosimetry models so astronauts activate water-wall storm shelters in time.',
    rawMetrics: [
      { label: 'Satellite Flare Class', value: 'X8.7 (External GOES X-Ray)' },
      { label: 'CME Speed Estimate', value: '>1,400 km/s (AR13664)' },
      { label: 'Dosimetry Benchmark', value: 'NASA OSDR RadLab (mSv/day)' },
      { label: 'Observation vs Dose', value: 'External Flux != Habitat mSv' },
    ],
  },
  5: {
    day: 5,
    source: 'NASA OSDR (Human Research)',
    datasetTitle: 'NASA OSDR Circadian Lighting, Fatigue & RadLab Exposure Recovery Studies',
    recordId: 'OSDR-HRP-SSLA-RADLAB-05',
    liveStatus: 'verified_cache',
    satelliteObservation:
      'NASA Human Research Program, ISS Solid-State Lighting Assembly (SSLA), and OSDR RadLab dosimetry records show off-Earth crews average ~6 hours of fragmented sleep per day without natural 24-hour sunlight cues, compounding radiation-stress fatigue and slowing reaction speed.',
    scientificInterpretation:
      'Blue-enriched daytime LED spectrum (around 460–480 nm) cues alertness, while warm amber evening spectrum (~600–620 nm), proper hydration, and scheduled rest prevent burnout. Individual exhaustion lowers precision well before medical emergencies occur.',
    gameSimulationRule:
      'Specialists above 70 Fatigue operate at half output and are forced to rest at 90. Full 24-Hour Rest restores +20 Health, -30 Fatigue, and +25 Crew Readiness for Sol 7 resilience, at a -25 Medkit cost and -8 exterior Shielding maintenance pause.',
    whyThisMatters:
      'Keeping astronauts rested, hydrated, and synced to a healthy sleep schedule is just as important for mission safety as oxygen tanks and solar panels.',
    rawMetrics: [
      { label: 'Mean Flight Sleep', value: '~6.0 hrs/night unassisted' },
      { label: 'SSLA Alert Spectrum', value: '460–480 nm Blue-Enriched' },
      { label: 'SSLA Rest Spectrum', value: '600–620 nm Warm Amber' },
      { label: 'Safety Thresholds', value: '50% output >=70 / Forced >=90' },
    ],
  },
  6: {
    day: 6,
    source: 'NASA LRO / Artemis',
    datasetTitle: 'NASA LRO Polar Cold-Trap Water-Ice Prospecting & S-Band Relay Coverage',
    recordId: 'LRO-PSR-VOLATILES-VIPER-06',
    liveStatus: 'verified_cache',
    satelliteObservation:
      'LRO Neutron Spectrometer and Diviner observations confirm hydrogen-rich deposits mixed into shadowed polar craters at 40–110 K, while rugged crater walls block direct line-of-sight radio waves unless an elevated S-band relay dish is maintained.',
    scientificInterpretation:
      'Driving a rover into a -200°C cold trap drains battery heaters rapidly to extract priceless water-ice samples. Servicing the sunlit relay dish instead ensures clean local telemetry backups if Earth radio signals get disrupted.',
    gameSimulationRule:
      'Crater Ice Extraction grants +25 Water, +15 Life Support, and +25 Science Score for -45 Rover Battery and -15 Power. Comms Dish Maintenance leaves Emergency Relay reinforced, unlocking Taha’s pre-cached autonomous lock in Sol 7 Stage 3.',
    whyThisMatters:
      'Future Artemis rovers must brave pitch-black cryogenic craters for water ice while keeping high-gain radio relays aligned with Earth across rugged lunar mountains.',
    rawMetrics: [
      { label: 'Crater Cold-Trap Temp', value: '~-200°C (73 K nominal)' },
      { label: 'Ice Extraction Draw', value: '-45 Rover Battery (Heaters)' },
      { label: 'Relay Band', value: 'S-Band High-Gain Telemetry' },
      { label: 'Sol 7 Prep Flag', value: 'Emergency Relay status' },
    ],
  },
  7: {
    day: 7,
    source: 'NASA DONKI',
    datasetTitle: 'Solar Radio Burst Ionospheric Noise & Autonomous Lunar Contingency Ops',
    recordId: 'DONKI-RBR-BLACKOUT-DAY7',
    liveStatus: 'verified_cache',
    satelliteObservation:
      'Strong solar radio bursts (Type II/IV bursts tracked in NASA space weather alerts) flood S-band and X-band radio receivers with broadband noise across the Earth–Moon link, overwhelming weak carrier signals during severe solar storm peaks.',
    scientificInterpretation:
      'When external solar radio interference severs contact with Earth Mission Control, ground flight directors cannot send real-time telemetry commands—the lunar crew must diagnose power buses, life support, and local transponders autonomously using saved logs.',
    gameSimulationRule:
      'During Sol 7 Part B & C, Earth Comms Blackout active enforces a hard service-level lockout (COMMS_BLACKOUT_ACTIVE) on Earth Control Uplink until Taha realigns the local backup carrier in Stage 3.',
    whyThisMatters:
      'Deep-space crews train to handle temporary communication blackouts on their own, applying engineering checklists and teamwork until the radio link recovers.',
    rawMetrics: [
      { label: 'Interference Type', value: 'Solar Radio Burst (Broadband)' },
      { label: 'Normal Link Delay', value: '2.6 s round-trip (Severed)' },
      { label: 'Service Lockout Code', value: 'COMMS_BLACKOUT_ACTIVE' },
      { label: 'Recovery Requirement', value: '3-Stage Autonomous Triage' },
    ],
  },
};

interface DonkiFlareSummary {
  flrID: string;
  classType: string;
  peakTime: string;
  sourceLocation: string;
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseDonkiFlareList(payload: unknown): DonkiFlareSummary[] {
  if (!Array.isArray(payload)) {
    return [];
  }
  const results: DonkiFlareSummary[] = [];
  for (const item of payload) {
    if (!isObjectRecord(item)) {
      continue;
    }
    const flrID = typeof item.flrID === 'string' ? item.flrID : null;
    const classType = typeof item.classType === 'string' ? item.classType : null;
    const peakTime = typeof item.peakTime === 'string' ? item.peakTime : null;
    const sourceLocation = typeof item.sourceLocation === 'string' ? item.sourceLocation : 'Solar Disk';
    if (flrID && classType && peakTime) {
      results.push({ flrID, classType, peakTime, sourceLocation });
    }
  }
  return results;
}

function pickStrongestFlare(flares: DonkiFlareSummary[]): DonkiFlareSummary | null {
  if (flares.length === 0) {
    return null;
  }
  const classScore = (classType: string): number => {
    const prefix = classType.charAt(0).toUpperCase();
    const magnitude = Number.parseFloat(classType.slice(1)) || 1;
    if (prefix === 'X') return 1000 + magnitude;
    if (prefix === 'M') return 100 + magnitude;
    if (prefix === 'C') return 10 + magnitude;
    return magnitude;
  };
  let best = flares[0];
  if (!best) return null;
  for (const flare of flares) {
    if (classScore(flare.classType) > classScore(best.classType)) {
      best = flare;
    }
  }
  return best;
}

function formatUtcDateDaysAgo(daysAgo: number): string {
  const now = new Date();
  const target = new Date(now.getTime() - daysAgo * 86_400_000);
  return target.toISOString().slice(0, 10);
}

/**
 * Fetches live NASA DONKI space weather records for space-weather days (Day 4 & Day 7)
 * with a strict 2.5-second AbortController timeout, falling back seamlessly to
 * `VERIFIED_NASA_DATASETS` whenever offline, rate-limited, or invalid.
 */
export async function getNasaDatasetForDay(
  day: DayNumber,
  fetchFn: typeof fetch = fetch,
): Promise<NasaScienceCardData> {
  const cached = VERIFIED_NASA_DATASETS[day];
  if (day !== 4 && day !== 7) {
    return { ...cached, rawMetrics: cached.rawMetrics.map((m) => ({ ...m })) };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 2500);

  try {
    const startDate = formatUtcDateDaysAgo(30);
    const endDate = formatUtcDateDaysAgo(0);
    const url = `https://api.nasa.gov/DONKI/FLR?startDate=${startDate}&endDate=${endDate}&api_key=DEMO_KEY`;
    const response = await fetchFn(url, { signal: controller.signal });
    if (!response.ok) {
      return { ...cached, rawMetrics: cached.rawMetrics.map((m) => ({ ...m })) };
    }
    const rawJson: unknown = await response.json();
    const flares = parseDonkiFlareList(rawJson);
    const strongest = pickStrongestFlare(flares);
    if (!strongest) {
      return { ...cached, rawMetrics: cached.rawMetrics.map((m) => ({ ...m })) };
    }

    return {
      ...cached,
      recordId: strongest.flrID,
      liveStatus: 'live',
      satelliteObservation: `Live NASA DONKI flare feed (${strongest.flrID}): NOAA/GOES sensors recorded an external ${strongest.classType}-class solar flare peaking at ${strongest.peakTime} from heliographic region ${strongest.sourceLocation}.`,
      rawMetrics: [
        { label: 'Live Flare ID', value: strongest.flrID },
        { label: 'GOES X-Ray Class', value: strongest.classType },
        { label: 'Peak Time (UTC)', value: strongest.peakTime },
        { label: 'Observation vs Dose', value: 'External Flux != Habitat mSv' },
      ],
    };
  } catch {
    return { ...cached, rawMetrics: cached.rawMetrics.map((m) => ({ ...m })) };
  } finally {
    clearTimeout(timeoutId);
  }
}
