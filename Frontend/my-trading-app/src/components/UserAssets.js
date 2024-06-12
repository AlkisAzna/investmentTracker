import React, { useState, useEffect, useMemo } from 'react';
import {
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  Typography,
  Card,
  CardContent
} from '@mui/material';
import { Pie } from 'react-chartjs-2';
import { ArcElement, Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale, Filler } from 'chart.js';
import { fetchUserAssets } from '../api/apiCalls';

// Register all necessary chart components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler
);

const UserAssets = () => {
  const [userAssets, setUserAssets] = useState([]);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await fetchUserAssets(); // Use API function to fetch assets
        setUserAssets(response);
        console.log(response);
      } catch (error) {
        console.error("Error fetching user assets:", error);
      }
    };
    fetchAssets();
  }, []);

  // Function to generate a random color
  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

// Generate a color for each asset
  const backgroundColors = useMemo(() => userAssets.map(() => getRandomColor()), [userAssets]);
  const hoverBackgroundColors = useMemo(() => backgroundColors.map(color => color), [backgroundColors]);

  const pieChartData = {
    labels: userAssets.map(asset => asset.asset_name),
    datasets: [{
      data: userAssets.map(asset => asset.total_value),
      backgroundColor: backgroundColors,
      hoverBackgroundColor: hoverBackgroundColors
    }]
  };


  return (
    <Card sx={{ p: 3, borderRadius: "16px", boxShadow: "6px 4px 18px 8px rgba(0,0,0,0.3)" }}>
      <CardContent>
        <Typography variant="h5" sx={{ fontFamily: "Raleway, Roboto", marginBottom: "15px", fontWeight: "bold", mb: 2 }}>
          User Assets
        </Typography>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 300 }} aria-label="simple table">
            <TableHead>
              <TableRow sx={{ backgroundColor: "green" }}>
                <TableCell align="center" sx={{ color: "white", fontFamily: "Raleway, Roboto", fontWeight: "bold" }}>
                  Name
                </TableCell>
                <TableCell align="center" sx={{ color: "white", fontFamily: "Raleway, Roboto", fontWeight: "bold" }}>
                  Quantities
                </TableCell>
                <TableCell align="center" sx={{ color: "white", fontFamily: "Raleway, Roboto", fontWeight: "bold" }}>
                  Total Value
                </TableCell>
                <TableCell align="center" sx={{ color: "white", fontFamily: "Raleway, Roboto", fontWeight: "bold" }}>
                  Category
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
            {userAssets.map((asset) => (
              <TableRow key={asset.id}>
                <TableCell align="center" component="th" scope="row" sx={{ fontFamily: "Raleway, Roboto" }}>
                  {asset.asset_name}
                </TableCell>
                <TableCell align="center" sx={{ fontFamily: "Raleway, Roboto" }}>
                    {asset.category === 'stocks' || asset.category === 'etf' ?
                      parseInt(asset.quantity) :
                      asset.category === 'crypto' ?
                      parseFloat(parseFloat(asset.quantity).toFixed(10)).toString() :
                      asset.quantity}
                  </TableCell>
                <TableCell align="center" sx={{ fontFamily: "Raleway, Roboto" }}>
                  ${asset.total_value}
                </TableCell>
                <TableCell align="center" sx={{ fontFamily: "Raleway, Roboto", textTransform: "uppercase"}}>
                  {asset.category}
                </TableCell>
              </TableRow>
            ))}
            </TableBody>
          </Table>
        </TableContainer>
        {userAssets.length > 0 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2, width: "100%" }}>
            <div style={{ width: "60%", height: "auto" }}> {}
              <Pie data={pieChartData} />
            </div>
        </Box>
        
        )}
      </CardContent>
    </Card>
  );
};

export default UserAssets;
