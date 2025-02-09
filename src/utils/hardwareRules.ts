
import type { Option } from '@/types/guitar';

interface HardwareMapping {
  chrome: number;
  black: number;
}

const HARDWARE_MAPPINGS: Record<string, HardwareMapping> = {
  tuners: { chrome: 997, black: 102 },
  knobVolume: { chrome: 999, black: 731 },
  knobVolumeTone: { chrome: 1012, black: 1011 },
  ponteHipshot: { chrome: 996, black: 112 },
};

const HARDWARE_COLOR = {
  BLACK: 727,
  CHROME: 728,
};

const SIX_STRINGS_ID = 369;

export const processHardwareSelections = (
  options: Option[],
  userSelections: Record<number, number>
): Option[] => {
  const hardwareColorSelection = Object.values(userSelections).find(
    id => id === HARDWARE_COLOR.BLACK || id === HARDWARE_COLOR.CHROME
  );
  const hasSixStrings = Object.values(userSelections).includes(SIX_STRINGS_ID);

  if (!hardwareColorSelection || !hasSixStrings) {
    return options;
  }

  const isBlackHardware = hardwareColorSelection === HARDWARE_COLOR.BLACK;

  return options.map(option => {
    // Find if this option is part of a hardware pair
    const hardwarePair = Object.values(HARDWARE_MAPPINGS).find(mapping =>
      isBlackHardware
        ? option.id === mapping.chrome || option.id === mapping.black
        : option.id === mapping.black || option.id === mapping.chrome
    );

    if (!hardwarePair) {
      return option;
    }

    // If black hardware is selected, hide chrome options and show black options
    if (isBlackHardware) {
      return {
        ...option,
        hidden: option.id === hardwarePair.chrome
      };
    }

    // If chrome hardware is selected, hide black options and show chrome options
    return {
      ...option,
      hidden: option.id === hardwarePair.black
    };
  });
};
