import { TNativeAudioWorkletNodeOptions } from 'standardized-audio-context';
import { TFixedOptions } from './fixed-options';

export type TNativePlayoutAudioWorkletNodeOptions = Omit<TNativeAudioWorkletNodeOptions, TFixedOptions> & {
    numberOfChannels: number;

    readPointerView: Uint8Array | Uint16Array | Uint32Array;

    startView: Uint8Array;

    stopView: Uint8Array;

    storageView: Float32Array;

    writePointerView: Uint8Array | Uint16Array | Uint32Array;
};
