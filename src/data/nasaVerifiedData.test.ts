import { describe, expect, it } from 'vitest';
import {
  getNasaDatasetForDay,
  SCIENTIFIC_TERMS,
  VERIFIED_NASA_DATASETS,
} from './nasaVerifiedData';
import type { DayNumber } from '../types/game';

const ALL_DAYS: readonly DayNumber[] = [1, 2, 3, 4, 5, 6, 7];

describe('NASA Verified Data Repository', () => {
  it('defines all six required kid-friendly scientific glossary terms', () => {
    const requiredTerms = [
      'Sol',
      'Radiation Dose (mSv)',
      'Capillary Action',
      'Coronal Mass Ejection (CME)',
      'Light-Time Delay',
      'Microgravity',
    ];
    for (const term of requiredTerms) {
      expect(SCIENTIFIC_TERMS[term]).toBeDefined();
      expect(SCIENTIFIC_TERMS[term]?.kidExplanation.length).toBeGreaterThan(20);
    }
  });

  it('strictly separates satelliteObservation, scientificInterpretation, and gameSimulationRule on Days 1–7', () => {
    for (const day of ALL_DAYS) {
      const card = VERIFIED_NASA_DATASETS[day];
      expect(card.day).toBe(day);
      expect(card.satelliteObservation.trim().length).toBeGreaterThan(25);
      expect(card.scientificInterpretation.trim().length).toBeGreaterThan(25);
      expect(card.gameSimulationRule.trim().length).toBeGreaterThan(20);
      expect(card.satelliteObservation).not.toBe(card.scientificInterpretation);
      expect(card.scientificInterpretation).not.toBe(card.gameSimulationRule);
      expect(card.rawMetrics.length).toBeGreaterThanOrEqual(3);
    }

    // ADR-0004: Day 4 DONKI dataset must distinguish external X-ray/proton flux from internal habitat dose
    expect(VERIFIED_NASA_DATASETS[4].source).toBe('NASA DONKI');
    expect(VERIFIED_NASA_DATASETS[4].scientificInterpretation).toContain('NOT the internal millisievert (mSv) dose');
  });

  it('falls back seamlessly to verified offline cache when DONKI fetch fails', async () => {
    const failingFetch: typeof fetch = async () => {
      throw new Error('Network unreachable');
    };

    const day4 = await getNasaDatasetForDay(4, failingFetch);
    expect(day4.liveStatus).toBe('verified_cache');
    expect(day4.source).toBe('NASA DONKI');
    expect(day4.recordId).toBe(VERIFIED_NASA_DATASETS[4].recordId);

    const day2 = await getNasaDatasetForDay(2, failingFetch);
    expect(day2.liveStatus).toBe('verified_cache');
    expect(day2.source).toBe('NASA OSDR (Veggie/PONDS)');
  });

  it('uses live DONKI observation when API responds cleanly while keeping interpretation separate', async () => {
    const mockResponse = new Response(
      JSON.stringify([
        {
          flrID: '2025-02-01T10:15:00-FLR-001',
          classType: 'X2.4',
          peakTime: '2025-02-01T10:15Z',
          sourceLocation: 'S14W28',
        },
      ]),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );

    const liveFetch: typeof fetch = async () => mockResponse;
    const day4 = await getNasaDatasetForDay(4, liveFetch);

    expect(day4.liveStatus).toBe('live');
    expect(day4.recordId).toBe('2025-02-01T10:15:00-FLR-001');
    expect(day4.satelliteObservation).toContain('X2.4');
    expect(day4.satelliteObservation).not.toContain('CRITICAL DISTINCTION');
    expect(day4.scientificInterpretation).toContain('NOT the internal millisievert (mSv) dose');
  });
});
