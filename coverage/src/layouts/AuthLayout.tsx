import React from "react";
import {
  Box,
  Typography,
  Avatar,
  CssBaseline,
  Container,
  Link,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Outlet } from "react-router-dom";

const AuthLayout: React.FC = () => {
  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
          SafeSpec OHS
        </Typography>
        <Outlet />
      </Box>
      <Box mt={5}>
        <Typography variant="body2" color="text.secondary" align="center">
          {"© "}
          <Link color="inherit" href="https://safespec.com/">
            SafeSpec
          </Link>{" "}
          {new Date().getFullYear()}
        </Typography>
      </Box>
    </Container>
  );
};

export default AuthLayout;
