import L from 'leaflet';
import 'leaflet.markercluster';
import { ObjectDto } from '~/api/generated.schemas';
import { createAirplaneIconHtml, rotateAirplaneIcon } from './map.airplane.icon';
import { createObjectPopupHtml } from './map.popup';

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
    private popup?: L.Popup;
    private selectedId?: string;
    private pending?: ObjectDto[];
    private isMoving = false;

    constructor(
        private readonly map: L.Map,
        private readonly onSelect: (id: string | undefined) => void,
    ) {
        this.cluster.on('click', this.onMarkerClick);
        this.map.on('movestart', this.onMoveStart);
        this.map.on('moveend', this.onMoveEnd);
        this.map.addLayer(this.cluster);
    }

    destroy() {
        this.map.off('movestart', this.onMoveStart);
        this.map.off('moveend', this.onMoveEnd);
        this.closePopup();
        this.map.removeLayer(this.cluster);
    }

    select = (id: string | undefined) => {
        if (id === this.selectedId && (!id || this.popup)) return;
        this.selectedId = id;

        const entry = id && this.tracked.get(id);
        if (!entry) {
            this.closePopup();
            return;
        }

        const popup = L.popup({ offset: MapObjectsLayer.POPUP_OFFSET })
            .setLatLng(entry.marker.getLatLng())
            .setContent(createObjectPopupHtml(entry.object));
        popup.on('remove', () => {
            if (this.popup !== popup) return;
            this.popup = undefined;
            this.selectedId = undefined;
            this.onSelect(undefined);
        });
        this.popup = popup;
        popup.openOn(this.map);
    };

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

        if (this.selectedId && !this.popup) this.select(this.selectedId);
        else this.refreshPopup();
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
        if (!this.selectedId || !this.popup) return;

        const entry = this.tracked.get(this.selectedId);
        if (!entry) {
            this.closePopup();
            this.selectedId = undefined;
            this.onSelect(undefined);
            return;
        }

        this.popup.setLatLng(entry.marker.getLatLng()).setContent(createObjectPopupHtml(entry.object));
    }

    private closePopup() {
        const popup = this.popup;
        this.popup = undefined;
        if (popup) this.map.closePopup(popup);
    }

    private onMarkerClick = (event: L.LeafletEvent) => {
        const id = this.markerIds.get(event.propagatedFrom as L.Marker);
        if (id) this.onSelect(id);
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
