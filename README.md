# Farm2Fork v3 - Next.js E-commerce Application

Farm2Fork is a Next.js 15.2.4 TypeScript e-commerce application featuring producer and product management, multi-auth integration (Supabase, Firebase, Auth0, AWS Amplify), and a comprehensive dashboard for content management.

**Szezonális zöldségek és gyümölcsök hazai termelőktől** - Seasonal vegetables and fruits from local Hungarian producers, with a focus on environmentally friendly solutions and organic ingredients.

## 🌱 Features

- **E-commerce Platform**: Complete shopping experience for seasonal produce
- **Producer Management**: Comprehensive profiles for local farmers and producers
- **Product Categories**: Vegetables, fruits, processed products, seasonal boxes, mushrooms, herbs, and more
- **Multi-Authentication**: Support for Supabase, Firebase, Auth0, AWS Amplify, and JWT
- **Admin Dashboard**: Content management, order tracking, user management
- **Seasonal Information**: Product availability based on seasons
- **Storage Guidelines**: Information about proper storage of products
- **Order Management**: Complete checkout and payment processing
- **Multi-language Support**: Primarily Hungarian with international support
- **Responsive Design**: Material-UI based modern interface

## 🛠 Prerequisites

- **Node.js** ≥20 (Recommended: v20.19.4)
- **Package Manager**: Yarn (preferred) or npm
- **Database**: Supabase account for authentication and data storage

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd farm2fork_v3

# Install dependencies (takes ~82 seconds, never cancel)
yarn install
```

### 2. Environment Setup

```bash
# Create environment file
cp .env.local.example .env.local
```

**Required Environment Variables** (build will fail without these):
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SUPABASE_SERVICE_KEY=your_supabase_service_key
```

### 3. Build and Run

```bash
# Build the application (takes ~146 seconds, never cancel)
yarn build

# Start development server (runs on port 8082)
yarn dev

# Or start production server
yarn start
```

**Important**: The application runs on **port 8082**, not the standard Next.js port 3000.

## 📦 Available Scripts

### Development
```bash
yarn dev              # Start development server with Turbopack
yarn tsc:dev          # Run dev server + TypeScript watch mode
yarn tsc:watch        # TypeScript compilation in watch mode
```

### Building
```bash
yarn build            # Production build
yarn clean            # Clean all build artifacts and dependencies
yarn re:build         # Clean + install + build (full rebuild)
```

### Code Quality
```bash
yarn lint             # Run ESLint (41 warnings expected, no errors)
yarn lint:fix         # Fix ESLint issues automatically
yarn fm:check         # Check Prettier formatting
yarn fm:fix           # Fix Prettier formatting
yarn fix:all          # Run lint:fix + fm:fix together
```

### TypeScript
```bash
npx tsc --noEmit      # Check TypeScript compilation
yarn tsc:print        # Show TypeScript configuration
```

## ⚙️ Environment Variables

### Required Variables
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

## 🏗 Project Structure

```
src/
├── app/                 # Next.js app router pages
│   ├── (home)/         # Homepage
│   ├── termekek/       # Products pages
│   ├── termelok/       # Producers pages
│   ├── dashboard/      # Admin dashboard
│   └── auth/           # Authentication pages
├── sections/           # Page-specific components
├── components/         # Reusable UI components
├── auth/              # Authentication components and providers
├── contexts/          # React context providers
├── actions/           # Server actions for data fetching
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
└── global-config.ts   # App configuration and environment variables
```

## 🔗 Key Routes

- **Homepage**: `/` - Main landing page
- **Products**: `/termekek` - Browse all products
  - `/termekek/zoldsegek` - Vegetables
  - `/termekek/gyumolcsok` - Fruits
  - `/termekek/feldolgozott-termekek` - Processed products
- **Producers**: `/termelok` - Local producer profiles
- **User Profile**: `/profil` - User account management
- **Order Process**: `/rendeles-menete` - Checkout and ordering
- **Seasonality**: `/szezonalitas` - Seasonal product information
- **Storage**: `/tarolas` - Product storage guidelines
- **Dashboard**: `/dashboard` - Admin panel (requires authentication)

## 🔐 Authentication

The application supports multiple authentication providers configured in `src/global-config.ts`:

- **Default**: Supabase (currently configured)
- **Available**: Firebase, AWS Amplify, Auth0, JWT

To switch auth providers, modify the `auth.method` in `src/global-config.ts` and ensure corresponding environment variables are set.

## 📱 Development Workflow

### Before Making Changes
```bash
# Ensure clean state
yarn lint
npx tsc --noEmit
```

### After Making Changes
```bash
# Fix code issues
yarn fix:all

# Verify TypeScript
npx tsc --noEmit

# Test the application
yarn dev  # Verify on http://localhost:8082
```

### Manual Testing Scenarios
1. **Homepage Load**: Navigate to http://localhost:8082
2. **Product Browsing**: Visit `/termekek` and test search
3. **Authentication**: Test sign-up/sign-in flows
4. **Dashboard**: Access admin features after login

## ⚠️ Important Notes

- **Build Requirements**: Application requires valid Supabase credentials to build and run properly
- **Port**: Development server runs on port **8082**, not 3000
- **Performance**: 
  - Initial install: ~82 seconds
  - Production build: ~146 seconds
  - Full rebuild: ~3 minutes 39 seconds
- **Code Quality**: 41 ESLint warnings are expected and non-breaking
- **Never Cancel**: Long-running builds and installs should never be cancelled

## 🐛 Troubleshooting

- **Build Fails**: Ensure required Supabase environment variables are set
- **Runtime Errors**: Check browser console for Supabase connection errors
- **Port Issues**: Application uses port 8082, not 3000
- **Dependencies**: Use `yarn re:build` for clean rebuild if issues persist

## 🤝 Contributing

1. Run validation before committing:
   ```bash
   yarn fix:all
   npx tsc --noEmit
   ```
2. Test core scenarios manually
3. Ensure all builds pass without new errors

## 📄 License

Private - All rights reserved

---

**Built with**: Next.js 15.2.4, TypeScript, Material-UI, Supabase
