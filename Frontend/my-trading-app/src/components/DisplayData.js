import React, { useEffect } from 'react';
import { Card, CardContent, Typography, Table, TableContainer, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import axios from 'axios';





const DisplayData = ({ symbol, defaultTimeframe, from, to }) => {

    const [data, setData] = React.useState([]);
    

    useEffect(() => {
  
    const fetchData = async () => {
        try {
          // Fetch data from the provided array instead of making an API request
          const fetchData = async () => {
            try {
              const response = await axios.get(`https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/${defaultTimeframe}/${from}/${to}`,
                { params: { apiKey: '5n7Eiuj0pJIaQiogr0QvD7uhhB2uL4ci' } });
                
      
              
              setData(response.data.results);
              console.log('Data:', response.data.results);
            } catch (error) {
              console.error('Error fetching data:', error);
            }
          }
          fetchData();
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
      
      fetchData();
      }, [defaultTimeframe, symbol, from, to]);   



  return (
    <>
    {data && data.length !== 0 &&
    (<Card sx={{ p: 3, borderRadius: '16px', boxShadow: '6px 4px 18px 8px rgba(0,0,0,0.3)' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Raleway, Roboto', fontWeight: 'bold', textAlign: 'center', fontSize: '24px' }}>
          Data Display
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Open</TableCell>
                <TableCell>Close</TableCell>
                <TableCell>High</TableCell>
                <TableCell>Low</TableCell>
                <TableCell>Volume</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{new Date(item.t).toLocaleDateString()}</TableCell>
                  <TableCell>{item.o}</TableCell>
                  <TableCell>{item.c}</TableCell>
                  <TableCell>{item.h}</TableCell>
                  <TableCell>{item.l}</TableCell>
                  <TableCell>{item.v}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>)
    }
    </>
  );
}

export default DisplayData;






