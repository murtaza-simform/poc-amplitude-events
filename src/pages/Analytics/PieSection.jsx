import React from 'react';
import { Paper, Typography, Divider, Box } from '@mui/material';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';

const COLORS = ['#1976d2', '#9c27b0', '#ff9800', '#2e7d32', '#d32f2f', '#455a64'];

function PieSection({ title, data, legend }) {
  return (
    <Paper sx={{ p:2, height:400, display:'flex', flexDirection:'column', overflow:'visible', borderRadius:0, boxShadow:'none', borderTop:'1px solid #eee' }}>
      <Typography variant='subtitle1' sx={{ fontWeight:600 }}>{title}</Typography>
      <Divider sx={{ my:1 }} />
      <Box sx={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', width:'100%', overflow:'visible' }}>
        <ResponsiveContainer width='100%' height='100%'>
          <PieChart margin={{ top:0, bottom:0, left:0, right:0 }}>
            <Pie dataKey='value' data={data} cx='50%' cy='50%' outerRadius={120} innerRadius={50} paddingAngle={2} label isAnimationActive={false}>
              {data.map((entry, idx) => <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />)}
            </Pie>
            {legend !== false && <Legend />}
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
}

export default React.memo(PieSection);
