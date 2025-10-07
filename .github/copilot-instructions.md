# Farm2Fork v3 - Next.js E-commerce Application

Farm2Fork is a Next.js 15.2.4 TypeScript e-commerce application featuring producer and product management, multi-auth integration (Supabase, Firebase, Auth0, AWS Amplify), and a comprehensive dashboard for content management.

**ALWAYS** reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Prerequisites and Installation
- Ensure Node.js >=20 is installed (current verified: v20.19.4)
- Use yarn as the preferred package manager, npm as fallback

### Bootstrap, Build, and Test Commands
Run these commands in order for initial setup:

```bash
# 1. Install dependencies - NEVER CANCEL: Takes 82 seconds. Set timeout to 120+ seconds.
yarn install
# Warnings about peer dependencies are expected and non-breaking

# 2. Create required environment file
cp .env.local.example .env.local  # Or create manually with required variables

# 3. Build application - NEVER CANCEL: Takes 146 seconds. Set timeout to 180+ seconds.
yarn build
# Build will fail without proper NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

# 4. Run linting - Takes 17 seconds
yarn lint
# 41 warnings expected, no errors - this is normal

# 5. Check TypeScript compilation
npx tsc --noEmit
# Should complete without errors

# 6. Check code formatting (optional)
yarn fm:check
# Shows formatting issues but is not breaking
```

### Development Server
```bash
# Start development server - Ready in ~1.6 seconds after build
yarn dev
# Runs on http://localhost:8082 (NOT standard port 3000)

# Alternative using npm
npm run dev
```

### Production Build and Start
```bash
# Production build
yarn build

# Start production server
yarn start
# Also runs on port 8082
```

## Environment Variables

### Required Variables (Build will fail without these)
Create a `.env.local` file with at minimum:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SUPABASE_SERVICE_KEY=your_supabase_service_key
```

### Optional Variables
```bash
# Server and assets
NEXT_PUBLIC_SERVER_URL=
NEXT_PUBLIC_ASSETS_DIR=

# Maps
NEXT_PUBLIC_MAPBOX_API_KEY=

# File storage
NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN=

# Google Analytics (optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=

# Firebase (if using Firebase auth)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APPID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# AWS Amplify (if using Amplify auth)
NEXT_PUBLIC_AWS_AMPLIFY_USER_POOL_ID=
NEXT_PUBLIC_AWS_AMPLIFY_USER_POOL_WEB_CLIENT_ID=
NEXT_PUBLIC_AWS_AMPLIFY_REGION=

# Auth0 (if using Auth0 auth)
NEXT_PUBLIC_AUTH0_CLIENT_ID=
NEXT_PUBLIC_AUTH0_DOMAIN=
NEXT_PUBLIC_AUTH0_CALLBACK_URL=
```

## Validation and Testing

### Pre-commit Validation
ALWAYS run these commands before committing changes:
```bash
# Fix linting issues
yarn lint:fix

# Fix formatting issues  
yarn fm:fix

# Or run both together
yarn fix:all

# Verify TypeScript compilation
npx tsc --noEmit
```

### Manual Validation Scenarios
After making changes, ALWAYS test these core user scenarios:

1. **Homepage Load Test**
   - Navigate to http://localhost:8082
   - Verify homepage displays without runtime errors
   - Check that producer/product cards render

2. **Authentication Flow** (requires valid Supabase credentials)
   - Test user registration at `/auth/supabase/sign-up`
   - Test user login at `/auth/supabase/sign-in`
   - Verify dashboard access after login

3. **Product Browsing**
   - Visit `/termekek` (products page)
   - Test product search functionality
   - Verify product detail pages load

4. **Dashboard Functionality** (admin features)
   - Access `/dashboard` after authentication
   - Test product management features
   - Verify producer management works

### Known Limitations
- Application requires valid Supabase credentials to function properly
- Using placeholder environment variables will cause runtime errors
- Build includes 41 ESLint warnings which are expected and non-breaking
- No formal test framework (Jest/Vitest) is configured

## Project Structure and Key Locations

### Important Directories
```
src/
├── app/                 # Next.js app router pages
├── auth/               # Authentication components and providers
├── components/         # Reusable UI components
├── sections/           # Page-specific components
├── contexts/           # React context providers
├── actions/            # Server actions for data fetching
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── global-config.ts    # App configuration and environment variables
```

### Frequently Modified Files
- `src/global-config.ts` - Main configuration file
- `src/app/*/page.tsx` - Page components
- `src/sections/*/` - Business logic components
- `src/components/*/` - UI components

### Build and Configuration Files
- `package.json` - Scripts and dependencies
- `next.config.ts` - Next.js configuration
- `eslint.config.mjs` - ESLint rules and settings
- `tsconfig.json` - TypeScript configuration
- `.env.local` - Environment variables (create manually)

## Common Tasks and Commands

### Development Workflow
```bash
# Clean rebuild from scratch - NEVER CANCEL: Takes 3 minutes 39 seconds total. Set timeout to 360+ seconds.
yarn clean && yarn install && yarn build
# Alternative: yarn re:build

# Development with TypeScript watching
yarn tsc:dev
# Runs both dev server and TypeScript watch mode

# Check ESLint configuration
yarn lint:print
# Note: Only works after yarn install, fails if dependencies are missing

# Check TypeScript configuration  
yarn tsc:print
```

### Debugging Tips
- Server runs on port 8082, not the standard Next.js port 3000
- Check browser console for Supabase connection errors if app fails to load
- Runtime errors often indicate missing or invalid environment variables
- Use React DevTools for component debugging

### Performance Notes
- Initial yarn install: ~82 seconds (after clean)
- Quick yarn install: ~16 seconds (with cache)
- Production build: ~146 seconds  
- Full rebuild (clean + install + build): ~219 seconds (3 minutes 39 seconds)
- Development server startup: ~1.8 seconds (after successful build)
- ESLint run: ~17 seconds
- Prettier formatting: ~11-28 seconds depending on changes

## Authentication Configuration

The app supports multiple authentication providers configured in `src/global-config.ts`:
- **Default**: Supabase (currently configured)
- **Available**: Firebase, AWS Amplify, Auth0, JWT

To switch auth providers, modify the `auth.method` in `src/global-config.ts` and ensure corresponding environment variables are set.

## Critical Reminders

- **NEVER CANCEL** long-running builds or installs - they may take 2+ minutes
- **ALWAYS** set appropriate timeouts (120+ seconds for install, 180+ seconds for build)
- **ALWAYS** create or copy environment file before building
- **ALWAYS** run validation commands before committing changes
- **ALWAYS** test authentication flow after auth-related changes
- **ALWAYS** verify the application runs on port 8082, not 3000