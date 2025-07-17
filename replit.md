# Workflow Generator Application

## Overview

This is a full-stack React application that generates n8n workflows using OpenAI's GPT models. The application allows users to describe automation needs in plain English and receive complete, working n8n workflow configurations. It features a modern React frontend with shadcn/ui components and an Express.js backend with PostgreSQL database integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Code Editor**: Custom Monaco Editor component for JSON visualization

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **API**: RESTful endpoints for workflow generation and management
- **Middleware**: Express JSON parsing, CORS, custom logging middleware

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Management**: Drizzle Kit for migrations
- **In-Memory Fallback**: MemStorage class for development/testing
- **Database Provider**: Neon Database (serverless PostgreSQL)

### Authentication and Authorization
- **Current State**: No authentication implemented
- **Session Management**: connect-pg-simple ready for PostgreSQL sessions
- **Security**: Basic error handling and input validation with Zod

## Key Components

### Core Services
1. **Workflow Generator** (`server/services/workflowGenerator.ts`)
   - Orchestrates workflow creation process
   - Integrates OpenAI API calls with database storage
   - Handles error management and response formatting

2. **OpenAI Integration** (`server/services/openai.ts`)
   - Uses GPT-4o model for workflow generation
   - Structured prompts for n8n workflow JSON generation
   - Comprehensive system prompts with n8n node specifications

3. **Storage Layer** (`server/storage.ts`)
   - Abstracted storage interface for flexibility
   - In-memory implementation for development
   - Ready for PostgreSQL integration with Drizzle ORM

### Frontend Features
1. **Home Page** (`client/src/pages/home.tsx`)
   - Workflow generation form with prompt input
   - Optional settings for authentication and error handling
   - Real-time workflow preview and JSON export
   - Example prompts and popular node types display

2. **UI Components**
   - Complete shadcn/ui component library
   - Custom Monaco Editor for JSON visualization
   - Responsive design with mobile-first approach
   - Toast notifications for user feedback

### API Endpoints
- `POST /api/workflows/generate` - Generate new workflow from prompt
- `GET /api/examples` - Retrieve example prompts
- `GET /api/node-types` - Get popular n8n node types
- `GET /api/workflows` - List all generated workflows

## Data Flow

1. **Workflow Generation Process**:
   - User submits prompt through frontend form
   - Frontend validates input and sends request to backend
   - Backend calls OpenAI API with structured prompt
   - Generated workflow is stored in database
   - Complete workflow JSON returned to frontend
   - User can view, edit, and export the workflow

2. **State Management**:
   - TanStack Query handles server state caching
   - React hooks manage local component state
   - Form state managed with controlled components

## External Dependencies

### Core Dependencies
- **OpenAI API**: GPT-4o model for workflow generation
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle ORM**: Type-safe database operations
- **Radix UI**: Accessible component primitives
- **TanStack Query**: Server state management

### Development Tools
- **Vite**: Build tool with hot module replacement
- **TypeScript**: Type safety across the application
- **Tailwind CSS**: Utility-first styling framework
- **ESBuild**: Fast JavaScript bundler for production

### AI Integration
- **Primary Model**: OpenRouter API with GPT-4o access (cost-efficient)
- **Fallback Model**: OpenAI GPT-4o (direct API)
- **Local Templates**: 8+ comprehensive workflow templates for instant generation
- **Smart Fallback**: Automatic fallback to templates when API limits reached
- **Prompt Engineering**: Optimized prompts for n8n workflow generation (2000 tokens)
- **Response Validation**: Zod schemas for API response validation

### Recent Updates (July 17, 2025)
- **Enhanced Template System**: Added specialized templates for CRM, e-commerce, monitoring, social media
- **Intelligent Matching**: Weighted keyword scoring for better template selection
- **Dynamic Generation**: Smart prompt analysis for custom workflow creation
- **Cost Optimization**: Reduced token usage and implemented fallback strategies

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds optimized React bundle to `dist/public`
- **Backend**: ESBuild compiles TypeScript server to `dist/index.js`
- **Assets**: Static files served from build output directory

### Environment Configuration
- **Development**: `npm run dev` with hot reloading
- **Production**: `npm run build && npm start`
- **Database**: Automatic migration with `npm run db:push`

### Runtime Requirements
- **Node.js**: ES modules support required
- **Environment Variables**: 
  - `DATABASE_URL` for PostgreSQL connection
  - `OPENAI_API_KEY` for AI integration
  - `NODE_ENV` for environment detection

### Hosting Considerations
- **Static Assets**: Can be served via CDN
- **API Server**: Requires Node.js runtime
- **Database**: PostgreSQL compatible hosting
- **File Structure**: Monorepo with shared TypeScript types