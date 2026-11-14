import type { DayNumber } from '../types/game';

export interface AstronautSuitItem {
  id: string;
  emoji: string;
  name: string;
  description: string;
  accentHex: string;
}

export interface BaseMachineItem {
  id: string;
  emoji: string;
  name: string;
  description: string;
  accentHex: string;
}

export interface DailyObstacleItem {
  id: string;
  title: string;
  description: string;
}

export interface NasaSourceLink {
  title: string;
  url: string;
}

export interface NasaTopicItem {
  id: string;
  topic: string;
  links: readonly NasaSourceLink[];
}

export const ALL_DAYS: readonly DayNumber[] = [1, 2, 3, 4, 5, 6, 7];

export const ASTRONAUT_SUIT_ITEMS: readonly AstronautSuitItem[] = [
  {
    id: 'plss',
    emoji: '🎒',
    name: 'Life Support Backpack (PLSS)',
    description:
      'Carries tanks of oxygen (O2) for breathing, a battery to power the suit, and scrubbers that filter out the toxic carbon dioxide (CO2) you breathe out.',
    accentHex: '#79C8E8',
  },
  {
    id: 'water_cooled_suit',
    emoji: '💧',
    name: 'Water-Cooled Suit',
    description:
      'Tiny water tubes inside the suit keep you cool in boiling sunlight and warm in freezing Moon shadows!',
    accentHex: '#9BD8A7',
  },
  {
    id: 'helmet_visor',
    emoji: '🪖',
    name: 'Helmet & Gold-Coated Visor',
    description:
      'Protects your eyes from blinding space sunlight and lets you talk to Mission Control!',
    accentHex: '#FFD66B',
  },
  {
    id: 'outer_armor',
    emoji: '🛡️',
    name: 'Multi-Layer Outer Armor',
    description: 'Blocks sharp Moon dust and tiny flying space rocks!',
    accentHex: '#A995E8',
  },
  {
    id: 'gloves_boots',
    emoji: '🧤',
    name: 'Heated Gloves & Lunar Boots',
    description:
      'Keeps your fingers warm while fixing solar panels and helps you hop across rocky craters!',
    accentHex: '#F87171',
  },
];

export const BASE_MACHINE_ITEMS: readonly BaseMachineItem[] = [
  {
    id: 'life_support_recycler',
    emoji: '🫧',
    name: 'Air & Water Recycler (Life Support System)',
    description:
      'This is the "lungs" of your base! It takes water and uses electricity to split it, making fresh, breathable oxygen, and also cleans dirty water so you can reuse it',
    accentHex: '#9BD8A7',
  },
  {
    id: 'solar_batteries',
    emoji: '☀️',
    name: 'Solar Panels & Batteries (Base Power)',
    description:
      'It catches sunlight and turns it into electricity (Power) to run all the machines, lights, and heaters in your base.',
    accentHex: '#FFD66B',
  },
  {
    id: 'weather_radar_shield',
    emoji: '📡',
    name: 'Space Weather Radar & Radiation Shield',
    description:
      'It warns you when dangerous solar storms are getting close to the Moon, so you can turn on your Radiation Shield to protect yourself.',
    accentHex: '#A995E8',
  },
];

