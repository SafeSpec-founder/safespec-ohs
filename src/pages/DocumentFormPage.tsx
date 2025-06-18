import React from "react";
import { Container, Typography, Paper, Box } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";

const DocumentFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {isEditing ? "Edit Document" : "Create New Document"}
        </Typography>

        <Paper sx={{ p: 3 }}>
          <Typography variant="body1">
            Document form component will be implemented here.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default DocumentFormPage;
