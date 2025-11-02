import L from 'leaflet';
import { memo, useCallback, useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import { ObjectDto } from '~/api/generated.schemas';
import { formatCoordinate, formatDirection, formatTime } from '~/utils/format';
import { createAirplaneIconHtml } from '~/view/map/map.airplane.icon';

const createAirplaneIcon = (direction: number, name: string) => {
    return L.divIcon({
        html: createAirplaneIconHtml({ direction, name }),
        className: 'custom-airplane-icon',
        iconSize: [50, 50],
        iconAnchor: [25, 25],
        popupAnchor: [0, -25],
    });
};

interface MapMarkerProps {
    object: ObjectDto;
    onClick?: (object: ObjectDto) => void;
}

export const MapMarker = memo(
    ({ object, onClick }: MapMarkerProps) => {
        const click = useCallback(() => onClick?.(object), [object, onClick]);
        const eventHandlers = useMemo<L.LeafletEventHandlerFnMap>(() => ({ click }), [click]);
        const name = useMemo(() => object.id.slice(-6), [object.id]);
        const icon = useMemo(() => createAirplaneIcon(object.direction, name), [name, object.direction]);
        const position = useMemo<L.LatLngExpression>(
            () => [object.latitude, object.longitude],
            [object.latitude, object.longitude],
        );

        return (
            <Marker position={position} icon={icon} eventHandlers={eventHandlers}>
                <Popup>
                    <div>
                        <strong>{name}</strong>
                        <br />
                        <strong>Position:</strong>
                        <br />
                        Lat: {formatCoordinate(object.latitude)}
                        <br />
                        Lng: {formatCoordinate(object.longitude)}
                        <br />
                        <strong>Direction:</strong> {formatDirection(object.direction)}
                        <br />
                        <strong>Updated:</strong> {formatTime(object.updatedAt)}
                    </div>
                </Popup>
            </Marker>
        );
    },
    (prev, next) => prev.object.updatedAt === next.object.updatedAt,
);
