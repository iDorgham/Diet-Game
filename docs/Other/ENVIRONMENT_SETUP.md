# Environment Setup Guide

This guide will help you configure the environment variables for the Diet Game project.

## Quick Setup

### 1. Backend Environment Setup

```bash
# Copy the environment template
cp backend/env.setup backend/.env

# Edit the .env file with your actual values
# Use your preferred editor (VS Code, nano, vim, etc.)
code backend/.env
```

### 2. Frontend Environment Setup

```bash
# Copy the environment template
cp env.setup .env

# Edit the .env file with your actual values
code .env
```

## Required API Keys and Services

### Database Setup

1. **PostgreSQL Database**
   - Install PostgreSQL locally or use a cloud service
   - Create a database named `diet_game_gamification`
   - Update the database credentials in `backend/.env`

2. **Redis Cache**
   - Install Redis locally or use a cloud service
   - Update Redis connection details in `backend/.env`

### Firebase Setup

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication and Firestore

2. **Get Firebase Configuration**
   - Go to Project Settings > General
   - Scroll down to "Your apps" section
   - Add a web app and copy the config
   - Update the Firebase variables in both `.env` files

3. **Service Account Key**
   - Go to Project Settings > Service Accounts
   - Generate a new private key
   - Update `FIREBASE_PRIVATE_KEY` in `backend/.env`

### External API Keys

#### 1. Grok API (AI Integration)
- Sign up at [Grok API](https://grok.com/api)
- Get your API key
- Update `GROK_API_KEY` in `backend/.env`

#### 2. USDA Food Database
- Sign up at [USDA API](https://fdc.nal.usda.gov/api-guide.html)
- Get your API key
- Update `USDA_API_KEY` in both `.env` files

#### 3. Edamam Recipe API
- Sign up at [Edamam Developer](https://developer.edamam.com/)
- Create a Recipe Search application
- Get App ID and App Key
- Update `EDAMAM_APP_ID` and `EDAMAM_APP_KEY` in both `.env` files

#### 4. Spoonacular API
- Sign up at [Spoonacular API](https://spoonacular.com/food-api)
- Get your API key
- Update `SPOONACULAR_API_KEY` in both `.env` files

### Email Configuration (Optional)

For email notifications, configure SMTP:

1. **Gmail SMTP**
   - Enable 2-factor authentication
   - Generate an App Password
   - Update SMTP settings in `backend/.env`

2. **Other SMTP Providers**
   - Update `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`

### Monitoring (Optional)

#### Sentry Error Tracking
- Sign up at [Sentry](https://sentry.io/)
- Create a new project
- Get your DSN
- Update `SENTRY_DSN` in both `.env` files

#### Google Analytics
- Create a Google Analytics account
- Get your Measurement ID
- Update `VITE_GOOGLE_ANALYTICS_ID` in `.env`

## Security Considerations

### Production Environment

1. **Generate Strong Secrets**
   ```bash
   # Generate JWT secrets
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   
   # Generate session secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   
   # Generate encryption key (32 characters)
   node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
   ```

2. **Update Security Variables**
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - `SESSION_SECRET`
   - `ENCRYPTION_KEY`

3. **Database Security**
   - Use strong passwords
   - Enable SSL in production
   - Use connection pooling

4. **API Key Security**
   - Never commit API keys to version control
   - Use environment variables
   - Rotate keys regularly

## Environment Variables Reference

### Backend (.env)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment mode | Yes | development |
| `PORT` | Server port | Yes | 3000 |
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `REDIS_URL` | Redis connection string | Yes | - |
| `JWT_SECRET` | JWT signing secret | Yes | - |
| `FIREBASE_PROJECT_ID` | Firebase project ID | Yes | - |
| `GROK_API_KEY` | Grok AI API key | Yes | - |
| `USDA_API_KEY` | USDA Food Database API key | Yes | - |

### Frontend (.env)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_API_URL` | Backend API URL | Yes | http://localhost:3000 |
| `VITE_FIREBASE_API_KEY` | Firebase API key | Yes | - |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | Yes | - |
| `VITE_USDA_API_KEY` | USDA API key | No | - |
| `VITE_DEBUG_MODE` | Enable debug mode | No | true |

## Verification

### Test Backend Configuration

```bash
cd backend
npm run dev
```

Check for any missing environment variable errors.

### Test Frontend Configuration

```bash
npm run dev
```

Check browser console for any configuration errors.

### Test Database Connection

```bash
cd backend
npm run migrate
```

### Test Redis Connection

```bash
cd backend
npm run seed
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check PostgreSQL is running
   - Verify connection string format
   - Check firewall settings

2. **Redis Connection Failed**
   - Check Redis is running
   - Verify Redis URL format
   - Check Redis authentication

3. **Firebase Authentication Failed**
   - Verify Firebase project ID
   - Check service account key format
   - Ensure Firestore rules allow access

4. **API Key Invalid**
   - Verify API key is correct
   - Check API key permissions
   - Ensure API key is not expired

### Getting Help

- Check the logs in `backend/logs/` directory
- Review the configuration files in `backend/src/config/`
- Check browser developer console for frontend errors

## Next Steps

After setting up the environment:

1. Run database migrations: `cd backend && npm run migrate`
2. Seed the database: `cd backend && npm run seed`
3. Start the backend: `cd backend && npm run dev`
4. Start the frontend: `npm run dev`
5. Visit `http://localhost:5173` to see the application
