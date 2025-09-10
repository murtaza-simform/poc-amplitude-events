import React from 'react';
import { Box, Paper, Avatar, Typography, IconButton } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import './UserList.css';

function getMutedColor(seed) {
  const palette = ['#B0BEC5', '#CFD8DC', '#B2DFDB', '#C8E6C9', '#D1C4E9', '#FFE0B2', '#FFECB3', '#E0E0E0'];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return palette[hash % palette.length];
}

export function UserCard({ user, onOpen, onEdit, onDelete }) {
  const initial = user.name ? user.name.charAt(0).toUpperCase() : '?';
  const color = getMutedColor(user.email || String(user.id));
  return (
    <Paper
      key={user.id}
      elevation={2}
      onClick={() => onOpen(user)}
      className='user-card user-card-simple'
    >
      <Avatar className='user-card-avatar-simple' sx={{ bgcolor: color }}>{initial}</Avatar>
      <Typography className='user-card-name-simple' noWrap title={user.name}>{user.name}</Typography>
      <Box className='user-card-actions-simple'>
        <IconButton size='small' className='user-card-icon-btn-simple' onClick={(e) => { e.stopPropagation(); onEdit(user); }}>
          <Edit fontSize='small' />
        </IconButton>
        <IconButton size='small' className='user-card-icon-btn-simple' onClick={(e) => { e.stopPropagation(); onDelete(user); }}>
          <Delete fontSize='small' />
        </IconButton>
      </Box>
    </Paper>
  );
}

export default function UserList({ users, onOpen, onEdit, onDelete }) {
  return (
    <Box className='user-list-grid simple-style'>
      {users.map(u => (
        <UserCard key={u.id} user={u} onOpen={onOpen} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </Box>
  );
}
