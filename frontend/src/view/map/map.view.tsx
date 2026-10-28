import { Paper, styled } from '@mui/material';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet/dist/leaflet.css';
import { reaction } from 'mobx';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { useService } from '~/services/service.base';
import { MapService } from '~/services/service.map';
import { ObjectsService } from '~/services/service.objects';
import { MapHud } from './map.hud';
import { MapObjectsLayer } from './map.objects.layer';

const StypedPaper = styled(Paper)({
    position: 'relative',
    height: '100%',
    overflow: 'hidden',
    '& .leaflet-container': {
        height: '100%',
        width: '100%',
    },
});

const MapController = observer(() => {
    const mapInstance = useMap();
    const [mapService] = useService(MapService);

    useEffect(() => {
        if (mapInstance) {
            mapInstance.setView(mapService.center, mapService.zoom);
        }
    }, [mapInstance, mapService.center, mapService.zoom]);

    return null;
});

const MapObjects = () => {
    const map = useMap();
    const [objects] = useService(ObjectsService);

    useEffect(() => {
        const layer = new MapObjectsLayer(map);
        const dispose = reaction(() => objects.items, layer.update, { fireImmediately: true });

        return () => {
            dispose();
            layer.destroy();
        };
    }, [map, objects]);

    return null;
};

export const MapView = observer(() => {
    const [map] = useService(MapService);
    return (
        <StypedPaper>
            <MapContainer center={map.center} zoom={map.zoom} style={{ height: '100%', width: '100%' }}>
                <MapController />
                <TileLayer
                    url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <MapObjects />
            </MapContainer>
            <MapHud />
        </StypedPaper>
    );
});
