import type { IOrderHistory } from 'src/types/order';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Paper from '@mui/material/Paper';
import Timeline from '@mui/lab/Timeline';
import TimelineDot from '@mui/lab/TimelineDot';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';

import { fDateTime } from 'src/utils/format-time';

// ----------------------------------------------------------------------

type Props = {
    history?: IOrderHistory;
};

export function OrderDetailsHistory({ history }: Props) {
    const renderSummary = () => (
        <Paper
            variant="outlined"
            sx={{
                p: 2.5,
                gap: 2,
                minWidth: 260,
                flexShrink: 0,
                borderRadius: 2,
                display: 'flex',
                typography: 'body2',
                borderStyle: 'dashed',
                flexDirection: 'column',
            }}
        >
            <div>
                <Box sx={{ mb: 0.5, color: 'text.disabled' }}>Rendelés időpontja</Box>
                {fDateTime(history?.orderTime)}
            </div>

            <div>
                <Box sx={{ mb: 0.5, color: 'text.disabled' }}>Fizetés időpontja</Box>
                {fDateTime(history?.orderTime)}
            </div>

            <div>
                <Box sx={{ mb: 0.5, color: 'text.disabled' }}>Szállítás dátuma</Box>
                {fDateTime(history?.orderTime)}
            </div>

            <div>
                <Box sx={{ mb: 0.5, color: 'text.disabled' }}>Lezárás dátuma</Box>
                {fDateTime(history?.orderTime)}
            </div>
        </Paper>
    );

    const renderTimeline = () => (
        <Timeline
            sx={{ p: 0, m: 0, [`& .${timelineItemClasses.root}:before`]: { flex: 0, padding: 0 } }}
        >
            {history?.timeline.sort((a, b) => {
                const timeA = a.time ? new Date(a.time).getTime() : 0;
                const timeB = b.time ? new Date(b.time).getTime() : 0;
                return timeA - timeB;
            }).map((item, index) => {
                const firstTime = index === 0;
                const lastTime = index === history.timeline.length - 1;

                return (
                    <TimelineItem key={`${index}-${item.time}`}>
                        <TimelineSeparator>
                            <TimelineDot color={(firstTime && 'primary') || 'grey'} />
                            {lastTime ? null : <TimelineConnector />}
                        </TimelineSeparator>

                        <TimelineContent>
                            <Typography variant="subtitle2">{item.title}</Typography>

                            <Box sx={{ color: 'text.disabled', typography: 'caption', mt: 0.5 }}>
                                {fDateTime(item.time)}
                            </Box>
                        </TimelineContent>
                    </TimelineItem>
                );
            })}
        </Timeline>
    );

    return (
        <Card>
            <CardHeader title="Előzmények" />
            <Box
                sx={{
                    p: 3,
                    gap: 3,
                    display: 'flex',
                    alignItems: { md: 'flex-start' },
                    flexDirection: { xs: 'column-reverse', md: 'row' },
                }}
            >
                {renderTimeline()}
                {renderSummary()}
            </Box>
        </Card>
    );
}
