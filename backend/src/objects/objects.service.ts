import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { GeojsonService, PolygonData } from '../common/geojson.service';
import { PubSubService } from '../common/pubsub.service';
import { ObjectDto } from './objects.dto';

@Injectable()
export class ObjectsService implements OnModuleInit {
    private readonly log = new Logger(this.constructor.name);

    private objects: Map<string, ObjectDto> = new Map();
    private polygonData!: PolygonData;

    constructor(
        private kmlSvc: GeojsonService,
        private pubSubService: PubSubService,
    ) {}

    onModuleInit() {
        this.polygonData = this.kmlSvc.parsePolygonFromFile('./map.kml');

        const count = Math.floor(Math.random() * 101) + 100;
        while (this.objects.size < count) this.addNewObject();

        setInterval(() => {
            this.log.debug('Modifying objects collection');
            if (Math.random() < 0.5) this.addNewObject();
            else this.removeRandomObject();
        }, 60 * 1000);

        setInterval(() => {
            this.log.debug('Updating object positions');
            this.objects.forEach(obj => {
                const speedKmh = 200;
                const speedMs = speedKmh / 3.6;
                const intervalSeconds = 5;
                const distanceMeters = speedMs * intervalSeconds;
                const speedDegrees = distanceMeters / 111000;

                const directionRadians = (obj.direction * Math.PI) / 180;

                const deltaLat = speedDegrees * Math.cos(directionRadians);
                const deltaLng = speedDegrees * Math.sin(directionRadians);

                if (Math.random() < 0.3) {
                    obj.direction += this.randomInRange(-2, 2);
                } else if (Math.random() < 0.05) {
                    obj.direction += this.randomInRange(-15, 15);
                }

                obj.direction = (obj.direction + 360) % 360;
                obj.latitude += deltaLat;
                obj.longitude += deltaLng;

                obj.updatedAt = new Date();

                this.pubSubService.publish('UPDATE_OBJECT', obj);
            });
        }, 5 * 1000);
    }

    private randomInRange(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }

    private isPointInPolygon(lat: number, lng: number): boolean {
        const polygon = this.polygonData.coordinates;

        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i][0];
            const yi = polygon[i][1];
            const xj = polygon[j][0];
            const yj = polygon[j][1];

            if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
                inside = !inside;
            }
        }
        return inside;
    }

    private generateRandomCoordinatesInPolygon(): { latitude: number; longitude: number } {
        const { bounds, center } = this.polygonData;

        let latitude: number, longitude: number;
        let attempts = 0;
        const maxAttempts = 1000;

        do {
            latitude = this.randomInRange(bounds.minLat, bounds.maxLat);
            longitude = this.randomInRange(bounds.minLng, bounds.maxLng);
            attempts++;
        } while (!this.isPointInPolygon(latitude, longitude) && attempts < maxAttempts);

        if (attempts >= maxAttempts) {
            latitude = center.latitude;
            longitude = center.longitude;
        }

        return { latitude, longitude };
    }

    private addNewObject() {
        const id = uuidv4();
        const coordinates = this.generateRandomCoordinatesInPolygon();
        const newObj = {
            id,
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            direction: this.randomInRange(0, 360),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.objects.set(id, newObj);

        this.pubSubService.publish('ADD_OBJECT', newObj);

        return [id, newObj] as const;
    }

    private removeRandomObject() {
        const ids = Array.from(this.objects.keys());
        if (ids.length === 0) return false;
        const randomId = ids[Math.floor(Math.random() * ids.length)];
        this.objects.delete(randomId);
    }

    getList(): ObjectDto[] {
        return Array.from(this.objects.values());
    }
}
