import React from "react";
import { Box, Typography, Button, Container, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import LockIcon from "@mui/icons-material/Lock";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

/**
 * Unauthorized page displayed when user doesn't have permission to access a resource
 */
const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate("/dashboard");
  };

  return (
    <Container maxWidth="md">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        textAlign="center"
      >
        <Paper
          elevation={3}
          sx={{
            p: 6,
            borderRadius: 2,
            maxWidth: 500,
            width: "100%",
          }}
        >
          <Box mb={3}>
            <LockIcon
              sx={{
                fontSize: 80,
                color: "error.main",
                mb: 2,
              }}
            />
          </Box>

          <Typography variant="h4" component="h1" gutterBottom color="error">
            Access Denied
          </Typography>

          <Typography
            variant="h6"
            component="h2"
            gutterBottom
            color="text.secondary"
          >
            Insufficient Permissions
          </Typography>

          <Typography variant="body1" paragraph color="text.secondary">
            You don't have the necessary permissions to access this resource.
            Please contact your administrator if you believe this is an error.
          </Typography>

          <Box mt={4} display="flex" gap={2} justifyContent="center">
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleGoBack}
              size="large"
            >
              Go Back
            </Button>

            <Button variant="contained" onClick={handleGoHome} size="large">
              Go to Dashboard
            </Button>
          </Box>

          <Box mt={3}>
            <Typography variant="body2" color="text.secondary">
              If you need access to this resource, please contact your system
              administrator.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default UnauthorizedPage;
