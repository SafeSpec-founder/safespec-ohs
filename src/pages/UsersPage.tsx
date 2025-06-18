import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Container,
  Button,
  Tabs,
  Tab,
} from "@mui/material";
import { useAppSelector, useAppDispatch } from "../store/index";
import { selectUsers, fetchUsers } from "../store/slices/userSlice";
import UserCard from "../components/users/UserCard";
import AddIcon from "@mui/icons-material/Add";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useNavigate } from "react-router-dom";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`users-tabpanel-${index}`}
      aria-labelledby={`users-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `users-tab-${index}`,
    "aria-controls": `users-tabpanel-${index}`,
  };
}

const UsersPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const users = useAppSelector(selectUsers);
  const [value, setValue] = useState(0);

  useEffect(() => {
    dispatch(fetchUsers({}));
  }, [dispatch]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleViewUser = (user: any) => {
    navigate(`/users/${user.id}`);
  };

  const handleEditUser = (user: any) => {
    navigate(`/users/${user.id}/edit`);
  };

  const handleCreateUser = () => {
    navigate("/users/create");
  };

  // Filter users based on the selected tab
  const filteredUsers = useMemo(() => {
    const safeUsers = Array.isArray(users) ? users : [];
    switch (value) {
      case 0: // All
        return safeUsers;
      case 1: // Admins
        return safeUsers.filter((user) => user.role === "admin");
      case 2: // Managers
        return safeUsers.filter((user) => user.role === "manager");
      case 3: // Staff
        return safeUsers.filter((user) => user.role === "staff");
      default:
        return safeUsers;
    }
  }, [users, value]);

  if (!Array.isArray(users)) {
    // handle loading, error, or empty state
    return <div>No users found.</div>;
  }

  return (
    <Container maxWidth="xl">
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          Users
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="outlined" startIcon={<FilterListIcon />}>
            Filter
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateUser}
          >
            Add User
          </Button>
        </Box>
      </Box>

      <Paper sx={{ width: "100%", borderRadius: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="user tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label={`All Users (${users.length})`} {...a11yProps(0)} />
            <Tab
              label={`Admins (${
                users.filter((user) => user.role === "admin").length
              })`}
              {...a11yProps(1)}
            />
            <Tab
              label={`Managers (${
                users.filter((user) => user.role === "manager").length
              })`}
              {...a11yProps(2)}
            />
            <Tab
              label={`Staff (${
                users.filter((user) => user.role === "staff").length
              })`}
              {...a11yProps(3)}
            />
          </Tabs>
        </Box>

        <TabPanel value={value} index={0}>
          <UsersList
            users={filteredUsers}
            onView={handleViewUser}
            onEdit={handleEditUser}
          />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <UsersList
            users={filteredUsers}
            onView={handleViewUser}
            onEdit={handleEditUser}
          />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <UsersList
            users={filteredUsers}
            onView={handleViewUser}
            onEdit={handleEditUser}
          />
        </TabPanel>
        <TabPanel value={value} index={3}>
          <UsersList
            users={filteredUsers}
            onView={handleViewUser}
            onEdit={handleEditUser}
          />
        </TabPanel>
      </Paper>
    </Container>
  );
};

interface UsersListProps {
  users: any[];
  onView: (user: any) => void;
  onEdit: (user: any) => void;
}

const UsersList: React.FC<UsersListProps> = ({ users, onView, onEdit }) => {
  if (users.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: "center" }}>
        <Typography variant="body1" color="text.secondary">
          No users found.
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3} sx={{ p: 2 }}>
      {users.map((user) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={user.id}>
          <UserCard
            {...user}
            onViewDetails={() => onView(user)}
            onEdit={() => onEdit(user)}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default UsersPage;
