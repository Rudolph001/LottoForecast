# EuroMillions AI Prediction Platform

## Overview

This is a full-stack EuroMillions lottery prediction platform that leverages AI/ML algorithms to generate intelligent number predictions. The application provides real-time jackpot tracking, currency conversion, historical data analysis, and professional-grade prediction capabilities.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Charts/Visualization**: Recharts for data visualization
- **Theme**: Custom light/dark theme implementation with CSS variables

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **API**: RESTful API design
- **File Upload**: Multer for CSV data processing
- **Development**: Vite dev server integration for hot module replacement

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM
- **Connection**: Neon serverless PostgreSQL
- **Schema Management**: Drizzle Kit for migrations
- **In-Memory Fallback**: MemStorage class for development/testing

## Key Components

### Database Schema
- **euroMillionsDraws**: Historical draw data with main numbers, lucky stars, jackpot amounts
- **predictions**: AI-generated predictions with confidence scores and pattern matching
- **mlModels**: ML model versioning, accuracy tracking, and training data metrics

### API Endpoints
- `GET /api/jackpot` - Current jackpot information
- `GET /api/exchange-rate` - Live EUR to ZAR currency conversion
- `POST /api/upload-data` - CSV file upload for historical data processing
- `GET /api/predictions/latest` - Latest AI prediction
- `POST /api/predictions/generate` - Generate new predictions
- `GET /api/analysis/frequency` - Number frequency analysis
- `GET /api/model/performance` - ML model performance metrics

### Core Features
1. **Jackpot Banner**: Real-time jackpot display with multi-currency support
2. **Currency Converter**: Live EUR to ZAR conversion with auto-calculation
3. **Data Upload**: CSV processing for historical EuroMillions data
4. **AI Predictions**: ML-powered number generation with confidence scoring
5. **Analytics Dashboard**: Frequency analysis, pattern matching, performance metrics
6. **Theme System**: Professional light/dark mode with custom color palette

## Data Flow

1. **Data Ingestion**: CSV files uploaded → Parsed and validated → Stored in PostgreSQL
2. **AI Processing**: Historical data → ML algorithms → Weighted predictions → Confidence scoring
3. **Real-time Updates**: External APIs → Jackpot/exchange rate data → Cached responses
4. **User Interface**: React Query → API endpoints → Component state → UI rendering

## External Dependencies

### Core Libraries
- **Database**: `drizzle-orm`, `@neondatabase/serverless`
- **UI Framework**: `react`, `@radix-ui/*` components
- **Styling**: `tailwindcss`, `class-variance-authority`
- **Data Fetching**: `@tanstack/react-query`
- **Charts**: `recharts`
- **Form Handling**: `react-hook-form`, `zod`
- **Date Utilities**: `date-fns`

### Development Tools
- **Build**: `vite`, `esbuild`
- **TypeScript**: Full type safety across frontend/backend
- **Linting**: ESLint configuration
- **Replit Integration**: Cartographer plugin for development

## Deployment Strategy

### Development
- Vite dev server with HMR
- Express backend with middleware integration
- Live reload and error overlay
- Replit development banner integration

### Production Build
- Frontend: Vite build → Static assets in `dist/public`
- Backend: ESBuild bundle → Single `dist/index.js` file
- Database: Drizzle migrations via `db:push` command
- Environment: NODE_ENV-based configuration

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (required)
- `NODE_ENV`: Development/production mode
- `REPL_ID`: Replit environment detection

## Changelog
- January 06, 2025. Initial setup
- January 06, 2025. Successfully migrated to Replit environment with automatic exchange rate updates every 5 minutes

## User Preferences

Preferred communication style: Simple, everyday language.