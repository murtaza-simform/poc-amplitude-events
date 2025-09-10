import React, { useReducer } from 'react';
import {
  Dialog,
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import '../UserList/UserList.css';

const initialState = {
  current: '',
  nextPwd: '',
  errors: { current: '', next: '' },
  showCurrent: false,
  showNext: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'TOGGLE_VISIBILITY':
      return { ...state, [action.field]: !state[action.field] };
    case 'SET_ERRORS':
      return { ...state, errors: action.errors };
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
}

export default function PasswordChangeDialog({
  open,
  email,
  onConfirm,
  defaultPassword = 'changeme',
}) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { current, nextPwd, errors, showCurrent, showNext } = state;

  const resetState = () => dispatch({ type: 'RESET' });

  const validate = () => {
    const e = { current: '', next: '' };
    if (current !== defaultPassword) e.current = 'Current password mismatch';
    if (!nextPwd) e.next = 'New password required';
    else if (nextPwd.length < 6) e.next = 'Minimum 6 characters';
    dispatch({ type: 'SET_ERRORS', errors: e });
    return !e.current && !e.next;
  };

  const handleSave = () => {
    if (!validate()) return;
    onConfirm(nextPwd, () => resetState());
  };

  return (
    <Dialog
      open={open}
      onClose={() => {}}
      disableEscapeKeyDown
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: 'rgba(0,0,0,0.25)',
            backdropFilter: 'blur(6px)',
          },
        },
        paper: {
          elevation: 0,
          sx: { background: 'transparent', boxShadow: 'none' },
        },
      }}
    >
      <Box
        className='legacy-user-card'
        style={{ width: 400, '--banner-color': '#c8ced3' }}
      >
        <Box
          className='legacy-user-card-banner'
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
          }}
        >
          <Typography variant='subtitle1' sx={{ ml: 3, fontWeight: 600 }}>
            Finalize Your Account
          </Typography>
        </Box>
        <Box className='legacy-user-card-details'>
          <div className='legacy-details-table'>
            <div className='legacy-details-row'>
              <Typography variant='caption' className='legacy-user-card-label'>
                Email
              </Typography>
              <Typography className='legacy-user-card-value' title={email}>
                {email}
              </Typography>
            </div>
            <div className='legacy-details-row'>
              <Typography variant='caption' sx={{ fontSize: 11, opacity: 0.8 }}>
                You are using a temporary password. Please set a new one to
                continue.
              </Typography>
            </div>
            <div className='legacy-details-row'>
              <TextField
                label='Current Password'
                type={showCurrent ? 'text' : 'password'}
                size='small'
                fullWidth
                value={current}
                onChange={(e) =>
                  dispatch({
                    type: 'SET_FIELD',
                    field: 'current',
                    value: e.target.value,
                  })
                }
                error={!!errors.current}
                helperText={errors.current || 'Default temporary password'}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          size='small'
                          tabIndex={-1}
                          onClick={() =>
                            dispatch({
                              type: 'TOGGLE_VISIBILITY',
                              field: 'showCurrent',
                            })
                          }
                          aria-label={
                            showCurrent
                              ? 'Hide current password'
                              : 'Show current password'
                          }
                        >
                          {showCurrent ? (
                            <VisibilityOff fontSize='small' />
                          ) : (
                            <Visibility fontSize='small' />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </div>
            <div className='legacy-details-row'>
              <TextField
                label='New Password'
                type={showNext ? 'text' : 'password'}
                size='small'
                fullWidth
                value={nextPwd}
                onChange={(e) =>
                  dispatch({
                    type: 'SET_FIELD',
                    field: 'nextPwd',
                    value: e.target.value,
                  })
                }
                error={!!errors.next}
                helperText={errors.next || 'Min 6 characters'}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          size='small'
                          tabIndex={-1}
                          onClick={() =>
                            dispatch({ type: 'TOGGLE_VISIBILITY', field: 'showNext' })
                          }
                          aria-label={
                            showNext ? 'Hide new password' : 'Show new password'
                          }
                        >
                          {showNext ? (
                            <VisibilityOff fontSize='small' />
                          ) : (
                            <Visibility fontSize='small' />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </div>
            <div
              className='legacy-details-row'
              style={{ justifyContent: 'flex-end', gap: 12 }}
            >
              <Button
                variant='contained'
                className='legacy-save-btn'
                onClick={handleSave}
              >
                Update
              </Button>
            </div>
          </div>
        </Box>
      </Box>
    </Dialog>
  );
}
