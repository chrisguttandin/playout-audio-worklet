import { IAudioWorkletNodeOptions } from 'standardized-audio-context';
import { TFixedOptions } from './fixed-options';

export type TPlayoutAudioWorkletNodeOptions = Partial<Omit<IAudioWorkletNodeOptions, TFixedOptions>> & {
    numberOfChannels: number;

    readPointerView: Uint8Array | Uint16Array | Uint32Array;

    startView: Uint16Array;

    stopView: Uint16Array;

    storageView: Float32Array;

    writePointerView: Uint8Array | Uint16Array | Uint32Array;
};
