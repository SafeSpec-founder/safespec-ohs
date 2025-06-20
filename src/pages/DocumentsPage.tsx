import React from "react";
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
import { selectDocuments, fetchDocuments } from "@store/slices/documentSlice";
import DocumentCard from "@components/documents/DocumentCard";
import DocumentUploader from "@components/documents/DocumentUploader";
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
      id={`documents-tabpanel-${index}`}
      aria-labelledby={`documents-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `documents-tab-${index}`,
    "aria-controls": `documents-tabpanel-${index}`,
  };
}

const DocumentsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const documents = useAppSelector(selectDocuments);
  const [value, setValue] = React.useState(0);
  const [showUploader, setShowUploader] = React.useState(false);

  React.useEffect(() => {
    dispatch(fetchDocuments({}));
  }, [dispatch]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleViewDocument = (document: any) => {
    navigate(`/documents/${document.id}`);
  };

  const handleDownloadDocument = (document: any) => {
    // In a real app, this would trigger a download
    logger.info("Download document:", document.id);
  };

  const handleEditDocument = (document: any) => {
    navigate(`/documents/${document.id}/edit`);
  };

  const handleDeleteDocument = (document: any) => {
    // In a real app, this would dispatch a delete action
    logger.info("Delete document:", document.id);
  };

  const handleUploadSuccess = () => {
    setShowUploader(false);
    // In a real app, this would refresh the documents list
    dispatch(fetchDocuments({}));
  };

  // Filter documents based on the selected tab
  const filteredDocuments = React.useMemo(() => {
    switch (value) {
      case 0: // All
        return documents;
      case 1: // Policies
        return documents.filter((doc) => doc.category === "policy");
      case 2: // Procedures
        return documents.filter((doc) => doc.category === "procedure");
      case 3: // Forms
        return documents.filter((doc) => doc.category === "form");
      case 4: // Reports
        return documents.filter((doc) => doc.category === "report");
      default:
        return documents;
    }
  }, [documents, value]);

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
          Documents
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="outlined" startIcon={<FilterListIcon />}>
            Filter
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowUploader(!showUploader)}
          >
            {showUploader ? "Cancel" : "Upload Document"}
          </Button>
        </Box>
      </Box>

      {showUploader && (
        <Box sx={{ mb: 4 }}>
          <DocumentUploader document={null} onDocumentCreated={handleUploadSuccess} />
        </Box>
      )}

      <Paper sx={{ width: "100%", borderRadius: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="document tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label={`All (${documents.length})`} {...a11yProps(0)} />
            <Tab
              label={`Policies (${documents.filter((doc) => doc.category === "policy").length})`}
              {...a11yProps(1)}
            />
            <Tab
              label={`Procedures (${documents.filter((doc) => doc.category === "procedure").length})`}
              {...a11yProps(2)}
            />
            <Tab
              label={`Forms (${documents.filter((doc) => doc.category === "form").length})`}
              {...a11yProps(3)}
            />
            <Tab
              label={`Reports (${documents.filter((doc) => doc.category === "report").length})`}
              {...a11yProps(4)}
            />
          </Tabs>
        </Box>

        <TabPanel value={value} index={0}>
          <DocumentsList
            documents={filteredDocuments}
            onView={handleViewDocument}
            onDownload={handleDownloadDocument}
            onEdit={handleEditDocument}
            onDelete={handleDeleteDocument}
          />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <DocumentsList
            documents={filteredDocuments}
            onView={handleViewDocument}
            onDownload={handleDownloadDocument}
            onEdit={handleEditDocument}
            onDelete={handleDeleteDocument}
          />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <DocumentsList
            documents={filteredDocuments}
            onView={handleViewDocument}
            onDownload={handleDownloadDocument}
            onEdit={handleEditDocument}
            onDelete={handleDeleteDocument}
          />
        </TabPanel>
        <TabPanel value={value} index={3}>
          <DocumentsList
            documents={filteredDocuments}
            onView={handleViewDocument}
            onDownload={handleDownloadDocument}
            onEdit={handleEditDocument}
            onDelete={handleDeleteDocument}
          />
        </TabPanel>
        <TabPanel value={value} index={4}>
          <DocumentsList
            documents={filteredDocuments}
            onView={handleViewDocument}
            onDownload={handleDownloadDocument}
            onEdit={handleEditDocument}
            onDelete={handleDeleteDocument}
          />
        </TabPanel>
      </Paper>
    </Container>
  );
};

interface DocumentsListProps {
  documents: any[];
  onView: (document: any) => void;
  onDownload: (document: any) => void;
  onEdit: (document: any) => void;
  onDelete: (document: any) => void;
}

const DocumentsList: React.FC<DocumentsListProps> = ({
  documents,
  onView,
  onDownload,
  onEdit,
  onDelete,
}) => {
  if (documents.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: "center" }}>
        <Typography variant="body1" color="text.secondary">
          No documents found.
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3} sx={{ p: 2 }}>
      {documents.map((document) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={document.id}>
          <DocumentCard
            document={document}
            onView={() => onView(document)}
            onDownload={() => onDownload(document)}
            onEdit={() => onEdit(document)}
            onDelete={() => onDelete(document)}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default DocumentsPage;
