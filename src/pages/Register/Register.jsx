import React, { useState, useMemo, useCallback } from 'react';
import {
  Button,
  TextField,
  Box,
  Typography,
  Paper,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from '@mui/material';
import { toast } from 'react-toastify';
import { ErrorOutline, Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { track } from '../../amplitude';
import { EVENTS, PROP_KEYS } from '../../analyticsEvents';
import './Register.css';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', group: '' });
  const [errors, setErrors] = useState({ name: '', email: '', password: '', group: '' });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const validators = useMemo(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return {
      name: (value) => {
        if (!value) return 'Name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        return '';
      },
      email: (value) => {
        if (!value) return 'Email is required';
        if (!emailRegex.test(value)) return 'Invalid email format';
        return '';
      },
      password: (value) => {
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return '';
      },
      group: (value) => {
        if (!value) return 'Group is required';
        return '';
      }
    }; }, []);

  const validateField = useCallback((name) => {
    setErrors(prev => ({ ...prev, [name]: validators[name](form[name]) }));
  }, [form, validators]);

  const validateAll = useCallback(() => {
    const nextErrors = Object.keys(validators).reduce((acc, key) => {
      acc[key] = validators[key](form[key]);
      return acc;
    }, {});
    setErrors(nextErrors);
    return Object.values(nextErrors).every(v => !v);
  }, [form, validators]);

  const getUsers = useCallback(() => {
    try { const raw = localStorage.getItem('users'); return raw ? JSON.parse(raw) : []; } catch { return []; }
  }, []);
  const saveUsers = useCallback((list) => { localStorage.setItem('users', JSON.stringify(list)); }, []);

  const handleChange = useCallback((field) => (e) => {
    const value = e.target.value;
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(er => ({ ...er, [field]: '' }));
  }, [errors]);

  const adornmentIfError = (err) => err ? {
    input: {
      endAdornment: (
        <InputAdornment position='end'>
          <ErrorOutline color='error' fontSize='small' />
        </InputAdornment>
      ),
    },
  } : undefined;

  const handleRegister = () => {
    if (!validateAll()) {
  track(EVENTS.REGISTRATION_VALIDATION_FAILED, { [PROP_KEYS.EMAIL]: form.email });
      toast.error('Please fix the highlighted validation errors');
      return;
    }
  track(EVENTS.REGISTRATION_ATTEMPTED, {
      [PROP_KEYS.EMAIL]: form.email,
      [PROP_KEYS.GROUP]: form.group || undefined,
    });
    const users = getUsers();
    if (users.find((u) => u.email.toLowerCase() === form.email.toLowerCase())) {
  track(EVENTS.REGISTRATION_FAILED, {
        [PROP_KEYS.EMAIL]: form.email,
        [PROP_KEYS.FAILURE_REASON]: 'email_exists',
      });
      toast.error('Email already registered');
      return;
    }
    const newUsers = [
      ...users,
      { name: form.name, email: form.email, password: form.password, group: form.group },
    ];
    saveUsers(newUsers);
  track(EVENTS.REGISTRATION_SUCCEEDED, {
      [PROP_KEYS.EMAIL]: form.email,
      [PROP_KEYS.GROUP]: form.group,
    });
    toast.success('Registration successful!');
    setTimeout(() => navigate('/login',  { replace: true }), 1200);
  };

  return (
    <Box className='register-container'>
      <Paper elevation={3} className='register-paper'>
        <Typography variant='h5' mb={2}>
          Register
        </Typography>
        <TextField
          label='Name'
          fullWidth
          margin='normal'
          value={form.name}
          onChange={handleChange('name')}
          onBlur={() => validateField('name')}
          error={!!errors.name}
          helperText={errors.name || undefined}
        />
        <TextField
          label='Email'
          fullWidth
          margin='normal'
          value={form.email}
          onChange={handleChange('email')}
          onBlur={() => validateField('email')}
          error={!!errors.email}
          helperText={errors.email || undefined}
          slotProps={adornmentIfError(errors.email)}
        />
        <FormControl fullWidth margin='normal' error={!!errors.group}>
          <InputLabel id='group-label'>Group</InputLabel>
          <Select
            labelId='group-label'
            label='Group'
            value={form.group}
            onChange={handleChange('group')}
            onBlur={() => validateField('group')}
          >
            <MenuItem value=''>
              <em>None</em>
            </MenuItem>
            <MenuItem value='Engineering'>Engineering</MenuItem>
            <MenuItem value='Pharmacy'>Pharmacy</MenuItem>
            <MenuItem value='Design'>Design</MenuItem>
            <MenuItem value='QA'>QA</MenuItem>
            <MenuItem value='Support'>Support</MenuItem>
            <MenuItem value='Operations'>Operations</MenuItem>
          </Select>
          {errors.group && (
            <Typography variant='caption' color='error'>
              {errors.group}
            </Typography>
          )}
        </FormControl>
        <TextField
          label='Password'
          type={showPassword ? 'text' : 'password'}
          fullWidth
          margin='normal'
          value={form.password}
          onChange={handleChange('password')}
          onBlur={() => validateField('password')}
          error={!!errors.password}
          helperText={errors.password || undefined}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position='end'>
                  {errors.password && <ErrorOutline color='error' fontSize='small' style={{ marginRight: 4 }} />}
                  <IconButton
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword(p => !p)}
                    edge='end'
                    size='small'
                    tabIndex={-1}
                  >
                    {showPassword ? <VisibilityOff fontSize='small' /> : <Visibility fontSize='small' />}
                  </IconButton>
                </InputAdornment>
              )
            }
          }}
        />
        <Button
          variant='contained'
          color='primary'
          fullWidth
          className='register-submit-btn'
          onClick={handleRegister}
        >
          Register
        </Button>
        <Button
          color='secondary'
          fullWidth
          className='register-back-btn'
          onClick={() => navigate('/login',  { replace: true })}
        >
          Back to Login
        </Button>
      </Paper>
    </Box>
  );
}
