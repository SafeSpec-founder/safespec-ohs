# SafeSpec OHS Firebase Functions

This directory contains the Firebase Cloud Functions for the SafeSpec OHS application, providing a comprehensive backend API for occupational health and safety management.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Firebase CLI
- Firebase project with Firestore, Authentication, and Storage enabled

### Installation

```bash
cd functions
npm install
```

### Environment Setup

```bash
cp .env.example .env
# Edit .env with your Firebase configuration
```

### Local Development

```bash
# Start Firebase emulators
firebase emulators:start

# Deploy functions
firebase deploy --only functions
```

## 📋 Available Functions

### Authentication Functions

- `createUserOnSignUp` - Creates user profile on signup
- `cleanupUserData` - Cleans up user data on deletion
- `getUserRole` - Gets user role information
- `setUserRole` - Sets user role (admin only)
- `updateLoginTimestamp` - Updates user login timestamp
- `recordLoginActivity` - Records login activity
- `exchangeAuthCode` - OAuth code exchange
- `exchangeAuthCodeHttp` - HTTP OAuth endpoint

### Incident Management Functions

- `createIncident` - Creates new incident reports
- `updateIncidentStatus` - Updates incident status
- `assignIncident` - Assigns incidents to users
- `escalateIncident` - Escalates high-priority incidents

### Document Management Functions

- `createDocumentVersion` - Creates document versions on updates
- `generateDocumentReport` - Generates document reports
- `processDocumentUpload` - Processes document uploads

### Compliance Functions

- `checkComplianceStatus` - Checks compliance status
- `generateComplianceReport` - Generates compliance reports
- `scheduleComplianceCheck` - Schedules compliance checks

### Notification Functions

- `createNotification` - Creates notifications
- `markNotificationRead` - Marks notifications as read
- `sendReminderNotifications` - Sends reminder notifications

### Scheduled Functions

- `calculatePerformanceMetrics` - Daily performance metrics calculation
- `sendReminderNotifications` - Hourly reminder checks
- `cleanupOldData` - Weekly data cleanup
- `generateWeeklyReports` - Weekly report generation

### Approval Workflow Functions

- `processPendingApproval` - Processes approval requests
- `createApprovalRequest` - Creates approval requests
- `escalateApproval` - Escalates overdue approvals

### HTTP API Endpoints

- `GET /health` - Health check endpoint
- `GET /api/status` - API status endpoint
- `POST /api/auth/exchange` - OAuth code exchange
- `GET /api/metrics` - Performance metrics
- `POST /api/webhooks/*` - Webhook endpoints

## 🔧 Configuration

### Environment Variables

All configuration is handled through environment variables. See `.env.example` for required variables.

### Firebase Configuration

Ensure your Firebase project has the following services enabled:

- Firestore Database
- Authentication
- Cloud Storage
- Cloud Functions

### Security Rules

The functions implement role-based access control with the following roles:

- `user` - Basic user permissions
- `supervisor` - Can manage incidents and users
- `manager` - Can generate reports and manage compliance
- `admin` - Full system access
- `super_admin` - System administration

## 📊 Monitoring & Logging

### Performance Monitoring

- Function execution times
- Error rates and types
- Resource usage metrics
- User activity tracking

### Audit Logging

All significant actions are logged to the `audit_logs` collection:

- User authentication events
- Data modifications
- Permission changes
- System administration actions

### Health Checks

- `/health` endpoint for basic health monitoring
- Automatic error reporting to Firebase Crashlytics
- Performance metrics collection

## 🔒 Security Features

### Authentication & Authorization

- Firebase Authentication integration
- JWT token validation
- Role-based access control
- Session management

### Data Protection

- Input validation using Joi schemas
- SQL injection prevention
- XSS protection
- Rate limiting

### Audit & Compliance

- Complete audit trail
- GDPR compliance features
- Data retention policies
- Secure data deletion

## 🚀 Deployment

### Development

```bash
firebase emulators:start
```

### Staging

```bash
firebase use staging
firebase deploy --only functions
```

### Production

```bash
firebase use production
firebase deploy --only functions
```

### CI/CD

The functions are automatically deployed via GitHub Actions on:

- Push to `main` branch (production)
- Push to `develop` branch (staging)
- Pull request creation (development)

## 📈 Performance Optimization

### Function Configuration

- Memory allocation: 256MB-1GB based on function complexity
- Timeout: 60-540 seconds based on operation type
- Max instances: 10-100 based on expected load

### Database Optimization

- Efficient Firestore queries with proper indexing
- Connection pooling for external services
- Caching for frequently accessed data

### Monitoring

- Cloud Monitoring integration
- Custom metrics for business logic
- Alerting for critical errors

## 🧪 Testing

### Unit Tests

```bash
npm test
```

### Integration Tests

```bash
npm run test:integration
```

### Load Testing

```bash
npm run test:load
```

## 📚 API Documentation

### Authentication

All callable functions require Firebase Authentication. Include the ID token in requests:

```javascript
const functions = getFunctions();
const myFunction = httpsCallable(functions, "functionName");
const result = await myFunction(data);
```

### Error Handling

Functions return standardized error responses:

```javascript
{
  "error": {
    "code": "permission-denied",
    "message": "Insufficient permissions"
  }
}
```

### Rate Limiting

API endpoints are rate limited:

- 100 requests per 15 minutes per user
- 1000 requests per hour per IP
- Burst protection for high-frequency operations

## 🔄 Data Flow

### Incident Reporting Flow

1. User creates incident via `createIncident`
2. Automatic notification to supervisors
3. Workflow triggers for assignment and escalation
4. Status updates via `updateIncidentStatus`
5. Completion and reporting

### Compliance Monitoring Flow

1. Scheduled compliance checks via `checkComplianceStatus`
2. Automatic report generation
3. Notification of non-compliance issues
4. Escalation to management
5. Corrective action tracking

### Document Management Flow

1. Document upload and processing
2. Version control via `createDocumentVersion`
3. Access control and permissions
4. Search and retrieval
5. Audit trail maintenance

## 🛠️ Troubleshooting

### Common Issues

#### Function Timeout

- Increase timeout in function configuration
- Optimize database queries
- Implement pagination for large datasets

#### Memory Errors

- Increase memory allocation
- Optimize data processing
- Implement streaming for large files

#### Permission Errors

- Verify user roles and permissions
- Check Firebase security rules
- Validate authentication tokens

### Debugging

```bash
# View function logs
firebase functions:log

# Debug locally
firebase emulators:start --inspect-functions

# Monitor performance
firebase functions:config:get
```

## 📞 Support

For technical support or questions:

- Check the troubleshooting section above
- Review Firebase Functions documentation
- Contact the development team
- Submit issues via GitHub

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
