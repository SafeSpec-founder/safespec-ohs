import React from "react";
import { Container, Typography, Box } from "@mui/material";

/**
 * ReportFormPage - Create or edit report
 */
const ReportFormPage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Report Form
        </Typography>
        <Typography variant="body1">
          This page will contain the form for creating or editing reports.
        </Typography>
      </Box>
    </Container>
  );
};

export default ReportFormPage;
