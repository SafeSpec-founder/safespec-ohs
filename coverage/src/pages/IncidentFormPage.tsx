import React from "react";
import { Container, Typography, Paper, Box } from "@mui/material";
import { useParams } from "react-router-dom";

const IncidentFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditing = !!id;

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {isEditing ? "Edit Incident" : "Create New Incident"}
        </Typography>

        <Paper sx={{ p: 3 }}>
          <Typography variant="body1">
            Incident form component will be implemented here.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default IncidentFormPage;
