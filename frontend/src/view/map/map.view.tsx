import { Paper, styled } from '@mui/material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { observer } from 'mobx-react-lite';
import { FC, useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import { useService } from '~/services/service.base';
import { MapService } from '~/services/service.map';
import { ObjectsService } from '~/services/service.objects';
import { MapHud } from './map.hud';
import { MapMarker } from './map.marker';

const StypedPaper = styled(Paper)({
    position: 'relative',
    height: '100%',
    overflow: 'hidden',
    '& .leaflet-container': {
        height: '100%',
        width: '100%',
    },
});

const onIconCreate = (cluster: any) => {
    const count = cluster.getChildCount();
    let backgroundColor = '#2196f3';
    let size = 30;
    let fontSize = 11;

    if (count < 10) {
        backgroundColor = '#2196f3';
        size = 30;
        fontSize = 11;
    } else if (count < 100) {
        backgroundColor = '#ff9800';
        size = 40;
        fontSize = 13;
    } else {
        backgroundColor = '#f44336';
        size = 50;
        fontSize = 15;
    }

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
};

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

const MapCluster: FC = observer(() => {
    const [objects] = useService(ObjectsService);

    return (
        <MarkerClusterGroup chunkedLoading iconCreateFunction={onIconCreate}>
            {objects.items.map(object => (
                <MapMarker key={object.id} object={object} />
            ))}
        </MarkerClusterGroup>
    );
});

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
                <MapCluster />
            </MapContainer>
            <MapHud />
        </StypedPaper>
    );
});
