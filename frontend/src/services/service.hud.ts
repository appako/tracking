import { action, makeObservable, observable } from 'mobx';
import { useEffect } from 'react';
import { singleton } from 'tsyringe';

@singleton()
export class HudService {
    private static readonly SAMPLE_INTERVAL_MS = 1000;

    @observable fps = 0;
    @observable messagesPerSec = 0;
    @observable bytesPerSec = 0;
    @observable maxMessageBytes = 0;

    private frames = 0;
    private messages = 0;
    private bytes = 0;
    private maxBytes = 0;
    private lastSampleAt = 0;
    private frameRequest?: number;
    private sampleTimer?: ReturnType<typeof setInterval>;

    constructor() {
        makeObservable(this);
    }

    recordMessage(bytes: number) {
        this.messages++;
        this.bytes += bytes;
        this.maxBytes = Math.max(this.maxBytes, bytes);
    }

    private start() {
        if (this.sampleTimer) return;
        this.lastSampleAt = performance.now();
        this.frameRequest = requestAnimationFrame(this.countFrame);
        this.sampleTimer = setInterval(this.sample, HudService.SAMPLE_INTERVAL_MS);
    }

    private stop() {
        if (this.frameRequest !== undefined) cancelAnimationFrame(this.frameRequest);
        clearInterval(this.sampleTimer);
        this.frameRequest = undefined;
        this.sampleTimer = undefined;
    }

    private countFrame = () => {
        this.frames++;
        this.frameRequest = requestAnimationFrame(this.countFrame);
    };

    @action.bound private sample() {
        const now = performance.now();
        const seconds = (now - this.lastSampleAt) / 1000;
        this.fps = this.frames / seconds;
        this.messagesPerSec = this.messages / seconds;
        this.bytesPerSec = this.bytes / seconds;
        if (this.messages) this.maxMessageBytes = this.maxBytes;
        this.frames = 0;
        this.messages = 0;
        this.bytes = 0;
        this.maxBytes = 0;
        this.lastSampleAt = now;
    }

    useHud = () => {
        useEffect(() => {
            this.start();
            return () => this.stop();
        }, []);
    };
}
