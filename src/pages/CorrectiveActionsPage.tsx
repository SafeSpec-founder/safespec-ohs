import React, { useState, useEffect, useMemo } from "react";
import { logger } from "../utils/logger";
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
import { useAppSelector, useAppDispatch } from "@store/index";
import {
  selectCorrectiveActions,
  fetchCorrectiveActions,
} from "@store/slices/correctiveActionSlice";
import CorrectiveActionCard from "@components/corrective-actions/CorrectiveActionCard";
import CorrectiveActionForm from "@components/corrective-actions/CorrectiveActionForm";
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
      id={`actions-tabpanel-${index}`}
      aria-labelledby={`actions-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `actions-tab-${index}`,
    "aria-controls": `actions-tabpanel-${index}`,
  };
}

const CorrectiveActionsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const correctiveActions = useAppSelector(selectCorrectiveActions);
  const [value, setValue] = useState(0);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    dispatch(fetchCorrectiveActions());
  }, [dispatch]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleViewAction = (action: any) => {
    navigate(`/corrective-actions/${action.id}`);
  };

  const handleEditAction = (action: any) => {
    navigate(`/corrective-actions/${action.id}/edit`);
  };

  const handleDeleteAction = (action: any) => {
    // In a real app, this would dispatch a delete action
    logger.info("Delete action:", action.id);
  };

  const handleCompleteAction = (action: any) => {
    // In a real app, this would dispatch an update action
    logger.info("Complete action:", action.id);
  };

  const handleVerifyAction = (action: any) => {
    // In a real app, this would dispatch an update action
    logger.info("Verify action:", action.id);
  };

  const handleCreateSuccess = () => {
    setShowForm(false);
    // In a real app, this would refresh the actions list
    dispatch(fetchCorrectiveActions());
  };

  // Filter actions based on the selected tab
  const filteredActions = useMemo(() => {
    switch (value) {
      case 0: // All
        return correctiveActions;
      case 1: // Open
        return correctiveActions.filter((action) => action.status === "open");
      case 2: // In Progress
        return correctiveActions.filter(
          (action) => action.status === "in_progress",
        );
      case 3: // Completed
        return correctiveActions.filter(
          (action) => action.status === "completed",
        );
      case 4: // Overdue
        return correctiveActions.filter((action) => {
          return (
            new Date(action.dueDate) < new Date() &&
            action.status !== "completed"
          );
        });
      default:
        return correctiveActions;
    }
  }, [correctiveActions, value]);

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
          Corrective Actions
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="outlined" startIcon={<FilterListIcon />}>
            Filter
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Cancel" : "Create Action"}
          </Button>
        </Box>
      </Box>

      {showForm && (
        <Box sx={{ mb: 4 }}>
          <CorrectiveActionForm
            onSuccess={handleCreateSuccess}
            onCancel={() => setShowForm(false)}
          />
        </Box>
      )}

      <Paper sx={{ width: "100%", borderRadius: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="corrective actions tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              label={`All (${correctiveActions.length})`}
              {...a11yProps(0)}
            />
            <Tab
              label={`Open (${correctiveActions.filter((action) => action.status === "open").length})`}
              {...a11yProps(1)}
            />
            <Tab
              label={`In Progress (${correctiveActions.filter((action) => action.status === "in_progress").length})`}
              {...a11yProps(2)}
            />
            <Tab
              label={`Completed (${correctiveActions.filter((action) => action.status === "completed").length})`}
              {...a11yProps(3)}
            />
            <Tab
              label={`Overdue (${
                correctiveActions.filter((action) => {
                  return (
                    new Date(action.dueDate) < new Date() &&
                    action.status !== "completed"
                  );
                }).length
              })`}
              {...a11yProps(4)}
            />
          </Tabs>
        </Box>

        <TabPanel value={value} index={0}>
          <ActionsList
            actions={filteredActions}
            onEdit={handleEditAction}
            onDelete={handleDeleteAction}
            onComplete={handleCompleteAction}
            onVerify={handleVerifyAction}
          />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <ActionsList
            actions={filteredActions}
            onEdit={handleEditAction}
            onDelete={handleDeleteAction}
            onComplete={handleCompleteAction}
            onVerify={handleVerifyAction}
          />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <ActionsList
            actions={filteredActions}
            onEdit={handleEditAction}
            onDelete={handleDeleteAction}
            onComplete={handleCompleteAction}
            onVerify={handleVerifyAction}
          />
        </TabPanel>
        <TabPanel value={value} index={3}>
          <ActionsList
            actions={filteredActions}
            onEdit={handleEditAction}
            onDelete={handleDeleteAction}
            onComplete={handleCompleteAction}
            onVerify={handleVerifyAction}
          />
        </TabPanel>
        <TabPanel value={value} index={4}>
          <ActionsList
            actions={filteredActions}
            onEdit={handleEditAction}
            onDelete={handleDeleteAction}
            onComplete={handleCompleteAction}
            onVerify={handleVerifyAction}
          />
        </TabPanel>
      </Paper>
    </Container>
  );
};

interface ActionsListProps {
  actions: any[];
  onEdit: (action: any) => void;
  onDelete: (action: any) => void;
  onComplete: (action: any) => void;
  onVerify: (action: any) => void;
}

const ActionsList: React.FC<ActionsListProps> = ({
  actions,
  onEdit,
  onDelete,
  onComplete,
  onVerify,
}) => {
  if (actions.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: "center" }}>
        <Typography variant="body1" color="text.secondary">
          No corrective actions found.
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3} sx={{ p: 2 }}>
      {actions.map((action) => (
        <Grid item xs={12} sm={6} md={4} key={action.id}>
          <CorrectiveActionCard
            correctiveAction={action}
            onEdit={() => onEdit(action)}
            onDelete={() => onDelete(action)}
            onComplete={() => onComplete(action)}
            onVerify={() => onVerify(action)}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default CorrectiveActionsPage;
