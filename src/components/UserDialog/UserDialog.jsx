import React, { useMemo } from 'react';
import { Dialog, Box, Avatar, Typography, TextField, Button, IconButton, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Edit, Delete, Close } from '@mui/icons-material';
import '../UserList/UserList.css';
import './UserDialog.css';

export default function UserDialog({ open, editMode, selectedUser, form, setForm, handleSave, handleClose, onEdit, onDelete }) {
  const GROUP_OPTIONS = useMemo(() => [
    'Engineering', 'Pharmacy', 'Design', 'QA', 'Support', 'Operations'
  ], []);

  const bannerColor = '#d0d7dd';
  const activeInitial = (editMode ? form?.name : selectedUser?.name) ? (editMode ? form.name : selectedUser.name).charAt(0).toUpperCase() : '?';

  const CloseButton = (
    <IconButton size='small' className='legacy-user-card-icon-btn' onClick={(e) => { e.stopPropagation(); handleClose(); }}>
      <Close fontSize='small' />
    </IconButton>
  );

  const EditButtons = (!editMode && selectedUser) ? (
    <>
      {onEdit && (
        <IconButton size='small' className='legacy-user-card-icon-btn' onClick={(e) => { e.stopPropagation(); onEdit(selectedUser); }}>
          <Edit fontSize='small' />
        </IconButton>
      )}
      {onDelete && (
        <IconButton size='small' className='legacy-user-card-icon-btn' onClick={(e) => { e.stopPropagation(); onDelete(selectedUser); }}>
          <Delete fontSize='small' />
        </IconButton>
      )}
    </>
  ) : null;

  const renderEditContent = () => (
    <Box className='legacy-user-card' style={{ width: 360, '--banner-color': bannerColor }}>
      <Box className='legacy-user-card-banner'>
        <Avatar className='legacy-user-card-avatar'>{activeInitial}</Avatar>
        <Box className='legacy-user-card-actions'>
          {CloseButton}
        </Box>
      </Box>
      <Box className='legacy-user-card-details'>
        <div className='legacy-details-table'>
          <div className='legacy-details-row'>
            <TextField
              label='Name'
              value={form.name}
              size='small'
              fullWidth
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className='legacy-details-row'>
            <Typography variant='caption' className='legacy-user-card-label'>Email</Typography>
            <TextField
              value={form.email}
              size='small'
              fullWidth
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
          </div>
            <div className='legacy-details-row'>
              <Typography variant='caption' className='legacy-user-card-label'>Group</Typography>
              <FormControl variant='outlined' size='small' fullWidth>
                <InputLabel id='edit-group-label'>Group</InputLabel>
                <Select
                  labelId='edit-group-label'
                  label='Group'
                  value={form.group}
                  onChange={e => setForm({ ...form, group: e.target.value })}
                >
                  <MenuItem value=''><em>None</em></MenuItem>
                  {GROUP_OPTIONS.map(opt => (
                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          <div className='legacy-details-row' style={{ justifyContent: 'flex-end', gap: 12 }}>
            <Button variant='contained' className='legacy-save-btn' onClick={handleSave}>Save</Button>
          </div>
        </div>
      </Box>
    </Box>
  );

  const renderViewContent = () => (
    !selectedUser ? null : (
      <Box className='legacy-user-card' style={{ width: 360, '--banner-color': bannerColor }}>
        <Box className='legacy-user-card-banner'>
          <Avatar className='legacy-user-card-avatar'>{activeInitial}</Avatar>
          <Box className='legacy-user-card-actions'>
            {CloseButton}
            {EditButtons}
          </Box>
        </Box>
        <Box className='legacy-user-card-details'>
          <div className='legacy-details-table'>
            <div className='legacy-details-row'>
              <Typography className='legacy-user-card-name' title={selectedUser.name}>{selectedUser.name}</Typography>
            </div>
            <div className='legacy-details-row'>
              <Typography variant='caption' className='legacy-user-card-label'>Email</Typography>
              <Typography className='legacy-user-card-value' title={selectedUser.email}>{selectedUser.email}</Typography>
            </div>
            <div className='legacy-details-row'>
              <Typography variant='caption' className='legacy-user-card-label'>Group</Typography>
              <Typography className='legacy-user-card-value' title={selectedUser.group}>{selectedUser.group}</Typography>
            </div>
          </div>
        </Box>
      </Box>
    )
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      className='user-dialog-root'
      slotProps={{
        backdrop: { sx: { backgroundColor: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' } },
        paper: {
          elevation: 0,
          sx: { background: 'transparent', boxShadow: 'none', overflow: 'visible' }
        }
      }}
    >
      <Box className='user-dialog-card-wrapper' sx={{ p: 0, m: 0 }}>
        {editMode ? renderEditContent() : renderViewContent()}
      </Box>
    </Dialog>
  );
}