export const DAILY_OBSTACLES_BY_DAY: Record<DayNumber, readonly DailyObstacleItem[]> = {
  1: [
    {
      id: 'd1_o1',
      title: 'No-Air Rocket Landing & Hard Crash Risk',
      description:
        'Lunar lander drops fast toward the rocky Moon surface—if the lunar lander touches down faster than 3.0 m/s, the hard slam cracks the outer hull shielding!',
    },
    {
      id: 'd1_o2',
      title: 'Bright Sunlight vs. Hidden Crater Ice (Landing Zone Dilemma)',
      description:
        'Astronaut is stuck between landing on a sunny hill with plenty of solar power but no water ice and zero storm cover, or landing near a dark crater edge with frozen water ice and natural rock walls but very little sunlight!',
    },
  ],
  2: [
    {
      id: 'd2_o1',
      title: 'Floating Water & Drowning Plant Roots',
      description:
        'Inside the Greenhouse on the Moon, weak Moon gravity keeps water from soaking down into the dirt—so water floats around and sticks to plant roots like a heavy blanket, blocking them from breathing air!',
    },
    {
      id: 'd2_o2',
      title: 'Trapped Air Bubbles in the Water Pipes',
      description:
        'A sudden pressure drop creates stubborn air bubbles inside the water recycling pipes, blocking water flow between the water loop and the garden!',
    },
    {
      id: 'd2_o3',
      title: 'Hungry Batteries vs. Tired Space Gardeners',
      description:
        'Running fast electric water pumps grows lots of food quickly, while watering plants by hand with wicking blocks saves battery power—leaving the base stuck between draining electricity or wearing out the crew!',
    },
  ],
  3: [
    {
      id: 'd3_o1',
      title: 'Sticky Moon Dust & Freezing Shadows',
      description:
        'Tiny grains of Moon dust cling tightly to your outside solar panels and block the sunlight, just as freezing shadows drop the temperature inside the crater!',
    },
    {
      id: 'd3_o2',
      title: 'The Big Power Overload',
      description:
        'Heavy science lab spectrometers and room heaters run at the exact same time, causing a sudden heat spike and pulling way too much electricity through the wires!',
    },
    {
      id: 'd3_o3',
      title: 'Freezing Crew vs. Half-Charged Batteries (Nighttime Power Dilemma)',
      description:
        "There isn't enough electricity to run the whole base at night, leaving the astronaut stuck between letting the rooms get freezing cold (which makes the crew tired and weak), leaving the Moon Rover half-charged, or pushing the power machines past their safe limit!",
    },
  ],
  4: [
    {
      id: 'd4_o1',
      title: 'Giant X-Class Solar Flare & Proton Radiation Wave',
      description:
        'The astronaut receives an urgent space weather alert—a massive explosion on the Sun is shooting invisible, high-speed waves of radiation straight toward your Moon base and threatening your batteries!',
    },
    {
      id: 'd4_o2',
      title: 'Confusing Radiation Readings & Unprotected Base Windows',
      description:
        "Alarms start beeping with mixed-up numbers from space satellites and indoor sensors while the base's glass windows are still wide open to incoming space radiation!",
    },
    {
      id: 'd4_o3',
      title: 'Drained Batteries vs. Radiation Danger (Storm Lockdown Dilemma)',
      description:
        "Astronauts don't have enough electricity to run full radiation shields and keep every machine running at once—leaving them stuck between draining massive battery power (which can stall your garden's water pumps) or letting dangerous radiation leak inside and tire out the crew!",
    },
  ],
  5: [
    {
      id: 'd5_o1',
      title: 'Confused Space Body Clocks & Low Energy',
      description:
        "Hard work in the Moon garden, chilly rooms from Day 3, and stress from Day 4's solar storm have left the crew dehydrated, worn out, and confused about when it's time to sleep or wake up!",
    },
    {
      id: 'd5_o2',
      title: 'Stale Air & Slow Reflexes',
      description:
        'One of the astronauts is moving super slowly and making mistakes! Too much carbon dioxide (CO2 - the used air we breathe out) is building up in the room and making everyone sleepy.',
    },
    {
      id: 'd5_o3',
      title: 'Exhausted Crew vs. Empty Medkits',
      description:
        'The crew is too worn out to keep working at full speed, leaving the base stuck between running out of medical supplies and letting the astronauts stay tired for the big finale!',
    },
  ],
  6: [
    {
      id: 'd6_o1',
      title: 'Giant Boulders & Steep Crater Ridges',
      description:
        'The Moon Rover runs into jagged space rocks, steep crater slopes, and rough rocky ridges that can trap its wheels!',
    },
    {
      id: 'd6_o2',
      title: 'Freezing -200°C Shadow Traps',
      description:
        'Dark crater shadows lie across your path—if your Rover drives into one, the extreme cold drains your Rover battery super fast and freezes the wheels!',
    },
    {
      id: 'd6_o3',
      title: 'Shadow Signal Blackout (Telemetry Drop)',
      description:
        'When the Rover gets stuck behind a high rocky ridge inside a deep shadow, its radio signal to the Moon base suddenly drops out, cutting off live sensor data!',
    },
  ],
  7: [
    {
      id: 'd7_o1',
      title: 'Giant Solar Radio Static (Scrambled Signals)',
      description:
        'A sudden burst of noisy radio energy from the Sun blasts through space, filling your radio with loud static and garbling messages from the team at Mission Control on Earth',
    },
    {
      id: 'd7_o2',
      title: 'Total Earth Radio Blackout',
      description:
        'The space storm grows so strong that it completely cuts off all radio contact with the team on Earth and locks out the AI Mission Advisor—leaving your Moon base totally on its own!',
    },
  ],
};

