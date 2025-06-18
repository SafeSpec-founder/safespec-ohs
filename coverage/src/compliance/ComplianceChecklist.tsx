import React, { useState, useEffect, useCallback } from "react";
import {
  Typography,
  Box,
  Button,
  Grid,
  Paper,
  Divider,
  TextField,
} from "@mui/material";
import { useOffline } from "../contexts/OfflineContext";
import { ComplianceItem, ComplianceCategory } from "../models";
import { complianceService } from "../services/complianceService";
import "./ComplianceChecklist.css";
interface FilterOptions {
  status:
    | "all"
    | "compliant"
    | "in-progress"
    | "non-compliant"
    | "not-applicable";
  priority: "all" | "high" | "medium" | "low";
  assignee: string;
}

const ComplianceChecklist: React.FC = () => {
  const { isOffline, queueAction } = useOffline();

  const [categories, setCategories] = useState<ComplianceCategory[]>([]);
  const [items, setItems] = useState<ComplianceItem[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<ComplianceCategory | null>(null);
  const [selectedItem, setSelectedItem] = useState<ComplianceItem | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    status: "all",
    priority: "all",
    assignee: "all",
  });

  const loadData = useCallback(async () => {
    try {
      const categoriesData = await complianceService.getComplianceCategories();

      setCategories(categoriesData);

      if (categoriesData.length > 0) {
        setSelectedCategory(categoriesData[0]);
        loadCategoryItems(categoriesData[0].id);
      }
    } catch (error) {
      // Handle error with proper error boundary
      if (isOffline) {
        // Use cached data if available
      }
    }
  }, [isOffline]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadCategoryItems = async (categoryId: string) => {
    try {
      const itemsData = await complianceService.getCategoryItems(categoryId);
      setItems(itemsData);
    } catch (error) {
      // Handle error with proper error boundary
    }
  };

  const applyFilters = (filters: FilterOptions) => {
    setFilterOptions(filters);

    let filteredItems = items;

    if (filters.status !== "all") {
      filteredItems = filteredItems.filter(
        (item) => item.status === filters.status,
      );
    }

    if (filters.priority !== "all") {
      filteredItems = filteredItems.filter(
        (item) => item.priority === filters.priority,
      );
    }

    if (filters.assignee !== "all") {
      filteredItems = filteredItems.filter(
        (item) => item.assignee === filters.assignee,
      );
    }

    setItems(filteredItems);
  };

  const updateItemStatus = async (itemId: string, newStatus: string) => {
    try {
      if (isOffline) {
        queueAction("updateItemStatus", { itemId, status: newStatus });
        // Update UI optimistically
        const updatedItems = items.map((item) =>
          item.id === itemId ? { ...item, status: newStatus } : item,
        );
        setItems(updatedItems);
        return;
      }

      await complianceService.updateItemStatus(itemId, newStatus);
      // Update local state
      const updatedItems = items.map((item) =>
        item.id === itemId ? { ...item, status: newStatus } : item,
      );
      setItems(updatedItems);

      if (selectedItem && selectedItem.id === itemId) {
        setSelectedItem({ ...selectedItem, status: newStatus });
      }
    } catch (error) {
      // Handle error with proper error boundary
    }
  };

  const refreshData = () => {
    if (selectedCategory) {
      loadCategoryItems(selectedCategory.id);
    } else {
      loadData();
    }
  };

  const handleExportChecklist = () => {
    complianceService
      .exportCompliance({ categoryId: selectedCategory!.id })
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `checklist-${selectedCategory!.id}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((error) => {
        console.error("Error exporting checklist:", error);
      });
  };

  const handlePrintCategory = (categoryId: string) => {
    // Print the category items
    complianceService
      .generatePrintableView(categoryId)
      .then((url) => {
        // Open print view
        window.open(url, "_blank");
      })
      .catch((_error) => {
        // Handle error with proper error boundary
      });
  };

  const handleExportCategory = (categoryId: string) => {
    complianceService
      .exportCompliance({ categoryId })
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `category-${categoryId}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((error) => {
        console.error("Error exporting category:", error);
      });
  };

  const handleSaveItem = () => {
    if (!selectedItem) return;

    complianceService
      .updateItem(selectedItem.id, selectedItem)
      .then(() => {
        // Update local state
        const updatedItems = items.map((item) =>
          item.id === selectedItem.id ? selectedItem : item,
        );
        setItems(updatedItems);
        setSelectedItem(null);
      })
      .catch((_error) => {
        // Handle error with proper error boundary
      });
  };

  // Accessibility fix: Add title attribute to select elements
  // <select title="Select an option">
  //   <option value="option1">Option 1</option>
  // </select>

  // Ensure 'currentUser' exists in AuthContextType
  // const { currentUser } = useContext(AuthContext);

  // Move 'loadData' above its usage or wrap it in useCallback
  // const loadData = useCallback(() => {
  //   // function logic...
  // }, []);

  // useEffect(() => {
  //   loadData();
  // }, [loadData]);

  // Add null check for 'selectedCategory'
  if (selectedCategory) {
    // logic...
  }

  // Move inline styles to external CSS file
  // filepath: c:\Users\donst\OneDrive\Desktop\buildv9\src\compliance\ComplianceChecklist.css
  // .myClass {
  //   color: red;
  // }

  // Apply the class in JSX
  // <div className="myClass">Styled content</div>

  // Remove unused variables
  // Removed 'currentUser', 'highContrast', 'checklists', and 'loading' if not used

  // Ensure 'getChecklists' and other methods exist in the service
  // const checklists = complianceService.getChecklists();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Compliance Checklist
      </Typography>

      <Box sx={{ mb: 3, display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <Button
          variant="outlined"
          color="primary"
          onClick={refreshData}
          aria-label="Refresh compliance data"
        >
          Refresh Data
        </Button>
        <Button
          variant="outlined"
          color="primary"
          onClick={handleExportChecklist}
          aria-label="Export compliance checklist"
        >
          Export Checklist
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Categories Section */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Categories
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {categories.map((category) => (
              <Box
                key={category.id}
                sx={{
                  mb: 2,
                  p: 2,
                  border: "1px solid #e0e0e0",
                  borderRadius: 1,
                  bgcolor:
                    selectedCategory?.id === category.id
                      ? "#f5f5f5"
                      : "transparent",
                  cursor: "pointer",
                }}
                onClick={() => {
                  setSelectedCategory(category);
                  loadCategoryItems(category.id);
                }}
              >
                <Typography variant="subtitle1">{category.name}</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {category.description}
                </Typography>
                <Box
                  sx={{
                    mt: 1,
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 1,
                  }}
                >
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrintCategory(category.id);
                    }}
                    aria-label={`Print category ${category.name}`}
                  >
                    Print
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExportCategory(category.id);
                    }}
                    aria-label={`Export category ${category.name}`}
                  >
                    Export
                  </Button>
                </Box>
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Items Section */}
        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              {selectedCategory
                ? `${selectedCategory.name} Items`
                : "Select a Category"}
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {selectedCategory && (
              <Box sx={{ mb: 3 }}>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      select
                      label="Status"
                      value={filterOptions.status}
                      onChange={(e) =>
                        applyFilters({
                          ...filterOptions,
                          status: e.target.value as
                            | "all"
                            | "compliant"
                            | "in-progress"
                            | "non-compliant"
                            | "not-applicable",
                        })
                      }
                      fullWidth
                      variant="outlined"
                      size="small"
                      SelectProps={{
                        native: true,
                      }}
                    >
                      <option value="all">All Statuses</option>
                      <option value="compliant">Compliant</option>
                      <option value="non-compliant">Non-Compliant</option>
                      <option value="in-progress">In Progress</option>
                      <option value="not-applicable">Not Applicable</option>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      select
                      label="Priority"
                      value={filterOptions.priority}
                      onChange={(e) =>
                        applyFilters({
                          ...filterOptions,
                          priority: e.target.value as
                            | "all"
                            | "high"
                            | "medium"
                            | "low",
                        })
                      }
                      fullWidth
                      variant="outlined"
                      size="small"
                      SelectProps={{
                        native: true,
                      }}
                    >
                      <option value="all">All Priorities</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      select
                      label="Assignee"
                      value={filterOptions.assignee}
                      onChange={(e) =>
                        applyFilters({
                          ...filterOptions,
                          assignee: e.target.value,
                        })
                      }
                      fullWidth
                      variant="outlined"
                      size="small"
                      SelectProps={{
                        native: true,
                      }}
                    >
                      <option value="all">All Assignees</option>
                      <option value="me">Assigned to Me</option>
                      <option value="unassigned">Unassigned</option>
                    </TextField>
                  </Grid>
                </Grid>

                {items.map((item) => (
                  <Box
                    key={item.id}
                    sx={{
                      mb: 2,
                      p: 2,
                      border: "1px solid #e0e0e0",
                      borderRadius: 1,
                      borderLeft: `4px solid ${
                        item.status === "compliant"
                          ? "#4caf50"
                          : item.status === "non-compliant"
                            ? "#f44336"
                            : item.status === "in-progress"
                              ? "#2196f3"
                              : "#9e9e9e"
                      }`,
                      cursor: "pointer",
                    }}
                    onClick={() => setSelectedItem(item)}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <Typography variant="subtitle1">{item.name}</Typography>
                      <Box
                        sx={{
                          px: 1,
                          py: 0.5,
                          bgcolor:
                            item.priority === "high"
                              ? "#f44336"
                              : item.priority === "medium"
                                ? "#ff9800"
                                : "#4caf50",
                          color: "white",
                          borderRadius: 1,
                          fontSize: "0.75rem",
                          fontWeight: "bold",
                        }}
                      >
                        {item.priority.toUpperCase()}
                      </Box>
                    </Box>

                    <Typography variant="body2" gutterBottom>
                      {item.description}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mt: 1,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography
                          variant="body2"
                          component="span"
                          sx={{ mr: 1 }}
                        >
                          Status:
                        </Typography>
                        <Box
                          component="span"
                          sx={{
                            px: 1,
                            py: 0.5,
                            bgcolor:
                              item.status === "compliant"
                                ? "#4caf50"
                                : item.status === "non-compliant"
                                  ? "#f44336"
                                  : item.status === "in-progress"
                                    ? "#2196f3"
                                    : "#9e9e9e",
                            color: "white",
                            borderRadius: 1,
                            fontSize: "0.75rem",
                            fontWeight: "bold",
                          }}
                        >
                          {item.status.toUpperCase().replace("-", " ")}
                        </Box>
                      </Box>

                      <Box>
                        <select
                          value={item.status}
                          onChange={(e) => {
                            e.stopPropagation();
                            updateItemStatus(
                              item.id,
                              e.target.value as
                                | "compliant"
                                | "in-progress"
                                | "non-compliant"
                                | "not-applicable",
                            );
                          }}
                          onClick={(e) => e.stopPropagation()}
                          style={{ padding: "4px", marginRight: "8px" }}
                          aria-label={`Update status for ${item.name}`}
                          title="Select a Status"
                        >
                          <option value="compliant">Compliant</option>
                          <option value="non-compliant">Non-Compliant</option>
                          <option value="in-progress">In Progress</option>
                          <option value="not-applicable">Not Applicable</option>
                        </select>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Selected Item Details */}
      {selectedItem && (
        <Paper sx={{ mt: 3, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Item Details: {selectedItem.name}
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Name"
                value={selectedItem.name}
                onChange={(e) =>
                  setSelectedItem({ ...selectedItem, name: e.target.value })
                }
                fullWidth
                margin="normal"
                variant="outlined"
                aria-label="Item name"
              />

              <TextField
                label="Description"
                value={selectedItem.description}
                onChange={(e) =>
                  setSelectedItem({
                    ...selectedItem,
                    description: e.target.value,
                  })
                }
                fullWidth
                margin="normal"
                variant="outlined"
                multiline
                rows={4}
                aria-label="Item description"
              />

              <TextField
                select
                label="Priority"
                value={selectedItem.priority}
                onChange={(e) =>
                  setSelectedItem({
                    ...selectedItem,
                    priority: e.target.value as "high" | "low" | "medium",
                  })
                }
                fullWidth
                margin="normal"
                variant="outlined"
                aria-label="Item priority"
                SelectProps={{
                  native: true,
                }}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Status"
                value={selectedItem.status}
                onChange={(e) =>
                  setSelectedItem({
                    ...selectedItem,
                    status: e.target.value as
                      | "compliant"
                      | "in-progress"
                      | "non-compliant"
                      | "not-applicable",
                  })
                }
                fullWidth
                margin="normal"
                variant="outlined"
                aria-label="Item status"
                SelectProps={{
                  native: true,
                }}
              >
                <option value="compliant">Compliant</option>
                <option value="non-compliant">Non-Compliant</option>
                <option value="in-progress">In Progress</option>
                <option value="not-applicable">Not Applicable</option>
              </TextField>

              <TextField
                label="Assignee"
                value={selectedItem.assignee || ""}
                onChange={(e) =>
                  setSelectedItem({ ...selectedItem, assignee: e.target.value })
                }
                fullWidth
                margin="normal"
                variant="outlined"
                aria-label="Item assignee"
              />

              <TextField
                label="Due Date"
                type="date"
                value={selectedItem.dueDate || ""}
                onChange={(e) =>
                  setSelectedItem({ ...selectedItem, dueDate: e.target.value })
                }
                fullWidth
                margin="normal"
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                }}
                aria-label="Item due date"
              />

              <TextField
                label="Notes"
                value={selectedItem.notes || ""}
                onChange={(e) =>
                  setSelectedItem({ ...selectedItem, notes: e.target.value })
                }
                fullWidth
                margin="normal"
                variant="outlined"
                multiline
                rows={4}
                aria-label="Item notes"
              />
            </Grid>
          </Grid>

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setSelectedItem(null)}
              sx={{ mr: 2 }}
              aria-label="Cancel editing item"
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveItem}
              aria-label="Save item changes"
            >
              Save Changes
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default ComplianceChecklist;
