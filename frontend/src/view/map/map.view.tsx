import { CircularProgress, Paper, styled } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { lazy, Suspense } from 'react';
import { useService } from '~/services/service.base';
import { MapService } from '~/services/service.map';
import { Col } from '../view.box';
import { MapHud } from './map.hud';
import { MapRendererToggle } from './map.renderer.toggle';

const LeafletMapView = lazy(() => import('./map.view.leaflet').then(module => ({ default: module.LeafletMapView })));
const WebglMapView = lazy(() => import('./map.view.webgl').then(module => ({ default: module.WebglMapView })));

const StyledPaper = styled(Paper)({
    position: 'relative',
    height: '100%',
    overflow: 'hidden',
});

export const MapView = observer(() => {
    const [mapSvc] = useService(MapService);
    const [renderer] = mapSvc.useRenderer();

    return (
        <StyledPaper>
            <Suspense
                fallback={
                    <Col height="100%" alignItems="center">
                        <CircularProgress />
                    </Col>
                }
            >
                {renderer === 'webgl' ? <WebglMapView /> : <LeafletMapView />}
            </Suspense>
            <MapRendererToggle />
            <MapHud />
        </StyledPaper>
    );
});
