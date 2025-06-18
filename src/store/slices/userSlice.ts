import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../index";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatar?: string;
  role:
    | "admin"
    | "manager"
    | "supervisor"
    | "employee"
    | "contractor"
    | "viewer";
  department: string;
  position: string;
  phone?: string;
  location: string;
  timezone: string;
  language: string;
  status: "active" | "inactive" | "suspended" | "pending";
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  permissions: string[];
  certifications: Certification[];
  emergencyContact?: EmergencyContact;
  preferences: UserPreferences;
  metadata: Record<string, any>;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issuedDate: string;
  expiryDate: string;
  certificateNumber: string;
  status: "valid" | "expired" | "pending" | "revoked";
  attachments: string[];
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  dashboard: {
    layout: string;
    widgets: string[];
  };
  privacy: {
    profileVisibility: "public" | "internal" | "private";
    activityTracking: boolean;
  };
}

export interface UserState {
  users: User[];
  currentUser: User | null;
  selectedUser: User | null;
  loading: boolean;
  error: string | null;
  filters: {
    role?: string;
    department?: string;
    status?: string;
    location?: string;
    search?: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  bulkActions: {
    selectedIds: string[];
    isSelecting: boolean;
  };
}

const initialState: UserState = {
  users: [],
  currentUser: null,
  selectedUser: null,
  loading: false,
  error: null,
  filters: {},
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
  },
  bulkActions: {
    selectedIds: [],
    isSelecting: false,
  },
};

// Async thunks
export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (params: { page?: number; limit?: number; filters?: any } = {}) => {
    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    return response.json();
  },
);

export const fetchUser = createAsyncThunk(
  "users/fetchUser",
  async (userId: string) => {
    const response = await fetch(`/api/users/${userId}`);
    return response.json();
  },
);

export const createUser = createAsyncThunk(
  "users/createUser",
  async (userData: Omit<User, "id" | "createdAt" | "updatedAt">) => {
    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    return response.json();
  },
);

