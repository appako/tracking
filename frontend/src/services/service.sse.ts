import { EventSourceMessage, fetchEventSource } from '@microsoft/fetch-event-source';
import { useEffect } from 'react';
import { singleton } from 'tsyringe';
import {
    EventCreateObjectDto,
    EventMessageDtoData,
    EventMessageKeyEnum,
    EventMessageTypeEnum,
    EventUpdateObjectsDto,
} from '~/api/generated.schemas';
import { ApiService } from './service.api';
import { AuthService } from './service.auth';
import { HudService } from './service.hud';
import { ObjectsService } from './service.objects';

class FatalSseError extends Error {}

@singleton()
export class SseService {
    private static readonly RETRY_INTERVAL_MS = 5000;

    private controller?: AbortController;

    constructor(
        private readonly apiSvc: ApiService,
        private readonly authSvc: AuthService,
        private readonly objectsSvc: ObjectsService,
        private readonly hudSvc: HudService,
    ) {}

    private disconnect() {
        this.controller?.abort();
        this.controller = undefined;
        this.objectsSvc.stopCleanup();
    }

    private connect() {
        if (this.controller) return;

        const Authorization = this.authSvc.apiKey;
        if (!Authorization) {
            console.warn('No auth token available for SSE connection');
            return;
        }

        const controller = new AbortController();
        this.controller = controller;
        this.objectsSvc.startCleanup();

        const [sseKey] = this.apiSvc.getObjectsControllerStreamQueryKey();
        const sseUrl = `${process.env.API_HOST}${sseKey}`;

        fetchEventSource(sseUrl, {
            signal: controller.signal,
            openWhenHidden: true,
            headers: { Authorization, Accept: 'text/event-stream' },

            onmessage: this.processMessage,

            onopen: async response => {
                if (response.status === 401) {
                    this.authSvc.logout();
                    throw new FatalSseError('SSE connection unauthorized');
                }
                if (!response.ok) throw new Error(`SSE connection failed: ${response.status} ${response.statusText}`);

                this.objectsSvc.load().catch(error => console.error('Failed to load objects:', error));
            },

            onclose: () => {
                throw new Error('SSE connection closed by server');
            },

            onerror: error => {
                if (error instanceof FatalSseError) throw error;
                console.error('SSE connection error:', error);
                return SseService.RETRY_INTERVAL_MS;
            },
        }).catch(error => console.error('SSE connection stopped:', error));
    }

    private processMessage = (msg: EventSourceMessage) => {
        if (msg.event !== EventMessageTypeEnum.message) return;
        this.hudSvc.recordMessage(msg.data.length);

        try {
            const data = JSON.parse(msg.data) as EventMessageDtoData;

            switch (data?.type) {
                case EventMessageKeyEnum.UPDATE_OBJECTS:
                    this.objectsSvc.setMany((data as EventUpdateObjectsDto).value);
                    break;
                case EventMessageKeyEnum.ADD_OBJECT:
                    this.objectsSvc.setMany([(data as EventCreateObjectDto).value]);
                    break;
                default:
                    console.log('Unknown SSE event type:', data?.type);
            }
        } catch (error) {
            console.error('Error parsing SSE event:', error);
        }
    };

    useSseConnection = () => {
        useEffect(() => {
            this.connect();
            return () => this.disconnect();
        }, []);
    };
}
