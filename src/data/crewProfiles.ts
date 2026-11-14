import type {
  CrewExpression,
  CrewId,
  CrewProfile,
  DayNumber,
  OnBaseCrewId,
} from '../types/game';

export const ON_BASE_CREW_IDS: readonly OnBaseCrewId[] = [
  'albaraa',
  'omar',
  'taha',
  'yassin',
  'sayed',
];

export const ALL_CREW_IDS: readonly CrewId[] = [
  'albaraa',
  'omar',
  'taha',
  'yassin',
  'sayed',
  'abdelrahman',
];

export interface MiddayBeat {
  specialistId: CrewId;
  greeting: string;
  advice: string;
  expression: CrewExpression;
}

export const CREW_MIDDAY_BEATS: Record<DayNumber, MiddayBeat> = {
  1: {
    specialistId: 'albaraa',
    greeting: 'Touchdown shock tilted our gyro! Reset it now so base sensors stay level.',
    advice: 'A tilted gyro hurts Crew Morale if we leave it uncalibrated past midday.',
    expression: 'alert',
  },
  2: {
    specialistId: 'sayed',
    greeting: 'Weak 1.62 m/s² gravity trapped air bubbles in the garden loop! Bleed that valve fast.',
    advice: 'Floating air pockets starve roots of water and drop Life Support oxygen.',
    expression: 'concerned',
  },
  3: {
    specialistId: 'albaraa',
    greeting: 'Electrostatic moon dust spiked the Power Core bus! Sweep panels and balance kW now.',
    advice: 'Uncleaned dust cuts solar kW right when heaters and science rigs pull heavy current.',
    expression: 'alert',
  },
  4: {
    specialistId: 'sayed',
    greeting: 'Solar protons from the X-class flare rattled our Science Lab radar! Recalibrate it.',
    advice: 'Remember: outside satellite flux is NOT the internal mSv dose inside our water walls.',
    expression: 'surprised',
  },
  5: {
    specialistId: 'omar',
    greeting: 'CO2 ppm is climbing in Habitat Core and slowing crew reflexes! Swap the scrubber filter.',
    advice: 'Scrubbing CO2 back into clean O2 restores sharp focus before tomorrow’s rover sortie.',
    expression: 'worried',
  },
  6: {
    specialistId: 'yassin',
    greeting: 'Sharp regolith dust jammed the Robotics airlock seal in -200°C cold! Wipe it clean.',
    advice: 'Sealing the airlock protects internal pressure and Shielding before rover launch.',
    expression: 'concerned',
  },
  7: {
    specialistId: 'taha',
    greeting: 'Broadband solar static just severed Earth Control! Clear local noise on the Comms Dish.',
    advice: 'Abdul’s 2.6s link is down, so our crew runs the 3-stage rescue solo.',
    expression: 'alert',
  },
};

