import React, { useState } from 'react';
import { Box, Card, CardContent, Tab} from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import Navbar from '../components/Navbar';
import AssetAllocation from '../components/AssetAllocation';
import UnrealisedProfit from '../components/UnrealisedProfit';
import TransactionHistory from '../components/TransactionHistory';
import UserAssets from '../components/UserAssets';
import AssetPerformance from '../components/AssetPerformance';
  
const Portfolio = () => {
    const [selectedTab, setSelectedTab] = useState('1');
  
    const handleChange = (event, newValue) => {
      setSelectedTab(newValue);
    };
  
    return (
      <>
        <Navbar position="static" />
        <Box sx={{ padding: '0px 20px', width: '100%', typography: 'body1' }}>
          <TabContext value={selectedTab}>
            <Box sx={{ padding: '10px', borderBottom: 1, borderColor: 'divider' }}>
              <TabList onChange={handleChange} aria-label="Portfolio tabs">
                <Tab sx={{ fontFamily: 'Raleway' }} label="Overall Value" value="1" />
                <Tab sx={{ fontFamily: 'Raleway' }} label="Asset Allocation" value="2" />
                <Tab sx={{ fontFamily: 'Raleway' }} label="User Asset Performance" value="3" />
                <Tab sx={{ fontFamily: 'Raleway' }} label="Unrealised Profit/Loss" value="4" />
                <Tab sx={{ fontFamily: 'Raleway' }} label="Transaction History" value="5" />
              </TabList>
            </Box>
            <Card>
              <CardContent>
                    <TabPanel value="1">
                    {/* Overall Portfolio Value */}
                      <UserAssets />
                    </TabPanel>
                    <TabPanel value="2">
                        {/* Asset Allocation */}
                        <AssetAllocation />
                    </TabPanel>
                    <TabPanel value="3">
                    {/* Top Performing Assets Table */}
                      <AssetPerformance/>
                    </TabPanel>
                    <TabPanel value="4">
                      {/* Unrealised Profit/Loss */}
                        <UnrealisedProfit />
                    </TabPanel>
                    <TabPanel value="5">
                      {/* Transaction History Table */}
                       <TransactionHistory />
                    </TabPanel>
                </CardContent>
            </Card>
        </TabContext>
    </Box>
  </>
  );
};
  
export default Portfolio;