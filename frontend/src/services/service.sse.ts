import { EventSourceMessage, fetchEventSource } from '@microsoft/fetch-event-source';
import { action, observable } from 'mobx';
import { useEffect } from 'react';
import { singleton } from 'tsyringe';
import { ObjectDto } from '~/api/generated.schemas';
import { ApiService } from './service.api';
import { AuthService } from './service.auth';
import { ObjectsService } from './service.objects';

@singleton()
export class SseService {
    @observable isConnected = false;
    @observable controller = new AbortController();

    constructor(
        private readonly apiSvc: ApiService,
        private readonly authSvc: AuthService,
        private readonly objectsSvc: ObjectsService,
    ) {}

    @action.bound private setIsConnected(connected: boolean) {
        this.isConnected = connected;
    }

    private disconnect() {
        if (this.controller) this.controller.abort();
        this.setIsConnected(false);
        console.log('SSE connection disconnected');
    }

    private connect() {
        if (this.isConnected) return;

        const Authorization = this.authSvc.apiKey;
        if (!Authorization) {
            console.warn('No auth token available for SSE connection');
            return;
        }

        this.setIsConnected(true);
        const [sseKey] = this.apiSvc.getObjectsControllerStreamQueryKey();
        const sseUrl = `${process.env.API_HOST}${sseKey}`;

        fetchEventSource(sseUrl, {
            signal: this.controller.signal,
            openWhenHidden: true,
            headers: { Authorization, Accept: 'text/event-stream' },

            onmessage: this.processMessage,

            async onopen(response) {
                if (response.ok) console.log('SSE connection opened successfully');
                else console.error('SSE connection failed:', response.status, response.statusText);
            },

            onclose: () => {
                console.log('SSE connection closed');
                this.setIsConnected(false);
            },
            onerror: error => {
                console.error('SSE connection error:', error);
                this.setIsConnected(false);
                return 5000;
            },
        }).catch(error => {
            console.error('SSE fetchEventSource error:', error);
            this.setIsConnected(false);
        });
    }

    private processMessage = (msg: EventSourceMessage) => {
        try {
            if (msg.event !== 'message') return;

            const { value, type } = JSON.parse(msg.data);

            switch (type) {
                case 'UPDATE_OBJECT':
                case 'ADD_OBJECT':
                    if (value.id && value.latitude !== undefined && value.longitude !== undefined) {
                        const objectDto: ObjectDto = {
                            id: value.id,
                            latitude: value.latitude,
                            longitude: value.longitude,
                            direction: value.direction,
                            createdAt: value.createdAt,
                            updatedAt: value.updatedAt,
                        };
                        this.objectsSvc.setObject(objectDto);
                    }
                    break;
                default:
                    console.log('Unknown SSE event type:', value.type);
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
