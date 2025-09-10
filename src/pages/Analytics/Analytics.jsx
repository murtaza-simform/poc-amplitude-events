import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { EVENTS, PROP_KEYS } from '../../analyticsEvents';
import { track, clearUser, endSession } from '../../amplitude';
import NavBar from '../../components/NavBar';
import EventExplorer from './EventExplorer';
import BarSection from './BarSection';
import PieSection from './PieSection';

export default function Analytics() {
  const [events, setEvents] = useState([]); // raw tracked events
  const [currentUser, setCurrentUser] = useState({ email: '', group: '' });
  const [usersSnapshot, setUsersSnapshot] = useState([]); // cached list of users
  const [groupFilter, setGroupFilter] = useState('ALL');
  const [eventSearch, setEventSearch] = useState('');

  // Single bootstrap + polling effect (demo-only; replace with API subscriptions in prod)
  useEffect(() => {
    const loadOnce = () => {
      // Current user (read only once)
      try {
        const raw = localStorage.getItem('currentUser');
        if (raw) {
          const parsed = JSON.parse(raw);
          setCurrentUser({
            email: parsed.email || '',
            group: parsed.group || '',
          });
        }
      } catch {
        /* ignore */
      }
    };

    const loadEventsAndUsers = () => {
      try {
        const parsed = JSON.parse(
          localStorage.getItem('localAmplitudeEvents') || '[]'
        );
        if (Array.isArray(parsed)) {
          setEvents((prev) => {
            if (prev.length && parsed.length === prev.length) {
              const prevLast = prev[prev.length - 1];
              const newLast = parsed[parsed.length - 1];
              if (prevLast?.id === newLast?.id && prevLast?.ts === newLast?.ts)
                return prev;
            }
            return parsed;
          });
        }
      } catch {
        /* ignore */
      }
      try {
        const parsedUsers = JSON.parse(localStorage.getItem('users') || '[]');
        if (Array.isArray(parsedUsers)) {
          setUsersSnapshot((prev) =>
            prev.length === parsedUsers.length ? prev : parsedUsers
          );
        }
      } catch {
        /* ignore */
      }
    };

    loadOnce();
    loadEventsAndUsers();
    const id = setInterval(loadEventsAndUsers, 2000);
    return () => clearInterval(id);
  }, []);

  // Single derived analytics memo block
  const analyticsDerived = useMemo(() => {
    // Event counts
    const eventCounts = Object.create(null);
    for (const ev of events)
      eventCounts[ev.event] = (eventCounts[ev.event] || 0) + 1;
    const get = (name) => eventCounts[name] || 0;

    // Users per group & group set
    const groupCountMap = Object.create(null);
    const groupSet = new Set();
    for (const u of usersSnapshot) {
      const g = u.group || 'Unassigned';
      groupCountMap[g] = (groupCountMap[g] || 0) + 1;
      if (u.group) groupSet.add(u.group);
    }
    // Include groups referenced only in events
    const userEmailToGroup = Object.fromEntries(
      usersSnapshot.map((u) => [u.email, u.group])
    );
    for (const ev of events) {
      const actorEmail = ev.user || ev.properties?.email;
      const g = userEmailToGroup[actorEmail] || ev.properties?.group;
      if (g) groupSet.add(g);
    }
    const usersPerGroupChartData = Object.entries(groupCountMap).map(
      ([group, value]) => ({ name: group, value })
    );
    const groupFilterOptions = [...groupSet].sort();

    // Scenario / funnel arrays
    const loginEventFunnel = [
      { label: 'Attempted', value: get(EVENTS.LOGIN_ATTEMPTED) },
      { label: 'Succeeded', value: get(EVENTS.LOGIN_SUCCEEDED) },
      { label: 'Failed', value: get(EVENTS.LOGIN_FAILED) },
    ];
    const registrationEventFunnel = [
      {
        label: 'Validation Failed',
        value: get(EVENTS.REGISTRATION_VALIDATION_FAILED),
      },
      { label: 'Attempted', value: get(EVENTS.REGISTRATION_ATTEMPTED) },
      { label: 'Succeeded', value: get(EVENTS.REGISTRATION_SUCCEEDED) },
      { label: 'Failed', value: get(EVENTS.REGISTRATION_FAILED) },
    ];
    const userManagementEventStats = [
      { label: 'Session Loaded', value: get(EVENTS.USER_SESSION_LOADED) },
      { label: 'Viewed', value: get(EVENTS.USER_VIEWED) },
      { label: 'Created', value: get(EVENTS.USER_CREATED) },
      { label: 'Updated', value: get(EVENTS.USER_UPDATED) },
      { label: 'Deleted', value: get(EVENTS.USER_DELETED) },
      { label: 'Filter Changed', value: get(EVENTS.GROUP_FILTER_CHANGED) },
    ];
    const pageViewCounts = [
      { label: 'Login Page', value: get(EVENTS.LOGIN_PAGE_VIEWED) },
      { label: 'Register Page', value: get(EVENTS.REGISTER_PAGE_VIEWED) },
      { label: 'Home Page', value: get(EVENTS.HOME_PAGE_VIEWED) },
    ];

    return {
      loginEventFunnel,
      registrationEventFunnel,
      userManagementEventStats,
      pageViewCounts,
      usersPerGroupChartData,
      groupFilterOptions,
    };
  }, [events, usersSnapshot]);

  const handleResetFilters = useCallback(() => {
    setGroupFilter('ALL');
    setEventSearch('');
  }, []);
  const handleLogout = useCallback(() => {
    const rawCurrent = localStorage.getItem('currentUser');
    let email = currentUser.email;
    let group = currentUser.group;
    if ((!email || !group) && rawCurrent) {
      try {
        const parsed = JSON.parse(rawCurrent);
        email ||= parsed.email;
        group ||= parsed.group;
      } catch {
        /* ignore */
      }
    }
    if (email) {
      track(EVENTS.LOGOUT, {
        [PROP_KEYS.EMAIL]: email,
        [PROP_KEYS.GROUP]: group,
      });
      track(EVENTS.USER_SESSION_ENDED, {
        [PROP_KEYS.EMAIL]: email,
        [PROP_KEYS.GROUP]: group,
      });
    }
    endSession();
    localStorage.removeItem('currentUser');
    clearUser();
    window.location.href = '/login';
  }, [currentUser]);

  return (
    <>
      <NavBar currentUser={currentUser} onLogout={handleLogout} />
      <Box
        sx={{
          m: 0,
          p: 0,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Typography
          variant='h5'
          sx={{ px: 2, py: 2, mb: 0, borderBottom: '1px solid #eee' }}
        >
          Scenario Analytics & Event Explorer
        </Typography>

        <BarSection
          title='Login Scenario'
          data={analyticsDerived.loginEventFunnel}
        />
        <BarSection
          title='Registration Scenario'
          data={analyticsDerived.registrationEventFunnel}
        />
        <BarSection
          title='Home Scenario'
          data={analyticsDerived.userManagementEventStats}
        />
        <BarSection title='Page Views' data={analyticsDerived.pageViewCounts} />
        <PieSection
          title='Users Per Group'
          data={analyticsDerived.usersPerGroupChartData}
        />

        <Paper
          sx={{
            px: 2,
            py: 2,
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
            alignItems: 'center',
            borderRadius: 0,
            boxShadow: 'none',
            borderTop: '1px solid #eee',
          }}
        >
          <FormControl size='small' sx={{ minWidth: 160 }}>
            <InputLabel id='analytics-group-filter-label'>Group</InputLabel>
            <Select
              labelId='analytics-group-filter-label'
              label='Group'
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
            >
              <MenuItem value='ALL'>All Groups</MenuItem>
              {analyticsDerived.groupFilterOptions.map((g) => (
                <MenuItem key={g} value={g}>
                  {g}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            size='small'
            label='Search Event Name'
            value={eventSearch}
            onChange={(e) => setEventSearch(e.target.value)}
          />
          <Button size='small' variant='outlined' onClick={handleResetFilters}>
            Reset
          </Button>
        </Paper>

        <Paper
          sx={{
            p: 2,
            borderRadius: 0,
            boxShadow: 'none',
            borderTop: '1px solid #eee',
          }}
        >
          <EventExplorer
            events={events}
            groupFilter={groupFilter}
            eventSearch={eventSearch}
            usersSnapshot={usersSnapshot}
          />
        </Paper>
      </Box>
    </>
  );
}
