import React from "react";
import { Container, Typography, Paper, Box } from "@mui/material";
import { useParams } from "react-router-dom";

const DocumentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Document Details
        </Typography>

        <Paper sx={{ p: 3 }}>
          <Typography variant="body1">Document details for ID: {id}</Typography>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Document details component will be implemented here.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default DocumentDetailsPage;
