import React from 'react';
import { Paper, Typography, Divider, Box, Chip } from '@mui/material';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Cell } from 'recharts';

const COLORS = ['#1976d2', '#9c27b0', '#ff9800', '#2e7d32', '#d32f2f', '#455a64'];

function BarSection({ title, data }) {
  return (
    <Paper sx={{ p:2, height:340, display:'flex', flexDirection:'column', borderRadius:0, boxShadow:'none', borderTop:'1px solid #eee' }}>
      <Typography variant='subtitle1' sx={{ fontWeight:600 }}>{title}</Typography>
      <Divider sx={{ my:1 }} />
      <Box sx={{ flex:1, width:'100%' }}>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart data={data} margin={{ top:10, right:10, left:0, bottom:30 }}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='label' angle={-25} textAnchor='end' interval={0} height={60} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey='value' fill='#1976d2' isAnimationActive={false}>
              {data.map((entry, idx) => <Cell key={entry.label} fill={COLORS[idx % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
      <Box sx={{ display:'flex', gap:1, flexWrap:'wrap', mt:1 }}>
        {data.filter(d=>d.value>0).map((d, idx) => (
          <Chip key={d.label} size='small' label={`${d.label}: ${d.value}`} sx={{ backgroundColor: COLORS[idx % COLORS.length], color:'#fff' }} />
        ))}
      </Box>
    </Paper>
  );
}

export default React.memo(BarSection);
