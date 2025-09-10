import React, { useState } from 'react';
import { Button, TextField, Box, Typography, Paper, InputAdornment, IconButton } from '@mui/material';
import { ErrorOutline, Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { identifyUser, track, createNewSession, endSession } from '../../amplitude';
import { EVENTS, PROP_KEYS } from '../../analyticsEvents';
import PasswordChangeDialog from '../../components/PasswordChangeDialog';
import { toast } from 'react-toastify';
import './Login.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({ email: '', password: '' });
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const getUsers = () => {
    try { const raw = localStorage.getItem('users'); return raw ? JSON.parse(raw) : []; } catch { return []; }
  };

  const validateEmail = () => {
    if (!form.email) { setErrors(e => ({ ...e, email: 'Email is required' })); return false; }
    if (!emailRegex.test(form.email)) { setErrors(e => ({ ...e, email: 'Invalid email format' })); return false; }
    setErrors(e => ({ ...e, email: '' })); return true;
  };
  const validatePassword = () => {
    if (!form.password) { setErrors(e => ({ ...e, password: 'Password is required' })); return false; }
    if (form.password.length < 6) { setErrors(e => ({ ...e, password: 'Password must be at least 6 characters' })); return false; }
    setErrors(e => ({ ...e, password: '' })); return true;
  };
  const validateAll = () => validateEmail() && validatePassword();

  const [forcePwReset, setForcePwReset] = useState({ open:false, email:'' });

  const updateUserPassword = (email, newPassword) => {
    try {
      const users = getUsers();
      const next = users.map(u => u.email.toLowerCase() === email.toLowerCase() ? { ...u, password: newPassword } : u);
      localStorage.setItem('users', JSON.stringify(next));
  } catch { void 0; }
  };

  const handleLogin = () => {
    if (!validateAll()) { 
  track(EVENTS.LOGIN_VALIDATION_FAILED, { [PROP_KEYS.EMAIL]: form.email });
      toast.error('Please fix the highlighted validation errors');
      return; 
    }
  track(EVENTS.LOGIN_ATTEMPTED, { [PROP_KEYS.EMAIL]: form.email });
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === form.email.toLowerCase());
  if (!user) { toast.error('User not found'); track(EVENTS.LOGIN_FAILED, { [PROP_KEYS.EMAIL]: form.email, [PROP_KEYS.FAILURE_REASON]: 'user_not_found' }); return; }
  if (user.password !== form.password) { toast.error('Incorrect password'); track(EVENTS.LOGIN_FAILED, { [PROP_KEYS.EMAIL]: form.email, [PROP_KEYS.FAILURE_REASON]: 'wrong_password' }); return; }
  // End any previous session (safety) and create a new one for this login
  endSession();
  const sessionId = createNewSession();
  localStorage.setItem('currentUser', JSON.stringify({ email: user.email, group: user.group }));
  track(EVENTS.LOGIN_SUCCEEDED, { [PROP_KEYS.EMAIL]: form.email, [PROP_KEYS.GROUP]: user.group });
  track(EVENTS.USER_SESSION_LOADED, { [PROP_KEYS.EMAIL]: form.email, [PROP_KEYS.GROUP]: user.group, sessionId });
  identifyUser({ userId: user.email, email: user.email, group: user.group });
    const needsReset = user.password === 'changeme';
    navigate('/home', { replace: true });
    if (needsReset) {
      localStorage.setItem('pendingPasswordResetEmail', user.email);
    }
  };

  return (
  <Box className="login-container">
      <Paper elevation={3} className="login-paper">
        <Typography variant="h5" mb={2}>Login</Typography>
        <TextField label="Email" fullWidth margin="normal" value={form.email}
          onChange={e => { const v = e.target.value; setForm(f => ({ ...f, email: v })); if (errors.email) setErrors(er => ({ ...er, email: '' })); }}
          onBlur={validateEmail} error={!!errors.email} helperText={errors.email || undefined}
          slotProps={errors.email ? { input: { endAdornment: (<InputAdornment position="end"><ErrorOutline color="error" fontSize="small" /></InputAdornment>) } } : undefined}
        />
        <TextField label="Password" type={showPassword ? 'text' : 'password'} fullWidth margin="normal" value={form.password}
          onChange={e => { const v = e.target.value; setForm(f => ({ ...f, password: v })); if (errors.password) setErrors(er => ({ ...er, password: '' })); }}
          onBlur={validatePassword} error={!!errors.password} helperText={errors.password || undefined}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  {errors.password && <ErrorOutline color="error" fontSize="small" style={{ marginRight: 4 }} />}
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
        <Button variant="contained" color="primary" fullWidth className="login-submit-btn" onClick={handleLogin}>Login</Button>
        <Button color="secondary" fullWidth className="login-register-btn" onClick={() => navigate('/register')}>Register</Button>
      </Paper>
      <PasswordChangeDialog
        open={forcePwReset.open}
        email={forcePwReset.email}
        onCancel={() => { setForcePwReset({ open:false, email:'' }); navigate('/home', { replace: true }); }}
        onConfirm={(newPwd, clearCb) => {
          updateUserPassword(forcePwReset.email, newPwd);
          clearCb();
          setForcePwReset({ open:false, email:'' });
          toast.success('Password updated');
          if (forcePwReset.email) {
            track(EVENTS.PASSWORD_UPDATED, { [PROP_KEYS.EMAIL]: forcePwReset.email });
          }
          navigate('/home', { replace: true });
        }}
      />
    </Box>
  );
}
