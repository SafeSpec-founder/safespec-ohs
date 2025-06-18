import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../index";
import { documentService } from "@services/documentService";

export interface Document {
  id: string;
  title: string;
  description: string;
  content: string;
  version: number;
  status: "draft" | "published" | "archived" | "under_review";
  category: string;
  tags: string[];
  createdBy: string;
  lastModifiedBy: string;
  approvedBy?: string;
  approvalDate?: string;
  expiryDate?: string;
  fileUrl?: string;
  fileType?: string;
  fileSize?: number;
  createdAt: string;
  updatedAt: string;
}

interface DocumentState {
  documents: Document[];
  currentDocument: Document | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    status?: string;
    category?: string;
    tags?: string[];
    search?: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

const initialState: DocumentState = {
  documents: [],
  currentDocument: null,
  isLoading: false,
  error: null,
  filters: {},
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

// Async thunks
export const fetchDocuments = createAsyncThunk(
  "documents/fetchDocuments",
  async (
    params: { page?: number; limit?: number; filters?: any },
    { rejectWithValue },
  ) => {
    try {
      return await documentService.getDocuments(params);
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch documents");
    }
  },
);

export const fetchDocumentById = createAsyncThunk(
  "documents/fetchDocumentById",
  async (id: string, { rejectWithValue }) => {
    try {
      return await documentService.getDocumentById(id);
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch document");
    }
  },
);

export const createDocument = createAsyncThunk(
  "documents/createDocument",
  async (
    document: Omit<Document, "id" | "version" | "createdAt" | "updatedAt">,
    { rejectWithValue },
  ) => {
    try {
      return await documentService.createDocument(document);
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create document");
    }
  },
);

export const updateDocument = createAsyncThunk(
  "documents/updateDocument",
  async (
    { id, data }: { id: string; data: Partial<Document> },
    { rejectWithValue },
  ) => {
    try {
      return await documentService.updateDocument(id, data);
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update document");
    }
  },
);

export const deleteDocument = createAsyncThunk(
  "documents/deleteDocument",
  async (id: string, { rejectWithValue }) => {
    try {
      await documentService.deleteDocument(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to delete document");
    }
  },
);

export const uploadDocumentFile = createAsyncThunk(
  "documents/uploadDocumentFile",
  async ({ id, file }: { id: string; file: File }, { rejectWithValue }) => {
    try {
      return await documentService.uploadDocumentFile(id, file);
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to upload document file");
    }
  },
);

export const documentSlice = createSlice({
  name: "documents",
  initialState,
  reducers: {
    setCurrentDocument: (state, action: PayloadAction<Document | null>) => {
      state.currentDocument = action.payload;
    },
    clearCurrentDocument: (state) => {
      state.currentDocument = null;
    },
    setFilters: (state, action: PayloadAction<any>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset to first page when filters change
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.pagination.limit = action.payload;
      state.pagination.page = 1; // Reset to first page when limit changes
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch documents
      .addCase(fetchDocuments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.documents = action.payload.data;
        state.pagination.total = action.payload.total;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch document by ID
      .addCase(fetchDocumentById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDocumentById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentDocument = action.payload;
      })
      .addCase(fetchDocumentById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create document
      .addCase(createDocument.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createDocument.fulfilled, (state, action) => {
        state.isLoading = false;
        state.documents.unshift(action.payload);
        state.currentDocument = action.payload;
        state.pagination.total += 1;
      })
      .addCase(createDocument.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update document
      .addCase(updateDocument.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateDocument.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.documents.findIndex(
          (document) => document.id === action.payload.id,
        );
        if (index !== -1) {
          state.documents[index] = action.payload;
        }
        if (state.currentDocument?.id === action.payload.id) {
          state.currentDocument = action.payload;
        }
      })
      .addCase(updateDocument.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Delete document
      .addCase(deleteDocument.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.isLoading = false;
        state.documents = state.documents.filter(
          (document) => document.id !== action.payload,
        );
        if (state.currentDocument?.id === action.payload) {
          state.currentDocument = null;
        }
        state.pagination.total -= 1;
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Upload document file
      .addCase(uploadDocumentFile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadDocumentFile.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentDocument) {
          state.currentDocument = {
            ...state.currentDocument,
            fileUrl: action.payload.fileUrl,
            fileType: action.payload.fileType,
            fileSize: action.payload.fileSize,
          };
        }
        const index = state.documents.findIndex(
          (document) => document.id === action.payload.id,
        );
        if (index !== -1) {
          state.documents[index] = {
            ...state.documents[index],
            fileUrl: action.payload.fileUrl,
            fileType: action.payload.fileType,
            fileSize: action.payload.fileSize,
          };
        }
      })
      .addCase(uploadDocumentFile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setCurrentDocument,
  clearCurrentDocument,
  setFilters,
  clearFilters,
  setPage,
  setLimit,
  clearError,
} = documentSlice.actions;

// Selectors
export const selectDocuments = (state: RootState) => state.documents.documents;
export const selectCurrentDocument = (state: RootState) =>
  state.documents.currentDocument;
export const selectDocumentsLoading = (state: RootState) =>
  state.documents.isLoading;
export const selectDocumentsError = (state: RootState) => state.documents.error;
export const selectDocumentsFilters = (state: RootState) =>
  state.documents.filters;
export const selectDocumentsPagination = (state: RootState) =>
  state.documents.pagination;

export default documentSlice.reducer;
