import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { GeojsonService, PolygonData } from '../common/geojson.service';
import { PubSubService } from '../common/pubsub.service';
import { EventMessageKeyEnum, ObjectDto } from './objects.dto';

@Injectable()
export class ObjectsService implements OnModuleInit, OnModuleDestroy {
    private static readonly MOVE_INTERVAL_MS = 5 * 1000;
    private static readonly MUTATE_INTERVAL_MS = 60 * 1000;
    private static readonly SPEED_KMH = 200;
    private static readonly METERS_PER_DEGREE = 111000;

    private readonly log = new Logger(this.constructor.name);

    private objects: Map<string, ObjectDto> = new Map();
    private polygonData!: PolygonData;
    private timers: NodeJS.Timeout[] = [];

    constructor(
        private kmlSvc: GeojsonService,
        private pubSubService: PubSubService,
        private configService: ConfigService,
    ) {}

    onModuleInit() {
        const kmlPath = path.resolve(this.configService.get<string>('MAP_KML_PATH', 'map.kml'));
        this.polygonData = this.kmlSvc.parsePolygonFromFile(kmlPath);

        const count = Math.floor(Math.random() * 101) + 100;
        while (this.objects.size < count) this.addNewObject();

        this.timers.push(
            setInterval(() => {
                this.log.debug('Modifying objects collection');
                if (Math.random() < 0.5) this.addNewObject();
                else this.removeRandomObject();
            }, ObjectsService.MUTATE_INTERVAL_MS),
        );

        this.timers.push(setInterval(() => this.moveObjects(), ObjectsService.MOVE_INTERVAL_MS));
    }

    onModuleDestroy() {
        this.timers.forEach(timer => clearInterval(timer));
        this.timers = [];
    }

    private moveObjects() {
        const distanceDegrees =
            ((ObjectsService.SPEED_KMH / 3.6) * (ObjectsService.MOVE_INTERVAL_MS / 1000)) /
            ObjectsService.METERS_PER_DEGREE;

        this.objects.forEach(obj => {
            if (Math.random() < 0.3) {
                obj.direction += this.randomInRange(-2, 2);
            } else if (Math.random() < 0.05) {
                obj.direction += this.randomInRange(-15, 15);
            }

            const directionRadians = (obj.direction * Math.PI) / 180;
            const latitude = obj.latitude + distanceDegrees * Math.cos(directionRadians);
            const longitude =
                obj.longitude +
                (distanceDegrees * Math.sin(directionRadians)) / Math.cos((obj.latitude * Math.PI) / 180);

            if (this.isPointInPolygon(latitude, longitude)) {
                obj.latitude = latitude;
                obj.longitude = longitude;
            } else {
                // Turn back at the polygon border instead of leaving the area
                obj.direction += 180 + this.randomInRange(-30, 30);
            }

            obj.direction = ((obj.direction % 360) + 360) % 360;
            obj.updatedAt = new Date();
        });

        this.pubSubService.publish(EventMessageKeyEnum.UPDATE_OBJECTS, this.getList());
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

        this.pubSubService.publish(EventMessageKeyEnum.ADD_OBJECT, { ...newObj });
    }

    // Removal is intentionally not published: clients drop objects that stop receiving updates
    private removeRandomObject() {
        const ids = Array.from(this.objects.keys());
        if (ids.length === 0) return;
        const randomId = ids[Math.floor(Math.random() * ids.length)];
        this.objects.delete(randomId);
    }

    getList(): ObjectDto[] {
        return Array.from(this.objects.values(), obj => ({ ...obj }));
    }
}
