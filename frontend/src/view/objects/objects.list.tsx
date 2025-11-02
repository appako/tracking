import { Box, Paper, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useService } from '~/services/service.base';
import { ObjectsService } from '~/services/service.objects';
import { Col } from '../view.box';
import { renderObjectListItem } from './objects.list.item';

export const ObjectsList = observer(() => {
    const [svc] = useService(ObjectsService);
    svc.useObjectsList();

    return (
        <Paper
            sx={{
                p: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <Typography variant="h6" gutterBottom>
                Objects {svc.itemsCount}
            </Typography>
            <Box flex={1} p={1} bgcolor="grey.50" borderRadius={1} overflow="auto">
                {!svc.itemsCount && (
                    <Col height="100%" alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                            Object list will be displayed here
                        </Typography>
                    </Col>
                )}
                <Col>{svc.items.map(renderObjectListItem)}</Col>
            </Box>
        </Paper>
    );
});
