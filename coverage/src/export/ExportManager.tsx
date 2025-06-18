import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Box, Button, Grid, Paper, Divider, TextField, Tabs, Tab } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useOffline } from '../contexts/OfflineContext';
import { exportService } from '../services/exportService';

interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  fields: string[];
}

interface ExportReport {
  id: string;
  name: string;
  templateId: string;
  format: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  downloadUrl?: stexport interface ScheduledReport {
  id: string;
  templateId: string;
  format: string;
  schedule: string;
  frequency: string;
  recipients: string[];
  lastRun?: string;
  nextRun?: string;
  createdAt: string;
  startDate: string;
}
interface FormData {
  templateId: string;
  format: string;
  dateRange: string;
  customStartDate: string;
  customEndDate: string;
  includeCharts: boolean;
  includeAttachments: boolean;
  recipients: string;
  schedule: string;
  frequency: string;
  dayOfWeek: number;
  dayOfMonth: number;
  startDate: string;
  endDate: string;
}

const ExportManager: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { highContrast } = useAccessibility();
  const { isOffline, queueAction } = useOffline();
  
  const [activeTab, setActiveTab] = useState<number>(0);
  const [templates, setTemplates] = useState<ExportTemplate[]>([]);
  const [reports, setReports] = useState<ExportReport[]>([]);
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    templateId: '',
    format: 'pdf',
    dateRange: 'last30days',
    customStartDate: '',
    customEndDate: '',
    includeCharts: true,
    includeAttachments: true,
    recipients: '',
    schedule: 'once',
    frequency: 'weekly',
    dayOfWeek: 1,
    dayOfMonth: 1,
    startDate: '',
    endDate: ''
  });
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    setLoading(true);
    try {
      const templatesData = await exportService.getTemplates();
      const reportsData = await exportService.getReports();
      const scheduledData = await exportService.getScheduledReports();
      
      setTemplates(templatesData);
      setReports(reportsData);
      setScheduledReports(scheduledData);
      
      if (templatesData.length > 0) {
        setFormData({
          ...formData,
          templateId: templatesData[0].id
        });
      }
    } catch (error) {
      // Handle error with proper error boundary
      if (isOffline) {
        // Use cached data if available
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  const handleInputChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };
  
  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const reportParams = {
        templateId: formData.templateId,
        format: formData.format,
        dateRange: formData.dateRange,
        customStartDate: formData.customStartDate,
        customEndDate: formData.customEndDate,
        includeCharts: formData.includeCharts,
        includeAttachments: formData.includeAttachments
      };
      
      if (isOffline) {
        queueAction('generateReport', reportParams);
        // Show success message
        return;
      }
      
      const newReport = await exportService.generateReport(reportParams);
      setReports([newReport, ...reports]);
      
      // Show success message
    } catch (error) {
      // Handle error with proper error boundary
    } finally {
      setLoading(false);
    }
  };
  
  const handleScheduleReport = async () => {
    setLoading(true);
    try {
      const scheduleParams = {
        templateId: formData.templateId,
        format: formData.format,
        includeCharts: formData.includeCharts,
        includeAttachments: formData.includeAttachments,
        recipients: formData.recipients.split(',').map((email: string) => email.trim()),
        schedule: formData.schedule,
        frequency: formData.frequency,
        dayOfWeek: formData.dayOfWeek.toString(),
        dayOfMonth: formData.dayOfMonth.toString(),
        startDate: formData.startDate,
        endDate: formData.endDate
      };
      
      if (isOffline) {
        queueAction('scheduleReport', scheduleParams);
        // Show success message
        return;
      }
      
      const newSchedule = await exportService.scheduleReport(scheduleParams);
      setScheduledReports([newSchedule, ...scheduledReports]);
      
      // Show success message
    } catch (error) {
      // Handle error with proper error boundary
    } finally {
      setLoading(false);
    }
  };
  
  const handleDownloadReport = async (report: any) => {
    try {
      const url = await exportService.getReportDownloadUrl(report.id);
      // Open the report in a new tab
      window.open(url, '_blank');
    } catch (error) {
      // Handle error with proper error boundary
    }
  };
  
  const handleDeleteReport = async (reportId: string) => {
    try {
      await exportService.deleteReport(reportId);
      // Update local state
      setReports(reports.filter(report => report.id !== reportId));
      
      // Show success message
    } catch (error) {
      // Handle error with proper error boundary
    }
  };
  
  const handleDeleteScheduledReport = async (reportId: string) => {
    try {
      await exportService.deleteScheduledReport(reportId);
      // Update local state
      setScheduledReports(scheduledReports.filter(report => report.id !== reportId));
      
      // Show success message
    } catch (error) {
      // Handle error with proper error boundary
    }
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Export Manager
      </Typography>
      
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          variant="outlined" 
          color="primary"
          onClick={loadData}
          aria-label="Refresh export data"
        >
          Refresh Data
        </Button>
      </Box>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          aria-label="Export manager tabs"
          variant="fullWidth"
        >
          <Tab label="Generate Report" id="tab-0" aria-controls="tabpanel-0" />
          <Tab label="Schedule Reports" id="tab-1" aria-controls="tabpanel-1" />
          <Tab label="My Reports" id="tab-2" aria-controls="tabpanel-2" />
          <Tab label="Scheduled Reports" id="tab-3" aria-controls="tabpanel-3" />
        </Tabs>
        
        {/* Generate Report Tab */}
        <Box
          role="tabpanel"
          hidden={activeTab !== 0}
          id="tabpanel-0"
          aria-labelledby="tab-0"
          sx={{ p: 3 }}
        >
          {activeTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Report Configuration
                </Typography>
                
                <TextField
                  select
                  label="Report Template"
                  value={formData.templateId}
                  onChange={(e) => handleInputChange('templateId', e.target.value)}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  SelectProps={{
                    native: true,
                  }}
                  aria-label="Select report template"
                >
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </TextField>
                
                <TextField
                  select
                  label="Format"
                  value={formData.format}
                  onChange={(e) => handleInputChange('format', e.target.value)}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  SelectProps={{
                    native: true,
                  }}
                  aria-label="Select report format"
                >
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="csv">CSV</option>
                  <option value="html">HTML</option>
                </TextField>
                
                <TextField
                  select
                  label="Date Range"
                  value={formData.dateRange}
                  onChange={(e) => handleInputChange('dateRange', e.target.value)}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  SelectProps={{
                    native: true,
                  }}
                  aria-label="Select date range"
                >
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="last7days">Last 7 Days</option>
                  <option value="last30days">Last 30 Days</option>
                  <option value="thisMonth">This Month</option>
                  <option value="lastMonth">Last Month</option>
                  <option value="thisYear">This Year</option>
                  <option value="custom">Custom Range</option>
                </TextField>
                
                {formData.dateRange === 'custom' && (
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      label="Start Date"
                      type="date"
                      value={formData.customStartDate}
                      onChange={(e) => handleInputChange('customStartDate', e.target.value)}
                      fullWidth
                      margin="normal"
                      variant="outlined"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      aria-label="Custom start date"
                    />
                    <TextField
                      label="End Date"
                      type="date"
                      value={formData.customEndDate}
                      onChange={(e) => handleInputChange('customEndDate', e.target.value)}
                      fullWidth
                      margin="normal"
                      variant="outlined"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      aria-label="Custom end date"
                    />
                  </Box>
                )}
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Report Options
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body1" gutterBottom>
                    Include Charts and Graphs:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                      variant={formData.includeCharts ? "contained" : "outlined"} 
                      color="primary"
                      onClick={() => handleInputChange('includeCharts', true)}
                      aria-label="Include charts and graphs"
                    >
                      Yes
                    </Button>
                    <Button 
                      variant={!formData.includeCharts ? "contained" : "outlined"} 
                      color="primary"
                      onClick={() => handleInputChange('includeCharts', false)}
                      aria-label="Exclude charts and graphs"
                    >
                      No
                    </Button>
                  </Box>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body1" gutterBottom>
                    Include Attachments:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                      variant={formData.includeAttachments ? "contained" : "outlined"} 
                      color="primary"
                      onClick={() => handleInputChange('includeAttachments', true)}
                      aria-label="Include attachments"
                    >
                      Yes
                    </Button>
                    <Button 
                      variant={!formData.includeAttachments ? "contained" : "outlined"} 
                      color="primary"
                      onClick={() => handleInputChange('includeAttachments', false)}
                      aria-label="Exclude attachments"
                    >
                      No
                    </Button>
                  </Box>
                </Box>
                
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={handleGenerateReport}
                    disabled={loading || !formData.templateId}
                    aria-label="Generate report"
                  >
                    Generate Report
                  </Button>
                </Box>
              </Grid>
            </Grid>
          )}
        </Box>
        
        {/* Schedule Reports Tab */}
        <Box
          role="tabpanel"
          hidden={activeTab !== 1}
          id="tabpanel-1"
          aria-labelledby="tab-1"
          sx={{ p: 3 }}
        >
          {activeTab === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Report Configuration
                </Typography>
                
                <TextField
                  select
                  label="Report Template"
                  value={formData.templateId}
                  onChange={(e) => handleInputChange('templateId', e.target.value)}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  SelectProps={{
                    native: true,
                  }}
                  aria-label="Select report template"
                >
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </TextField>
                
                <TextField
                  select
                  label="Format"
                  value={formData.format}
                  onChange={(e) => handleInputChange('format', e.target.value)}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  SelectProps={{
                    native: true,
                  }}
                  aria-label="Select report format"
                >
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="csv">CSV</option>
                  <option value="html">HTML</option>
                </TextField>
                
                <TextField
                  label="Recipients (comma separated)"
                  value={formData.recipients}
                  onChange={(e) => handleInputChange('recipients', e.target.value)}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  aria-label="Enter recipient email addresses"
                />
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body1" gutterBottom>
                    Include Charts and Graphs:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                      variant={formData.includeCharts ? "contained" : "outlined"} 
                      color="primary"
                      onClick={() => handleInputChange('includeCharts', true)}
                      aria-label="Include charts and graphs"
                    >
                      Yes
                    </Button>
                    <Button 
                      variant={!formData.includeCharts ? "contained" : "outlined"} 
                      color="primary"
                      onClick={() => handleInputChange('includeCharts', false)}
                      aria-label="Exclude charts and graphs"
                    >
                      No
                    </Button>
                  </Box>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body1" gutterBottom>
                    Include Attachments:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                      variant={formData.includeAttachments ? "contained" : "outlined"} 
                      color="primary"
                      onClick={() => handleInputChange('includeAttachments', true)}
                      aria-label="Include attachments"
                    >
                      Yes
                    </Button>
                    <Button 
                      variant={!formData.includeAttachments ? "contained" : "outlined"} 
                      color="primary"
                      onClick={() => handleInputChange('includeAttachments', false)}
                      aria-label="Exclude attachments"
                    >
                      No
                    </Button>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Schedule Configuration
                </Typography>
                
                <TextField
                  select
                  label="Schedule Type"
                  value={formData.schedule}
                  onChange={(e) => handleInputChange('schedule', e.target.value)}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  SelectProps={{
                    native: true,
                  }}
                  aria-label="Select schedule type"
                >
                  <option value="once">One Time</option>
                  <option value="recurring">Recurring</option>
                </TextField>
                
                {formData.schedule === 'once' ? (
                  <TextField
                    label="Scheduled Date"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    aria-label="Select scheduled date"
                  />
                ) : (
                  <>
                    <TextField
                      select
                      label="Frequency"
                      value={formData.frequency}
                      onChange={(e) => handleInputChange('frequency', e.target.value)}
                      fullWidth
                      margin="normal"
                      variant="outlined"
                      SelectProps={{
                        native: true,
                      }}
                      aria-label="Select frequency"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                    </TextField>
                    
                    {formData.frequency === 'weekly' && (
                      <TextField
                        select
                        label="Day of Week"
                        value={formData.dayOfWeek}
                        onChange={(e) => handleInputChange('dayOfWeek', e.target.value)}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        SelectProps={{
                          native: true,
                        }}
                        aria-label="Select day of week"
                      >
                        <option value="1">Monday</option>
                        <option value="2">Tuesday</option>
                        <option value="3">Wednesday</option>
                        <option value="4">Thursday</option>
                        <option value="5">Friday</option>
                        <option value="6">Saturday</option>
                        <option value="0">Sunday</option>
                      </TextField>
                    )}
                    
                    {formData.frequency === 'monthly' && (
                      <TextField
                        select
                        label="Day of Month"
                        value={formData.dayOfMonth}
                        onChange={(e) => handleInputChange('dayOfMonth', e.target.value)}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        SelectProps={{
                          native: true,
                        }}
                        aria-label="Select day of month"
                      >
                        {Array.from({ length: 31 }, (_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1}
                          </option>
                        ))}
                      </TextField>
                    )}
                    
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <TextField
                        label="Start Date"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        InputLabelProps={{
                          shrink: true,
                        }}
                        aria-label="Select start date"
                      />
                      <TextField
                        label="End Date (Optional)"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => handleInputChange('endDate', e.target.value)}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        InputLabelProps={{
                          shrink: true,
                        }}
                        aria-label="Select end date"
                      />
                    </Box>
                  </>
                )}
                
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={handleScheduleReport}
                    disabled={loading || !formData.templateId || !formData.recipients || !formData.startDate}
                    aria-label="Schedule report"
                  >
                    Schedule Report
                  </Button>
                </Box>
              </Grid>
            </Grid>
          )}
        </Box>
        
        {/* My Reports Tab */}
        <Box
          role="tabpanel"
          hidden={activeTab !== 2}
          id="tabpanel-2"
          aria-labelledby="tab-2"
          sx={{ p: 3 }}
        >
          {activeTab === 2 && (
            <>
              <Typography variant="h6" gutterBottom>
                Generated Reports
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {reports.length === 0 ? (
                <Typography variant="body1" color="text.secondary">
                  No reports found. Generate a report from the "Generate Report" tab.
                </Typography>
              ) : (
                reports.map(report => (
                  <Box 
                    key={report.id} 
                    sx={{ 
                      mb: 2, 
                      p: 2, 
                      border: '1px solid #e0e0e0', 
                      borderRadius: 1
                    }}
                  >
                    <Typography variant="subtitle1">{report.name}</Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Generated: {new Date(report.createdAt).toLocaleString()} | Format: {report.format.toUpperCase()}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      Template: {templates.find(t => t.id === report.templateId)?.name || 'Unknown'}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => handleDownloadReport(report)}
                        aria-label={`Download report ${report.name}`}
                      >
                        Download
                      </Button>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        color="error"
                        onClick={() => handleDeleteReport(report.id)}
                        aria-label={`Delete report ${report.name}`}
                      >
                        Delete
                      </Button>
                    </Box>
                  </Box>
                ))
              )}
            </>
          )}
        </Box>
        
        {/* Scheduled Reports Tab */}
        <Box
          role="tabpanel"
          hidden={activeTab !== 3}
          id="tabpanel-3"
          aria-labelledby="tab-3"
          sx={{ p: 3 }}
        >
          {activeTab === 3 && (
            <>
              <Typography variant="h6" gutterBottom>
                Scheduled Reports
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {scheduledReports.length === 0 ? (
                <Typography variant="body1" color="text.secondary">
                  No scheduled reports found. Schedule a report from the "Schedule Reports" tab.
                </Typography>
              ) : (
                scheduledReports.map(report => (
                  <Box 
                    key={report.id} 
                    sx={{ 
                      mb: 2, 
                      p: 2, 
                      border: '1px solid #e0e0e0', 
                      borderRadius: 1
                    }}
                  >
                    <Typography variant="subtitle1">{report.name}</Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Created: {new Date(report.createdAt).toLocaleString()} | Format: {report.format.toUpperCase()}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      Template: {templates.find(t => t.id === report.templateId)?.name || 'Unknown'}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      Schedule: {report.schedule === 'once' ? 'One Time' : 'Recurring'} | 
                      {report.schedule === 'once' 
                        ? ` Date: ${new Date(report.startDate).toLocaleDateString()}`
                        : ` Frequency: ${report.frequency.charAt(0).toUpperCase() + report.frequency.slice(1)}`
                      }
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      Recipients: {report.recipients.join(', ')}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
                      <Button 
                        size="small" 
                        variant="outlined"
                        href={`/exports/scheduled/${report.id}/edit`}
                        aria-label={`Edit scheduled report ${report.name}`}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        color="error"
                        onClick={() => handleDeleteScheduledReport(report.id)}
                        aria-label={`Delete scheduled report ${report.name}`}
                      >
                        Delete
                      </Button>
                    </Box>
                  </Box>
                ))
              )}
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default ExportManager;
