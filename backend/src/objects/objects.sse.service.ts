import { Injectable, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { PubSubService } from '../common/pubsub.service';
import { EventMessageDto, EventMessageKeyEnum, EventMessageTypeEnum, ObjectDto } from './objects.dto';

@Injectable()
export class ObjectsSseService {
    private readonly log = new Logger(this.constructor.name);

    constructor(private pubSubService: PubSubService<ObjectDto>) {}

    createStream(): Observable<EventMessageDto<ObjectDto>> {
        this.log.debug('Creating SSE stream for object updates');

        return new Observable(subscriber => {
            const heartbeatTimer = setInterval(
                () => subscriber.next({ id: uuidv4(), type: EventMessageTypeEnum.heartbeat, data: null! }),
                30 * 1000,
            );

            const updateSubscription = this.pubSubService
                .subscribe(EventMessageKeyEnum.UPDATE_OBJECT)
                .pipe(
                    map(event => ({
                        id: uuidv4(),
                        type: EventMessageTypeEnum.message,
                        data: { type: EventMessageKeyEnum.UPDATE_OBJECT, value: event.data },
                    })),
                )
                .subscribe(message => subscriber.next(message));

            const addSubscription = this.pubSubService
                .subscribe(EventMessageKeyEnum.ADD_OBJECT)
                .pipe(
                    map(event => ({
                        id: uuidv4(),
                        type: EventMessageTypeEnum.message,
                        data: { type: EventMessageKeyEnum.ADD_OBJECT, value: event.data },
                    })),
                )
                .subscribe(message => subscriber.next(message));

            return () => {
                clearInterval(heartbeatTimer);
                updateSubscription.unsubscribe();
                addSubscription.unsubscribe();
                this.log.debug('SSE stream closed and cleaned up');
            };
        });
    }
}
