import { CREW_PROFILES } from '../data/crewProfiles';
import { VERIFIED_NASA_DATASETS } from '../data/nasaVerifiedData';
import type { CrewExpression, DayNumber, GameState } from '../types/game';

export interface EarthControlReply {
  sender: 'abdelrahman';
  senderName: string;
  role: string;
  expression: CrewExpression;
  oneWayDelaySeconds: 1.3;
  roundTripDelaySeconds: 2.6;
  headline: string;
  telemetryAnalysis: string;
  scientificNote: string;
  tradeOffWarning: string;
  source: 'local_telemetry' | 'live_llm';
}

export interface EarthControlAdapter {
  generateReply(state: Readonly<GameState>, question: string): Promise<EarthControlReply>;
}

export const SUGGESTED_ADVISOR_QUESTIONS: Record<DayNumber, string[]> = {
  1: [
    'Should we land on Sunlit Peak or Crater Rim?',
    'Why is there a 2.6-second radio delay?',
    'How fast is safe for rocket landing?',
  ],
  2: [
    'Should we pick Electric Pumps or Capillary Tubes?',
    'How much power should we save today?',
    'How do space plants make fresh air?',
  ],
  3: [
    'Should we save battery or warm the base?',
    'Why does Moon dust slow down solar panels?',
    'Will saved batteries help during tomorrow’s storm?',
  ],
  4: [
    'Should we raise Full Shield or Half Shield?',
    'How do water walls block solar storms?',
    'Does our landing spot change storm safety?',
  ],
  5: [
    'Should we pick Movie Night or Extra Work?',
    'Why does astronaut rest keep the base safe?',
    'How do amber lights help astronauts sleep?',
  ],
  6: [
    'Should Yassin scoop ice or fix the relay?',
    'Why is Moon crater ice so valuable?',
    'Why might the radio relay matter tomorrow?',
  ],
  7: [
    'Why is our Earth radio signal getting static?',
    'What should we check before radio cuts out?',
    'How do we reconnect if Earth goes quiet?',
  ],
};

function selectAbdelrahmanExpression(state: Readonly<GameState>): CrewExpression {
  const lowest = Math.min(
    state.primary.lifeSupport,
    state.primary.power,
    state.primary.shielding,
    state.primary.crewReadiness,
  );
  if (lowest < 35 || state.flags.activePumpsStalled) {
    return 'alert';
  }
  if (state.day === 4 || state.day === 7) {
    return 'concerned';
  }
  if (lowest >= 75) {
    return 'happy';
  }
  return 'focused';
}

function buildDaySpecificGuidance(
  state: Readonly<GameState>,
  question: string,
): Pick<EarthControlReply, 'headline' | 'telemetryAnalysis' | 'scientificNote' | 'tradeOffWarning'> {
  const q = question.toLowerCase();
  const statusLine = `Power ${state.primary.power}%, Life Support ${state.primary.lifeSupport}%, Shield ${state.primary.shielding}%.`;

  if (q.includes('delay') || q.includes('light') || q.includes('radio')) {
    return {
      headline: 'Earth–Moon Radio Check',
      telemetryAnalysis: statusLine,
      scientificNote: 'Radio takes 2.6 seconds to Earth.',
      tradeOffWarning: 'Steer the base yourself during delays!',
    };
  }

  switch (state.day) {
    case 1:
      return {
        headline: 'Sol 1 Landing Hint',
        telemetryAnalysis: statusLine,
        scientificNote: 'Peaks get sun; craters hide ice.',
        tradeOffWarning: 'Peak gives Power; Rim gives Shield.',
      };
    case 2:
      return {
        headline: 'Sol 2 Space Plants Hint',
        telemetryAnalysis: statusLine,
        scientificNote: 'Capillary tubes move water without power.',
        tradeOffWarning: 'Electric pumps stall under 25% Power.',
      };
    case 3:
      return {
        headline: 'Sol 3 Power Hint',
        telemetryAnalysis: statusLine,
        scientificNote: 'Moon dust slows down solar panels.',
        tradeOffWarning:
          state.flags.farmingMode === 'active_pumps'
            ? 'Save battery now for tomorrow’s storm!'
            : 'Save battery for rovers, or heat cabins.',
      };
    case 4:
      return {
        headline: 'Sol 4 Solar Storm Hint',
        telemetryAnalysis: statusLine,
        scientificNote: 'Water walls block space storm rays.',
        tradeOffWarning:
          state.flags.farmingMode === 'active_pumps' && state.flags.day3Allocation !== 'battery_storage'
            ? 'Full Shield drains unbuffered pump power!'
            : 'Full Shield protects crew; Half saves power.',
      };
    case 5:
      return {
        headline: 'Sol 5 Crew Care Hint',
        telemetryAnalysis: statusLine,
        scientificNote: 'Warm lights help astronauts sleep deep.',
        tradeOffWarning: 'Rest boosts morale; Extra Work saves medkits.',
      };
    case 6:
      return {
        headline: 'Sol 6 Rover Hint',
        telemetryAnalysis: statusLine,
        scientificNote: 'Cold craters trap frozen Moon ice.',
        tradeOffWarning: 'Ice gives water; Relay saves radio.',
      };
    case 7:
      return {
        headline: 'Sol 7 Part A — Signal Fading!',
        telemetryAnalysis: statusLine,
        scientificNote: 'Solar bursts jam Earth radio waves.',
        tradeOffWarning: 'Aim the dish with your crew!',
      };
    default: {
      const _exhaustive: never = state.day;
      return _exhaustive;
    }
  }
}

