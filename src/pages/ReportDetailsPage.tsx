import React from "react";
import { Container, Typography, Box } from "@mui/material";

/**
 * ReportDetailsPage - Display detailed information about a report
 */
const ReportDetailsPage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Report Details
        </Typography>
        <Typography variant="body1">
          This page will display detailed information about a specific report.
        </Typography>
      </Box>
    </Container>
  );
};

export default ReportDetailsPage;
