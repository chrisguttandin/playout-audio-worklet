import {
    IAudioWorkletNode,
    TAudioWorkletNodeConstructor,
    TContext,
    TNativeAudioWorkletNode,
    TNativeAudioWorkletNodeConstructor,
    TNativeContext
} from 'standardized-audio-context';
import { IPlayoutAudioWorkletNode } from './interfaces';
import { TAnyAudioWorkletNodeOptions, TAnyPlayoutAudioWorkletNodeOptions, TFixedOptions, TNativePlayoutAudioWorkletNode } from './types';
import { worklet } from './worklet/worklet';

/*
 * @todo Explicitly referencing the barrel file seems to be necessary when enabling the
 * isolatedModules compiler option.
 */
export * from './interfaces/index';
export * from './types/index';

const blob = new Blob([worklet], { type: 'application/javascript; charset=utf-8' });

export const addPlayoutAudioWorkletModule = async (addAudioWorkletModule: (url: string) => Promise<void>) => {
    const url = URL.createObjectURL(blob);

    try {
        await addAudioWorkletModule(url);
    } finally {
        URL.revokeObjectURL(url);
    }
};

export function createPlayoutAudioWorkletNode<T extends TContext | TNativeContext>(
    audioWorkletNodeConstructor: T extends TContext ? TAudioWorkletNodeConstructor : TNativeAudioWorkletNodeConstructor,
    context: T,
    options: Partial<TAnyPlayoutAudioWorkletNodeOptions<T>> = {}
): T extends TContext ? IPlayoutAudioWorkletNode<T> : TNativePlayoutAudioWorkletNode {
    type TAnyAudioWorkletNode = T extends TContext ? IAudioWorkletNode<T> : TNativeAudioWorkletNode;
    type TAnyPlayoutAudioWorkletNode = T extends TContext ? IPlayoutAudioWorkletNode<T> : TNativePlayoutAudioWorkletNode;

    const { numberOfChannels, readPointerView, startView, stopView, storageView, writePointerView } = options;
    const fixedOptions: Required<Pick<TAnyAudioWorkletNodeOptions<T>, TFixedOptions>> = {
        numberOfInputs: 0,
        numberOfOutputs: 1,
        outputChannelCount: <number[]>[numberOfChannels],
        processorOptions: {
            readPointerView,
            startView,
            stopView,
            storageView,
            writePointerView
        }
    };
    const audioWorkletNode: TAnyAudioWorkletNode = new (<any>audioWorkletNodeConstructor)(context, 'playout-audio-worklet-processor', {
        ...options,
        ...fixedOptions
    });
    const listener = () => {
        audioWorkletNode.port.removeEventListener('message', listener);
        audioWorkletNode.port.close();
        audioWorkletNode.dispatchEvent(new Event('ended'));
    };

    audioWorkletNode.port.addEventListener('message', listener);
    audioWorkletNode.port.start();

    Object.defineProperties(audioWorkletNode, {
        port: {
            get(): TAnyPlayoutAudioWorkletNode['port'] {
                throw new Error("The port of a PlayoutAudioWorkletNode can't be accessed.");
            }
        }
    });

    return <TAnyPlayoutAudioWorkletNode>audioWorkletNode;
}
