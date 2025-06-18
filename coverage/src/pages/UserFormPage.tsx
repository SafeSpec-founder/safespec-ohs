import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { useAppSelector, useAppDispatch } from "../store/index";
import {
  createUser,
  updateUser,
  fetchUserById,
} from "../store/slices/userSlice";
import {
  ROLES,
  PERMISSIONS,
  getPermissionsForRole,
} from "../utils/rolePermissions";

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  permissions: string[];
  status: string;
}

/**
 * UserFormPage - Create or edit user information
 */
const UserFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isEdit = Boolean(id);

  const { selectedUser, loading, error } = useAppSelector(
    (state) => state.users,
  );

  const [formData, setFormData] = useState<UserFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
    role: ROLES.EMPLOYEE,
    permissions: [],
    status: "Active",
  });

  const [formErrors, setFormErrors] = useState<Partial<UserFormData>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      dispatch(fetchUserById(id));
    }
  }, [isEdit, id, dispatch]);

  useEffect(() => {
    if (isEdit && selectedUser) {
      setFormData({
        firstName: selectedUser.firstName || "",
        lastName: selectedUser.lastName || "",
        email: selectedUser.email || "",
        phone: selectedUser.phone || "",
        department: selectedUser.department || "",
        role: selectedUser.role || ROLES.EMPLOYEE,
        permissions: selectedUser.permissions || [],
        status: selectedUser.status || "Active",
      });
    }
  }, [isEdit, selectedUser]);

  const handleInputChange =
    (field: keyof UserFormData) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Clear error when user starts typing
      if (formErrors[field]) {
        setFormErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const handleSelectChange = (field: keyof UserFormData) => (event: any) => {
    const value = event.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Update permissions when role changes
    if (field === "role") {
      const rolePermissions = getPermissionsForRole(value);
      setFormData((prev) => ({ ...prev, permissions: rolePermissions }));
    }
  };

  const handlePermissionChange =
    (permission: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const checked = event.target.checked;
      setFormData((prev) => ({
        ...prev,
        permissions: checked
          ? [...prev.permissions, permission]
          : prev.permissions.filter((p) => p !== permission),
      }));
    };

  const validateForm = (): boolean => {
    const errors: Partial<UserFormData> = {};

    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }

    if (!formData.role) {
      errors.role = "Role is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      if (isEdit && id) {
        await dispatch(
          updateUser({
            id,
            updates: {
              ...formData,
              role: formData.role as
                | "admin"
                | "manager"
                | "supervisor"
                | "employee"
                | "contractor"
                | "viewer",
              status: formData.status.toLowerCase() as
                | "active"
                | "inactive"
                | "suspended"
                | "pending",
            },
          }),
        );
      } else {
        // Transform formData to match User interface requirements
        const userData = {
          ...formData,
          displayName: `${formData.firstName} ${formData.lastName}`,
          position: formData.department, // Use department as position for now
          location: "", // Default empty location
          timezone: "UTC", // Default timezone
          language: "en", // Default language
          role: formData.role as
            | "admin"
            | "manager"
            | "supervisor"
            | "employee"
            | "contractor"
            | "viewer",
          status: formData.status.toLowerCase() as
            | "active"
            | "inactive"
            | "suspended"
            | "pending",
          certifications: [],
          preferences: {
            notifications: {
              email: true,
              push: true,
              sms: false,
            },
            dashboard: {
              layout: "default",
              widgets: [],
            },
            privacy: {
              profileVisibility: "internal" as
                | "public"
                | "internal"
                | "private",
              activityTracking: true,
            },
          },
          metadata: {},
        };
        await dispatch(createUser(userData));
      }

      navigate("/users");
    } catch (error) {
      console.error("Error saving user:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/users");
  };

  if (loading && isEdit) {
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

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 3, mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleCancel}
          sx={{ mb: 2 }}
        >
          Back to Users
        </Button>

        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {isEdit ? "Edit User" : "Create New User"}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={formData.firstName}
                  onChange={handleInputChange("firstName")}
                  error={Boolean(formErrors.firstName)}
                  helperText={formErrors.firstName}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={formData.lastName}
                  onChange={handleInputChange("lastName")}
                  error={Boolean(formErrors.lastName)}
                  helperText={formErrors.lastName}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange("email")}
                  error={Boolean(formErrors.email)}
                  helperText={formErrors.email}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={formData.phone}
                  onChange={handleInputChange("phone")}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Department"
                  value={formData.department}
                  onChange={handleInputChange("department")}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={handleSelectChange("status")}
                    label="Status"
                  >
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                    <MenuItem value="Suspended">Suspended</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Role & Permissions
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={formData.role}
                    onChange={handleSelectChange("role")}
                    label="Role"
                    error={Boolean(formErrors.role)}
                  >
                    {Object.values(ROLES).map((role) => (
                      <MenuItem key={role} value={role}>
                        {role.replace("_", " ").toUpperCase()}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Additional Permissions
                </Typography>
                <Grid container spacing={1}>
                  {Object.values(PERMISSIONS).map((permission) => (
                    <Grid item xs={12} sm={6} md={4} key={permission}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.permissions.includes(permission)}
                            onChange={handlePermissionChange(permission)}
                          />
                        }
                        label={permission.replace(/_/g, " ").toUpperCase()}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Grid>

              {/* Form Actions */}
              <Grid item xs={12}>
                <Box display="flex" gap={2} justifyContent="flex-end" mt={3}>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    disabled={saving}
                  >
                    {saving ? (
                      <CircularProgress size={20} />
                    ) : isEdit ? (
                      "Update User"
                    ) : (
                      "Create User"
                    )}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default UserFormPage;
