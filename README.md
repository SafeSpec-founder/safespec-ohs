# SafeSpec OHS - Complete Full-Stack Application

## Overview

 Document your setup, e.g., README.md:

Firebase Functions V1

Node 20 (1st Gen)

firebase-functions@5.1.1

<firebase-admin@12.x>

SafeSpec OHS is a comprehensive Occupational Health and Safety (OHS) management system built with modern web technologies. This full-stack application provides organizations with powerful tools to manage incidents, conduct audits, track corrective actions, manage documents, and ensure regulatory compliance.

## Architecture

### Frontend

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **State Management**: Redux Toolkit
- **UI Components**: Custom components with Tailwind CSS
- **Authentication**: Firebase Authentication
- **Offline Support**: Service Worker with IndexedDB caching
- **PWA Features**: Installable, offline-capable, responsive design

### Backend

- **Platform**: Firebase Cloud Functions (Node.js 18)
- **Database**: Firebase Firestore
- **Authentication**: Firebase Authentication with custom claims
- **Storage**: Firebase Storage
- **API**: RESTful API with Express.js
- **Security**: Role-based access control (RBAC)

### Infrastructure

- **Hosting**: Firebase Hosting
- **CDN**: Firebase CDN
- **Monitoring**: Firebase Analytics & Performance
- **CI/CD**: GitHub Actions
- **Containerization**: Docker support

## Features

### Core Modules

1. **Incident Management**

   - Create, track, and manage safety incidents
   - Severity classification and workflow management
   - Attachment support and witness tracking
   - Automated notifications and escalations

2. **Audit Management**

   - Schedule and conduct safety audits
   - Customizable audit checklists
   - Finding tracking and scoring
   - Compliance reporting

3. **Corrective Actions**

   - Create and assign corrective/preventive actions
   - Due date tracking and notifications
   - Progress monitoring and verification
   - Effectiveness evaluation

4. **Document Management**

   - Centralized document repository
   - Version control and access levels
   - Document expiry tracking
   - Search and categorization

5. **User Management**

   - Multi-tenant architecture
   - Role-based permissions
   - User activity tracking
   - Profile management

6. **Reporting & Analytics**

   - Comprehensive safety dashboards
   - Customizable reports
   - Trend analysis
   - Export capabilities

7. **AI Assistant** (Placeholder Ready)
   - Intelligent safety recommendations
   - Natural language query support
   - Automated risk assessment
   - Compliance guidance

### Security Features

- Multi-factor authentication
- Role-based access control
- Data encryption at rest and in transit
- Audit logging
- Session management
- GDPR compliance ready

### Compliance Standards

- OSHA compliance
- ISO 45001 support
- Industry-specific regulations
- Customizable compliance frameworks

## Technology Stack

### Frontend Dependencies

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.8.0",
  "@reduxjs/toolkit": "^1.9.0",
  "react-redux": "^8.0.0",
  "firebase": "^9.17.0",
  "tailwindcss": "^3.2.0",
  "vite": "^4.1.0",
  "typescript": "^4.9.0"
}
```

### Backend Dependencies

```json
{
  "firebase-admin": "^11.5.0",
  "firebase-functions": "^4.2.0",
  "express": "^4.18.0",
  "cors": "^2.8.0",
  "joi": "^17.7.0",
  "bcryptjs": "^2.4.0",
  "multer": "^1.4.0"
}
```

## Project Structure

```
safespec_fullstack/
├── src/                          # Frontend source code
│   ├── components/               # React components
│   ├── pages/                    # Page components
│   ├── services/                 # API services
│   ├── store/                    # Redux store
│   ├── contexts/                 # React contexts
│   ├── hooks/                    # Custom hooks
│   ├── utils/                    # Utility functions
│   ├── styles/                   # Styling files
│   └── config/                   # Configuration files
├── functions/                    # Firebase Cloud Functions
│   ├── src/                      # Functions source code
│   │   ├── routes/               # API routes
│   │   ├── middleware/           # Express middleware
│   │   └── index.ts              # Main entry point
│   ├── package.json              # Functions dependencies
│   └── tsconfig.json             # TypeScript config
├── public/                       # Static assets
├── .github/workflows/            # CI/CD workflows
├── firebase.json                 # Firebase configuration
├── firestore.rules               # Firestore security rules
├── firestore.indexes.json        # Firestore indexes
├── storage.rules                 # Storage security rules
├── docker-compose.yml            # Docker configuration
├── Dockerfile                    # Docker image
└── package.json                  # Frontend dependencies
```

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Firebase CLI
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd safespec_fullstack
   ```

2. **Run the setup script**

   The `setup.sh` script installs all dependencies and runs the project's lint
   and test suites. It requires network access during execution.

   ```bash
   ./setup.sh
   ```

3. **Install frontend dependencies**

   ```bash
   npm install
   ```

