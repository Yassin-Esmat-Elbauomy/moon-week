import type {
  DailyScenarioSpec,
  Day7StageSpec,
  DayNumber,
  GameState,
  StageCrisisSpec,
} from '../types/game';

export type { Day7StageSpec, StageCrisisSpec };

export interface ConnectedDailyScenarioSpec extends DailyScenarioSpec {
  middayBriefing: string;
  storyRippleFallback: string;
}

export const DAY7_STAGE_SPECS: Record<1 | 2 | 3, Day7StageSpec> = {
  1: {
    stage: 1,
    title: 'Power Bus Rescue',
    featuredCrew: ['albaraa', 'yassin'],
    miniGame: 'power_grid',
    prompt: 'Solar static cut Earth radio and rattled our main bus! Pick an emergency power fix.',
    options: [
      {
        choiceId: '7_1A_rover_bus_tap',
        label: 'Tap Rover Auxiliary Batteries',
        shortSummary: 'Links Yassin’s rover battery pack directly to base life support.',
        immediateDeltas: { roverBattery: -35, power: 15, lifeSupport: 5 },
        compoundingSummary: 'Clean +15 Power & +5 Life Support. Requires >=30% Rover Battery.',
        requires: {
          label: 'Needs 30% Rover Battery',
          check: (state) => state.sub.roverBattery >= 30,
        },
        badgeColor: 'sky',
      },
      {
        choiceId: '7_1B_manual_bypass',
        label: 'Manual Junction Bypass',
        shortSummary: 'Jumpers power buses by hand to spare the rover battery.',
        immediateDeltas: { power: 5, crewReadiness: -10, crewFatigue: 10 },
        compoundingSummary: 'Adds +10 Fatigue & -10 Morale. Sol 3 Overclock fault cuts -8 Shield.',
        badgeColor: 'amber',
      },
    ],
  },
  2: {
    stage: 2,
    title: 'Cabin O2 & Biosphere',
    featuredCrew: ['sayed', 'omar'],
    miniGame: 'greenhouse',
    prompt: 'CO2 ppm is rising inside Habitat Core! Choose how to restore breathable oxygen.',
    options: [
      {
        choiceId: '7_2A_medbay_o2_divert',
        label: 'Divert Medbay O2 & Warmth',
        shortSummary: 'Shares spare Medbay oxygen tanks and heat with Greenhouse crops.',
        immediateDeltas: {
          medicalSupplies: -20,
          lifeSupport: 15,
          crewReadiness: 10,
          scienceScore: 10,
        },
        compoundingSummary: 'Full Rest resilience adds +5 Morale. Requires >=20% Medical Supplies.',
        requires: {
          label: 'Needs 20% Med Supplies',
          check: (state) => state.sub.medicalSupplies >= 20,
        },
        badgeColor: 'mint',
      },
      {
        choiceId: '7_2B_seal_greenhouse',
        label: 'Seal Outer Greenhouse',
        shortSummary: 'Isolates outer plant racks and switches crew to stored rations.',
        immediateDeltas: {
          lifeSupport: 5,
          foodAndSupplies: -15,
          crewReadiness: -8,
          scienceScore: -5,
        },
        compoundingSummary: 'Preserves Medkits, but loses -15 Food, -8 Morale, and -5 Science.',
        badgeColor: 'amber',
      },
    ],
  },
  3: {
    stage: 3,
    title: 'S-Band Carrier Lock',
    featuredCrew: ['taha'],
    miniGame: 'rover_surface',
    prompt: 'Final step: punch through solar radio static to reconnect Abdul on Earth!',
    options: [
      {
        choiceId: '7_3A_phased_array_lock',
        label: 'Autonomous Phased-Array Lock',
        shortSummary: 'Aims Taha’s high-gain dish through the storm using local telemetry.',
        immediateDeltas: { power: 10, shielding: 10, scienceScore: 15 },
        compoundingSummary: '+10 Power & +15 Science if Sol 6 Relay reinforced; else -15 Power.',
        badgeColor: 'purple',
      },
      {
        choiceId: '7_3B_emergency_beacon',
        label: 'Low-Power Emergency Beacon',
        shortSummary: 'Transmits a steady low-watt pulse until Earth locks onto our base.',
        immediateDeltas: { power: -5, shielding: 5, crewReadiness: 5, scienceScore: 0 },
        compoundingSummary: 'Safe low draw (-5 Power), +5 Shield, and +5 Morale recovery.',
        badgeColor: 'sky',
      },
    ],
  },
};

