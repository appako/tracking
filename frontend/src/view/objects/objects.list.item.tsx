import { Box, Card, CardContent, Chip, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { FC, useCallback } from 'react';
import { ObjectDto } from '~/api/generated.schemas';
import { useService } from '~/services/service.base';
import { MapService } from '~/services/service.map';
import { formatCoordinate, formatDirection, formatTime } from '~/utils/format';
import { Row } from '../view.box';

interface ObjectListItemProps {
    object: ObjectDto;
}

export const ObjectListItem: FC<ObjectListItemProps> = observer(({ object }) => {
    const [map] = useService(MapService);

    const handleClick = useCallback(() => {
        map.showObject(object, 9);
    }, [map, object]);

    return (
        <Card
            sx={{
                cursor: 'pointer',
                '&:hover': { backgroundColor: 'action.hover' },
            }}
            onClick={handleClick}
        >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" component="div">
                        {object.id.slice(-6)}
                    </Typography>
                    <Chip label={formatDirection(object.direction)} size="small" color="primary" variant="outlined" />
                </Box>
                <Row mt={2} justifyContent={'space-between'} alignItems={'center'}>
                    <Row justifyContent="flex-start" gap={2}>
                        <Typography variant="caption" color="text.secondary" display="block">
                            Lat: {formatCoordinate(object.latitude)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                            Lng: {formatCoordinate(object.longitude)}
                        </Typography>
                    </Row>
                    <Typography variant="caption" color="text.secondary">
                        Updated: {formatTime(object.updatedAt)}
                    </Typography>
                </Row>
            </CardContent>
        </Card>
    );
});