4. **Install backend dependencies**

   ```bash
   cd functions
   npm install
   cd ..
   ```

5. **Configure environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your Firebase configuration
   ```

6. **Initialize Firebase**

   ```bash
   firebase login
   firebase use --add
   ```

### Development

1. **Start Firebase emulators**

   ```bash
   firebase emulators:start
   ```

2. **Start frontend development server**

   ```bash
   npm run dev
   ```

3. **Build and deploy functions**

   ```bash
   cd functions
   npm run build
   firebase deploy --only functions
   ```

### Production Deployment

1. **Build frontend**

   ```bash
   npm run build
   ```

2. **Deploy to Firebase**

   ```bash
   firebase deploy
   ```

## Configuration

### Environment Variables

#### Frontend (.env)

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
VITE_API_URL=https://us-central1-your-project.cloudfunctions.net/api
```

#### Backend (Firebase Functions)

Environment variables are managed through Firebase Functions configuration:

```bash
firebase functions:config:set openai.api_key="your-openai-key"
firebase functions:config:set sendgrid.api_key="your-sendgrid-key"
```

### Firebase Configuration

#### Firestore Rules

The application uses comprehensive security rules to ensure data protection and proper access control based on user roles and tenant isolation.

#### Storage Rules

File uploads are secured with role-based access and file type validation.

#### Indexes

Optimized database indexes are configured for efficient querying across all collections.

## API Documentation

### Authentication Endpoints

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout
- `POST /auth/forgot-password` - Password reset
- `POST /auth/refresh-token` - Token refresh

### Core Resource Endpoints

- `GET|POST|PUT|DELETE /incidents` - Incident management
- `GET|POST|PUT|DELETE /audits` - Audit management
- `GET|POST|PUT|DELETE /corrective-actions` - Corrective action management
- `GET|POST|PUT|DELETE /documents` - Document management
- `GET|POST|PUT|DELETE /users` - User management
- `GET|POST|PUT|DELETE /tenants` - Tenant management

### Reporting Endpoints

- `GET /reports/types` - Available report types
- `POST /reports/generate` - Generate reports
- `GET /reports/:id` - Get report by ID
- `GET /reports/:id/export` - Export report

### AI Assistant Endpoints

- `POST /chat/message` - Send message to AI
- `GET /chat/history` - Get chat history
- `POST /chat/analyze` - AI analysis

## Security

### Authentication & Authorization

- Firebase Authentication with custom claims
- Role-based access control (RBAC)
- Multi-tenant data isolation
- Session management with automatic token refresh

### Data Protection

- Encryption at rest (Firestore)
- Encryption in transit (HTTPS)
- Input validation and sanitization
- SQL injection prevention
- XSS protection

### Compliance

- GDPR compliance features
- Data retention policies
- Audit logging
- Privacy controls

## Testing

### Frontend Testing

```bash
npm run test:unit          # Unit tests
npm run test:integration   # Integration tests
npm run test:e2e          # End-to-end tests
```

### Backend Testing

```bash
cd functions
npm run test              # Function tests
npm run test:integration  # Integration tests
```

### Security Testing

```bash
npm audit                 # Dependency audit
npm run test:security     # Security tests
```

## Monitoring & Analytics

### Performance Monitoring

- Firebase Performance Monitoring
- Core Web Vitals tracking
- Custom performance metrics

### Error Tracking

- Firebase Crashlytics
- Error boundary implementation
- Comprehensive logging

### Analytics

- Firebase Analytics
- User behavior tracking
- Feature usage metrics

## Deployment

### CI/CD Pipeline

The application includes comprehensive GitHub Actions workflows for:

- Automated testing
- Security scanning
- Performance testing
- Deployment to staging and production
- Rollback capabilities

### Docker Support

```bash
# Build Docker image
docker build -t safespec-ohs .

# Run with Docker Compose
docker-compose up -d
```

### Scaling Considerations

- Firebase automatically scales
- CDN for global content delivery
- Database optimization with indexes
- Caching strategies implemented

## Maintenance

### Regular Tasks

- Security updates
- Dependency updates
- Performance optimization
- Backup verification
- Monitoring review

### Backup & Recovery

- Automated Firestore backups
- Storage backup procedures
- Disaster recovery plan
- Data export capabilities

## Support & Documentation

### Additional Resources

- API Documentation: `/docs/api`
- User Manual: `/docs/user-guide`
- Admin Guide: `/docs/admin-guide`
- Developer Guide: `/docs/developer-guide`

### Getting Help

- GitHub Issues: For bug reports and feature requests
- Documentation: Comprehensive guides and tutorials
- Community: Discussion forums and support

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## Changelog

See CHANGELOG.md for a detailed history of changes and updates.

---

**SafeSpec OHS** - Building safer workplaces through technology.
