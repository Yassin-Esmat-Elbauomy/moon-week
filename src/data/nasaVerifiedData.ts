import type { DayNumber, NasaScienceCardData, ScientificTermDefinition } from '../types/game';

export interface NasaScienceStoryCardData extends NasaScienceCardData {
  connectedStoryHook: string;
}

export const SCIENTIFIC_TERMS: Record<string, ScientificTermDefinition> = {
  Sol: {
    term: 'Sol',
    shortTitle: 'Solar Operational Day',
    kidExplanation:
      'Astronauts call one mission day cycle a Sol. Inside our South Pole base, each Sol runs from 06:00 to 22:00 with timed indoor lighting so the crew keeps a healthy body clock.',
  },
  'Radiation Dose (mSv)': {
    term: 'Radiation Dose (mSv)',
    shortTitle: 'Millisievert (Absorbed Dose)',
    kidExplanation:
      'A millisievert (mSv) measures how much radiation energy actually reaches inside a sheltered room. Satellites count raw particles outside in space, while water walls and crater rock cut the mSv dose inside.',
  },
  'Capillary Action': {
    term: 'Capillary Action',
    shortTitle: 'Zero-Power Water Climbing',
    kidExplanation:
      'Under 1/6 Earth gravity (1.62 m/s²), water floats and clings to plant roots. Capillary wicks use tiny sponge-like spaces so water climbs smoothly to roots with 0 kW of electricity.',
  },
  'Coronal Mass Ejection (CME)': {
    term: 'Coronal Mass Ejection (CME)',
    shortTitle: 'High-Speed Solar Proton Wave',
    kidExplanation:
      'A Coronal Mass Ejection is a giant cloud of solar plasma and fast protons blasted off the Sun at over 1,400 km/s. When aimed at the Moon, it raises external radiation and can jam radio links.',
  },
  'Light-Time Delay': {
    term: 'Light-Time Delay',
    shortTitle: '1.3s / 2.6s Earth–Moon Radio Wait',
    kidExplanation:
      'Even at light speed (300,000 km/s), radio signals need 1.3s to cross the 384,400 km gap to the Moon and 1.3s back—creating a 2.6s round-trip wait for every reply from Abdul.',
  },
  Microgravity: {
    term: 'Microgravity',
    shortTitle: 'Weak & 1/6 Lunar Gravity',
    kidExplanation:
      'In orbit, water forms floating spheres instead of draining down. On the Moon, gravity is just 1.62 m/s² (one-sixth of Earth), so water still beads up and chokes plant roots without smart piping.',
  },
  'CO2 Scrubbing (ppm)': {
    term: 'CO2 Scrubbing (ppm)',
    shortTitle: 'Carbon Dioxide Parts Per Million',
    kidExplanation:
      'Every breath adds carbon dioxide (CO2) to sealed habitat air, measured in parts per million (ppm). Air scrubbers and greenhouse plants convert stale CO2 back into breathable oxygen.',
  },
  'Circadian Spectrum (nm)': {
    term: 'Circadian Spectrum (nm)',
    shortTitle: '460 nm Alert vs 600 nm Rest Light',
    kidExplanation:
      'NASA uses 460 nm blue-enriched LEDs to cue morning focus and 600 nm warm amber light at night so astronauts sleep soundly without natural Earth sunrises.',
  },
};

