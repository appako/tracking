import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet/dist/leaflet.css';
import { reaction } from 'mobx';
import { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { useService } from '~/services/service.base';
import { MapService } from '~/services/service.map';
import { ObjectsService } from '~/services/service.objects';
import { MapObjectsLayer } from './map.objects.layer';

const MapSync = () => {
    const map = useMap();
    const [mapSvc] = useService(MapService);

    useEffect(() => {
        const saveViewport = () => mapSvc.saveViewport({ center: map.getCenter(), zoom: map.getZoom() });
        map.on('moveend', saveViewport);
        const dispose = reaction(
            () => mapSvc.focus,
            focus => focus && map.setView(focus.center, focus.zoom),
        );

        return () => {
            dispose();
            map.off('moveend', saveViewport);
        };
    }, [map, mapSvc]);

    return null;
};

const MapObjects = () => {
    const map = useMap();
    const [mapSvc, objects] = useService(MapService, ObjectsService);

    useEffect(() => {
        const layer = new MapObjectsLayer(map, mapSvc.select);
        const disposeItems = reaction(() => objects.items, layer.update, { fireImmediately: true });
        const disposeSelection = reaction(() => mapSvc.selectedId, layer.select, { fireImmediately: true });

        return () => {
            disposeSelection();
            disposeItems();
            layer.destroy();
        };
    }, [map, mapSvc, objects]);

    return null;
};

export const LeafletMapView = () => {
    const [mapSvc] = useService(MapService);
    const { center, zoom } = mapSvc.viewport;

    return (
        <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
            <MapSync />
            <TileLayer
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapObjects />
        </MapContainer>
    );
};
