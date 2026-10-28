import { Box, Paper, Typography } from '@mui/material';
import { useVirtualizer } from '@tanstack/react-virtual';
import { observer } from 'mobx-react-lite';
import { useRef } from 'react';
import { useService } from '~/services/service.base';
import { ObjectsService } from '~/services/service.objects';
import { Col } from '../view.box';
import { ObjectListItem } from './objects.list.item';

const ITEM_SIZE_ESTIMATE = 120;

export const ObjectsList = observer(() => {
    const [svc] = useService(ObjectsService);
    const scrollRef = useRef<HTMLDivElement>(null);
    const items = svc.items;

    const virtualizer = useVirtualizer({
        count: items.length,
        getScrollElement: () => scrollRef.current,
        estimateSize: () => ITEM_SIZE_ESTIMATE,
        getItemKey: index => items[index].id,
    });

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
            <Box ref={scrollRef} flex={1} p={1} bgcolor="grey.50" borderRadius={1} overflow="auto">
                {!svc.itemsCount && (
                    <Col height="100%" alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                            Object list will be displayed here
                        </Typography>
                    </Col>
                )}
                <Box position="relative" height={virtualizer.getTotalSize()}>
                    {virtualizer.getVirtualItems().map(row => (
                        <Box
                            key={row.key}
                            ref={virtualizer.measureElement}
                            data-index={row.index}
                            position="absolute"
                            top={0}
                            left={0}
                            width="100%"
                            pb={1}
                            style={{ transform: `translateY(${row.start}px)` }}
                        >
                            <ObjectListItem object={items[row.index]} />
                        </Box>
                    ))}
                </Box>
            </Box>
        </Paper>
    );
});
