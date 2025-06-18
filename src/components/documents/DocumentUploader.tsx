import React from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import { Document } from "@store/slices/documentSlice";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import ArticleIcon from "@mui/icons-material/Article";
import { useAppDispatch, useAppSelector } from "@store/index";
import {
  uploadDocumentFile,
  createDocument,
} from "@store/slices/documentSlice";
import { selectUser } from "@store/slices/authSlice";

interface DocumentUploaderProps {
  document: Document | null;
  onDocumentCreated?: (document: Document) => void;
  allowedTypes?: string[];
  maxSize?: number; // in MB
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  document,
  onDocumentCreated,
  allowedTypes = [".pdf", ".docx", ".xlsx", ".pptx", ".txt", ".csv"],
  maxSize = 10, // 10MB default
}) => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectUser);
  const [file, setFile] = React.useState<File | null>(null);
  const [category, setCategory] = React.useState<string>("");
  const [title, setTitle] = React.useState<string>("");
  const [description, setDescription] = React.useState<string>("");
  const [error, setError] = React.useState<string>("");
  const [isUploading, setIsUploading] = React.useState<boolean>(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];

      // Check file size
      if (selectedFile.size > maxSize * 1024 * 1024) {
        setError(`File size exceeds the maximum allowed size of ${maxSize}MB`);
        return;
      }

      // Check file type
      const fileExtension = `.${selectedFile.name.split(".").pop()?.toLowerCase()}`;
      if (!allowedTypes.includes(fileExtension)) {
        setError(
          `File type not allowed. Allowed types: ${allowedTypes.join(", ")}`,
        );
        return;
      }

      setFile(selectedFile);
      setError("");

      // Auto-fill title from filename if empty
      if (!title) {
        const fileName = selectedFile.name.split(".")[0];
        setTitle(fileName);
      }
    }
  };

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setCategory(event.target.value);
  };

  const handleUpload = async () => {
    if (!file || !title || !category) {
      setError("Please fill in all required fields and select a file");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      if (document) {
        // If we have a document, upload file to existing document
        await dispatch(uploadDocumentFile({ id: document.id, file })).unwrap();
      } else if (onDocumentCreated) {
        // Create a new document first to obtain a real ID
        const newDocData = {
          title,
          description,
          category,
          content: "",
          status: "draft" as const,
          tags: [],
          createdBy: currentUser?.id || "current-user",
          lastModifiedBy: currentUser?.id || "current-user",
        };

        let created = await dispatch(createDocument(newDocData)).unwrap();
        const uploadResult = await dispatch(
          uploadDocumentFile({ id: created.id, file }),
        ).unwrap();

        created = {
          ...created,
          fileUrl: uploadResult.fileUrl,
          fileType: uploadResult.fileType,
          fileSize: uploadResult.fileSize,
        };

        onDocumentCreated(created);
      }

      // Reset form
      setFile(null);
      setTitle("");
      setDescription("");
      setCategory("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload failed:", error);
      setError("Failed to upload document. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = () => {
    if (!file) return <CloudUploadIcon fontSize="large" />;

    const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;

    switch (fileExtension) {
      case ".pdf":
        return <PictureAsPdfIcon fontSize="large" color="error" />;
      case ".docx":
      case ".doc":
        return <DescriptionIcon fontSize="large" color="primary" />;
      default:
        return <ArticleIcon fontSize="large" color="action" />;
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        {document ? "Update Document" : "Upload New Document"}
      </Typography>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          margin="normal"
        />

        <TextField
          fullWidth
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          rows={3}
          margin="normal"
        />

        <FormControl fullWidth margin="normal" required>
          <InputLabel id="category-label">Category</InputLabel>
          <Select
            labelId="category-label"
            value={category}
            label="Category"
            onChange={handleCategoryChange}
          >
            <MenuItem value="policy">Policy</MenuItem>
            <MenuItem value="procedure">Procedure</MenuItem>
            <MenuItem value="form">Form</MenuItem>
            <MenuItem value="report">Report</MenuItem>
            <MenuItem value="training">Training</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box
        sx={{
          border: "2px dashed",
          borderColor: "divider",
          borderRadius: 2,
          p: 3,
          textAlign: "center",
          mb: 3,
          cursor: "pointer",
          "&:hover": {
            borderColor: "primary.main",
            backgroundColor: "rgba(25, 118, 210, 0.04)",
          },
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          hidden
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={allowedTypes.join(",")}
        />

        <Box sx={{ mb: 2 }}>{getFileIcon()}</Box>

        <Typography variant="body1" gutterBottom>
          {file ? file.name : "Click to select a file or drag and drop"}
        </Typography>

        <Typography variant="caption" color="textSecondary">
          Allowed file types: {allowedTypes.join(", ")} (Max size: {maxSize}MB)
        </Typography>

        {file && (
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            File size: {(file.size / (1024 * 1024)).toFixed(2)}MB
          </Typography>
        )}
      </Box>

      {error && (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleUpload}
        disabled={!file || !title || !category || isUploading}
        startIcon={<CloudUploadIcon />}
      >
        {isUploading ? "Uploading..." : "Upload Document"}
      </Button>
    </Paper>
  );
};

export default DocumentUploader;
