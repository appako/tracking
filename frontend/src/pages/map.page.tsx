import { Box } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useService } from '~/services/service.base';
import { ObjectsService } from '~/services/service.objects';
import { SseService } from '~/services/service.sse';
import { MapView } from '~/view/map/map.view';
import { ObjectsList } from '~/view/objects/objects.list';

export const MapPage = observer(() => {
    const [svc, sse] = useService(ObjectsService, SseService);

    sse.useSseConnection();
    svc.useObjectsList();

    return (
        <Box sx={{ height: 'calc(100vh - 120px)', p: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, height: '100%', width: 'full' }}>
                <Box sx={{ flex: 3, height: '100%' }}>
                    <MapView />
                </Box>
                <Box sx={{ flex: 1, height: '100%' }}>
                    <ObjectsList />
                </Box>
            </Box>
        </Box>
    );
});
