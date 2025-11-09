# Bhavki Membership Manager

## Overview

Bhavki Membership Manager is a complete membership management system designed for organizational membership tracking, payment management, and investment oversight. The application supports two distinct user roles: a chairman (administrator) who manages all aspects of the organization, and members who can view their own information and payment history through a Bangla-language interface.

The system provides comprehensive features including membership ID generation, payment tracking with transaction details, investment management, automated share calculations for different member types, and complete audit history of all administrative actions.

## Recent Changes

### November 9, 2025 - Email Support, Password Reset, and Investment Tracking
- **Added optional email support**: User model now includes optional email field (unique, lowercase indexed)
- **Implemented forgot password functionality** for both chairman and members with email-based tokens
- **Created reset password page** with 1-hour token expiration and single-use enforcement
- **Updated all registration and edit forms** to support optional email field with validation
- **Enhanced Investment model** with profit/loss tracking, reason, and status fields
- **Updated investment API endpoints** to handle profit/loss updates with audit logging
- **Improved member dashboard UI**: Payment list now has scrollable view with sticky headers (max-h-96)
- **Enhanced text visibility**: Added text-black classes across member dashboard for better readability
- **Updated README.md** with comprehensive documentation of email and password reset features
- **All changes architect-reviewed and approved** with no blocking defects

### November 9, 2025 - Critical Share Calculation Fix
- **Fixed critical bug in share calculation formulas** that was multiplying the base amount (500 Taka) twice
- **Old member formula corrected**: Now properly calculates as `(monthsPaid / totalShares) × 100` to return percentage (0-100%)
- **New member formula corrected**: Now properly calculates as `(memberContribution / totalFund) × 100` to return percentage (0-100%)
- **Updated Jest tests** with concrete expected values instead of placeholder assertions
- **All 10 tests passing** with verified accuracy for multiple scenarios including edge cases
- **Formulas now produce mathematically correct percentage values** representing each member's proportional share

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: Next.js 14 with TypeScript, server-side rendering, and API routes
- **Styling**: Tailwind CSS with custom theme configuration and responsive design
- **Form Management**: React Hook Form for form state and validation
- **Date Handling**: date-fns library for date formatting and manipulation
- **Pages Structure**: Separate page hierarchies for chairman (`/chairman/*`) and member (`/member/*`) portals

**Design Decisions**:
- Bangla language interface for member portal to improve accessibility for local users
- Separate login flows for chairman and members with different authentication requirements
- Dashboard-based interfaces for both roles with role-specific information display
- Client-side form validation with server-side verification for security

### Backend Architecture

**API Structure**: Next.js API routes (`/pages/api/*`)
- **Authentication**: JWT tokens stored in httpOnly secure cookies
- **Database ORM**: Prisma Client for type-safe database queries
- **Validation**: Zod schemas for request validation across all endpoints
- **Rate Limiting**: In-memory rate limiter for authentication endpoints (15-minute windows, 5 requests max)
- **Audit Logging**: Complete tracking of all chairman actions with timestamps and change details

**Security Measures**:
- bcrypt password hashing (10 rounds)
- httpOnly cookies for token storage to prevent XSS attacks
- Secure headers configuration in next.config.js (HSTS, X-Frame-Options, CSP-related headers)
- SQL injection protection through Prisma's parameterized queries
- Input validation on all endpoints using Zod schemas
- Rate limiting on sensitive endpoints (login, password reset)
- Password reset tokens with 1-hour expiration

**Core API Endpoints**:
- `/api/auth/*` - Authentication (login, logout, registration, password reset)
- `/api/members/*` - Member CRUD operations (chairman only for write operations)
- `/api/payments/*` - Payment tracking and history
- `/api/investments/*` - Investment management (chairman creates, members view)
- `/api/membership-ids/*` - Membership ID generation and management
- `/api/audit-logs/*` - Audit history viewing (chairman only)
- `/api/reports/*` - Share calculation reports

### Data Architecture

**Database**: PostgreSQL (configured for Neon serverless in production via `server/db.ts`)

**ORM Layer**: Dual approach detected:
- Prisma ORM (primary) - Used throughout the application
- Drizzle ORM setup (in `server/db.ts`) - May be added later for specific use cases

**Key Data Models** (Prisma Schema):
- `User` - Both chairman and member accounts with role differentiation, membership IDs, share types
- `Payment` - Payment records with member references, transaction details, audit fields
- `Investment` - Organizational investments with full details and audit tracking
- `MembershipId` - Pool of generated IDs with assignment tracking and soft deletion
- `PasswordResetToken` - Secure password reset mechanism with expiration
- `AuditLog` - Complete action history with performer, target, and change details

**Share Calculation Logic**:
- Old members (fullShare): Calculated as percentage of total shares based on months paid
- New members: Calculated as contribution amount divided by total fund
- "New but full share": One-time upfront payment calculated based on existing member payments
- Share calculations are read-only operations computed on-demand

**Data Integrity**:
- Soft deletion pattern for users (isDeleted flag) to maintain payment history
- Cascade behavior: Deleting a member marks associated MembershipId as deleted
- Unique constraints on membershipId and mobile numbers
- Transaction support for multi-step operations (user creation with ID assignment)

### Authentication & Authorization

**JWT Implementation**:
- Auto-generated JWT secret (with fallback generation if not in environment)
- 7-day token expiration
- Payload includes: userId, membershipId, role
- Secure cookie configuration with SameSite=strict, httpOnly flags

**Role-Based Access Control**:
- Chairman: Full access to all endpoints, can create/edit/delete members and payments
- Member: Read-only access to own profile and payment history, view-only access to investments
- Middleware function `requireAuth()` enforces role requirements on protected endpoints

**Password Management**:
- Chairman-only password reset via email
- Reset tokens expire after 1 hour
- Tokens marked as used after successful reset
- Members cannot self-reset passwords (must contact chairman)

### External Dependencies

**Database Services**:
- PostgreSQL database (Neon serverless via `@neondatabase/serverless`)
- Connection pooling configured for serverless environments
- WebSocket support for Neon database connections

**Email Service**:
- Nodemailer for SMTP email delivery
- Configurable SMTP settings (host, port, credentials)
- Used for chairman password reset functionality
- HTML email templates for professional appearance

**Third-Party NPM Packages**:
- `@prisma/client` - Database ORM
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT token generation and verification
- `zod` - Schema validation
- `cookie` - Cookie parsing and serialization
- `next` - React framework
- `react-hook-form` - Form state management
- `date-fns` - Date manipulation
- `nodemailer` - Email sending
- `tailwindcss` - CSS framework

**Development Dependencies**:
- `prisma` - Database schema management and migrations
- `typescript` - Type safety
- `jest` & `ts-jest` - Testing framework
- `ts-node` - TypeScript execution for seed scripts
- `autoprefixer` & `postcss` - CSS processing

**Testing Infrastructure**:
- Jest configured with ts-jest preset
- Unit tests for share calculation logic
- Test files located in `__tests__/` directory
- Module path aliasing (`@/*`) configured for imports

**Seed Scripts**:
- `scripts/seed-chairman.ts` - Creates initial chairman account
- `scripts/seed-sample.ts` - Generates sample members and payments for testing
- Both support environment variable configuration