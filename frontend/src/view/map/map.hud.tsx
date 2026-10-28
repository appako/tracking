import { Paper, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useService } from '~/services/service.base';
import { HudService } from '~/services/service.hud';
import { ObjectsService } from '~/services/service.objects';
import { formatBytes } from '~/utils/format';

export const MapHud = observer(() => {
    const [hud, objects] = useService(HudService, ObjectsService);

    hud.useHud();

    return (
        <Paper
            elevation={3}
            sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                zIndex: 1000,
                px: 1.5,
                py: 1,
                pointerEvents: 'none',
                fontFamily: 'monospace',
                minWidth: 180,
            }}
        >
            <Typography variant="caption" component="pre" sx={{ m: 0, fontFamily: 'inherit' }}>
                {[
                    `FPS      ${hud.fps.toFixed(0)}`,
                    `Objects  ${objects.itemsCount}`,
                    `Msg/s    ${hud.messagesPerSec.toFixed(1)}`,
                    `Data/s   ${formatBytes(hud.bytesPerSec)}`,
                    `Max msg  ${formatBytes(hud.maxMessageBytes)}`,
                ].join('\n')}
            </Typography>
        </Paper>
    );
});
