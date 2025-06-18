import React from "react";
import { Container, Typography, Box } from "@mui/material";

/**
 * CorrectiveActionFormPage - Create or edit corrective action
 */
const CorrectiveActionFormPage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Corrective Action Form
        </Typography>
        <Typography variant="body1">
          This page will contain the form for creating or editing corrective
          actions.
        </Typography>
      </Box>
    </Container>
  );
};

export default CorrectiveActionFormPage;
