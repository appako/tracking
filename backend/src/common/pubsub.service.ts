import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

export interface PubSubEvent<T = unknown> {
    channel: string;
    data: T;
    timestamp: Date;
}

@Injectable()
export class PubSubService<T = unknown> {
    private eventSubject = new Subject<PubSubEvent<T>>();

    publish(channel: string, data: T): void {
        this.eventSubject.next({ channel, data, timestamp: new Date() });
    }

    subscribe(channel: string) {
        return this.eventSubject.pipe(filter(event => event.channel === channel));
    }
}
