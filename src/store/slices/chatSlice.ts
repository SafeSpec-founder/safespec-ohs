import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../index";
import { chatService } from "@services/chatService";

export interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: string;
  metadata?: {
    documentId?: string;
    incidentId?: string;
    contextType?: string;
  };
}

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  activeConversationId: string | null;
  conversations: {
    id: string;
    title: string;
    lastMessage: string;
    timestamp: string;
  }[];
}

const initialState: ChatState = {
  messages: [],
  isLoading: false,
  error: null,
  activeConversationId: null,
  conversations: [],
};

// Async thunks
export const fetchConversations = createAsyncThunk(
  "chat/fetchConversations",
  async (_, { rejectWithValue }) => {
    try {
      return await chatService.getConversations();
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch conversations");
    }
  },
);

export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async (conversationId: string, { rejectWithValue }) => {
    try {
      return await chatService.getMessages(conversationId);
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch messages");
    }
  },
);

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async (
    {
      conversationId,
      content,
      metadata,
    }: { conversationId: string | null; content: string; metadata?: any },
    { rejectWithValue },
  ) => {
    try {
      return await chatService.sendMessage(conversationId, content, metadata);
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to send message");
    }
  },
);

export const createConversation = createAsyncThunk(
  "chat/createConversation",
  async (title: string, { rejectWithValue }) => {
    try {
      return await chatService.createConversation(title);
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create conversation");
    }
  },
);

export const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setActiveConversation: (state, action: PayloadAction<string | null>) => {
      state.activeConversationId = action.payload;
      state.messages = []; // Clear messages when changing conversation
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch conversations
      .addCase(fetchConversations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch messages
      .addCase(fetchMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isLoading = false;

        // If this is a new conversation, update the active conversation ID
        if (!state.activeConversationId && action.payload.conversationId) {
          state.activeConversationId = action.payload.conversationId;

          // Add the new conversation to the list
          if (action.payload.conversation) {
            state.conversations.unshift(action.payload.conversation);
          }
        }

        // Add the user message and assistant response
        if (action.payload.userMessage) {
          state.messages.push(action.payload.userMessage);
        }
        if (action.payload.assistantMessage) {
          state.messages.push(action.payload.assistantMessage);
        }

        // Update the conversation in the list
        if (state.activeConversationId && action.payload.assistantMessage) {
          const conversationIndex = state.conversations.findIndex(
            (conv) => conv.id === state.activeConversationId,
          );

          if (conversationIndex !== -1) {
            state.conversations[conversationIndex] = {
              ...state.conversations[conversationIndex],
              lastMessage:
                action.payload.assistantMessage.content.substring(0, 50) +
                (action.payload.assistantMessage.content.length > 50
                  ? "..."
                  : ""),
              timestamp: action.payload.assistantMessage.timestamp,
            };
          }
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create conversation
      .addCase(createConversation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createConversation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversations.unshift(action.payload);
        state.activeConversationId = action.payload.id;
        state.messages = []; // Clear messages for new conversation
      })
      .addCase(createConversation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setActiveConversation, clearMessages, clearError } =
  chatSlice.actions;

// Selectors
export const selectMessages = (state: RootState) => state.chat.messages;
export const selectConversations = (state: RootState) =>
  state.chat.conversations;
export const selectActiveConversationId = (state: RootState) =>
  state.chat.activeConversationId;
export const selectChatLoading = (state: RootState) => state.chat.isLoading;
export const selectChatError = (state: RootState) => state.chat.error;

export default chatSlice.reducer;
