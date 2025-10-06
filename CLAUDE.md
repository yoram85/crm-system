# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

מערכת CRM (Customer Relationship Management) בעברית עם תמיכה מלאה ב-RTL ועיצוב רספונסיבי.

**Tech Stack:**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling with RTL support)
- Zustand (state management with persistence)
- React Router (routing)
- Supabase (PostgreSQL database + Auth)
- Netlify (hosting + serverless functions)
- Lucide React (icons)
- date-fns (date utilities)
- Recharts (charts and graphs)
- jsPDF (PDF export with Hebrew support)

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Architecture

### Database (Supabase)

The app uses Supabase (PostgreSQL) for data persistence with Row Level Security (RLS).

**Setup:**
1. Create Supabase project at https://supabase.com
2. Run SQL schema from `supabase-schema.sql`
3. Get credentials from Settings → API
4. Add to `.env.local` (see `.env.local.example`)

**Main tables:**
- `customers` - Customer/lead data
- `deals` - Sales opportunities
- `tasks` - Activities and to-dos
- `products` - Product catalog
- `services` - Service offerings
- `user_profiles` - User management
- `activities` - Activity log

### State Management (Zustand + Supabase Sync)

The app uses Zustand stores with automatic Supabase synchronization:

**Main Store (`src/store/useStore.ts`):**
```typescript
const { customers, addCustomer, updateCustomer, deleteCustomer } = useStore()

// Adding a customer syncs to both state AND Supabase
await addCustomer({
  firstName: 'ישראל',
  lastName: 'ישראלי',
  email: 'israel@example.com',
  phone: '050-1234567',
  company: 'חברה בע"מ',
  status: 'lead',
  notes: ''
})
```

**Auth Store (`src/store/useAuthStore.ts`):**
```typescript
const { user, isAuthenticated, login, signInWithGoogle, logout } = useAuthStore()

// Login with Supabase Auth
await login('user@example.com', 'password')

// Google OAuth
await signInWithGoogle()
```

### Routing Structure

**Public Routes:**
- `/login` - Login page (Email + Google OAuth)
- `/register` - Registration page

**Protected Routes (require authentication):**
- `/` - Dashboard (statistics and overview)
- `/customers` - Customer management (CRUD)
- `/deals` - Deal pipeline management
- `/tasks` - Task/activity management
- `/products` - Product catalog
- `/services` - Service offerings
- `/reports` - Reports and analytics
- `/activity` - Activity log
- `/team` - Team management
- `/team/activity` - Team activity feed
- `/team/performance` - Team performance metrics
- `/settings` - Settings (Admin only)

### Component Structure

- `src/components/Layout.tsx` - Main layout with responsive sidebar
- `src/pages/` - Page components (Dashboard, Customers, Deals, Tasks)
- `src/types/` - TypeScript type definitions
- `src/store/` - Zustand state management

### RTL Support

The entire app is RTL (right-to-left) optimized:
- HTML has `dir="rtl"` and `lang="he"`
- Tailwind configured for RTL
- All text in Hebrew
- Responsive design works with RTL layout

### Responsive Behavior

- **Desktop (lg+)**: Fixed sidebar on right side
- **Tablet/Mobile**: Hamburger menu with slide-in sidebar
- **Overlay**: Dark overlay on mobile when sidebar is open

## Key Features

### Core CRM Features
1. **Customer Management** - Full CRUD with status tracking, profile images, and bulk actions
2. **Deal Pipeline** - Kanban-style drag & drop, stages, probability, close dates, and products/services linking
3. **Task Management** - Activities with priorities, due dates, customer/deal associations
4. **Products & Services** - Catalog management with pricing, stock, and categories
5. **Dashboard** - Real-time statistics, charts, and recent activity

### Advanced Features
6. **Team Management** - User roles (Admin, Manager, Sales, Support, Viewer) with permissions
7. **Activity Log** - Full audit trail of all actions
8. **Reports & Analytics** - Charts, graphs, and PDF export with Hebrew support
9. **Webhooks & Integrations** - N8N, Zapier, Google Sheets, Airtable
10. **Dark Mode** - Full theme support with user preferences
11. **Email Composer** - Template-based email sending
12. **Advanced Search** - Multi-field search across all entities
13. **Notifications** - Real-time notification center

