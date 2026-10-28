import L from 'leaflet';
import 'leaflet.markercluster';
import { ObjectDto } from '~/api/generated.schemas';
import { formatCoordinate, formatDirection, formatTime } from '~/utils/format';
import { createAirplaneIconHtml, rotateAirplaneIcon } from './map.airplane.icon';

interface TrackedObject {
    marker: L.Marker;
    object: ObjectDto;
}

export class MapObjectsLayer {
    private static readonly ICON_SIZE = 50;
    private static readonly POPUP_OFFSET: L.PointTuple = [0, -25];

    private readonly tracked = new Map<string, TrackedObject>();
    private readonly markerIds = new WeakMap<L.Marker, string>();
    private readonly cluster = L.markerClusterGroup({
        chunkedLoading: true,
        iconCreateFunction: MapObjectsLayer.createClusterIcon,
    });
    private readonly popup = L.popup({ offset: MapObjectsLayer.POPUP_OFFSET });

    private selectedId?: string;
    private pending?: ObjectDto[];
    private isMoving = false;

    constructor(private readonly map: L.Map) {
        this.cluster.on('click', this.onMarkerClick);
        this.popup.on('remove', this.onPopupRemove);
        this.map.on('movestart', this.onMoveStart);
        this.map.on('moveend', this.onMoveEnd);
        this.map.addLayer(this.cluster);
    }

    destroy() {
        this.map.off('movestart', this.onMoveStart);
        this.map.off('moveend', this.onMoveEnd);
        this.map.closePopup(this.popup);
        this.map.removeLayer(this.cluster);
    }

    update = (objects: ObjectDto[]) => {
        if (this.isMoving) {
            this.pending = objects;
            return;
        }

        const seen = new Set<string>();
        const added: L.Marker[] = [];
        const moved: TrackedObject[] = [];

        for (const object of objects) {
            seen.add(object.id);
            const entry = this.tracked.get(object.id);

            if (!entry) {
                const marker = this.createMarker(object);
                this.tracked.set(object.id, { marker, object });
                added.push(marker);
                continue;
            }

            const position = entry.marker.getLatLng();
            entry.object = object;
            if (position.lat !== object.latitude || position.lng !== object.longitude) moved.push(entry);
            else rotateAirplaneIcon(entry.marker.getElement(), object.direction);
        }

        const removed: L.Marker[] = [];
        this.tracked.forEach(({ marker }, id) => {
            if (seen.has(id)) return;
            this.tracked.delete(id);
            removed.push(marker);
        });

        const movedMarkers = moved.map(({ marker }) => marker);
        this.cluster.removeLayers([...movedMarkers, ...removed]);
        moved.forEach(({ marker, object }) => marker.setLatLng([object.latitude, object.longitude]));
        this.cluster.addLayers([...movedMarkers, ...added]);

        this.refreshPopup();
    };

    private createMarker(object: ObjectDto) {
        const size = MapObjectsLayer.ICON_SIZE;
        const marker = L.marker([object.latitude, object.longitude], {
            icon: L.divIcon({
                html: createAirplaneIconHtml(object.id.slice(-6)),
                className: 'custom-airplane-icon',
                iconSize: [size, size],
                iconAnchor: [size / 2, size / 2],
            }),
        });

        this.markerIds.set(marker, object.id);
        marker.on('add', () => {
            const current = this.tracked.get(object.id)?.object ?? object;
            rotateAirplaneIcon(marker.getElement(), current.direction);
        });

        return marker;
    }

    private refreshPopup() {
        if (!this.selectedId || !this.map.hasLayer(this.popup)) return;

        const entry = this.tracked.get(this.selectedId);
        if (!entry) {
            this.map.closePopup(this.popup);
            return;
        }

        this.popup.setLatLng(entry.marker.getLatLng()).setContent(MapObjectsLayer.createPopupHtml(entry.object));
    }

    private onMarkerClick = (event: L.LeafletEvent) => {
        const marker = event.propagatedFrom as L.Marker;
        const id = this.markerIds.get(marker);
        const entry = id && this.tracked.get(id);
        if (!entry) return;

        this.selectedId = id;
        this.popup
            .setLatLng(marker.getLatLng())
            .setContent(MapObjectsLayer.createPopupHtml(entry.object))
            .openOn(this.map);
    };

    private onPopupRemove = () => {
        this.selectedId = undefined;
    };

    private onMoveStart = () => {
        this.isMoving = true;
    };

    private onMoveEnd = () => {
        this.isMoving = false;
        const pending = this.pending;
        this.pending = undefined;
        if (pending) this.update(pending);
    };

    private static createPopupHtml(object: ObjectDto) {
        return `<div>
            <strong>${object.id.slice(-6)}</strong><br />
            <strong>Position:</strong><br />
            Lat: ${formatCoordinate(object.latitude)}<br />
            Lng: ${formatCoordinate(object.longitude)}<br />
            <strong>Direction:</strong> ${formatDirection(object.direction)}<br />
            <strong>Updated:</strong> ${formatTime(object.updatedAt)}
        </div>`;
    }

    private static createClusterIcon(cluster: L.MarkerCluster) {
        const count = cluster.getChildCount();
        const [backgroundColor, size, fontSize] =
            count < 10 ? ['#2196f3', 30, 11] : count < 100 ? ['#ff9800', 40, 13] : ['#f44336', 50, 15];

        return L.divIcon({
            html: `<div style="
                background: ${backgroundColor};
                border: 2px solid #ffffff;
                border-radius: 50%;
                color: #ffffff;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: ${fontSize}px;
                font-weight: bold;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                width: ${size}px;
                height: ${size}px;
            "><span>${count}</span></div>`,
            className: 'custom-cluster-icon',
            iconSize: L.point(size, size, true),
        });
    }
}
