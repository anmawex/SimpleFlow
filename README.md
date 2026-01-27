# SEIKYU

SEIKYU is a Vue 3 application with Supabase authentication, built on top of the Sakai template using PrimeVue components.

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd SEIKYU
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_KEY=your-anon-key
   ```
   
   You can find these values in your [Supabase Dashboard](https://app.supabase.com) under:
   `Project Settings > API`

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173` (or the port shown in your terminal)

## 🔐 Authentication

The application uses Supabase for authentication with the following features:

- ✅ Email/Password login
- ✅ User registration
- ✅ Session persistence
- ✅ Protected routes
- ✅ Automatic token refresh
- ✅ Logout functionality

### Protected Routes

All routes under `/dashboard` require authentication. If a user tries to access a protected route without being logged in, they will be redirected to the login page.

## 📁 Project Structure

```
src/
├── app/
│   ├── layout/        # Application layouts
│   ├── pages/         # App-level pages (404, etc)
│   └── router/        # Vue Router configuration
├── features/
│   ├── auth/          # Authentication feature
│   │   ├── pages/     # Login, Access, Error pages
│   │   └── store/     # Pinia auth store
│   ├── dashboard/     # Dashboard feature
│   └── ...
├── shared/            # Shared components and utilities
├── assets/            # Static assets
├── supabase.js        # Supabase client configuration
└── main.js            # Application entry point
```

## 🛠️ Built With

- [Vue 3](https://vuejs.org/) - Progressive JavaScript Framework
- [Vite](https://vitejs.dev/) - Next Generation Frontend Tooling
- [PrimeVue](https://primevue.org/) - UI Component Library
- [Pinia](https://pinia.vuejs.org/) - State Management
- [Vue Router](https://router.vuejs.org/) - Official Router
- [Supabase](https://supabase.com/) - Backend as a Service

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🔒 Security Notes

- Never commit your `.env` file to version control
- The `.env` file is already in `.gitignore`
- Use `.env.example` as a template for other developers
- Keep your Supabase keys secure

## 📚 Documentation

For more information about the template, visit the [Sakai documentation](https://sakai.primevue.org/documentation).

## 📄 License

See LICENSE.md for details.
