import React, { useMemo } from 'react';
import { Box, Typography, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';

/**
 * EventExplorer
 * Lightweight table viewer with filtering already applied upstream via props.
 * Props:
 *  - events: raw events array
 *  - groupFilter: current selected group or 'ALL'
 *  - eventSearch: substring filter on event name (case-insensitive)
 *  - usersSnapshot: list of users used to resolve group by email
 */
export default function EventExplorer({ events, groupFilter, eventSearch, usersSnapshot }) {
  const userMap = useMemo(() => {
    const m = {};
    for (const u of usersSnapshot) {
      if (u.email) m[u.email] = u.group || '';
    }
    return m;
  }, [usersSnapshot]);

  const filtered = useMemo(() => {
    const term = eventSearch?.toLowerCase() || '';
    return events.filter(e => {
      const actorEmail = e.user || e.properties?.email;
      const actorGroup = userMap[actorEmail] || e.properties?.group;
      if (groupFilter !== 'ALL' && actorGroup !== groupFilter) return false;
      if (term && !e.event.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [events, groupFilter, eventSearch, userMap]);

  const rows = useMemo(() => {
    // Sort + slice in dedicated memo to avoid re-sorting on each render
    return [...filtered].sort((a,b)=> b.ts - a.ts).slice(0,300);
  }, [filtered]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1 }}>
          Events ({filtered.length})
        </Typography>
        <TableContainer component={Paper} variant='outlined' sx={{ maxHeight: 400 }}>
          <Table size='small' stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Time</TableCell>
                <TableCell>Event</TableCell>
                <TableCell>Event By</TableCell>
                <TableCell>Group</TableCell>
                <TableCell>Session</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map(e => (
                <TableRow key={e.id} hover>
                  <TableCell>{new Date(e.ts).toLocaleTimeString()}</TableCell>
                  <TableCell>{e.event}</TableCell>
                  <TableCell>{e.user || e.properties?.email || '-'}</TableCell>
                  <TableCell>{userMap[e.user || e.properties?.email] || e.properties?.group || '-'}</TableCell>
                  <TableCell>{e.sessionId || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}