export const CREW_PROFILES: Record<CrewId, CrewProfile> = {
  albaraa: {
    id: 'albaraa',
    name: 'AlBaraa Mohammad',
    role: 'Flight Engineer',
    stationName: 'Power Room',
    roomId: 'power_station',
    specialty: 'Balances solar kW, base heaters, and battery reserves.',
    accentColor: '#FFD66B',
    visorTint: '#79C8E8',
    isRemote: false,
    templateFeatures: {
      skinTone: '#E8B892',
      hairColor: '#2B1F1A',
      hairStyle: 'short_wave',
      hasGlasses: false,
      facialHair: 'light_stubble',
    },
    dayDialogues: {
      1: {
        greeting: 'Lander thrusters armed! Touch down under 3.0 m/s in 1.62 m/s² lunar gravity.',
        advice: 'Sunlit Peak brings steady solar kW; Crater Rim trades sun for ice and rock cover.',
        expression: 'happy',
      },
      2: {
        greeting: 'Base landing power is wired straight into Sayed’s Greenhouse pumps.',
        advice: 'Electric pumps grow food fast, but stall instantly if Power drops below 25%.',
        expression: 'focused',
      },
      3: {
        greeting: 'Static moon dust is coating our solar wings while shadows freeze outside gear!',
        advice: 'Bank battery power tonight so tomorrow’s storm shields never trip our pumps.',
        expression: 'alert',
      },
      4: {
        greeting: 'X-class solar flare inbound! Full water-wall shielding draws -25 Power.',
        advice: 'Saved Sol 3 batteries absorb this storm surge; overclocked lines carry risk.',
        expression: 'worried',
      },
      5: {
        greeting: 'Our power grid weathered the storm! Now stale CO2 and tiredness are catching up.',
        advice: 'Protect crew rest tonight so engineers stay sharp for Yassin’s rover trek.',
        expression: 'normal',
      },
      6: {
        greeting: 'I topped off Yassin’s rover pack—crater -200°C cold traps drain heaters fast!',
        advice: 'Reinforcing Taha’s solar relay today boosts our power margin if radio fails.',
        expression: 'focused',
      },
      7: {
        greeting: 'Solar static just killed Earth radio! Our power bus is wobbling from the week’s strain.',
        advice: 'Tap the rover battery if we have 30% charge, or wire a careful manual bypass.',
        expression: 'alert',
      },
    },
  },
  omar: {
    id: 'omar',
    name: 'Omar Badr',
    role: 'Medical Officer',
    stationName: 'Medbay',
    roomId: 'medbay',
    specialty: 'Guards CO2 air quality, sleep clocks, and crew morale.',
    accentColor: '#9BD8A7',
    visorTint: '#9BD8A7',
    isRemote: false,
    templateFeatures: {
      skinTone: '#F1C6A5',
      hairColor: '#3B2A20',
      hairStyle: 'neat_crop',
      hasGlasses: true,
      facialHair: 'none',
    },
    dayDialogues: {
      1: {
        greeting: 'Landing straps secure! Smooth touchdown below 3.0 m/s keeps every astronaut safe.',
        advice: 'Balanced water and air from Sol 1 keeps crew health high all week.',
        expression: 'happy',
      },
      2: {
        greeting: 'Fresh Greenhouse greens boost morale after yesterday’s dusty landing!',
        advice: 'Zero-power capillary wicks save electricity, though hand tending adds crew fatigue.',
        expression: 'normal',
      },
      3: {
        greeting: 'If we cut cabin heat for battery reserves tonight, cold rooms will tire everyone.',
        advice: 'Watch Medbay readiness on Sol 5 if you chill cabins or overclock hardware.',
        expression: 'concerned',
      },
      4: {
        greeting: 'Storm shelter doors sealed! Water walls keep internal mSv radiation safe.',
        advice: 'Skipping full shielding hurts crew health and drains Medkits tomorrow.',
        expression: 'focused',
      },
      5: {
        greeting: 'Cabin CO2 ppm crept up during the storm lockdown! Let’s scrub air and reset sleep clocks.',
        advice: 'Use 460 nm blue light for focus, 600 nm amber for deep rest, and save Medkits.',
        expression: 'concerned',
      },
      6: {
        greeting: 'Rested astronauts react faster while guiding Yassin across -200°C crater shadows.',
        advice: 'Keep at least 20% Medbay supplies buffered for emergencies.',
        expression: 'normal',
      },
      7: {
        greeting: 'Earth radio is silent, Commander, so I’m watching cabin O2 and CO2 ppm closely.',
        advice: 'Share spare Medbay oxygen with Sayed’s plants if air reserves drop.',
        expression: 'focused',
      },
    },
  },
  taha: {
    id: 'taha',
    name: 'Taha Yasin',
    role: 'Comms Officer',
    stationName: 'Comms Room',
    roomId: 'comms_room',
    specialty: 'Aligns S-band dishes, storm shields, and Earth uplinks.',
    accentColor: '#79C8E8',
    visorTint: '#79C8E8',
    isRemote: false,
    templateFeatures: {
      skinTone: '#DDA982',
      hairColor: '#1E1B18',
      hairStyle: 'fade',
      hasGlasses: false,
      facialHair: 'neat_beard',
    },
    dayDialogues: {
      1: {
        greeting: 'S-band dish locked onto Earth! Every radio message takes 2.6s round-trip.',
        advice: 'Because signals lag 1.3s each way, you fly the final descent locally.',
        expression: 'happy',
      },
      2: {
        greeting: 'Telemetry from Sayed’s Veggie trays is streaming cleanly across the 2.6s link.',
        advice: 'Ask Earth Control before locking nightly choices whenever power gets tight.',
        expression: 'normal',
      },
      3: {
        greeting: 'Solar dust cut our kW output just as space weather radar flagged a growing sunspot!',
        advice: 'Charge the battery bank tonight so tomorrow’s radiation shields stay online.',
        expression: 'focused',
      },
      4: {
        greeting: 'DONKI X8.7 flare incoming! Satellite alerts warn of a >1,400 km/s proton wave.',
        advice: 'Pump water into habitat walls so internal mSv dose stays green.',
        expression: 'surprised',
      },
      5: {
        greeting: 'The proton storm passed, leaving faint static across our S-band dish.',
        advice: 'Plan to inspect the outdoor relay tomorrow after the crew gets rest.',
        expression: 'normal',
      },
      6: {
        greeting: 'Crater cliffs block Yassin’s rover radio unless our elevated S-band relay shines!',
        advice: 'Fixing the Solar Relay today saves a clean lock map for Sol 7 emergencies.',
        expression: 'focused',
      },
      7: {
        greeting: 'Total Comms Blackout! Solar radio bursts flooded Earth’s 1.3s carrier wave.',
        advice: 'Stabilize power and cabin O2 first, then lock my dish back onto Earth.',
        expression: 'alert',
      },
    },
  },
  yassin: {
    id: 'yassin',
    name: 'Yassin Esmat',
    role: 'Robotics Officer',
    stationName: 'Rover Pad',
    roomId: 'robotics_bay',
    specialty: 'Pilots Moon rovers across -200°C icy craters.',
    accentColor: '#A995E8',
    visorTint: '#A995E8',
    isRemote: false,
    templateFeatures: {
      skinTone: '#E5B28B',
      hairColor: '#252120',
      hairStyle: 'spiky',
      hasGlasses: false,
      facialHair: 'none',
    },
    dayDialogues: {
      1: {
        greeting: 'Rover airlock standing by! Keep descent below 3.0 m/s so landing struts stay intact.',
        advice: 'Crater Rim puts frozen water ice right beside our rover ramp.',
        expression: 'happy',
      },
      2: {
        greeting: 'Rover wheels are parked indoors while Sayed starts our Moon garden.',
        advice: 'Saving base water and kW now gives my rover headroom for Sol 6.',
        expression: 'normal',
      },
      3: {
        greeting: 'Freezing shadows outside! My rover battery needs tonight’s charging bus.',
        advice: 'Essential Heating caps Rover Battery at 55%; Battery Storage fills it to 100%.',
        expression: 'concerned',
      },
      4: {
        greeting: 'Robotics shutters bolted! My rover is safe inside while protons hammer the sky.',
        advice: 'Keep rover batteries healthy—we may need them if the main grid stumbles.',
        expression: 'focused',
      },
      5: {
        greeting: 'Ice drills greased and thermal wheel heaters tested for tomorrow’s crater run!',
        advice: 'Rest the crew tonight so tomorrow’s shadow drive stays accident-free.',
        expression: 'happy',
      },
      6: {
        greeting: 'Time to roll! Steer around -200°C frost shadows so wheels never freeze solid.',
        advice: 'Drill crater ice for +25 Water and Science, or service Taha’s ridge relay!',
        expression: 'happy',
      },
      7: {
        greeting: 'Blackout hit hard, Commander, and my rover’s battery cable sits right by the bus!',
        advice: 'If Rover Battery is 30% or higher, tap it for an instant +15 Power rescue.',
        expression: 'focused',
      },
    },
  },
  sayed: {
    id: 'sayed',
    name: 'Sayed Mostafa',
    role: 'Science Officer',
    stationName: 'Greenhouse',
    roomId: 'greenhouse',
    specialty: 'Runs NASA hydroponics, CO2 balance, and sensor labs.',
    accentColor: '#79C8E8',
    visorTint: '#FFD66B',
    isRemote: false,
    templateFeatures: {
      skinTone: '#D69E76',
      hairColor: '#1F1A17',
      hairStyle: 'curly_top',
      hasGlasses: true,
      facialHair: 'none',
    },
    dayDialogues: {
      1: {
        greeting: 'LRO crater scans loaded! Ready to pick the smartest landing spot on Sol 1.',
        advice: 'Science Score reaches 75+ when our labs stay powered and healthy all week.',
        expression: 'happy',
      },
      2: {
        greeting: 'In 1.62 m/s² lunar gravity, water floats and chokes plant roots without smart control!',
        advice: 'Electric pumps yield high food & O2 for -8 kW/day; capillary tubes use 0 kW.',
        expression: 'focused',
      },
      3: {
        greeting: 'Dusty solar arrays squeezed our kW budget—both my plant pumps and lab sensors feel it.',
        advice: 'Avoid risky regulator overclocks unless you want fragile wires on Sol 7.',
        expression: 'normal',
      },
      4: {
        greeting: 'Space satellites measured an X8.7 flare, yet our base water walls keep room mSv safe!',
        advice: 'If Active Pumps lack Sol 3 batteries, Full Shielding triggers an immediate pump stall.',
        expression: 'surprised',
      },
      5: {
        greeting: 'Our greens scrub CO2 ppm back into oxygen while Dr. Omar resets crew sleep clocks!',
        advice: 'A rested team earns top Science results during Sol 6 and Sol 7.',
        expression: 'normal',
      },
      6: {
        greeting: 'Crater cold traps at -200°C lock ancient ice—drilling a core yields +25 Science Score!',
        advice: 'Weigh huge water & science gains against reinforcing Taha’s storm relay.',
        expression: 'happy',
      },
      7: {
        greeting: 'No Earth signal, Commander, and Greenhouse O2 needs backup while static rages!',
        advice: 'Diverting Medbay O2 saves both our crops and Science Score if Medkits >= 20%.',
        expression: 'worried',
      },
    },
  },
  abdelrahman: {
    id: 'abdelrahman',
    name: 'Abdul',
    role: 'Earth Flight Lead',
    stationName: 'Earth Control',
    roomId: 'earth_control',
    specialty: 'Guides the crew across the 2.6s Earth–Moon uplink.',
    accentColor: '#79C8E8',
    visorTint: '#FFD66B',
    isRemote: true,
    templateFeatures: {
      skinTone: '#E0AC85',
      hairColor: '#261D18',
      hairStyle: 'side_part',
      hasGlasses: false,
      facialHair: 'light_stubble',
    },
    dayDialogues: {
      1: {
        greeting: 'Houston checking in! Every message between us travels 2.6 seconds round-trip.',
        advice: 'Keep descent under 3.0 m/s, then weigh solar kW against crater ice.',
        expression: 'happy',
      },
      2: {
        greeting: 'Great landing, Commander! Earth telemetry shows your Greenhouse waking up.',
        advice: 'Keep Power comfortably above 25% if you choose electric plant pumps.',
        expression: 'normal',
      },
      3: {
        greeting: 'Heads up from Earth—solar sensors spotted a flare building toward Sol 4!',
        advice: 'Bank battery reserves tonight so tomorrow’s storm shields stay steady.',
        expression: 'focused',
      },
      4: {
        greeting: 'DONKI Storm Alert! External space flux is soaring—shield your base rooms now.',
        advice: 'Turn on Full Water Shielding if your Sol 3 power buffer can carry -25 kW.',
        expression: 'alert',
      },
      5: {
        greeting: 'The proton storm is fading! Now watch cabin CO2 ppm and specialist fatigue.',
        advice: 'Full Rest builds Crisis Resilience for the end of Moon Week.',
        expression: 'normal',
      },
      6: {
        greeting: 'Solar radio static is rising! Watch Yassin’s rover battery in -200°C shadows.',
        advice: 'Servicing the Solar Relay today makes reconnecting Earth much easier tomorrow.',
        expression: 'concerned',
      },
      7: {
        greeting: 'Ksssh—broadband solar burst jamming S-band! You have full command on the Moon!',
        advice: 'Complete all 3 rescue stages to lock your dish back onto Houston!',
        expression: 'worried',
      },
    },
  },
};

export function getCrewDialogueForPhase(
  crewId: CrewId,
  day: DayNumber,
  phase: 'morning' | 'midday',
): { greeting: string; advice: string; expression: CrewExpression } {
  if (phase === 'midday') {
    const midday = CREW_MIDDAY_BEATS[day];
    if (midday.specialistId === crewId) {
      return {
        greeting: midday.greeting,
        advice: midday.advice,
        expression: midday.expression,
      };
    }
    const base = CREW_PROFILES[crewId].dayDialogues[day];
    return {
      greeting: midday.greeting,
      advice: base.advice,
      expression: midday.expression,
    };
  }
  return CREW_PROFILES[crewId].dayDialogues[day];
}
