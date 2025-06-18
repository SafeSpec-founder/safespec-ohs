import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Avatar,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Security as SecurityIcon,
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { useAppSelector, useAppDispatch } from "../store/index";
import { fetchUserById } from "../store/slices/userSlice";
import RoleBasedComponent from "../components/auth/RoleBasedComponent";
import { PERMISSIONS } from "../utils/rolePermissions";

/**
 * UserDetailsPage - Display detailed information about a specific user
 */
const UserDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { selectedUser, loading, error } = useAppSelector(
    (state) => state.users,
  );
  const [localLoading, setLocalLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (id) {
        try {
          setLocalLoading(true);
          await dispatch(fetchUserById(id));
        } catch (error) {
          console.error("Error loading user:", error);
        } finally {
          setLocalLoading(false);
        }
      }
    };

    loadUser();
  }, [id, dispatch]);

  const handleEdit = () => {
    navigate(`/users/${id}/edit`);
  };

  const handleBack = () => {
    navigate("/users");
  };

  if (localLoading || loading) {
    return (
      <Container maxWidth="lg">
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!selectedUser) {
    return (
      <Container maxWidth="lg">
        <Alert severity="warning" sx={{ mt: 2 }}>
          User not found
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 3, mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mb: 2 }}
        >
          Back to Users
        </Button>

        <Paper elevation={3} sx={{ p: 4 }}>
          <Grid container spacing={3}>
            {/* User Header */}
            <Grid item xs={12}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar
                    sx={{ width: 80, height: 80, bgcolor: "primary.main" }}
                  >
                    {selectedUser.firstName?.[0]}
                    {selectedUser.lastName?.[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="h4" component="h1">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                      {selectedUser.role}
                    </Typography>
                    <Chip
                      label={selectedUser.status || "active"}
                      color={
                        selectedUser.status === "active" ? "success" : "default"
                      }
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Box>

                <RoleBasedComponent
                  requiredPermissions={[PERMISSIONS.EDIT_USERS]}
                >
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={handleEdit}
                  >
                    Edit User
                  </Button>
                </RoleBasedComponent>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Contact Information
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email"
                    secondary={selectedUser.email}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PhoneIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Phone"
                    secondary={selectedUser.phone || "Not provided"}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <BusinessIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Department"
                    secondary={selectedUser.department || "Not assigned"}
                  />
                </ListItem>
              </List>
            </Grid>

            {/* Security Information */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Security & Permissions
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <SecurityIcon />
                  </ListItemIcon>
                  <ListItemText primary="Role" secondary={selectedUser.role} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText primary="User ID" secondary={selectedUser.id} />
                </ListItem>
              </List>

              {selectedUser.permissions &&
                selectedUser.permissions.length > 0 && (
                  <Box mt={2}>
                    <Typography variant="subtitle2" gutterBottom>
                      Permissions
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {selectedUser.permissions.map((permission, index) => (
                        <Chip
                          key={index}
                          label={permission}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                )}
            </Grid>

            {/* Additional Information */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Additional Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Created At
                  </Typography>
                  <Typography variant="body1">
                    {selectedUser.createdAt
                      ? new Date(selectedUser.createdAt).toLocaleDateString()
                      : "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Last Updated
                  </Typography>
                  <Typography variant="body1">
                    {selectedUser.updatedAt
                      ? new Date(selectedUser.updatedAt).toLocaleDateString()
                      : "N/A"}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

export default UserDetailsPage;