### Technical Features
- **Data Persistence** - Supabase PostgreSQL with RLS
- **Authentication** - Email/password + Google OAuth
- **Real-time Sync** - Automatic sync between local state and database
- **Responsive Design** - Mobile-first with RTL support
- **PDF Export** - Hebrew font support (Rubik) with proper RTL rendering

## Styling Guidelines

- Use Tailwind utility classes
- Predefined component classes in `src/index.css`:
  - `.btn-primary` - Primary action buttons
  - `.btn-secondary` - Secondary action buttons
  - `.input-field` - Form inputs
  - `.card` - Card containers

## TypeScript Types

All types defined in `src/types/index.ts`:

**Core Entities:**
- `Customer` - Customer/lead entity with contact info and status
- `Deal` - Deal/opportunity with stage, amount, probability
- `Task` - Task/activity with priority, status, due date
- `Product` - Product with pricing, stock, category
- `Service` - Service with pricing, duration, category
- `User` - User profile with role and permissions
- `Activity` - Activity log entry

**Supporting Types:**
- `DealItem` - Product/service line item in deals
- `WebhookConfig` - Webhook configuration and status
- `IntegrationConfig` - Integration settings (Google Sheets, Airtable)
- `UserRole` - User roles: admin | manager | sales | support | viewer
- `Permission` - Granular permissions for RBAC
- `TeamPerformance` - Team metrics and KPIs

## Common Code Patterns

### Adding Data with Supabase Sync

```typescript
// Example: Adding a deal
await addDeal({
  title: 'עסקה חדשה',
  customerId: customer.id,
  amount: 50000,
  stage: 'proposal',
  probability: 70,
  expectedCloseDate: new Date('2024-12-31'),
  notes: 'הערות על העסקה',
  items: [
    {
      id: crypto.randomUUID(),
      type: 'product',
      itemId: product.id,
      quantity: 2,
      price: 25000,
      discount: 0
    }
  ]
})
```

### Checking Permissions

```typescript
// In components
import { PermissionGuard } from '../components/PermissionGuard'

<PermissionGuard permission="customers.create">
  <button onClick={handleAdd}>הוסף לקוח</button>
</PermissionGuard>

// In code
const { hasPermission } = useStore()
if (hasPermission('deals.edit')) {
  // Allow editing
}
```

### Using Webhooks

```typescript
// Webhooks are triggered automatically on CRUD operations
// Example: Adding a webhook
addWebhook({
  name: 'N8N Integration',
  url: 'https://your-n8n.app/webhook/crm',
  enabled: true,
  events: ['customer', 'deal', 'task']
})
```

### Exporting to PDF

```typescript
import { exportCustomersToPDF } from '../utils/pdfExport'

// Export with Hebrew support
exportCustomersToPDF(customers, 'לקוחות.pdf')
```

## Environment Setup

1. **Copy environment file:**
   ```bash
   cp .env.local.example .env.local
   ```

2. **Get Supabase credentials:**
   - Go to https://supabase.com/dashboard
   - Select your project → Settings → API
   - Copy URL and anon/public key

3. **Update `.env.local`:**
   ```env
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   VITE_BACKEND_URL=/.netlify/functions
   ```

## Important Notes

- **Data Storage**: Primary storage is Supabase (PostgreSQL), with Zustand for local state
- **Dates**: All dates use `date-fns` for formatting with Hebrew locale support
- **IDs**: Generated using `crypto.randomUUID()`
- **Language**: All UI text MUST be in Hebrew
- **RTL**: Maintain RTL layout consistency throughout
- **Security**: Row Level Security (RLS) ensures users only see their own data
- **Auth**: Google OAuth is configured, email/password also available
- **Webhooks**: Automatic on all CRUD operations if configured
