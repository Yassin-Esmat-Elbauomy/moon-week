import { describe, expect, it, vi } from 'vitest';
import { createInitialGameState, createPresetGameState } from '../simulation/engine';
import {
  type EarthControlAdapter,
  type EarthControlReply,
  queryEarthControl,
  SUGGESTED_ADVISOR_QUESTIONS,
} from './aiAdvisor';

describe('Earth Mission Control Uplink Service (aiAdvisor)', () => {
  it('enforces hard service-level COMMS_BLACKOUT_ACTIVE lockout on Day 7 blackout even if a custom adapter is injected', async () => {
    const blackoutState = createPresetGameState('day_7_blackout');
    expect(blackoutState.day).toBe(7);
    expect(blackoutState.commsBlackout).toBe(true);

    const mockAdapter: EarthControlAdapter = {
      generateReply: vi.fn(
        async (): Promise<EarthControlReply> => ({
          sender: 'abdelrahman',
          senderName: 'Abd-Elrahman Ahmad',
          role: 'Communications Officer — Earth Control',
          expression: 'normal',
          oneWayDelaySeconds: 1.3,
          roundTripDelaySeconds: 2.6,
          headline: 'Should never return',
          telemetryAnalysis: 'Bypassed',
          scientificNote: 'Bypassed',
          tradeOffWarning: 'Bypassed',
          source: 'local_telemetry',
        }),
      ),
    };

    await expect(
      queryEarthControl(blackoutState, 'Can Earth Control hear us?', mockAdapter),
    ).rejects.toThrow('COMMS_BLACKOUT_ACTIVE');
    expect(mockAdapter.generateReply).not.toHaveBeenCalled();
  });

  it('delivers Abd-Elrahman Earth Control telemetry replies with 1.3s/2.6s light-time delay on Days 1–6', async () => {
    const day1 = { ...createInitialGameState(), day: 1 as const };
    const replyDay1 = await queryEarthControl(day1, SUGGESTED_ADVISOR_QUESTIONS[1][0]!);
    expect(replyDay1.sender).toBe('abdelrahman');
    expect(replyDay1.senderName).toBe('Abd-Elrahman Ahmad');
    expect(replyDay1.oneWayDelaySeconds).toBe(1.3);
    expect(replyDay1.roundTripDelaySeconds).toBe(2.6);
    expect(replyDay1.telemetryAnalysis).toContain('Power 75%');
    expect(replyDay1.source).toBe('local_telemetry');

    // Day 7 Part A (before blackout) still permits degraded pre-blackout uplink
    const day7PartA = createPresetGameState('day_7_blackout');
    const preBlackoutState = {
      ...day7PartA,
      shift: 'morning' as const,
      commsBlackout: false,
      day7Stage: 'part_a_degraded' as const,
    };
    const replyDay7A = await queryEarthControl(preBlackoutState, 'What is happening to our signal?');
    expect(replyDay7A.headline).toContain('Sol 7 Part A');
  });
});
