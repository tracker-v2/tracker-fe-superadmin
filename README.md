# React + Vite + TypeScript Template (tracker-fe)

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/Dan5py/react-vite-ui/blob/main/LICENSE)

A React + Vite template powered by shadcn/ui.

## 🎉 Features

- **React** - A JavaScript library for building user interfaces.
- **Vite** - A fast, opinionated frontend build tool.
- **TypeScript** - A typed superset of JavaScript that compiles to plain JavaScript.
- **Tailwind CSS** - A utility-first CSS framework.
- **Tailwind Prettier Plugin** - A Prettier plugin for formatting Tailwind CSS classes.
- **ESLint** - A pluggable linting utility for JavaScript and TypeScript.
- **PostCSS** - A tool for transforming CSS with JavaScript.
- **Autoprefixer** - A PostCSS plugin to parse CSS and add vendor prefixes.
- **shadcn/ui** - Beautifully designed components that you can copy and paste.
- **react query** - Tanstack
- **zustand** - state management
  into your apps.

## ⚙️ Prerequisites

Make sure you have the following installed on your development machine:

- Node.js (version 16 or above)
- npm (package manager)

## 🚀 Getting Started

Follow these steps to get started with the react-vite-ui template:

1. Clone the repository:

   ```
   git clone https://github.com/Matador-Tracker-V3/tracker-fe-v4.git
   ```

2. Navigate to the project directory:

   ```bash
   cd tracker-fe
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm dev
   ```

## 📜 Available Scripts

- npm dev - Starts the development server.
- npm build - Builds the production-ready code.
- npm lint - Runs ESLint to analyze and lint the code.
- npm preview - Starts the Vite development server in preview mode.

## 📂 Project Structure

The project structure follows a standard React application layout:

```python
TRACKER-FE/
├── node_modules/
├── public/
│   ├── favicon.ico
├── src/
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   │
│   ├── components/
│   │   ├── common/              # Reusable components
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.test.tsx
│   │   │   │   ├── Button.types.ts
│   │   │   │   └── index.ts
│   │   │   ├── Input/
│   │   │   └── Card/
│   │   │
│   │   ├── layout/             # Layout components
│   │   │   ├── Navbar/
│   │   │   ├── Footer/
│   │   │   └── Sidebar/
│   │   │
│   │   └── features/           # Feature-specific components
│   │       ├── Auth/
│   │       │   ├── LoginForm/
│   │       │   └── RegisterForm/
│   │       └── Dashboard/
│   │           ├── Chart/
│   │           └── Summary/
│   │
│   ├── config/                 # App configuration
│   │   ├── api.config.ts
│   │   └── theme.config.ts
│   │
│   ├── constants/              # Constants and enums
│   │   ├── routes.ts
│   │   └── api.ts
│   │
│   ├── context/               # React Context
│   │   ├── AuthContext/
│   │   │   ├── AuthContext.tsx
│   │   │   ├── AuthContext.types.ts
│   │   │   └── index.ts
│   │   └── ThemeContext/
│   │
│   ├── hooks/                 # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useTheme.ts
│   │   └── useLocalStorage.ts
│   │
│   ├── interfaces/            # TypeScript interfaces
│   │   ├── user.interface.ts
│   │   └── api.interface.ts
│   │
│   ├── lib/                   # Third-party library configs
│   │   ├── axios.ts
│   │   └── firebase.ts
│   │
│   ├── pages/                 # Page components
│   │   ├── Home/
│   │   │   ├── Home.tsx
│   │   │   └── Home.test.tsx
│   │   ├── Dashboard/
│   │   └── Profile/
│   │
│   ├── services/              # API services
│   │   ├── auth.service.ts
│   │   └── user.service.ts
│   │
│   ├── store/                 # State management
│   │   ├── slices/           # Zustand stores
│   │   │   ├── authSlice.ts
│   │   │   └── userSlice.ts
│   │   ├── hooks.ts
│   │   └── index.ts
│   │
│   ├── styles/                # Global styles
│   │   ├── globals.css
│   │   └── theme.ts
│   │
│   ├── utils/                 # Utility functions
│   │   ├── __tests__/
│   │   │   └── format.test.ts
│   │   ├── format.ts
│   │   └── validation.ts
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
│
├── .eslintrc.js
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](https://choosealicense.com/licenses/mit/) file for details.
