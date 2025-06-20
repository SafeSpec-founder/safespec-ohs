import React, { useEffect } from "react";
import { Container, Typography, Box, CircularProgress } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import DocumentUploader from "@components/documents/DocumentUploader";
import { useAppDispatch, useAppSelector } from "@store/index";
import {
  fetchDocumentById,
  selectCurrentDocument,
  selectDocumentsLoading,
  clearCurrentDocument,
} from "@store/slices/documentSlice";

const DocumentFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isEditing = !!id;

  const document = useAppSelector(selectCurrentDocument);
  const loading = useAppSelector(selectDocumentsLoading);

  useEffect(() => {
    if (isEditing && id) {
      dispatch(fetchDocumentById(id));
    } else {
      dispatch(clearCurrentDocument());
    }
  }, [dispatch, id, isEditing]);

  const handleSaved = (doc: any) => {
    navigate(`/documents/${doc.id}`);
  };

  if (isEditing && loading && !document) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {isEditing ? "Edit Document" : "Upload New Document"}
        </Typography>
        <DocumentUploader document={isEditing ? document : null} onDocumentCreated={handleSaved} />
      </Box>
    </Container>
  );
};

export default DocumentFormPage;
