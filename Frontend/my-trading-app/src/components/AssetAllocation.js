import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  LinearProgress,
} from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { BarElement, CategoryScale, LinearScale, Chart as ChartJS, Title, Tooltip, Legend } from 'chart.js';
import { fetchUserAssets } from '../api/apiCalls';

// Register necessary Chart.js components
ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

const AssetAllocation = () => {
  const [userAssets, setUserAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssets = async () => {
      setLoading(true);
      try {
        const response = await fetchUserAssets();
        setUserAssets(response);
      } catch (error) {
        console.error("Error fetching user assets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, []);

  const categories = ['Crypto', 'ETF', 'Stocks'];
  const categoryKeys = ['crypto', 'etf', 'stocks'];
  const colors = ['#FF6384', '#36A2EB', '#FFCE56']; // Red, Blue, Yellow

  // Aggregate total values by category
  const categoryData = categoryKeys.map(key =>
    userAssets.filter(asset => asset.category.toLowerCase() === key)
    .reduce((acc, curr) => acc + parseFloat(curr.total_value), 0)
  );

  const categoryDetails = categoryKeys.map(key =>
    userAssets.filter(asset => asset.category.toLowerCase() === key)
  );

  const data = {
    labels: categories,
    datasets: [{
      label: 'Total Value',
      backgroundColor: colors,
      data: categoryData
    }]
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          afterLabel: function(context) {
            const categoryIndex = context.dataIndex;
            const assets = categoryDetails[categoryIndex];
            if (assets.length === 0) {
              return 'No assets';
            }
            return assets.map(asset => `${asset.asset_name}: $${asset.total_value}`).join('\n');
          }
        }
      }
    }
  };

  return (
    <Card sx={{ m: 2 }}>
      <CardContent>
        <Typography sx={{marginBottom: '15px'}} variant="h5">Asset Allocation</Typography>
        {loading ? <LinearProgress /> : (
          <Bar data={data} options={options} />
        )}
      </CardContent>
    </Card>
  );
};

export default AssetAllocation;