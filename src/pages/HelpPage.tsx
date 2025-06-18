import React from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Container,
  Button,
  Link,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import HelpIcon from "@mui/icons-material/Help";
import SupportIcon from "@mui/icons-material/Support";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import LiveHelpIcon from "@mui/icons-material/LiveHelp";
import AIChatInterface from "@components/ai/AIChatInterface";

const HelpPage: React.FC = () => {
  return (
    <Container maxWidth="xl">
      <Typography variant="h4" component="h1" gutterBottom>
        Help & Support
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mb: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <HelpIcon color="primary" sx={{ fontSize: 32, mr: 2 }} />
              <Typography variant="h5">How can we help you?</Typography>
            </Box>

            <Typography variant="body1" paragraph>
              Welcome to the SafeSpec OHS Application help center. Here you can
              find resources to help you use the application effectively,
              troubleshoot issues, and get support when needed.
            </Typography>

            <Typography variant="body1" paragraph>
              If you can't find what you're looking for, please don't hesitate
              to contact our support team or use the AI Assistant below for
              immediate help.
            </Typography>
          </Paper>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  height: "100%",
                  borderRadius: 2,
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4,
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <MenuBookIcon color="primary" sx={{ fontSize: 24, mr: 2 }} />
                  <Typography variant="h6">User Guides</Typography>
                </Box>

                <Typography variant="body2" paragraph>
                  Comprehensive guides for using all features of the SafeSpec
                  OHS Application.
                </Typography>

                <Box sx={{ mt: 2 }}>
                  <Link
                    component={RouterLink}
                    to="/help/guides/getting-started"
                    variant="body2"
                    display="block"
                    sx={{ mb: 1 }}
                  >
                    Getting Started Guide
                  </Link>
                  <Link
                    component={RouterLink}
                    to="/help/guides/incidents"
                    variant="body2"
                    display="block"
                    sx={{ mb: 1 }}
                  >
                    Incident Management Guide
                  </Link>
                  <Link
                    component={RouterLink}
                    to="/help/guides/documents"
                    variant="body2"
                    display="block"
                    sx={{ mb: 1 }}
                  >
                    Document Management Guide
                  </Link>
                  <Link
                    component={RouterLink}
                    to="/help/guides/reports"
                    variant="body2"
                    display="block"
                    sx={{ mb: 1 }}
                  >
                    Reporting Guide
                  </Link>
                  <Link
                    component={RouterLink}
                    to="/help/guides/all"
                    variant="body2"
                    display="block"
                  >
                    View All Guides →
                  </Link>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  height: "100%",
                  borderRadius: 2,
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4,
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <LiveHelpIcon color="primary" sx={{ fontSize: 24, mr: 2 }} />
                  <Typography variant="h6">FAQs</Typography>
                </Box>

                <Typography variant="body2" paragraph>
                  Find answers to commonly asked questions about the SafeSpec
                  OHS Application.
                </Typography>

                <Box sx={{ mt: 2 }}>
                  <Link
                    component={RouterLink}
                    to="/help/faq/account"
                    variant="body2"
                    display="block"
                    sx={{ mb: 1 }}
                  >
                    Account & Login
                  </Link>
                  <Link
                    component={RouterLink}
                    to="/help/faq/offline"
                    variant="body2"
                    display="block"
                    sx={{ mb: 1 }}
                  >
                    Offline Functionality
                  </Link>
                  <Link
                    component={RouterLink}
                    to="/help/faq/permissions"
                    variant="body2"
                    display="block"
                    sx={{ mb: 1 }}
                  >
                    Roles & Permissions
                  </Link>
                  <Link
                    component={RouterLink}
                    to="/help/faq/troubleshooting"
                    variant="body2"
                    display="block"
                    sx={{ mb: 1 }}
                  >
                    Troubleshooting
                  </Link>
                  <Link
                    component={RouterLink}
                    to="/help/faq/all"
                    variant="body2"
                    display="block"
                  >
                    View All FAQs →
                  </Link>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4,
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <SupportIcon color="primary" sx={{ fontSize: 24, mr: 2 }} />
                  <Typography variant="h6">Contact Support</Typography>
                </Box>

                <Typography variant="body2" paragraph>
                  Need additional help? Our support team is available to assist
                  you.
                </Typography>

                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={4}>
                    <Paper
                      variant="outlined"
                      sx={{ p: 2, textAlign: "center" }}
                    >
                      <Typography variant="subtitle1" gutterBottom>
                        Email Support
                      </Typography>
                      <Typography variant="body2">
                        support@safespec.com
                      </Typography>
                      <Typography
                        variant="caption"
                        display="block"
                        sx={{ mt: 1 }}
                      >
                        Response within 24 hours
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Paper
                      variant="outlined"
                      sx={{ p: 2, textAlign: "center" }}
                    >
                      <Typography variant="subtitle1" gutterBottom>
                        Phone Support
                      </Typography>
                      <Typography variant="body2">+1 (800) 555-0123</Typography>
                      <Typography
                        variant="caption"
                        display="block"
                        sx={{ mt: 1 }}
                      >
                        Mon-Fri, 9AM-5PM EST
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Paper
                      variant="outlined"
                      sx={{ p: 2, textAlign: "center" }}
                    >
                      <Typography variant="subtitle1" gutterBottom>
                        Live Chat
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        sx={{ mt: 1 }}
                      >
                        Start Chat
                      </Button>
                      <Typography
                        variant="caption"
                        display="block"
                        sx={{ mt: 1 }}
                      >
                        Available 24/7
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              AI Safety Assistant
            </Typography>
            <Typography variant="body2" paragraph>
              Get immediate answers to your questions about safety regulations,
              incident reporting, or how to use the SafeSpec OHS Application.
            </Typography>

            <AIChatInterface
              contextType="help"
              placeholder="Ask me anything about SafeSpec OHS..."
              fullHeight={true}
            />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HelpPage;
