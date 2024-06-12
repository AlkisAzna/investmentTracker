import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Typography, Button, Box } from '@mui/material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Register the necessary components
ChartJS.register(ArcElement, Tooltip, Legend);

const StatCard = ({ title, chartData, navigateTo }) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(navigateTo);
  };

  return (
    <Card sx={{ p: 3, borderRadius: '16px', boxShadow: '6px 4px 18px 8px rgba(0,0,0,0.3)', width: 1 }}>
      <CardContent>
        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', fontFamily: 'Raleway, Roboto', fontSize: '20px', mb: 2, textAlign: 'center' }}>
          {title}
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Pie data={chartData} />
        </Box>
        <Button variant="contained" onClick={handleNavigate} fullWidth sx={{ fontFamily: 'Raleway, Roboto', padding: '10px', borderRadius: '20px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', bgcolor: 'green', color: 'white', '&:hover': { bgcolor: 'white', color: "green", borderColor: 'darkgreen' } }}>
          Go to {title}
        </Button>
      </CardContent>
    </Card>
  );
};

export default StatCard;
