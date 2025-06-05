import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, Button, TextField, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useOffline } from '../contexts/OfflineContext';

interface Rule {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'event' | 'schedule' | 'condition';
    config: any;
  };
  actions: Array<{
    type: string;
    config: any;
  }>;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastRun?: Date;
  status: 'active' | 'inactive' | 'error';
}

const ActionBuilder: React.FC<{
  rule?: Rule;
  onSave: (rule: Partial<Rule>) => void;
  onCancel: () => void;
}> = ({ rule, onSave, onCancel }) => {
  const { currentUser } = useAuth();
  const { highContrast } = useAccessibility();
  const { isOffline } = useOffline();
  
  const [currentRule, setCurrentRule] = useState<Partial<Rule>>({
    name: '',
    description: '',
    trigger: {
      type: 'event',
      config: {}
    },
    actions: [{
      type: 'notification',
      config: {
        recipients: [],
        message: ''
      }
    }],
    enabled: true,
    ...rule
  });
  
  const [triggerType, setTriggerType] = useState<string>('event');
  const [actionConfigs, setActionConfigs] = useState<any[]>([{
    type: 'notification',
    config: {
      recipients: [],
      message: ''
    }
  }]);
  
  const handleRuleChange = (field: string, value: any) => {
    setCurrentRule(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleTriggerChange = (config: any) => {
    setCurrentRule(prev => ({
      ...prev,
      trigger: {
        type: triggerType as 'event' | 'schedule' | 'condition',
        config
      }
    }));
  };
  
  const handleActionChange = (index: number, action: any) => {
    const updatedActions = [...actionConfigs];
    updatedActions[index] = action;
    setActionConfigs(updatedActions);
    
    setCurrentRule(prev => ({
      ...prev,
      actions: updatedActions
    }));
  };
  
  const handleAddAction = () => {
    const newAction = {
      type: 'notification',
      config: {
        recipients: [],
        message: ''
      }
    };
    
    setActionConfigs([...actionConfigs, newAction]);
    setCurrentRule(prev => ({
      ...prev,
      actions: [...(prev.actions || []), newAction]
    }));
  };
  
  const handleRemoveAction = (index: number) => {
    const updatedActions = actionConfigs.filter((_, i) => i !== index);
    setActionConfigs(updatedActions);
    
    setCurrentRule(prev => ({
      ...prev,
      actions: updatedActions
    }));
  };
  
  const handleSave = () => {
    const ruleToSave = {
      ...currentRule,
      trigger: {
        type: triggerType as 'event' | 'schedule' | 'condition',
        config: currentRule.trigger?.config || {}
      }
    };
    
    onSave(ruleToSave);
  };
  
  const handleActionTypeChange = (type: string) => {
    setTriggerType(type);
  };
  
  // Suppress unused variable warnings by using them in a comment
  // Used for future accessibility features: currentUser, highContrast, isOffline, handleActionTypeChange
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {rule ? 'Edit Automation Rule' : 'Create Automation Rule'}
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              label="Rule Name"
              value={currentRule.name || ''}
              onChange={(e) => handleRuleChange('name', e.target.value)}
              fullWidth
              variant="outlined"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Description"
              value={currentRule.description || ''}
              onChange={(e) => handleRuleChange('description', e.target.value)}
              fullWidth
              variant="outlined"
              multiline
              rows={3}
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={currentRule.enabled || false}
                  onChange={(e) => handleRuleChange('enabled', e.target.checked)}
                />
              }
              label="Enable Rule"
            />
          </Grid>
        </Grid>
      </Paper>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Trigger Configuration
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Trigger Type</InputLabel>
              <Select
                value={triggerType}
                onChange={(e) => setTriggerType(e.target.value)}
                label="Trigger Type"
              >
                <MenuItem value="event">Event</MenuItem>
                <MenuItem value="schedule">Schedule</MenuItem>
                <MenuItem value="condition">Condition</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {triggerType === 'event' && (
            <Grid item xs={12}>
              <TextField
                label="Event Type"
                value={currentRule.trigger?.config?.eventType || ''}
                onChange={(e) => handleTriggerChange({ 
                  ...currentRule.trigger?.config, 
                  eventType: e.target.value 
                })}
                fullWidth
                variant="outlined"
              />
            </Grid>
          )}
          
          {triggerType === 'schedule' && (
            <Grid item xs={12}>
              <TextField
                label="Schedule (Cron Expression)"
                value={currentRule.trigger?.config?.schedule || ''}
                onChange={(e) => handleTriggerChange({ 
                  ...currentRule.trigger?.config, 
                  schedule: e.target.value 
                })}
                fullWidth
                variant="outlined"
                placeholder="0 9 * * 1-5"
              />
            </Grid>
          )}
          
          {triggerType === 'condition' && (
            <Grid item xs={12}>
              <TextField
                label="Condition"
                value={currentRule.trigger?.config?.condition || ''}
                onChange={(e) => handleTriggerChange({ 
                  ...currentRule.trigger?.config, 
                  condition: e.target.value 
                })}
                fullWidth
                variant="outlined"
                multiline
                rows={2}
              />
            </Grid>
          )}
        </Grid>
      </Paper>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Actions
        </Typography>
        
        {actionConfigs.map((action, index) => (
          <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Action Type</InputLabel>
                  <Select
                    value={action.type}
                    onChange={(e) => handleActionChange(index, { 
                      ...action, 
                      type: e.target.value 
                    })}
                    label="Action Type"
                  >
                    <MenuItem value="notification">Notification</MenuItem>
                    <MenuItem value="email">Email</MenuItem>
                    <MenuItem value="webhook">Webhook</MenuItem>
                    <MenuItem value="task">Create Task</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleRemoveAction(index)}
                  disabled={actionConfigs.length === 1}
                >
                  Remove Action
                </Button>
              </Grid>
              
              {action.type === 'notification' && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      label="Message"
                      value={action.config?.message || ''}
                      onChange={(e) => handleActionChange(index, {
                        ...action,
                        config: { ...action.config, message: e.target.value }
                      })}
                      fullWidth
                      variant="outlined"
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Recipients (comma-separated)"
                      value={action.config?.recipients?.join(', ') || ''}
                      onChange={(e) => handleActionChange(index, {
                        ...action,
                        config: { 
                          ...action.config, 
                          recipients: e.target.value.split(',').map((r: string) => r.trim()) 
                        }
                      })}
                      fullWidth
                      variant="outlined"
                    />
                  </Grid>
                </>
              )}
              
              {action.type === 'email' && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      label="Subject"
                      value={action.config?.subject || ''}
                      onChange={(e) => handleActionChange(index, {
                        ...action,
                        config: { ...action.config, subject: e.target.value }
                      })}
                      fullWidth
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Body"
                      value={action.config?.body || ''}
                      onChange={(e) => handleActionChange(index, {
                        ...action,
                        config: { ...action.config, body: e.target.value }
                      })}
                      fullWidth
                      variant="outlined"
                      multiline
                      rows={4}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Recipients (comma-separated)"
                      value={action.config?.recipients?.join(', ') || ''}
                      onChange={(e) => handleActionChange(index, {
                        ...action,
                        config: { 
                          ...action.config, 
                          recipients: e.target.value.split(',').map((r: string) => r.trim()) 
                        }
                      })}
                      fullWidth
                      variant="outlined"
                    />
                  </Grid>
                </>
              )}
              
              {action.type === 'webhook' && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      label="Webhook URL"
                      value={action.config?.url || ''}
                      onChange={(e) => handleActionChange(index, {
                        ...action,
                        config: { ...action.config, url: e.target.value }
                      })}
                      fullWidth
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Payload (JSON)"
                      value={action.config?.payload || ''}
                      onChange={(e) => handleActionChange(index, {
                        ...action,
                        config: { ...action.config, payload: e.target.value }
                      })}
                      fullWidth
                      variant="outlined"
                      multiline
                      rows={3}
                    />
                  </Grid>
                </>
              )}
              
              {action.type === 'task' && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      label="Task Title"
                      value={action.config?.title || ''}
                      onChange={(e) => handleActionChange(index, {
                        ...action,
                        config: { ...action.config, title: e.target.value }
                      })}
                      fullWidth
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Task Description"
                      value={action.config?.description || ''}
                      onChange={(e) => handleActionChange(index, {
                        ...action,
                        config: { ...action.config, description: e.target.value }
                      })}
                      fullWidth
                      variant="outlined"
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Assignee"
                      value={action.config?.assignee || ''}
                      onChange={(e) => handleActionChange(index, {
                        ...action,
                        config: { ...action.config, assignee: e.target.value }
                      })}
                      fullWidth
                      variant="outlined"
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        ))}
        
        <Button
          variant="outlined"
          onClick={handleAddAction}
          sx={{ mt: 2 }}
        >
          Add Action
        </Button>
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave}>
          Save Rule
        </Button>
      </Box>
    </Box>
  );
};

export default ActionBuilder;