export const NASA_SOURCES_BY_DAY: Record<DayNumber, readonly NasaTopicItem[]> = {
  1: [
    {
      id: 'd1_n1',
      topic: 'For Lunar Surface Maps and Dark Craters (LRO - LOLA & Diviner)',
      links: [
        {
          title: 'NASA Lunar Reconnaissance Orbiter (LRO) Mission Page',
          url: 'https://science.nasa.gov/lunar-science/programs/lunar-reconnaissance-orbiter/',
        },
        {
          title: 'NASA LRO Diviner Lunar Radiometer Experiment',
          url: 'https://www.jpl.nasa.gov/missions/diviner-lunar-radiometer-experiment-dlre/',
        },
      ],
    },
    {
      id: 'd1_n2',
      topic: 'Artemis Human Landing System',
      links: [
        {
          title: 'NASA Artemis Program & Human Landing System (HLS)',
          url: 'https://www.nasa.gov/humans-in-space/human-landing-system/',
        },
        {
          title: 'NASA Technical Reports Server (HLS 20210018118)',
          url: 'https://ntrs.nasa.gov/citations/20210018118',
        },
      ],
    },
    {
      id: 'd1_n3',
      topic: '2.6-second communication delay (Deep Space Network)',
      links: [
        {
          title: 'NASA Deep Space Network (DSN)',
          url: 'https://www.nasa.gov/communicating-with-missions/dsn/',
        },
      ],
    },
  ],
  2: [
    {
      id: 'd2_n1',
      topic: 'Space Adaptation Syndrome',
      links: [
        {
          title: 'NASA Human Research Program (HRP)',
          url: 'https://www.nasa.gov/hrp/',
        },
      ],
    },
    {
      id: 'd2_n2',
      topic: 'Capillarity and Water Management for Plants (PSI-187)',
      links: [
        {
          title: 'NASA Physical Sciences Informatics (PSI) Portal',
          url: 'https://science.nasa.gov/physical-sciences-informatics-psi/history-of-physical-science-informatics/',
        },
      ],
    },
    {
      id: 'd2_n3',
      topic: 'Space-based cultivation systems (Veggie & PONDS) and recycling data (OSD-729)',
      links: [
        {
          title: 'NASA Open Science Data Repository (OSDR)',
          url: 'https://osdr.nasa.gov/bio/repo/search?q=&data_source=cgene,alsda,esa&data_type=study',
        },
        {
          title: 'NASA Veggie Plant Growth System',
          url: 'https://science.nasa.gov/mission/veggie/',
        },
        {
          title: 'Passive Nutrient Delivery System (PONDS)',
          url: 'https://technology.nasa.gov/patent/KSC-TOPS-81',
        },
        {
          title: 'Food production on the Moon and in remote areas (CSA)',
          url: 'https://www.asc-csa.gc.ca/eng/youth-educators/toolkits/food-production/',
        },
      ],
    },
  ],
  3: [
    {
      id: 'd3_n1',
      topic: 'Electrostatically charged lunar dust (DONKI - HSS)',
      links: [
        {
          title: 'NASA DONKI Space Weather Database',
          url: 'https://kauai.ccmc.gsfc.nasa.gov/DONKI/',
        },
        {
          title: 'NASA Open APIs Portal (DONKI API)',
          url: 'https://api.nasa.gov/',
        },
      ],
    },
    {
      id: 'd3_n2',
      topic: 'Heat Transfer in Low Gravity (PSI-138)',
      links: [
        {
          title: 'NASA Physical Sciences Informatics (PSI) Portal (PSI-138)',
          url: 'https://psi.nasa.gov/physci/repo/search?q=&data_source=psi&data_type=investigation',
        },
      ],
    },
    {
      id: 'd3_n3',
      topic: 'The impact of cold on the body’s energy and bones',
      links: [
        {
          title: 'NASA Open Science Data Repository (OSDR) (OSD-979)',
          url: 'https://osdr.nasa.gov/bio/repo/search?q=&data_source=cgene,alsda,esa&data_type=study',
        },
        {
          title: 'NASA Sleep Accommodations',
          url: 'https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-041-sleep-accommodations.pdf',
        },
      ],
    },
  ],
  4: [
    {
      id: 'd4_n1',
      topic: 'Solar flares and radiation storms (DONKI - FLR & SEP)',
      links: [
        {
          title: 'NASA DONKI Space Weather Database (FLR & SEP)',
          url: 'https://kauai.ccmc.gsfc.nasa.gov/DONKI/',
        },
        {
          title: 'NASA Solar Dynamics Observatory (SDO) - Solar Flares',
          url: 'https://sdo.gsfc.nasa.gov/',
        },
      ],
    },
    {
      id: 'd4_n2',
      topic: 'Radiation Dosimetry Inside Vehicles (OSDR / RadLab)',
      links: [
        {
          title: 'NASA Open Science Data Repository (OSDR) – Radiation Data',
          url: 'https://osdr.nasa.gov/bio/repo/search?q=&data_source=cgene,alsda,esa&data_type=study',
        },
      ],
    },
    {
      id: 'd4_n3',
      topic: 'Protection against space radiation using water walls',
      links: [
        {
          title: 'NASA Space Radiation Analysis Group (SRAG)',
          url: 'https://srag.jsc.nasa.gov/',
        },
      ],
    },
  ],
  5: [
    {
      id: 'd5_n1',
      topic: 'Circadian Lighting for Astronauts',
      links: [
        {
          title: 'NASA Human Research Program - Circadian Lighting & Sleep',
          url: 'https://homeandcity.nasa.gov/technology/sleep-enhancing-light/',
        },
      ],
    },
    {
      id: 'd5_n2',
      topic: 'Carbon dioxide accumulation in low gravity (ECLSS & OSDR)',
      links: [
        {
          title: 'NASA Environmental Control and Life Support System (ECLSS)',
          url: 'https://www.nasa.gov/wp-content/uploads/2023/07/eclss-technical-brief-ochmo.pdf',
        },
        {
          title: 'NASA Task Book (Human Research Program Database)',
          url: 'https://taskbook.nasaprs.com/tbp/index.cfm',
        },
      ],
    },
  ],
  6: [
    {
      id: 'd6_n1',
      topic: 'The terrain of the Moon’s south pole and its permanently shadowed craters (-200°C)',
      links: [
        {
          title: 'NASA Moon Trek (Interactive Lunar Maps & LOLA Elevation Data)',
          url: 'https://svs.gsfc.nasa.gov/search/?search=Lunar+Topography&sort_by_1=relevance',
        },
        {
          title: 'NASA LRO Permanently Shadowed Regions (PSRs)',
          url: 'https://science.nasa.gov/wp-content/uploads/2024/01/lro-litho5-shadowed.pdf',
        },
        {
          title: 'LRO WAC Percentage-Based South Pole Illumination Map',
          url: 'https://lroc.im-ldi.com/news/991',
        },
      ],
    },
  ],
  7: [
    {
      id: 'd7_n1',
      topic: 'Solar Radio Bursts and Signal Disruptions (DONKI - RBE)',
      links: [
        {
          title: 'NASA DONKI Space Weather Database (Radio Burst Events)',
          url: 'https://science.nasa.gov/heliophysics/focus-areas/space-weather/',
        },
      ],
    },
    {
      id: 'd7_n2',
      topic: 'Autonomous Crew Operations (during loss of communication with Earth)',
      links: [
        {
          title: 'NASA Human Research Program (HRP) - Autonomous Medical & Crew Operations',
          url: 'https://www.nasa.gov/hrp/',
        },
      ],
    },
  ],
};
