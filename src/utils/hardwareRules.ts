
import type { Option } from '@/types/guitar';

interface HardwarePair {
  chromeId: number;
  blackId: number;
}

const HARDWARE_PAIRS: HardwarePair[] = [
  { chromeId: 997, blackId: 102 },   // Tuners 6
  { chromeId: 999, blackId: 731 },   // Knob Volume
  { chromeId: 1012, blackId: 1011 }, // Knob Volume + Tone
  { chromeId: 996, blackId: 112 },   // Ponte Hipshot Fixed
];

export const shouldApplyHardwareRules = (
  selections: Record<number, number>
): boolean => {
  const hasBlackHardware = selections[727] !== undefined; // Hardware Color Black
  const hasSixStrings = selections[369] !== undefined;    // 6 Strings
  return hasBlackHardware && hasSixStrings;
};

export const getHardwareOptionToShow = (
  optionId: number,
  selections: Record<number, number>
): number | undefined => {
  if (!shouldApplyHardwareRules(selections)) {
    return undefined;
  }

  const pair = HARDWARE_PAIRS.find(
    pair => pair.chromeId === optionId || pair.blackId === optionId
  );

  if (!pair) {
    return undefined;
  }

  // If it's a chrome option, show the black version
  if (pair.chromeId === optionId) {
    return pair.blackId;
  }
  // If it's a black option, show the chrome version
  if (pair.blackId === optionId) {
    return pair.chromeId;
  }

  return undefined;
};

export const shouldHideOption = (
  optionId: number,
  selections: Record<number, number>
): boolean => {
  if (!shouldApplyHardwareRules(selections)) {
    return false;
  }

  const pair = HARDWARE_PAIRS.find(
    pair => pair.chromeId === optionId || pair.blackId === optionId
  );

  if (!pair) {
    return false;
  }

  // Hide chrome options if black hardware is selected
  if (pair.chromeId === optionId) {
    return true;
  }

  return false;
};
