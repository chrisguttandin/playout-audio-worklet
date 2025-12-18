import { AudioContext, AudioWorkletNode } from 'standardized-audio-context';
import { addPlayoutAudioWorkletModule, createPlayoutAudioWorkletNode } from '../../src/module';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { spy } from 'sinon';

describe('module', () => {
    describe('addPlayoutAudioWorkletModule()', () => {
        it('should call the given function with an URL', () => {
            const addAudioWorkletModule = spy();

            addPlayoutAudioWorkletModule(addAudioWorkletModule);

            expect(addAudioWorkletModule).to.have.been.calledOnce;

            const { args } = addAudioWorkletModule.getCall(0);

            expect(args).to.have.a.lengthOf(1);
            expect(args[0]).to.be.a('string');
            expect(args[0]).to.match(/^blob:/);
        });
    });

    describe('createPlayoutAudioWorkletNode()', () => {
        const testCases = {
            'with a native AudioContext': {
                audioWorkletNodeConstructor: window.AudioWorkletNode,
                createAddAudioWorkletModule: (context) => (url) => context.audioWorklet.addModule(url),
                createContext: () => new window.AudioContext()
            },
            'with a standardized AudioContext': {
                audioWorkletNodeConstructor: AudioWorkletNode,
                createAddAudioWorkletModule: (context) => (url) => context.audioWorklet.addModule(url),
                createContext: () => new AudioContext()
            }
        };

        for (const [description, { audioWorkletNodeConstructor, createAddAudioWorkletModule, createContext }] of Object.entries(
            testCases
        )) {
            describe(`with the ${description}`, () => {
                let context;
                let playoutAudioWorkletNode;

                afterEach(() => {
                    if (context.close !== undefined) {
                        return context.close();
                    }
                });

                beforeEach(async () => {
                    context = createContext();

                    await addPlayoutAudioWorkletModule(createAddAudioWorkletModule(context));

                    const numberOfChannels = 1;
                    // eslint-disable-next-line no-undef
                    const sharedArrayBuffer = new SharedArrayBuffer(524);
                    const readPointerView = new Uint32Array(sharedArrayBuffer, 4, 1);
                    const startView = new Uint16Array(sharedArrayBuffer, 8, 1);
                    const stopView = new Uint16Array(sharedArrayBuffer, 10, 1);
                    const storageView = new Float32Array(sharedArrayBuffer, 12, 128);
                    const writePointerView = new Uint32Array(sharedArrayBuffer, 0, 1);

                    playoutAudioWorkletNode = createPlayoutAudioWorkletNode(audioWorkletNodeConstructor, context, {
                        numberOfChannels,
                        readPointerView,
                        startView,
                        stopView,
                        storageView,
                        writePointerView
                    });
                });

                it('should return an instance of the EventTarget interface', () => {
                    expect(playoutAudioWorkletNode.addEventListener).to.be.a('function');
                    expect(playoutAudioWorkletNode.dispatchEvent).to.be.a('function');
                    expect(playoutAudioWorkletNode.removeEventListener).to.be.a('function');
                });

                it('should return an instance of the AudioNode interface', () => {
                    expect(playoutAudioWorkletNode.channelCount).to.equal(2);
                    expect(playoutAudioWorkletNode.channelCountMode).to.equal(
                        playoutAudioWorkletNode instanceof AudioWorkletNode ? 'explicit' : 'max'
                    );
                    expect(playoutAudioWorkletNode.channelInterpretation).to.equal('speakers');
                    expect(playoutAudioWorkletNode.connect).to.be.a('function');
                    expect(playoutAudioWorkletNode.context).to.be.an.instanceOf(context.constructor);
                    expect(playoutAudioWorkletNode.disconnect).to.be.a('function');
                    expect(playoutAudioWorkletNode.numberOfInputs).to.equal(0);
                    expect(playoutAudioWorkletNode.numberOfOutputs).to.equal(1);
                });

                it('should return an instance of the AudioWorkletNode interface', () => {
                    expect(playoutAudioWorkletNode.onprocessorerror).to.be.null;
                    expect(playoutAudioWorkletNode.parameters).not.to.be.undefined;
                });

                describe('port', () => {
                    it('should throw an error', () => {
                        expect(() => {
                            playoutAudioWorkletNode.port;
                        }).to.throw(Error, "The port of a PlayoutAudioWorkletNode can't be accessed.");
                    });
                });
            });
        }
    });
});
