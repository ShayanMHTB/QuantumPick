# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```


--- 

## First version of project structure

```bash
src/
├── assets/                  # Static files (images, logos, icons)
├── components/
│   ├── ui/                  # Your existing shadcn components
│   ├── shared/              # App-wide components
│   │   ├── layout/          # Layout components (Navbar, Footer, etc.)
│   │   └── common/          # Reusable UI elements specific to your app
│   ├── lottery/             # Lottery-specific components
│   └── creator/             # Creator-specific components
├── config/                  # Configuration files and constants
│   ├── routes.ts            # Route definitions
│   └── api.ts               # API endpoints and configuration
├── features/                # Feature-based modules
│   ├── auth/                # Authentication related components/logic
│   ├── lottery/             # Lottery participation features
│   ├── creator/             # Lottery creation features
│   └── dashboard/           # User and creator dashboards
├── hooks/                   # Custom React hooks
│   ├── useWallet.ts         # Wallet connection hook
│   ├── useLottery.ts        # Lottery-related hooks
│   └── useAuth.ts           # Authentication hooks
├── i18n/                    # Internationalization setup
│   ├── index.ts             # i18n configuration
│   ├── languages.ts         # Supported languages config
│   └── translations/        # Translation files
│       ├── en/              # English translations
│       │   ├── common.json
│       │   ├── lottery.json
│       │   └── auth.json
│       ├── de/              # German translations
│       └── ...              # Other languages
├── layouts/                 # Page layout wrappers
│   ├── MainLayout.tsx
│   ├── DashboardLayout.tsx
│   └── AuthLayout.tsx
├── lib/                     # Utility functions and helpers
│   ├── utils.ts
│   ├── format.ts            # Formatting helpers (date, currency, etc.)
│   └── validation.ts        # Form validation helpers
├── pages/                   # Page components
│   ├── Home.tsx
│   ├── About.tsx
│   ├── auth/
│   ├── lotteries/
│   ├── creator/
│   └── dashboard/
├── router/                  # Routing configuration
│   └── AppRouter.tsx        # Main router configuration
├── services/                # API and external service integration
│   ├── api/                 # Backend API services
│   │   ├── index.ts         # API client setup
│   │   ├── lottery.ts       # Lottery-related API calls
│   │   └── user.ts          # User-related API calls
│   ├── web3/                # Web3 services
│   │   ├── index.ts         # Common Web3 functionality
│   │   ├── wallet.ts        # Wallet connection logic
│   │   └── contracts.ts     # Smart contract interaction
│   └── auth/                # Authentication services (SIWE)
├── store/                   # State management (Redux)
│   ├── index.ts
│   ├── slices/              # Redux slices
│   │   ├── authSlice.ts
│   │   ├── lotterySlice.ts
│   │   └── creatorSlice.ts
│   └── middlewares/         # Redux middlewares
├── styles/                  # Global styles and Tailwind configuration
│   └── globals.css
├── types/                   # TypeScript type definitions
│   ├── api.types.ts         # API response/request types
│   ├── lottery.types.ts     # Lottery-related types
│   └── user.types.ts        # User and auth-related types
├── utils/                   # Utility functions that don't fit in lib
│   ├── constants.ts         # Application constants
│   └── errorHandling.ts     # Error handling utilities
├── main.tsx                 # Entry point
├── index.css                # Global CSS
└── vite-env.d.ts
```
