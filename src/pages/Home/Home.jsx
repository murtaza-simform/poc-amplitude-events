import React, { useState, useEffect } from 'react';
import { Box, Button, FormControl, InputLabel, Select, MenuItem, Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Add } from '@mui/icons-material';
import UserList, { UserCard } from '../../components/UserList';
import UserDialog from '../../components/UserDialog';
import PasswordChangeDialog from '../../components/PasswordChangeDialog';
import NavBar from '../../components/NavBar';
import { clearUser, track, endSession } from '../../amplitude';
import { EVENTS, PROP_KEYS } from '../../analyticsEvents';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function loadUsersFromStorage() {
  try {
    const raw = localStorage.getItem('users');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((u, idx) => ({
      id: idx + 1,
      name: u.name || (u.email ? u.email.split('@')[0] : 'User'),
      email: u.email || '',
      group: u.group || ''
    }));
  } catch { return []; }
}

export default function Home() {
  const [users, setUsers] = useState(() => loadUsersFromStorage());
  const [dialog, setDialog] = useState({ open: false, editMode: false, selectedUser: null });
  const [form, setForm] = useState({ name: '', email: '', group: '' });
  const [currentUser, setCurrentUser] = useState({ email: '', group: '' });
  const [groupFilter, setGroupFilter] = useState('ALL');
  const [pwReset, setPwReset] = useState({ open:false, email:'' });
  const handleGroupFilterChange = (newValue) => {
    setGroupFilter(prev => {
      if (prev !== newValue) {
        const filtered = newValue === 'ALL' ? users : users.filter(u => u.group === newValue);
  track(EVENTS.GROUP_FILTER_CHANGED, {
          [PROP_KEYS.FILTER_FROM]: prev,
          [PROP_KEYS.FILTER_TO]: newValue,
          [PROP_KEYS.RESULT_COUNT]: filtered.length,
        });
      }
      return newValue;
    });
  };
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const raw = localStorage.getItem('currentUser');
      if (raw) {
        const parsed = JSON.parse(raw);
        setCurrentUser({ email: parsed.email || '', group: parsed.group || '' });
      } else {
        navigate('/login', { replace: true });
      }
  } catch {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const pending = localStorage.getItem('pendingPasswordResetEmail');
    if (pending) {
      setPwReset({ open:true, email: pending });
    }
  }, []);

  const handleLogout = () => {
    const exitingUser = { ...currentUser };
    if (exitingUser.email) {
      track(EVENTS.LOGOUT, { [PROP_KEYS.EMAIL]: exitingUser.email, [PROP_KEYS.GROUP]: exitingUser.group });
      track(EVENTS.USER_SESSION_ENDED, { [PROP_KEYS.EMAIL]: exitingUser.email, [PROP_KEYS.GROUP]: exitingUser.group });
    }
  endSession();
    localStorage.removeItem('currentUser');
    setCurrentUser({ email: '', group: '' });
    clearUser();
    navigate('/login', { replace: true });
  };

  const handleOpen = (user) => {
    setDialog({ open: true, editMode: false, selectedUser: user });
  track(EVENTS.USER_VIEWED, { [PROP_KEYS.EMAIL]: user.email, [PROP_KEYS.GROUP]: user.group });
  };

  const handleClose = () => {
    setDialog({ open: false, editMode: false, selectedUser: null });
    setForm({ name: '', email: '', group: '' });
  };

  const handleAdd = () => {
    setDialog({ open: true, editMode: true, selectedUser: null });
    setForm({ name: '', email: '', group: '' });
  };

  const handleEdit = (user) => {
    setDialog({ open: true, editMode: true, selectedUser: user });
    setForm(user);
  };

  const persistUsers = (list) => {
    const base = list.map(u => ({
      email: u.email,
      password: u.password || 'changeme',
      group: u.group,
      name: u.name
    }));
    localStorage.setItem('users', JSON.stringify(base));
  };

  const refreshIds = (list) => list.map((u, idx) => ({ ...u, id: idx + 1 }));

  const handleDelete = (user) => {
    const updated = refreshIds(users.filter((u) => u.id !== user.id));
    setUsers(updated);
    persistUsers(updated);
  track(EVENTS.USER_DELETED, { [PROP_KEYS.EMAIL]: user.email, [PROP_KEYS.GROUP]: user.group });
  };

  const handleSave = () => {
    if (!(dialog.editMode && form.name && form.email)) { handleClose(); return; }
    let updated = [];
    if (dialog.selectedUser) {
      updated = users.map((u) => (u.id === dialog.selectedUser.id ? { ...u, ...form } : u));
  track(EVENTS.USER_UPDATED, { [PROP_KEYS.EMAIL]: dialog.selectedUser.email, [PROP_KEYS.GROUP]: form.group });
    } else {
      const newUser = { ...form };
      updated = [...users, newUser];
  track(EVENTS.USER_CREATED, { [PROP_KEYS.EMAIL]: newUser.email, [PROP_KEYS.GROUP]: newUser.group });
    }
    updated = refreshIds(updated);
    setUsers(updated);
    persistUsers(updated);
  handleClose();
  };

  return (
    <>
      <NavBar currentUser={currentUser} onLogout={handleLogout} />
      <Box className="home-root">
        <Box className="home-content">
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', mb: 2 }}>
            <Button variant='contained' startIcon={<Add />} onClick={handleAdd} className="home-add-btn">Add User</Button>
            <FormControl size='small' sx={{ minWidth: 180 }} className='group-filter-blur'>
              <InputLabel id='group-filter-label'>Group Filter</InputLabel>
              <Select
                labelId='group-filter-label'
                label='Group Filter'
                value={groupFilter}
                onChange={e => handleGroupFilterChange(e.target.value)}
              >
                <MenuItem value='ALL'>All Groups</MenuItem>
                {[...new Set(users.map(u => u.group).filter(Boolean))].map(g => (
                  <MenuItem key={g} value={g}>{g}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          {(() => {
            const filtered = groupFilter === 'ALL' ? users : users.filter(u => u.group === groupFilter);
            const groups = filtered.reduce((acc, u) => { const key = u.group || 'Unassigned'; (acc[key] ||= []).push(u); return acc; }, {});
            return Object.entries(groups).map(([groupName, list]) => (
              <Accordion className='blur-accordion' key={groupName} defaultExpanded disableGutters>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ fontWeight: 600 }}>{groupName} ({list.length})</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box className='user-list-grid simple-style'>
                    {list.map(u => (
                      <UserCard key={u.id} user={u} onOpen={handleOpen} onEdit={handleEdit} onDelete={handleDelete} />
                    ))}
                  </Box>
                </AccordionDetails>
              </Accordion>
            ));
          })()}
          <UserDialog open={dialog.open} editMode={dialog.editMode} selectedUser={dialog.selectedUser} form={form} setForm={setForm} handleSave={handleSave} handleClose={handleClose} />
          <PasswordChangeDialog
            open={pwReset.open}
            email={pwReset.email}
            onConfirm={(newPwd, clearCb) => {
              try {
                const raw = localStorage.getItem('users');
                const users = raw ? JSON.parse(raw) : [];
                const updated = users.map(u => u.email.toLowerCase() === pwReset.email.toLowerCase() ? { ...u, password: newPwd } : u);
                localStorage.setItem('users', JSON.stringify(updated));
              } catch { void 0; }
              if (pwReset.email) {
                track(EVENTS.PASSWORD_UPDATED, { [PROP_KEYS.EMAIL]: pwReset.email });
              }
              clearCb && clearCb();
              localStorage.removeItem('pendingPasswordResetEmail');
              setPwReset({ open:false, email:'' });
            }}
          />
        </Box>
      </Box>
    </>
  );
}
