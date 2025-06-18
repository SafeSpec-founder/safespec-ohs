import React from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Avatar,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useAppDispatch, useAppSelector } from "@store/index";
import {
  selectMessages,
  selectChatLoading,
  sendMessage,
} from "@store/slices/chatSlice";
import { v4 as uuidv4 } from "uuid";

interface AIChatInterfaceProps {
  contextType?: "document" | "incident" | "general";
  contextId?: string;
  placeholder?: string;
  fullHeight?: boolean;
}

const AIChatInterface: React.FC<AIChatInterfaceProps> = ({
  contextType = "general",
  contextId,
  placeholder = "Ask me anything about safety...",
  fullHeight = false,
}) => {
  const dispatch = useAppDispatch();
  const messages = useAppSelector(selectMessages);
  const isLoading = useAppSelector(selectChatLoading);
  const [input, setInput] = React.useState("");
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (input.trim() === "" || isLoading) return;

    const metadata = {
      contextType,
      ...(contextId && { contextId }),
    };

    try {
      await dispatch(
        sendMessage({
          conversationId: null, // Let the service create a new conversation if needed
          content: input,
          metadata,
        }),
      );
      setInput("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        display: "flex",
        flexDirection: "column",
        height: fullHeight ? "100%" : "500px",
        overflow: "hidden",
        borderRadius: 2,
      }}
    >
      <Box
        sx={{
          p: 2,
          backgroundColor: "primary.main",
          color: "white",
        }}
      >
        <Typography variant="h6">AI Safety Assistant</Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          p: 2,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          backgroundColor: "#f5f5f5",
        }}
      >
        {messages.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              opacity: 0.7,
            }}
          >
            <Typography variant="body1" align="center">
              Ask me anything about safety regulations, incident reporting, or
              how to improve your safety practices.
            </Typography>
          </Box>
        ) : (
          messages.map((message) => (
            <Box
              key={message.id || uuidv4()}
              sx={{
                display: "flex",
                flexDirection: message.role === "user" ? "row-reverse" : "row",
                alignItems: "flex-start",
                gap: 1,
              }}
            >
              <Avatar
                sx={{
                  bgcolor:
                    message.role === "user" ? "primary.main" : "secondary.main",
                }}
              >
                {message.role === "user" ? "U" : "AI"}
              </Avatar>
              <Paper
                sx={{
                  p: 2,
                  maxWidth: "70%",
                  backgroundColor:
                    message.role === "user" ? "primary.light" : "white",
                  color: message.role === "user" ? "white" : "text.primary",
                  borderRadius: 2,
                }}
              >
                <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                  {message.content}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ opacity: 0.7, display: "block", mt: 1 }}
                >
                  {new Date(message.timestamp).toLocaleTimeString()}
                </Typography>
              </Paper>
            </Box>
          ))
        )}
        <div ref={messagesEndRef} />
      </Box>

      <Box
        sx={{
          p: 2,
          borderTop: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper",
        }}
      >
        <Box
          component="form"
          sx={{
            display: "flex",
            gap: 1,
          }}
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder={placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            multiline
            maxRows={4}
            disabled={isLoading}
            size="small"
          />
          <Button
            variant="contained"
            color="primary"
            endIcon={
              isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <SendIcon />
              )
            }
            onClick={handleSend}
            disabled={isLoading || input.trim() === ""}
          >
            {isLoading ? "Sending" : "Send"}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default AIChatInterface;
