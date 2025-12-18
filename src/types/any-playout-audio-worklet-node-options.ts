import { TAnyContext, TContext } from 'standardized-audio-context';
import { TNativePlayoutAudioWorkletNodeOptions } from './native-playout-audio-worklet-node-options';
import { TPlayoutAudioWorkletNodeOptions } from './playout-audio-worklet-node-options';

export type TAnyPlayoutAudioWorkletNodeOptions<T extends TAnyContext> = T extends TContext
    ? TPlayoutAudioWorkletNodeOptions
    : TNativePlayoutAudioWorkletNodeOptions;
