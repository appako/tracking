import { Injectable } from '@nestjs/common';
import { kml } from '@tmcw/togeojson';
import { DOMParser } from '@xmldom/xmldom';
import * as fs from 'fs';

export interface PolygonData {
    coordinates: [number, number][];
    bounds: {
        minLat: number;
        maxLat: number;
        minLng: number;
        maxLng: number;
    };
    center: {
        latitude: number;
        longitude: number;
    };
}

@Injectable()
export class GeojsonService {
    parsePolygonFromFile(filePath: string): PolygonData {
        try {
            const kmlContent = fs.readFileSync(filePath, 'utf-8');
            const dom = new DOMParser().parseFromString(kmlContent);

            const geoJson = kml(dom);

            const polygonFeature = geoJson.features?.find(feature => feature.geometry?.type === 'Polygon');

            if (!polygonFeature || polygonFeature.geometry?.type !== 'Polygon') {
                throw new Error('No polygon found in KML file');
            }

            const coordinates = polygonFeature.geometry.coordinates[0] as [number, number][];

            if (coordinates.length < 3) {
                throw new Error('Polygon must have at least 3 coordinates');
            }

            const longitudes = coordinates.map(coord => coord[0]);
            const latitudes = coordinates.map(coord => coord[1]);

            const bounds = {
                minLng: Math.min(...longitudes),
                maxLng: Math.max(...longitudes),
                minLat: Math.min(...latitudes),
                maxLat: Math.max(...latitudes),
            };

            const center = {
                latitude: (bounds.minLat + bounds.maxLat) / 2,
                longitude: (bounds.minLng + bounds.maxLng) / 2,
            };

            return {
                coordinates,
                bounds,
                center,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to parse KML file: ${errorMessage}`);
        }
    }
}