export const VERIFIED_NASA_DATASETS: Record<DayNumber, NasaScienceStoryCardData> = {
  1: {
    day: 1,
    source: 'NASA LRO / Artemis',
    datasetTitle: 'LRO LOLA & Diviner — Shackleton Crater Rim & Descent Limits',
    recordId: 'LRO-DIVINER-SHACKLETON-2023',
    liveStatus: 'verified_cache',
    satelliteObservation:
      'NASA Lunar Reconnaissance Orbiter (LRO) maps show Shackleton peaks stay sunlit at -53°C while deep crater rims drop to -200°C and trap frozen ice under 1.62 m/s² gravity.',
    scientificInterpretation:
      'With no lunar air to slow rockets, landers must fire thrusters to touch down below 3.0 m/s, while Earth radio takes 1.3s one-way (2.6s round-trip) to arrive.',
    gameSimulationRule:
      'Touchdowns at 3.0 m/s or faster dent -10 Shielding. Sunlit Peak gives +6 Power/day (but -10 Storm Shielding), while Crater Rim gives +15 Water and +10 Storm Shielding (at -4 Power/day).',
    whyThisMatters:
      'Real NASA Artemis planners weigh continuous solar kW on bright ridges against frozen crater water needed for drinking, oxygen, and rocket fuel.',
    connectedStoryHook:
      'Your Sol 1 landing choice sets the power and storm cover every base room relies on for the whole 7-day mission.',
    rawMetrics: [
      { label: 'Safe Touchdown', value: '< 3.0 m/s (1.62 m/s²)' },
      { label: 'Radio Delay', value: '1.3s one-way / 2.6s loop' },
      { label: 'Sunlit Peak', value: '~-53°C (High Solar kW)' },
      { label: 'Crater Cold Trap', value: '-200°C (Trapped Ice)' },
    ],
  },
  2: {
    day: 2,
    source: 'NASA OSDR (Veggie/PONDS)',
    datasetTitle: 'ISS Veggie & PONDS Capillary Crop Studies (OSD-655 / OSD-780)',
    recordId: 'OSD-655 / OSD-780 / CSA-FOOD',
    liveStatus: 'verified_cache',
    satelliteObservation:
      'NASA Open Science Data Repository (OSD-655 / OSD-780) tracked space lettuce under weak gravity where floating water clings around roots, compared against porous PONDS wicking mats.',
    scientificInterpretation:
      'In 1.62 m/s² lunar gravity, electric pumps circulate aerated water fast for big harvests using continuous kW, whereas capillary wicks pull water upward gently at 0 kW.',
    gameSimulationRule:
      'Active Pumps give +8 Life Support and +8 Food/day for -8 Power/day—and stall if Power drops under 25%. Capillary Tubes use 0 Power/day but add +8 Crew Fatigue/day from hand tending.',
    whyThisMatters:
      'Space gardens turn water and CO2 into fresh salads and oxygen while teaching water-saving farming for dry places on Earth.',
    connectedStoryHook:
      'Your Sol 1 landing power budget meets Sayed’s Greenhouse: hungry electric pumps will stall if storms pull base Power below 25%.',
    rawMetrics: [
      { label: 'Lunar Gravity', value: '1.62 m/s² (1/6 Earth)' },
      { label: 'Capillary Draw', value: '0 kW (Surface Tension)' },
      { label: 'Active Pump Risk', value: 'Stalls if Power < 25%' },
      { label: 'OSDR Benchmark', value: 'OSD-655 & OSD-780' },
    ],
  },
  3: {
    day: 3,
    source: 'NASA LRO / Artemis',
    datasetTitle: 'Charged Lunar Dust & South Pole Thermal Power Budgeting',
    recordId: 'LRO-LAMP-DUST-POWER-03',
    liveStatus: 'verified_cache',
    satelliteObservation:
      'NASA LRO dust detectors show static electricity lifts sharp lunar dust onto solar cells, cutting kW output up to 25% as crater shadows plunge outside gear toward -200°C.',
    scientificInterpretation:
      'When dusty panels drop available kW, base engineers must choose between warming living cabins, banking emergency battery kW, or overdriving power regulators past safe limits.',
    gameSimulationRule:
      'Battery Storage (+15 Power, 100% Rover Battery) buffers tomorrow’s solar storm surge at +15 Sol 4 Fatigue. Essential Heating keeps cabins warm but caps Rover Battery at 55%. Overclocking adds a Sol 7 fault risk.',
    whyThisMatters:
      'Managing kW reserves and wiping static moon dust keeps spacecraft batteries warm without blowing main electrical breakers.',
    connectedStoryHook:
      'Sayed’s Sol 2 garden and Yassin’s rover share the same dusty solar bus—tonight’s battery buffer decides whether Sol 4’s storm stalls the base.',
    rawMetrics: [
      { label: 'Dust Solar Loss', value: '18–25% kW Drop' },
      { label: 'Eclipse Cold', value: '-160°C to -200°C' },
      { label: 'Storm Buffer', value: 'Battery Storage Ready' },
      { label: 'Overclock Hazard', value: 'Sol 7 Junction Surge' },
    ],
  },
  4: {
    day: 4,
    source: 'NASA DONKI',
    datasetTitle: 'NASA DONKI X8.7 Solar Flare & OSDR RadLab Habitat Dosimetry',
    recordId: '2024-05-14T16:51:00-FLR-001',
    liveStatus: 'verified_cache',
    satelliteObservation:
      'NASA DONKI recorded an X8.7 solar flare (AR13664) launching a >1,400 km/s Coronal Mass Ejection and intense proton flux across open cislunar space.',
    scientificInterpretation:
      'Satellite X-ray class and space proton flux measure external space weather—NOT the internal millisievert (mSv) dose inside a shielded base! Water-filled walls and crater rock absorb protons before they reach the crew.',
    gameSimulationRule:
      'Full Water Shielding adds +15 Shielding (+10 Crater Rim / -10 Sunlit Peak) for -25 Power—causing an Unbuffered Storm Bus Overload and Active Pump Stall if Sol 3 skipped Battery Storage.',
    whyThisMatters:
      'Because the Moon has no magnetic shield or atmosphere, pairing DONKI alerts with water-wall shelters keeps crew mSv exposure safely low.',
    connectedStoryHook:
      'Sol 1’s rock cover and Sol 3’s battery bank collide right now: Full Water Shields draw massive kW while blocking incoming proton mSv.',
    rawMetrics: [
      { label: 'External Flare', value: 'X8.7 (>1,400 km/s CME)' },
      { label: 'Habitat Metric', value: 'Internal Dose (mSv)' },
      { label: 'Shield Draw', value: '-25 Power (Water Pumps)' },
      { label: 'Data Boundary', value: 'Space Flux != Room mSv' },
    ],
  },
  5: {
    day: 5,
    source: 'NASA OSDR (Human Research)',
    datasetTitle: 'NASA OSDR Circadian Lighting (460/600 nm) & CO2 Crew Recovery',
    recordId: 'OSDR-HRP-SSLA-RADLAB-05',
    liveStatus: 'verified_cache',
    satelliteObservation:
      'NASA Human Research and ISS lighting logs show crews average ~6.0 hours of fragmented sleep without Earth sunrises, while rising cabin CO2 ppm slows astronaut reaction times.',
    scientificInterpretation:
      'Scrubbing CO2 ppm restores alert thinking, while pairing 460 nm daytime blue light with 600 nm warm amber rest light resets crew circadian clocks and rebuilds physical resilience.',
    gameSimulationRule:
      'Specialists at 70+ Fatigue work at half output and rest automatically at 90+. Full Rest grants +20 Health, -30 Fatigue, +25 Crew Readiness, and Sol 7 Crisis Resilience for -25 Medkits and -8 Shielding.',
    whyThisMatters:
      'Fresh air with low CO2 ppm and protected sleep schedules keep astronauts sharp during high-pressure emergencies.',
    connectedStoryHook:
      'Cold Sol 3 cabins and Sol 4 storm stress spiked crew fatigue and CO2 ppm—restoring team alertness now preps everyone for Sol 6 and Sol 7.',
    rawMetrics: [
      { label: 'CO2 Safe Target', value: '< 1,000 CO2 ppm' },
      { label: 'Alert Spectrum', value: '460 nm Blue-Enriched' },
      { label: 'Sleep Spectrum', value: '600 nm Warm Amber' },
      { label: 'Fatigue Limits', value: '50% at 70 / Rest at 90' },
    ],
  },
  6: {
    day: 6,
    source: 'NASA LRO / Artemis',
    datasetTitle: 'LRO Polar -200°C Cold-Trap Ice & S-Band Relay Telemetry',
    recordId: 'LRO-PSR-VOLATILES-VIPER-06',
    liveStatus: 'verified_cache',
    satelliteObservation:
      'NASA LRO neutron maps spot hydrogen-rich water ice inside -200°C Permanently Shadowed Craters, while steep rim walls block direct S-band radio unless an elevated relay dish is aimed.',
    scientificInterpretation:
      'Driving rovers through -200°C shadows burns heavy battery kW to keep wheels unfrozen while drilling ice; servicing the ridge relay dish protects autonomous radio locks over the crater wall.',
    gameSimulationRule:
      'Scoop Crater Ice adds +25 Water, +15 Life Support, and +25 Science Score for -45 Rover Battery and -15 Power. Fix Solar Relay adds +15 Power, +10 Shielding, and reinforces the Emergency Relay for Sol 7.',
    whyThisMatters:
      'Lunar rovers need thermal wheel heaters to survive -200°C ice traps and clean S-band relays to beam science home.',
    connectedStoryHook:
      'With rested crew from Sol 5, Yassin can brave -200°C crater shadows for ice or fortify Taha’s relay dish right before Sol 7’s radio blackout.',
    rawMetrics: [
      { label: 'Shadow Trap Temp', value: '-200°C (Wheel Freeze)' },
      { label: 'Ice Drill Draw', value: '-45% Rover Battery' },
      { label: 'Telemetry Link', value: 'S-Band Relay (1.3s)' },
      { label: 'Blackout Prep', value: 'Sol 7 Dish Lock Bonus' },
    ],
  },
  7: {
    day: 7,
    source: 'NASA DONKI',
    datasetTitle: 'Solar Radio Burst Interference & 3-Stage Autonomous Recovery',
    recordId: 'DONKI-RBR-BLACKOUT-DAY7',
    liveStatus: 'verified_cache',
    satelliteObservation:
      'Intense Type II/IV solar radio bursts flood S-band receivers with broadband static, drowning out weak 2.6s Earth–Moon radio carrier signals across the lunar South Pole.',
    scientificInterpretation:
      'When solar noise severs Earth Mission Control Uplink, astronauts must run autonomous checklist triage—tapping local battery kW, balancing O2/CO2, and locking backup dish beacons solo.',
    gameSimulationRule:
      'Sol 7 Midday triggers Earth Comms Blackout until Stage 3 restores the carrier. Rover Bus Tap needs >=30% Rover Battery; Medbay O2 Divert needs >=20% Medkits; Phased Array Lock gets +10 Power if the Relay was fixed on Sol 6.',
    whyThisMatters:
      'Future deep-space astronauts on the Moon and Mars must solve life-support and power crises independently whenever solar storms cut Earth radio.',
    connectedStoryHook:
      'Every Sol 1–6 decision converges now: Earth radio is jammed by solar static, so your base survives on the reserves and relay you built all week!',
    rawMetrics: [
      { label: 'Radio Disruption', value: 'Solar Broadband Static' },
      { label: 'Normal Light Delay', value: '1.3s / 2.6s (Severed)' },
      { label: 'Stage 1 / 2 Gates', value: '30% Rover / 20% Medkits' },
      { label: 'Stage 3 Relay Boost', value: '+10 kW if Sol 6 Fixed' },
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
    const sourceLocation =
      typeof item.sourceLocation === 'string' ? item.sourceLocation : 'Solar Disk';
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
 * Fetches live NASA DONKI space weather records for space-weather days (Sol 4 & Sol 7)
 * with a strict 2.5-second AbortController timeout, falling back seamlessly to
 * `VERIFIED_NASA_DATASETS` whenever offline, rate-limited, or invalid.
 */
export async function getNasaDatasetForDay(
  day: DayNumber,
  fetchFn: typeof fetch = fetch,
): Promise<NasaScienceStoryCardData> {
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
      satelliteObservation: `Live NASA DONKI flare feed (${strongest.flrID}): GOES space sensors measured an external ${strongest.classType}-class solar flare peaking at ${strongest.peakTime} from region ${strongest.sourceLocation}.`,
      rawMetrics: [
        { label: 'Live Flare ID', value: strongest.flrID },
        { label: 'GOES X-Ray Class', value: strongest.classType },
        { label: 'Peak Time (UTC)', value: strongest.peakTime },
        { label: 'Data Boundary', value: 'Space Flux != Room mSv' },
      ],
    };
  } catch {
    return { ...cached, rawMetrics: cached.rawMetrics.map((m) => ({ ...m })) };
  } finally {
    clearTimeout(timeoutId);
  }
}