export const DAILY_SCENARIOS: Record<DayNumber, ConnectedDailyScenarioSpec> = {
  1: {
    day: 1,
    title: 'Shackleton Descent & Base Site',
    featuredCrew: ['albaraa'],
    morningBriefing: 'Land gently under 3.0 m/s in 1.62 m/s² lunar gravity across the 2.6s Earth radio lag!',
    middayBriefing: 'Touchdown jolted our guidance gyro—level it in Command Bridge before nightfall.',
    storyRippleFallback: 'Sol 1 sets our outpost location, shaping solar kW, water ice, and storm rock cover all week.',
    signatureMiniGame: 'lunar_lander',
    anomaly: {
      id: 'anomaly_day1',
      day: 1,
      roomId: 'control_room',
      specialistId: 'albaraa',
      title: 'Fix Tilted Gyro',
      description: 'Landing shock tilted the base gyro. Recenter it before evening!',
      affectedMeter: 'crewReadiness',
    },
    eveningPrompt: 'Touchdown complete! Where should we anchor our permanent Moon base?',
    options: [
      {
        choiceId: '1A_sunlit_ridge',
        label: 'Sunlit Peak',
        shortSummary: 'High bright ridge generating steady solar kW all week.',
        immediateDeltas: { power: 10, waterAvailability: -10, lifeSupport: -5 },
        compoundingSummary: '+6 Power every morning, but open sky cuts -10 Shielding in Sol 4 storms.',
        badgeColor: 'amber',
      },
      {
        choiceId: '1B_crater_shadow',
        label: 'Crater Shadow Rim',
        shortSummary: 'Rocky crater edge beside frozen -200°C water-ice deposits.',
        immediateDeltas: { power: -10, waterAvailability: 15, lifeSupport: 10 },
        compoundingSummary: '+10 Storm Shielding from crater walls, but shadows trim -4 Power/day.',
        badgeColor: 'sky',
      },
    ],
  },
  2: {
    day: 2,
    title: 'Lunar Hydroponics & Capillary Roots',
    featuredCrew: ['sayed'],
    morningBriefing: 'In weak 1/6g (1.62 m/s²), water floats into balls—wire Sayed’s Greenhouse safely!',
    middayBriefing: 'Pressure drops trapped air bubbles in the garden pipe—bleed the valve to restore O2!',
    storyRippleFallback: 'Yesterday’s landing power now feeds Sayed’s garden pumps and food loops.',
    signatureMiniGame: 'greenhouse',
    anomaly: {
      id: 'anomaly_day2',
      day: 2,
      roomId: 'greenhouse',
      specialistId: 'sayed',
      title: 'Clear Pipe Air Bubble',
      description: 'Low-gravity bubbles blocked garden water flow. Bleed the pipe valve!',
      affectedMeter: 'lifeSupport',
    },
    eveningPrompt: 'Our Greenhouse is online! How should we feed water to plant roots every day?',
    options: [
      {
        choiceId: '2A_active_pumps',
        label: 'Electric Water Pumps',
        shortSummary: 'Circulates water fast for +8 Life Support & +8 Food every day.',
        immediateDeltas: {
          power: -10,
          waterAvailability: -10,
          foodAndSupplies: 15,
          lifeSupport: 10,
          scienceScore: 10,
        },
        compoundingSummary: 'Draws -8 Power/day and stalls if base Power ever drops below 25%.',
        badgeColor: 'mint',
      },
      {
        choiceId: '2B_capillary_ponds',
        label: 'Capillary Water Tubes',
        shortSummary: 'Uses porous wicks so water climbs on its own at 0 kW.',
        immediateDeltas: {
          power: 0,
          waterAvailability: -5,
          foodAndSupplies: 6,
          lifeSupport: 5,
          scienceScore: 10,
        },
        compoundingSummary: 'Draws 0 Power/day, though hand tending adds +8 Crew Fatigue/day.',
        badgeColor: 'sky',
      },
    ],
  },
  3: {
    day: 3,
    title: 'Lunar Dust & Power Grid Crunch',
    featuredCrew: ['taha'],
    morningBriefing: 'Electrostatic orange dust dimmed our solar kW right before tomorrow’s solar storm!',
    middayBriefing: 'Regolith dust sparked a breaker overload in Power Core—clear dust and balance kW!',
    storyRippleFallback: 'Sol 2 plant pumps and heaters share one bus; tonight’s buffer faces tomorrow’s storm.',
    signatureMiniGame: 'power_grid',
    anomaly: {
      id: 'anomaly_day3',
      day: 3,
      roomId: 'power_station',
      specialistId: 'albaraa',
      title: 'Sweep Dust Bus Surge',
      description: 'Charged moon dust shorted a solar junction. Clear and reset it!',
      affectedMeter: 'power',
    },
    eveningPrompt: 'Dusty panels left scarce kW as shadows drop to -160°C. Pick tonight’s power plan!',
    options: [
      {
        choiceId: '3A_essential_heating',
        label: 'Warm Base Cabins',
        shortSummary: 'Keeps heaters full on for crew comfort instead of banking batteries.',
        immediateDeltas: { lifeSupport: 10, crewReadiness: 5, power: -10 },
        compoundingSummary: 'Caps Rover Battery at 55% and leaves no buffer for Sol 4 shields.',
        badgeColor: 'mint',
      },
      {
        choiceId: '3B_battery_storage',
        label: 'Bank Battery Storage',
        shortSummary: 'Stores emergency kW and fills Rover Battery to 100% in cooler rooms.',
        immediateDeltas: {
          power: 15,
          scienceScore: 20,
          lifeSupport: -12,
          crewReadiness: -8,
        },
        compoundingSummary: 'Protects Sol 4 storm shields! Cool rooms add +15 Fatigue tomorrow.',
        badgeColor: 'sky',
      },
      {
        choiceId: '3C_overclock_regulators',
        label: 'Overclock Regulators',
        shortSummary: 'Pushes power regulators above rated kW limits to run heat and labs together.',
        immediateDeltas: {
          power: 10,
          lifeSupport: 5,
          scienceScore: 10,
          crewFatigue: 15,
          crewReadiness: -10,
        },
        compoundingSummary: 'Instant boost, but strains hardware for a -10 Power fault on Sol 7!',
        badgeColor: 'purple',
      },
    ],
  },
  4: {
    day: 4,
    title: 'X-Class Solar Storm & Water Walls',
    featuredCrew: ['taha'],
    morningBriefing: 'DONKI tracked an X8.7 solar flare! Aim shield barriers to keep room mSv safe.',
    middayBriefing: 'Proton bursts scrambled Science Lab sensors—filter space noise from true base dose!',
    storyRippleFallback: 'Sol 1 terrain and Sol 3 batteries decide how smoothly your grid powers full shields.',
    signatureMiniGame: 'radiation',
    anomaly: {
      id: 'anomaly_day4',
      day: 4,
      roomId: 'science_lab',
      specialistId: 'sayed',
      title: 'Recalibrate RadLab Sensor',
      description: 'Solar protons shook internal dosimeters. Zero out false alarms!',
      affectedMeter: 'shielding',
    },
    eveningPrompt: 'The proton storm arrived! Set your habitat shielding strength for tonight.',
    options: [
      {
        choiceId: '4A_max_shielding',
        label: 'Full Water-Wall Shield',
        shortSummary: 'Pumps water into habitat walls to block incoming storm radiation.',
        immediateDeltas: { shielding: 15, crewReadiness: 5, power: -25 },
        compoundingSummary: 'Heavy -25 Power draw! Stalls unbuffered Active Pumps if Power < 25%.',
        badgeColor: 'sky',
      },
      {
        choiceId: '4B_partial_shielding',
        label: 'Partial Storm Shield',
        shortSummary: 'Saves electrical kW while letting a higher mSv dose reach the habitat.',
        immediateDeltas: {
          power: -10,
          scienceScore: 15,
          shielding: -20,
          crewReadiness: -15,
          crewHealth: -12,
        },
        compoundingSummary: 'Saves kW now, but crew radiation recovery costs -10 Medkits on Sol 5.',
        badgeColor: 'amber',
      },
    ],
  },
  5: {
    day: 5,
    title: 'CO2 Scrubbing & Circadian Reset',
    featuredCrew: ['omar'],
    morningBriefing: 'Storm stress pushed CO2 ppm high—scrub stale air and tune 460/600 nm crew lights!',
    middayBriefing: 'Habitat Core’s main CO2 scrubber clogged—swap the filter before reflexes drop.',
    storyRippleFallback: 'Chilly Sol 3 nights and Sol 4 storm stress strained health, medkits, and sleep.',
    signatureMiniGame: 'medbay',
    anomaly: {
      id: 'anomaly_day5',
      day: 5,
      roomId: 'main_habitat',
      specialistId: 'omar',
      title: 'Swap CO2 Air Filter',
      description: 'Rising CO2 ppm clogged the scrubber canister. Pop in a fresh filter!',
      affectedMeter: 'lifeSupport',
    },
    eveningPrompt: 'How should the crew recover tonight before tomorrow’s crater rover trek?',
    options: [
      {
        choiceId: '5A_full_rest',
        label: 'Full 24h Rest & Recovery',
        shortSummary: 'Switches cabin LEDs to 600 nm amber rest light with full Medbay care.',
        immediateDeltas: {
          crewHealth: 20,
          crewFatigue: -30,
          crewReadiness: 25,
          medicalSupplies: -25,
          lifeSupport: -5,
          shielding: -8,
        },
        compoundingSummary: 'Builds Crisis Resilience (+5 Morale on Sol 7) at -25 Medkit cost.',
        badgeColor: 'mint',
      },
      {
        choiceId: '5B_rationed_split_shift',
        label: 'Rationed Split Shift',
        shortSummary: 'Conserves Medkits and logs late-night lab work on lighter rest.',
        immediateDeltas: {
          crewHealth: 8,
          crewFatigue: -10,
          crewReadiness: 8,
          medicalSupplies: -5,
          scienceScore: 10,
        },
        compoundingSummary: 'Saves Medkits & gains +10 Science, but fatigue trims -8 Sol 7 Morale.',
        badgeColor: 'amber',
      },
    ],
  },
  6: {
    day: 6,
    title: 'Crater -200°C Ice & Relay Scout',
    featuredCrew: ['yassin'],
    morningBriefing: 'Steer Yassin’s rover around -200°C frost traps and raise the S-band dish over ridges!',
    middayBriefing: 'Electrostatic dust frosted the Robotics Bay seal—wipe it clean before nightfall.',
    storyRippleFallback: 'Sol 5 rest and Sol 3 battery charge determine how far Yassin’s rover can climb.',
    signatureMiniGame: 'rover_surface',
    anomaly: {
      id: 'anomaly_day6',
      day: 6,
      roomId: 'robotics_bay',
      specialistId: 'yassin',
      title: 'Clean Frosty Airlock Seal',
      description: 'Cryo dust froze onto the rover airlock gasket. Clean and reseal it!',
      affectedMeter: 'shielding',
    },
    eveningPrompt: 'Rover charge is limited. Pick Yassin’s final surface task before tomorrow!',
    options: [
      {
        choiceId: '6A_crater_ice',
        label: 'Extract Crater Water Ice',
        shortSummary: 'Braves -200°C shadows to drill frozen water for air and science.',
        immediateDeltas: {
          waterAvailability: 25,
          lifeSupport: 15,
          scienceScore: 25,
          power: -15,
          roverBattery: -45,
        },
        compoundingSummary: 'Massive +25 Water & +25 Science! Leaves Emergency Relay unserviced.',
        badgeColor: 'purple',
      },
      {
        choiceId: '6B_comms_maintenance',
        label: 'Reinforce Solar & S-Band Relay',
        shortSummary: 'Cleans outer panels and locks Taha’s elevated backup dish.',
        immediateDeltas: { power: 15, shielding: 10, scienceScore: 5, roverBattery: -25 },
        compoundingSummary: 'Reinforces Emergency Relay, granting +10 Power & +15 Science in Sol 7 Stage 3!',
        badgeColor: 'sky',
      },
    ],
  },
  7: {
    day: 7,
    title: 'Solar Radio Blackout Rescue',
    featuredCrew: ['albaraa'],
    morningBriefing: 'Earth’s 2.6s uplink is crackling with solar static—brace the power grid before blackout!',
    middayBriefing: 'Total Comms Blackout! Solar radio noise cut Houston—clear local Comms Room static!',
    storyRippleFallback: 'Every Sol 1–6 reserve and relay choice converges now as the crew runs solo.',
    signatureMiniGame: 'power_grid',
    anomaly: {
      id: 'anomaly_day7',
      day: 7,
      roomId: 'comms_room',
      specialistId: 'taha',
      title: 'Clear Solar Dish Static',
      description: 'Type II solar radio bursts jammed the Comms Dish. Filter the noise spike!',
      affectedMeter: 'shielding',
    },
    eveningPrompt: 'Earth Mission Control is silent! Complete all 3 autonomous recovery stages.',
    options: DAY7_STAGE_SPECS[1].options,
  },
};

