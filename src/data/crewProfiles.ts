import type { CrewId, CrewProfile, OnBaseCrewId } from '../types/game';

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

export const CREW_PROFILES: Record<CrewId, CrewProfile> = {
  albaraa: {
    id: 'albaraa',
    name: 'AlBaraa Mohammad',
    role: 'Flight Engineer',
    stationName: 'Power Room',
    roomId: 'power_station',
    specialty: 'Powers solar panels and base batteries.',
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
        greeting: "Hi! I'm Al-Baraa. Let's catch sunlight to power our Moon base!",
        advice: 'Sunlit Peak gives power; Crater Rim hides ice and shields.',
        expression: 'happy',
      },
      2: {
        greeting: 'Power cables are hooked up to Sayed’s space plants!',
        advice: 'Electric pumps grow fast, but stall if Power drops below 25%.',
        expression: 'focused',
      },
      3: {
        greeting: 'Moon dust is sticking to our solar wings right now!',
        advice: 'Save battery power tonight so storms never stop our pumps.',
        expression: 'alert',
      },
      4: {
        greeting: 'Solar storm incoming! Our shield pumps need big power!',
        advice: 'Full shields draw heavy power, so watch your battery level.',
        expression: 'worried',
      },
      5: {
        greeting: 'Our power grid survived the big solar storm safely!',
        advice: 'Let tired teammates rest so everyone stays fast and strong.',
        expression: 'normal',
      },
      6: {
        greeting: 'I charged Yassin’s rover battery for today’s crater trip!',
        advice: 'Fixing the solar relay today protects our base for tomorrow.',
        expression: 'focused',
      },
      7: {
        greeting: 'Earth radio is blocked by static! You lead the base today!',
        advice: 'Tap our rover battery if you need fast backup power.',
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
    specialty: 'Keeps astronauts healthy, rested, and happy.',
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
        greeting: 'Hi! Everyone landed safely and feels great on Sol 1!',
        advice: 'Keep water and crew rest balanced right from day one.',
        expression: 'happy',
      },
      2: {
        greeting: 'Fresh space greens help keep our crew healthy and strong!',
        advice: 'Capillary tubes save power, though hand-tending tires the team.',
        expression: 'normal',
      },
      3: {
        greeting: 'Chilly cabins make astronauts work harder and tire faster.',
        advice: 'Watch our crew fatigue tomorrow if you cool the rooms tonight.',
        expression: 'concerned',
      },
      4: {
        greeting: 'Everyone is tucked safely inside the shielded base right now!',
        advice: 'Full water walls keep outside solar rays away from crew.',
        expression: 'focused',
      },
      5: {
        greeting: "I'm Dr. Omar! Let's cheer up the crew with a rhythm game!",
        advice: 'A full rest night boosts everyone’s morale for Sol 7!',
        expression: 'concerned',
      },
      6: {
        greeting: 'Everyone looks strong and ready for today’s rover mission!',
        advice: 'Keep extra medkits ready in case tomorrow needs spare oxygen.',
        expression: 'normal',
      },
      7: {
        greeting: 'Stay calm, Commander! Our cabin air and oxygen look steady!',
        advice: 'Share spare medbay oxygen if our space plants get stuffy.',
        expression: 'focused',
      },
    },
  },
  taha: {
    id: 'taha',
    name: 'Taha Yasin',
    role: 'Base Comms Officer',
    stationName: 'Comms Room',
    roomId: 'comms_room',
    specialty: 'Tunes Moon dishes and space shields.',
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
        greeting: 'Radio dish online! Earth Mission Control hears us loud and clear!',
        advice: 'Radio waves take 2.6 seconds to bounce between Earth and Moon.',
        expression: 'happy',
      },
      2: {
        greeting: 'Base radios are clear across every Moon room today!',
        advice: 'Ask Earth Control for quick hints before locking nightly choices.',
        expression: 'normal',
      },
      3: {
        greeting: "I'm Taha! Let's tune the big dish to talk to Earth!",
        advice: 'Save battery power tonight so tomorrow’s storm shields stay strong.',
        expression: 'focused',
      },
      4: {
        greeting: 'Solar storm incoming! Raise the magnetic shields right now!',
        advice: 'Full water shields block harmful solar storm rays cleanly!',
        expression: 'surprised',
      },
      5: {
        greeting: 'Our radio signal looks much clearer after the storm passed!',
        advice: 'Check the outdoor relay dish tomorrow so signals stay locked.',
        expression: 'normal',
      },
      6: {
        greeting: 'Yassin’s rover needs strong radio waves across the crater rim!',
        advice: 'Fix the solar relay today to save our backup Earth map!',
        expression: 'focused',
      },
      7: {
        greeting: 'Earth radio is blocked by static! Let’s reconnect the dish!',
        advice: 'Use my saved map or send a safe pulse home!',
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
    specialty: 'Drives Moon rovers across deep craters.',
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
        greeting: 'Moon Rover checked! Airlocks sealed cleanly after our rocket landed!',
        advice: 'Touch down gently so our rocket hull stays strong!',
        expression: 'happy',
      },
      2: {
        greeting: 'The Moon Rover is charging happily in the Rover Pad!',
        advice: 'Keep my rover charged for our big ice hunt later!',
        expression: 'normal',
      },
      3: {
        greeting: 'Brrr! It is super freezing outside the rover airlock tonight!',
        advice: 'Save battery power tonight to charge my rover to 100%!',
        expression: 'concerned',
      },
      4: {
        greeting: 'Blast shutters locked! My rover is safe from the solar storm!',
        advice: 'Keep the rover parked indoors until the storm passes.',
        expression: 'focused',
      },
      5: {
        greeting: 'Rover wheels are greased and ice scoops are ready to roll!',
        advice: 'Check the rover battery before tomorrow’s crater drive!',
        expression: 'happy',
      },
      6: {
        greeting: "I'm Yassin! Drive the rover to scoop up glowing Moon ice!",
        advice: 'Scoop crater ice for water, or fix Taha’s solar relay!',
        expression: 'happy',
      },
      7: {
        greeting: 'My rover’s big battery pack sits right beside the power line!',
        advice: 'With 30% rover battery, we can power the base safely!',
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
    specialty: 'Grows space plants with NASA science.',
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
        greeting: 'Science trays ready! Let’s test real NASA Moon data today!',
        advice: 'Check NASA cards for quick rules before picking tonight’s spot.',
        expression: 'happy',
      },
      2: {
        greeting: "I'm Sayed! Help me connect water pipes to our space plants!",
        advice: 'Electric pumps grow fast; capillary tubes use zero power!',
        expression: 'focused',
      },
      3: {
        greeting: 'My Science Lab loves extra watts, when the battery allows!',
        advice: 'High Science and healthy meters win the top Gold score!',
        expression: 'normal',
      },
      4: {
        greeting: 'NASA spotted a solar storm racing toward our Moon base!',
        advice: 'Thick water shields keep the radiation dose outside our rooms!',
        expression: 'surprised',
      },
      5: {
        greeting: 'Our space plants are glowing green and making fresh oxygen!',
        advice: 'Give the crew rest tonight so nobody burns out!',
        expression: 'normal',
      },
      6: {
        greeting: 'NASA maps show bright water ice inside the deep crater!',
        advice: 'Crater ice boosts Science fast; fixing the relay saves comms!',
        expression: 'happy',
      },
      7: {
        greeting: 'Earth is offline, so our science team leads the rescue!',
        advice: 'Share medbay oxygen with our plants if cabin air drops!',
        expression: 'worried',
      },
    },
  },
  abdelrahman: {
    id: 'abdelrahman',
    name: 'Abd-Elrahman Ahmad',
    role: 'Earth Flight Lead',
    stationName: 'Earth Control',
    roomId: 'earth_control',
    specialty: 'Guides the crew from Earth Control.',
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
        greeting: 'Earth Control checking in! Radio waves take 2.6 seconds round-trip!',
        advice: 'Compare Power and Shield needs before picking your base spot!',
        expression: 'happy',
      },
      2: {
        greeting: 'Happy Sol 2! Your Greenhouse plants look great from Earth!',
        advice: 'Keep Power above 25% so electric plant pumps never stall.',
        expression: 'normal',
      },
      3: {
        greeting: 'Lunar shadows are freezing fast! Budget your power wisely tonight.',
        advice: 'Saving battery tonight protects your shields during tomorrow’s storm!',
        expression: 'focused',
      },
      4: {
        greeting: 'Storm Alert! NASA spotted a solar wave heading your way!',
        advice: 'Turn on Full Water Shields right away to protect your crew!',
        expression: 'alert',
      },
      5: {
        greeting: 'The solar storm is fading! Time to help everyone rest.',
        advice: 'Give your astronauts full rest tonight for strong Sol 7 morale!',
        expression: 'normal',
      },
      6: {
        greeting: 'Earth dishes are tracking Yassin’s rover along the crater rim!',
        advice: 'Fixing the radio relay today helps if static blocks Earth tomorrow!',
        expression: 'concerned',
      },
      7: {
        greeting: 'Bzzt—static everywhere! Trust your crew until the link returns!',
        advice: 'Restore the backup beacon to reconnect Earth Mission Control!',
        expression: 'worried',
      },
    },
  },
};
