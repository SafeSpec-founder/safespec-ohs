import React, { useState, useEffect } from 'react';
import { Typography, Box, Button, Grid, Paper, Divider } from '@mui/material';
import { InspectionTemplate, Inspection, InspectionItem, InspectionFinding } from '../../models/Inspection';
import { useAuth } from '../../contexts/AuthContext';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { useOffline } from '../../contexts/OfflineContext';
import { inspectionService } from '../../services/inspectionService';

const InspectionWorkflow: React.FC = () => {
  const { currentUser } = useAuth();
  const { highContrast } = useAccessibility();
  const { isOffline, queueAction } = useOffline();
  
  const [templates, setTemplates] = useState<InspectionTemplate[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<InspectionTemplate | null>(null);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [selectedFinding, setSelectedFinding] = useState<InspectionFinding | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    setLoading(true);
    try {
      const templatesData = await inspectionService.getTemplates();
      const inspectionsData = await inspectionService.getInspections();
      
      setTemplates(templatesData);
      setInspections(inspectionsData);
    } catch (error) {
      // Handle error with proper error boundary
      if (isOffline) {
        // Use cached data if available
      }
    } finally {
      setLoading(false);
    }
  };
  
  const createInspection = async (templateId: string) => {
    try {
      if (isOffline) {
        queueAction('createInspection', { templateId });
        // Update UI optimistically
        return;
      }
      
      const newInspection = await inspectionService.createInspection(templateId);
      setInspections([...inspections, newInspection]);
      setSelectedInspection(newInspection);
    } catch (error) {
      // Handle error with proper error boundary
    }
  };
  
  const updateInspectionItem = async (inspectionId: string, itemId: string, data: Partial<InspectionItem>) => {
    try {
      if (isOffline) {
        queueAction('updateInspectionItem', { inspectionId, itemId, data });
        // Update UI optimistically
        return;
      }
      
      await inspectionService.updateInspectionItem(inspectionId, itemId, data);
      // Update local state
      const updatedInspections = inspections.map(inspection => {
        if (inspection.id === inspectionId) {
          return {
            ...inspection,
            items: inspection.items.map(item => 
              item.id === itemId ? { ...item, ...data } : item
            )
          };
        }
        return inspection;
      });
      
      setInspections(updatedInspections);
      
      if (selectedInspection && selectedInspection.id === inspectionId) {
        setSelectedInspection({
          ...selectedInspection,
          items: selectedInspection.items.map(item => 
            item.id === itemId ? { ...item, ...data } : item
          )
        });
      }
    } catch (error) {
      // Handle error with proper error boundary
    }
  };
  
  const completeInspection = async (inspectionId: string) => {
    try {
      if (isOffline) {
        queueAction('completeInspection', { inspectionId });
        // Update UI optimistically
        return;
      }
      
      await inspectionService.completeInspection(inspectionId);
      // Update local state
      const updatedInspections = inspections.map(inspection => 
        inspection.id === inspectionId ? { ...inspection, status: 'completed', completedAt: new Date().toISOString() } : inspection
      );
      
      setInspections(updatedInspections);
      
      if (selectedInspection && selectedInspection.id === inspectionId) {
        setSelectedInspection({
          ...selectedInspection,
          status: 'completed',
          completedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      // Handle error with proper error boundary
    }
  };
  
  const addFinding = async (inspectionId: string, itemId: string, finding: Partial<InspectionFinding>) => {
    try {
      if (isOffline) {
        queueAction('addFinding', { inspectionId, itemId, finding });
        // Update UI optimistically
        return;
      }
      
      const newFinding = await inspectionService.addFinding(inspectionId, itemId, finding);
      // Update local state
      const updatedInspections = inspections.map(inspection => {
        if (inspection.id === inspectionId) {
          return {
            ...inspection,
            findings: [...inspection.findings, newFinding]
          };
        }
        return inspection;
      });
      
      setInspections(updatedInspections);
      
      if (selectedInspection && selectedInspection.id === inspectionId) {
        setSelectedInspection({
          ...selectedInspection,
          findings: [...selectedInspection.findings, newFinding]
        });
      }
    } catch (error) {
      // Handle error with proper error boundary
    }
  };
  
  const refreshData = () => {
    loadData();
  };
  
  const handleEditTemplate = (templateId: string) => {
    // Navigate to template editor or open modal
    const template = templates.find(t => t.id === templateId);
    if (template) {
      // Open template editor
    }
  };
  
  const handleExportInspection = (inspectionId: string) => {
    // Export inspection report
    inspectionService.exportInspection(inspectionId)
      .then(url => {
        // Open or download the exported report
        window.open(url, '_blank');
      })
      .catch(error => {
        // Handle error with proper error boundary
      });
  };
  
  const handleViewEvidence = (evidenceUrl: string) => {
    // Open evidence viewer
    window.open(evidenceUrl, '_blank');
  };
  
  const handleSaveFinding = (findingId: string) => {
    if (!selectedInspection || !selectedFinding) return;
    
    inspectionService.updateFinding(selectedInspection.id, findingId, selectedFinding)
      .then(() => {
        // Update local state
        const updatedInspections = inspections.map(inspection => {
          if (inspection.id === selectedInspection.id) {
            return {
              ...inspection,
              findings: inspection.findings.map(finding => 
                finding.id === findingId ? selectedFinding : finding
              )
            };
          }
          return inspection;
        });
        
        setInspections(updatedInspections);
        setSelectedInspection({
          ...selectedInspection,
          findings: selectedInspection.findings.map(finding => 
            finding.id === findingId ? selectedFinding : finding
          )
        });
      })
      .catch(error => {
        // Handle error with proper error boundary
      });
  };
  
  const handleUpdateItemStatus = (inspectionId: string, itemId: string, status: string) => {
    updateInspectionItem(inspectionId, itemId, { status });
  };
  
  const handleUpdateItemNotes = (inspectionId: string, itemId: string, notes: string) => {
    updateInspectionItem(inspectionId, itemId, { notes });
  };
  
  const handleAddEvidence = (inspectionId: string, itemId: string) => {
    // Open file upload dialog
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*,video/*,audio/*,.pdf';
    fileInput.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        
        // Upload the file
        inspectionService.uploadEvidence(inspectionId, itemId, file)
          .then(evidenceUrl => {
            // Update the item with the evidence URL
            updateInspectionItem(inspectionId, itemId, { 
              evidence: [...(selectedInspection?.items.find(i => i.id === itemId)?.evidence || []), evidenceUrl]
            });
          })
          .catch(error => {
            // Handle error with proper error boundary
          });
      }
    };
    fileInput.click();
  };
  
  const handleCreateFinding = (inspectionId: string, itemId: string) => {
    // Open finding creation dialog
    const item = selectedInspection?.items.find(i => i.id === itemId);
    if (!item) return;
    
    const newFinding: Partial<InspectionFinding> = {
      description: `Finding related to ${item.name}`,
      severity: 'medium',
      status: 'open',
      itemId: itemId,
      createdBy: currentUser?.id,
      createdAt: new Date().toISOString()
    };
    
    addFinding(inspectionId, itemId, newFinding);
  };
  
  const handleAddFinding = () => {
    if (!selectedInspection) return;
    
    // Open finding creation dialog
    const newFinding: Partial<InspectionFinding> = {
      description: 'New finding',
      severity: 'medium',
      status: 'open',
      createdBy: currentUser?.id,
      createdAt: new Date().toISOString()
    };
    
    addFinding(selectedInspection.id, '', newFinding);
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Inspection Workflow
      </Typography>
      
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button 
          variant="outlined" 
          color="primary"
          onClick={refreshData}
          aria-label="Refresh inspection data"
        >
          Refresh Data
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        {/* Templates Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Inspection Templates
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {templates.map(template => (
              <Box key={template.id} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Typography variant="subtitle1">{template.name}</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {template.description}
                </Typography>
                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <Button 
                    size="small" 
                    variant="outlined"
                    onClick={() => handleEditTemplate(template.id)}
                    aria-label={`Edit template ${template.name}`}
                  >
                    Edit
                  </Button>
                  <Button 
                    size="small" 
                    variant="contained" 
                    color="primary"
                    onClick={() => createInspection(template.id)}
                    aria-label={`Create inspection from template ${template.name}`}
                  >
                    Create Inspection
                  </Button>
                </Box>
              </Box>
            ))}
          </Paper>
        </Grid>
        
        {/* Inspections Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recent Inspections
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {inspections.map(inspection => (
              <Box key={inspection.id} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Typography variant="subtitle1">{inspection.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Status: {inspection.status}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Created: {new Date(inspection.createdAt).toLocaleDateString()}
                </Typography>
                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <Button 
                    size="small" 
                    variant="outlined"
                    onClick={() => handleExportInspection(inspection.id)}
                    aria-label={`Export inspection report for ${inspection.name}`}
                  >
                    Export
                  </Button>
                  <Button 
                    size="small" 
                    variant="contained" 
                    color="primary"
                    onClick={() => setSelectedInspection(inspection)}
                    aria-label={`View inspection details for ${inspection.name}`}
                  >
                    View Details
                  </Button>
                </Box>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Selected Inspection Details */}
      {selectedInspection && (
        <Paper sx={{ mt: 3, p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">{selectedInspection.name}</Typography>
            <Box>
              <Button 
                variant="outlined" 
                color="primary" 
                sx={{ mr: 1 }}
                onClick={() => handleExportInspection(selectedInspection.id)}
                aria-label={`Export inspection report for ${selectedInspection.name}`}
              >
                Export Report
              </Button>
              {selectedInspection.status !== 'completed' && (
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => completeInspection(selectedInspection.id)}
                  aria-label={`Complete inspection ${selectedInspection.name}`}
                >
                  Complete Inspection
                </Button>
              )}
            </Box>
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          <Typography variant="h6" gutterBottom>Inspection Items</Typography>
          
          {selectedInspection.items.map(item => (
            <Box key={item.id} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <Typography variant="subtitle1">{item.name}</Typography>
              <Typography variant="body2" gutterBottom>{item.description}</Typography>
              
              <Box sx={{ mt: 2, mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>Status:</Typography>
                <select 
                  value={item.status} 
                  onChange={(e) => handleUpdateItemStatus(selectedInspection.id, item.id, e.target.value)}
                  aria-label={`Update status for item ${item.name}`}
                  style={{ padding: '8px', width: '200px', marginBottom: '10px' }}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="non-compliant">Non-Compliant</option>
                  <option value="not-applicable">Not Applicable</option>
                </select>
                
                <Typography variant="body2" sx={{ mb: 1 }}>Notes:</Typography>
                <textarea 
                  value={item.notes || ''} 
                  aria-label="Add notes"
                  onChange={(e) => handleUpdateItemNotes(selectedInspection.id, item.id, e.target.value)}
                  style={{ width: '100%', minHeight: '80px', padding: '8px', marginBottom: '10px' }}
                />
                
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Button 
                    size="small" 
                    variant="outlined"
                    onClick={() => handleAddEvidence(selectedInspection.id, item.id)}
                    aria-label={`Add evidence for item ${item.name}`}
                  >
                    Add Evidence
                  </Button>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    color="warning"
                    onClick={() => handleCreateFinding(selectedInspection.id, item.id)}
                    aria-label={`Create finding for item ${item.name}`}
                  >
                    Create Finding
                  </Button>
                </Box>
              </Box>
              
              {item.evidence && item.evidence.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>Evidence:</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {item.evidence.map((evidence, index) => (
                      <Button 
                        key={index} 
                        size="small" 
                        variant="outlined"
                        onClick={() => handleViewEvidence(evidence)}
                        aria-label={`View evidence ${index + 1} for item ${item.name}`}
                      >
                        Evidence {index + 1}
                      </Button>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          ))}
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Findings</Typography>
            <Button 
              variant="outlined" 
              color="primary"
              onClick={handleAddFinding}
              aria-label="Add new finding"
            >
              Add Finding
            </Button>
          </Box>
          
          {selectedInspection.findings.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No findings recorded yet.</Typography>
          ) : (
            selectedInspection.findings.map(finding => (
              <Box key={finding.id} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Typography variant="subtitle1">
                  {finding.description}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Severity: {finding.severity} | Status: {finding.status}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Created: {new Date(finding.createdAt).toLocaleDateString()}
                </Typography>
                
                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  {finding.evidence && (
                    <Button 
                      size="small" 
                      variant="outlined"
                      onClick={() => handleViewEvidence(finding.evidence)}
                      aria-label={`View evidence for finding ${finding.description}`}
                    >
                      View Evidence
                    </Button>
                  )}
                  <Button 
                    size="small" 
                    variant="contained" 
                    color="primary"
                    onClick={() => setSelectedFinding(finding)}
                    aria-label={`Edit finding ${finding.description}`}
                  >
                    Edit
                  </Button>
                </Box>
              </Box>
            ))
          )}
          
          {/* Finding Edit Dialog */}
          {selectedFinding && (
            <Paper sx={{ mt: 3, p: 2, border: '1px solid #3f51b5' }}>
              <Typography variant="h6" gutterBottom>Edit Finding</Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>Description:</Typography>
                <textarea 
                  value={selectedFinding.description} 
                  onChange={(e) => setSelectedFinding({...selectedFinding, description: e.target.value})}
                  style={{ width: '100%', minHeight: '80px', padding: '8px' }}
                  aria-label="Edit finding description"
                />
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>Severity:</Typography>
                <select 
                  value={selectedFinding.severity} 
                  onChange={(e) => setSelectedFinding({...selectedFinding, severity: e.target.value})}
                  style={{ padding: '8px', width: '200px' }}
                  aria-label="Select finding severity"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>Status:</Typography>
                <select 
                  value={selectedFinding.status} 
                  onChange={(e) => setSelectedFinding({...selectedFinding, status: e.target.value})}
                  style={{ padding: '8px', width: '200px' }}
                  aria-label="Select finding status"
                >
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <Button 
                  variant="outlined" 
                  onClick={() => setSelectedFinding(null)}
                  aria-label="Cancel editing finding"
                >
                  Cancel
                </Button>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => handleSaveFinding(selectedFinding.id)}
                  aria-label="Save finding changes"
                >
                  Save Changes
                </Button>
              </Box>
            </Paper>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default InspectionWorkflow;
