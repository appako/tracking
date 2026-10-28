import { Paper, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { MapRenderer } from '~/routes';
import { useService } from '~/services/service.base';
import { MapService } from '~/services/service.map';

export const MapRendererToggle = observer(() => {
    const [mapSvc] = useService(MapService);
    const [renderer, setRenderer] = mapSvc.useRenderer();

    return (
        <Paper
            elevation={3}
            sx={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 1000 }}
        >
            <ToggleButtonGroup
                exclusive
                size="small"
                value={renderer}
                onChange={(_, next: MapRenderer | null) => next && setRenderer(next)}
            >
                <Tooltip title={mapSvc.isWebglSupported ? '' : 'WebGL2 is not available in this browser'}>
                    <span>
                        <ToggleButton value="webgl" disabled={!mapSvc.isWebglSupported}>
                            WebGL
                        </ToggleButton>
                    </span>
                </Tooltip>
                <ToggleButton value="leaflet">Leaflet</ToggleButton>
            </ToggleButtonGroup>
        </Paper>
    );
});