export const LocalEarthControlTelemetryAdapter: EarthControlAdapter = {
  async generateReply(state: Readonly<GameState>, question: string): Promise<EarthControlReply> {
    const profile = CREW_PROFILES.abdelrahman;
    const guidance = buildDaySpecificGuidance(state, question);
    return {
      sender: 'abdelrahman',
      senderName: profile.name,
      role: profile.role,
      expression: selectAbdelrahmanExpression(state),
      oneWayDelaySeconds: 1.3,
      roundTripDelaySeconds: 2.6,
      ...guidance,
      source: 'local_telemetry',
    };
  },
};

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getEnvApiKey(): string | undefined {
  const metaUnknown: unknown = import.meta;
  if (!isObjectRecord(metaUnknown) || !isObjectRecord(metaUnknown.env)) {
    return undefined;
  }
  const raw = metaUnknown.env.VITE_GEMINI_API_KEY;
  return typeof raw === 'string' && raw.trim().length > 0 ? raw.trim() : undefined;
}

function extractGeminiCandidateText(data: unknown): string | undefined {
  if (!isObjectRecord(data) || !Array.isArray(data.candidates) || data.candidates.length === 0) {
    return undefined;
  }
  const firstCandidate = data.candidates[0];
  if (!isObjectRecord(firstCandidate) || !isObjectRecord(firstCandidate.content)) {
    return undefined;
  }
  const parts = firstCandidate.content.parts;
  if (!Array.isArray(parts) || parts.length === 0) {
    return undefined;
  }
  const firstPart = parts[0];
  if (!isObjectRecord(firstPart)) {
    return undefined;
  }
  return typeof firstPart.text === 'string' ? firstPart.text : undefined;
}

export const LiveLlmEarthControlAdapter: EarthControlAdapter = {
  async generateReply(state: Readonly<GameState>, question: string): Promise<EarthControlReply> {
    const apiKey = getEnvApiKey();
    if (!apiKey) {
      return LocalEarthControlTelemetryAdapter.generateReply(state, question);
    }

    const nasa = VERIFIED_NASA_DATASETS[state.day];
    const prompt = [
      'You are Abdul at Earth Mission Control advising a 7–12 year old Moon Commander.',
      'Use super simple, friendly words with ZERO technical walls of text.',
      'Reply in 1–2 short sentences total (MAX 18 words per tip, MAX 10 words per JSON field!).',
      `Include "Power ${state.primary.power}%" in telemetryAnalysis.`,
      `State: Sol ${state.day}, Power ${state.primary.power}%, Life Support ${state.primary.lifeSupport}%, Shield ${state.primary.shielding}%, Morale ${state.primary.crewReadiness}%.`,
      `NASA Fact (${nasa.source}): ${nasa.scientificInterpretation}`,
      `Question: ${question}`,
      'Respond in JSON with keys: headline, telemetryAnalysis, scientificNote, tradeOffWarning.',
    ].join('\n');

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      });
      if (!res.ok) {
        return LocalEarthControlTelemetryAdapter.generateReply(state, question);
      }
      const data: unknown = await res.json();
      const text = extractGeminiCandidateText(data);
      if (!text) {
        return LocalEarthControlTelemetryAdapter.generateReply(state, question);
      }
      const parsed: unknown = JSON.parse(text);
      if (!isObjectRecord(parsed)) {
        return LocalEarthControlTelemetryAdapter.generateReply(state, question);
      }
      const headline = typeof parsed.headline === 'string' ? parsed.headline : null;
      const telemetryAnalysis =
        typeof parsed.telemetryAnalysis === 'string' ? parsed.telemetryAnalysis : null;
      const scientificNote = typeof parsed.scientificNote === 'string' ? parsed.scientificNote : null;
      const tradeOffWarning =
        typeof parsed.tradeOffWarning === 'string' ? parsed.tradeOffWarning : null;
      if (!headline || !telemetryAnalysis || !scientificNote || !tradeOffWarning) {
        return LocalEarthControlTelemetryAdapter.generateReply(state, question);
      }

      const profile = CREW_PROFILES.abdelrahman;
      return {
        sender: 'abdelrahman',
        senderName: profile.name,
        role: profile.role,
        expression: selectAbdelrahmanExpression(state),
        oneWayDelaySeconds: 1.3,
        roundTripDelaySeconds: 2.6,
        headline,
        telemetryAnalysis,
        scientificNote,
        tradeOffWarning,
        source: 'live_llm',
      };
    } catch {
      return LocalEarthControlTelemetryAdapter.generateReply(state, question);
    } finally {
      clearTimeout(timer);
    }
  },
};

/**
 * Primary service seam for Earth Mission Control Uplink (`Abdul`).
 * Enforces the ADR-0002 service-level lockout (`COMMS_BLACKOUT_ACTIVE`) on Day 7 blackout
 * before any local or remote adapter can run.
 */
export async function queryEarthControl(
  state: Readonly<GameState>,
  question: string,
  adapter?: EarthControlAdapter,
): Promise<EarthControlReply> {
  if (state.day === 7 && state.commsBlackout === true) {
    throw new Error('COMMS_BLACKOUT_ACTIVE');
  }

  const chosenAdapter =
    adapter ?? (getEnvApiKey() ? LiveLlmEarthControlAdapter : LocalEarthControlTelemetryAdapter);
  return chosenAdapter.generateReply(state, question);
}
