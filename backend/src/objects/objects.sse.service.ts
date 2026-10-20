import { Injectable, Logger } from '@nestjs/common';
import { interval, merge, Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { PubSubService } from '../common/pubsub.service';
import { EventMessageData, EventMessageDto, EventMessageKeyEnum, EventMessageTypeEnum } from './objects.dto';

@Injectable()
export class ObjectsSseService {
    private static readonly HEARTBEAT_INTERVAL_MS = 30 * 1000;

    private readonly log = new Logger(this.constructor.name);

    constructor(private pubSubService: PubSubService<EventMessageData['value']>) {}

    createStream(): Observable<EventMessageDto> {
        this.log.debug('Creating SSE stream for object updates');

        const heartbeat$ = interval(ObjectsSseService.HEARTBEAT_INTERVAL_MS).pipe(
            map((): EventMessageDto => ({ id: uuidv4(), type: EventMessageTypeEnum.heartbeat, data: null })),
        );

        const events$ = Object.values(EventMessageKeyEnum).map(channel =>
            this.pubSubService.subscribe(channel).pipe(
                map(
                    (event): EventMessageDto => ({
                        id: uuidv4(),
                        type: EventMessageTypeEnum.message,
                        data: { type: channel, value: event.data } as EventMessageData,
                    }),
                ),
            ),
        );

        return merge(heartbeat$, ...events$).pipe(finalize(() => this.log.debug('SSE stream closed and cleaned up')));
    }
}
