export type PhasePresetId = 'room' | 'fridge';

export interface PhasePreset {
  id: PhasePresetId;
  label: string;
  hours: number;
  temperatureC: number;
}

export const PHASE_PRESETS: readonly PhasePreset[] = [
  { id: 'room', label: 'Raumtemperatur', hours: 2, temperatureC: 22 },
  { id: 'fridge', label: 'Kühlschrank', hours: 24, temperatureC: 4 },
];

export function findPhasePreset(id: PhasePresetId): PhasePreset {
  return PHASE_PRESETS.find((preset) => preset.id === id) ?? PHASE_PRESETS[0];
}
