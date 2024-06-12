import React from "react";
import { Container, Grid } from "@mui/material";
import Navbar from "../components/Navbar";
import Assets from "../components/TopAssets";
import AssetChart from "../components/AssetChart";

const Dashboard = () => {
  return (
    <>
      <Navbar />
      <AssetChart />
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          {/* Assets Component */}
          <Grid item xs={12}>
            <Assets />
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default Dashboard;