export function getDynamicStoryRipple(state: Readonly<GameState>): string {
  const { day, flags } = state;

  switch (day) {
    case 1:
      return 'Sol 1 sets our anchor: touchdown speed (< 3.0 m/s) and landing site shape Power, Water, and Storm Cover all week.';
    case 2: {
      const siteNote =
        flags.landingSite === 'sunlit_ridge'
          ? 'Sol 1 Sunlit Peak gives +6 Power/day for pumps, with tighter starting Water.'
          : flags.landingSite === 'crater_shadow'
            ? 'Sol 1 Crater Rim gave +15 Water & +10 Storm Cover, at -4 Power/day.'
            : 'Sol 1 landing reserves set today’s starting Power and Water baseline.';
      return flags.hardLandingPenaltyApplied
        ? `${siteNote} Hard landing (>3.0 m/s) also dented -10 Shielding.`
        : siteNote;
    }
    case 3: {
      const farmNote =
        flags.farmingMode === 'active_pumps'
          ? 'Sol 2 Electric Pumps boost food & O2 (+8/day) but draw -8 Power/day and stall below 25%.'
          : flags.farmingMode === 'capillary_ponds'
            ? 'Sol 2 Capillary Tubes draw 0 Power/day while adding +8 Crew Fatigue/day.'
            : 'Sol 2 garden pipes share the same solar bus we are balancing today.';
      return farmNote;
    }
    case 4: {
      const batteryNote =
        flags.day3Allocation === 'battery_storage'
          ? 'Sol 3 Battery Storage buffered our grid for tonight’s -25 Power storm shield surge.'
          : flags.day3Allocation === 'overclock_regulators'
            ? 'Sol 3 Overclocking added hardware fault risk—and left Electric Pumps unbuffered for storms!'
            : 'Sol 3 Essential Heating left no storm battery buffer—watch Power if Active Pumps run!';
      return batteryNote;
    }
    case 5: {
      if (flags.activePumpsStalled) {
        return 'Yesterday’s Unbuffered Storm Overload stalled Greenhouse pumps (-15 Air & Food)—crew recovery is critical!';
      }
      if (flags.day4Protocol === 'partial_shielding') {
        return 'Partial shielding on Sol 4 cost -10 Medkits today; combine fresh CO2 scrubbing with deep rest.';
      }
      if (flags.day3Allocation === 'battery_storage') {
        return 'Full shields held during Sol 4’s storm, though chilly Sol 3 nights added +15 fatigue heading into Medbay.';
      }
      return 'After weathering Sol 4’s X-class flare, today’s CO2 scrubbing and rest reset crew sharpness.';
    }
    case 6: {
      const restNote = flags.crisisResilience
        ? 'Sol 5 Full Rest locked in Crisis Resilience (+5 Sol 7 Morale) for today’s rover mission.'
        : 'Sol 5 Split Shifts boosted Science (+10), leaving fatigue to watch on today’s -200°C drive.';
      return `${restNote} Rover Battery: ${Math.round(state.sub.roverBattery)}%.`;
    }
    case 7: {
      const parts: string[] = [];
      parts.push(
        flags.relayReinforced
          ? 'Sol 6 Relay reinforced (+10 Power unlock in Stage 3)'
          : 'Sol 6 Relay unreinforced (Stage 3 array lock costs -15 Power)',
      );
      if (flags.hardwareFaultRisk) {
        parts.push('Sol 3 Overclock fault risk active');
      }
      if (flags.activePumpsStalled) {
        parts.push('Greenhouse active pumps stalled');
      }
      if (flags.crisisResilience) {
        parts.push('Sol 5 Crisis Resilience ready');
      }
      return `${parts.join(' • ')}.`;
    }
    default: {
      const _exhaustive: never = day;
      return _exhaustive;
    }
  }
}