export const updateUser = createAsyncThunk(
  "users/updateUser",
  async ({ id, updates }: { id: string; updates: Partial<User> }) => {
    const response = await fetch(`/api/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    return response.json();
  },
);

export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (userId: string) => {
    await fetch(`/api/users/${userId}`, {
      method: "DELETE",
    });
    return userId;
  },
);

export const bulkUpdateUsers = createAsyncThunk(
  "users/bulkUpdateUsers",
  async ({
    userIds,
    updates,
  }: {
    userIds: string[];
    updates: Partial<User>;
  }) => {
    const response = await fetch("/api/users/bulk-update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userIds, updates }),
    });
    return response.json();
  },
);

export const inviteUser = createAsyncThunk(
  "users/inviteUser",
  async (inviteData: {
    email: string;
    role: string;
    department: string;
    message?: string;
  }) => {
    const response = await fetch("/api/users/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inviteData),
    });
    return response.json();
  },
);

export const updateUserPermissions = createAsyncThunk(
  "users/updateUserPermissions",
  async ({
    userId,
    permissions,
  }: {
    userId: string;
    permissions: string[];
  }) => {
    const response = await fetch(`/api/users/${userId}/permissions`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ permissions }),
    });
    return response.json();
  },
);

// Add this thunk to support fetchUserById
export const fetchUserById = createAsyncThunk(
  "users/fetchUserById",
  async (userId: string) => {
    const response = await fetch(`/api/users/${userId}`);
    return response.json();
  },
);

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<Partial<UserState["filters"]>>,
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setPagination: (
      state,
      action: PayloadAction<Partial<UserState["pagination"]>>,
    ) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setSelectedUser: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload;
    },
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload;
    },
    toggleUserSelection: (state, action: PayloadAction<string>) => {
      const userId = action.payload;
      const index = state.bulkActions.selectedIds.indexOf(userId);
      if (index > -1) {
        state.bulkActions.selectedIds.splice(index, 1);
      } else {
        state.bulkActions.selectedIds.push(userId);
      }
    },
    selectAllUsers: (state) => {
      state.bulkActions.selectedIds = state.users.map((user) => user.id);
    },
    clearUserSelection: (state) => {
      state.bulkActions.selectedIds = [];
    },
    toggleBulkSelection: (state) => {
      state.bulkActions.isSelecting = !state.bulkActions.isSelecting;
      if (!state.bulkActions.isSelecting) {
        state.bulkActions.selectedIds = [];
      }
    },
    updateUserStatus: (
      state,
      action: PayloadAction<{ id: string; status: User["status"] }>,
    ) => {
      const { id, status } = action.payload;
      const user = state.users.find((u) => u.id === id);
      if (user) {
        user.status = status;
        user.updatedAt = new Date().toISOString();
      }
      if (state.selectedUser && state.selectedUser.id === id) {
        state.selectedUser.status = status;
        state.selectedUser.updatedAt = new Date().toISOString();
      }
    },
    addUserCertification: (
      state,
      action: PayloadAction<{ userId: string; certification: Certification }>,
    ) => {
      const { userId, certification } = action.payload;
      const user = state.users.find((u) => u.id === userId);
      if (user) {
        user.certifications.push(certification);
      }
    },
    updateUserCertification: (
      state,
      action: PayloadAction<{
        userId: string;
        certificationId: string;
        updates: Partial<Certification>;
      }>,
    ) => {
      const { userId, certificationId, updates } = action.payload;
      const user = state.users.find((u) => u.id === userId);
      if (user) {
        const certification = user.certifications.find(
          (c) => c.id === certificationId,
        );
        if (certification) {
          Object.assign(certification, updates);
        }
      }
    },
    removeUserCertification: (
      state,
      action: PayloadAction<{ userId: string; certificationId: string }>,
    ) => {
      const { userId, certificationId } = action.payload;
      const user = state.users.find((u) => u.id === userId);
      if (user) {
        user.certifications = user.certifications.filter(
          (c) => c.id !== certificationId,
        );
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users || [];
        state.pagination.total = action.payload.total || 0;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch users";
      })
      // Fetch single user
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.selectedUser = action.payload;
      })
      // Create user
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.unshift(action.payload);
        state.pagination.total += 1;
      })
      // Update user
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex((u) => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.selectedUser && state.selectedUser.id === action.payload.id) {
          state.selectedUser = action.payload;
        }
        if (state.currentUser && state.currentUser.id === action.payload.id) {
          state.currentUser = action.payload;
        }
      })
      // Delete user
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u.id !== action.payload);
        state.pagination.total = Math.max(0, state.pagination.total - 1);
        if (state.selectedUser && state.selectedUser.id === action.payload) {
          state.selectedUser = null;
        }
        // Remove from bulk selection
        state.bulkActions.selectedIds = state.bulkActions.selectedIds.filter(
          (id) => id !== action.payload,
        );
      })
      // Bulk update users
      .addCase(bulkUpdateUsers.fulfilled, (state, action) => {
        const updatedUsers = action.payload;
        updatedUsers.forEach((updatedUser: User) => {
          const index = state.users.findIndex((u) => u.id === updatedUser.id);
          if (index !== -1) {
            state.users[index] = updatedUser;
          }
        });
        state.bulkActions.selectedIds = [];
      })
      // Invite user
      .addCase(inviteUser.fulfilled, (_state, _action) => {
        // Handle invitation success (could add to pending invitations list)
      })
      // Update user permissions
      .addCase(updateUserPermissions.fulfilled, (state, action) => {
        const user = state.users.find((u) => u.id === action.meta.arg.userId);
        if (user) {
          user.permissions = action.payload.permissions;
        }
      });
  },
});

export const {
  setFilters,
  clearFilters,
  setPagination,
  setSelectedUser,
  setCurrentUser,
  toggleUserSelection,
  selectAllUsers,
  clearUserSelection,
  toggleBulkSelection,
  updateUserStatus,
  addUserCertification,
  updateUserCertification,
  removeUserCertification,
} = userSlice.actions;

export default userSlice.reducer;
export const selectUsers = (state: RootState) => state.users;
export const selectCurrentUser = (state: RootState) => state.users.currentUser;
export const selectSelectedUser = (state: RootState) =>
  state.users.selectedUser;
