import { PickingInfo } from '@deck.gl/core';
import { IconLayer, TextLayer } from '@deck.gl/layers';
import { MapboxOverlay, MapboxOverlayProps } from '@deck.gl/mapbox';
import { Paper, ToggleButton } from '@mui/material';
import 'maplibre-gl/dist/maplibre-gl.css';
import { reaction } from 'mobx';
import { observer } from 'mobx-react-lite';
import { useEffect, useRef, useState } from 'react';
import { Map, MapRef, NavigationControl, Popup, useControl, ViewStateChangeEvent } from 'react-map-gl/maplibre';
import { ObjectDto } from '~/api/generated.schemas';
import { useService } from '~/services/service.base';
import { MapService } from '~/services/service.map';
import { ObjectsService } from '~/services/service.objects';
import { createObjectPopupHtml } from './map.popup';

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty';
const CANVAS_CONTEXT_ATTRIBUTES: WebGLContextAttributes = { powerPreference: 'default' };
const LEAFLET_ZOOM_OFFSET = 1;
const PITCH_3D = 60;
const LABELS_MIN_ZOOM = 7;
const ICON_SIZE = 32;
const PICKING_RADIUS = 8;

const AIRPLANE_ICON_URL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="28" fill="#2196f3" stroke="#ffffff" stroke-width="4"/>
        <path fill="#ffffff" d="M32 10 L36 26 L52 34 L52 38 L36 34 L35 46 L41 50 L41 53 L32 50 L23 53 L23 50 L29 46 L28 34 L12 38 L12 34 L28 26 Z"/>
    </svg>`,
)}`;
const ICON_MAPPING = { airplane: { x: 0, y: 0, width: 64, height: 64 } };

const DeckOverlay = (props: MapboxOverlayProps) => {
    const overlay = useControl(() => new MapboxOverlay(props));
    overlay.setProps(props);
    return null;
};

export const WebglMapView = observer(() => {
    const [mapSvc, objects] = useService(MapService, ObjectsService);
    const mapRef = useRef<MapRef>(null);
    const [initialViewport] = useState(() => mapSvc.viewport);
    const [zoom, setZoom] = useState(initialViewport.zoom - LEAFLET_ZOOM_OFFSET);
    const [is3d, setIs3d] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    useEffect(
        () =>
            reaction(
                () => mapSvc.focus,
                focus =>
                    focus &&
                    mapRef.current?.flyTo({
                        center: [focus.center.lng, focus.center.lat],
                        zoom: focus.zoom - LEAFLET_ZOOM_OFFSET,
                    }),
            ),
        [mapSvc],
    );

    const onMoveEnd = ({ viewState }: ViewStateChangeEvent) => {
        mapSvc.saveViewport({
            center: { lat: viewState.latitude, lng: viewState.longitude },
            zoom: viewState.zoom + LEAFLET_ZOOM_OFFSET,
        });
        setZoom(viewState.zoom);
        setIs3d(viewState.pitch > 0);
    };

    const onHover = ({ object }: PickingInfo<ObjectDto>) => setIsHovering(!!object);

    const items = objects.items;
    const selected = mapSvc.selectedId ? objects.get(mapSvc.selectedId) : undefined;

    const layers = [
        new IconLayer<ObjectDto>({
            id: 'objects',
            data: items,
            pickable: true,
            billboard: false,
            iconAtlas: AIRPLANE_ICON_URL,
            iconMapping: ICON_MAPPING,
            getIcon: () => 'airplane',
            getPosition: object => [object.longitude, object.latitude],
            getAngle: object => -object.direction,
            getSize: ICON_SIZE,
            sizeUnits: 'pixels',
            onHover,
            onClick: ({ object }) => mapSvc.select(object?.id),
        }),
        new TextLayer<ObjectDto>({
            id: 'labels',
            data: items,
            visible: zoom >= LABELS_MIN_ZOOM,
            getPosition: object => [object.longitude, object.latitude],
            getText: object => object.id.slice(-6),
            getSize: 11,
            getColor: [255, 255, 255],
            getPixelOffset: [0, ICON_SIZE / 2 + 8],
            fontWeight: 'bold',
            background: true,
            getBackgroundColor: [33, 150, 243, 230],
            backgroundPadding: [4, 1],
        }),
    ];

    return (
        <>
            <Map
                ref={mapRef}
                mapStyle={MAP_STYLE}
                canvasContextAttributes={CANVAS_CONTEXT_ATTRIBUTES}
                initialViewState={{
                    latitude: initialViewport.center.lat,
                    longitude: initialViewport.center.lng,
                    zoom: initialViewport.zoom - LEAFLET_ZOOM_OFFSET,
                }}
                style={{ width: '100%', height: '100%' }}
                cursor={isHovering ? 'pointer' : undefined}
                onMoveEnd={onMoveEnd}
            >
                <NavigationControl position="top-left" visualizePitch />
                <DeckOverlay interleaved pickingRadius={PICKING_RADIUS} layers={layers} />
                {selected && (
                    <Popup
                        latitude={selected.latitude}
                        longitude={selected.longitude}
                        offset={ICON_SIZE / 2}
                        closeOnClick={false}
                        onClose={() => mapSvc.select(undefined)}
                    >
                        <div dangerouslySetInnerHTML={{ __html: createObjectPopupHtml(selected) }} />
                    </Popup>
                )}
            </Map>
            <Paper elevation={3} sx={{ position: 'absolute', bottom: 32, left: 12, zIndex: 1000 }}>
                <ToggleButton
                    value="3d"
                    size="small"
                    selected={is3d}
                    onChange={() => mapRef.current?.easeTo({ pitch: is3d ? 0 : PITCH_3D })}
                >
                    3D
                </ToggleButton>
            </Paper>
        </>
    );
});
