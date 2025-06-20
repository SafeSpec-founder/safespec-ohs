import React, { useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Download as DownloadIcon, Edit as EditIcon } from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@store/index";
import {
  fetchDocumentById,
  selectCurrentDocument,
  selectDocumentsLoading,
  selectDocumentsError,
} from "@store/slices/documentSlice";

const DocumentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const doc = useAppSelector(selectCurrentDocument);
  const loading = useAppSelector(selectDocumentsLoading);
  const error = useAppSelector(selectDocumentsError);

  useEffect(() => {
    if (id) {
      dispatch(fetchDocumentById(id));
    }
  }, [dispatch, id]);

  const handleEdit = () => {
    navigate(`/documents/${id}/edit`);
  };

  const handleDownload = () => {
    if (doc?.fileUrl) {
      const link = document.createElement("a");
      link.href = doc.fileUrl;
      link.download = doc.title;
      link.click();
    }
  };

  if (loading && !doc) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!doc) {
    return (
      <Container maxWidth="md">
        <Alert severity="warning" sx={{ mt: 2 }}>
          Document not found
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {doc.title}
        </Typography>
        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Description
          </Typography>
          <Typography variant="body1" paragraph>
            {doc.description || "No description provided."}
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            Category
          </Typography>
          <Typography variant="body1" paragraph>{doc.category}</Typography>
          <Typography variant="subtitle1" gutterBottom>
            Status
          </Typography>
          <Typography variant="body1" paragraph>
            {doc.status.replace("_", " ")}
          </Typography>
          {doc.fileUrl && (
            <Button
              variant="contained"
              sx={{ mt: 2, mr: 2 }}
              startIcon={<DownloadIcon />}
               onClick={handleDownload}
            >
              Download File
            </Button>
          )}
          <Button
            variant="outlined"
            sx={{ mt: 2 }}
            startIcon={<EditIcon />}
            onClick={handleEdit}
          >
            Edit
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default DocumentDetailsPage;
