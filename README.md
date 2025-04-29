# QuantumPick: Transparent Web3 Lottery Platform

<p align="center">
  <img src="/api/placeholder/400/180" alt="QuantumPick Logo" />
</p>

<div align="center">
  
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19.0.0-61dafb.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-3178c6.svg)](https://www.typescriptlang.org/)
[![Django](https://img.shields.io/badge/Django-5.2-092e20.svg)](https://www.djangoproject.com/)
[![Web3](https://img.shields.io/badge/Web3-7.10.0-f16822.svg)](https://web3js.readthedocs.io/)

</div>

## 🌟 Overview

QuantumPick is a transparent, fair, and trustworthy Web3 lottery platform that allows users to either participate in existing lotteries or create their own. Unlike previous attempts in this space that were plagued by scams or poor reputation management, QuantumPick emphasizes legitimacy, transparency, and user trust as core values.

The platform handles the entire lottery lifecycle including:
- Lottery creation and configuration
- Secure ticket purchasing
- Transparent, provably fair drawing mechanism
- Automated prize distribution

## ✨ Key Features

- **Transparent Operations**: All lottery mechanics are visible on the blockchain
- **User-Friendly Interface**: Simplified Web3 experience suitable for both crypto-natives and newcomers
- **Wallet Integration**: Seamless connection with MetaMask and WalletConnect
- **Lottery Creation**: Tools for anyone to create and customize their own lottery
- **Secure Randomness**: Implementation of provably fair randomness mechanisms
- **Mobile Responsive**: Fully optimized for all device sizes

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+)
- Python (v3.10+)
- Docker and Docker Compose
- PostgreSQL
- MetaMask or another Web3 wallet

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/quantumpick.git
cd quantumpick
```

2. **Set up environment variables**

```bash
cp .env.example .env
# Edit .env with your configuration values
```

3. **Start the application with Docker**

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database
- pgAdmin (database management)
- Django backend
- React frontend

4. **Access the application**

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api
- pgAdmin: http://localhost:5050

## 🛠️ Project Structure

```
QuantumPick/
 ├── .env                   # Environmental variables
 ├── .env.example           # Example of environmental variables
 ├── .gitignore             # Project root .gitignore
 ├── dbs                    # Copy of postgreSQL, and pgAdmin docker volumes
 ├── docker-compose.yml     # Docker compose file
 ├── img                    # Docker images
 ├── LICENSE                # Project LICENSE
 ├── README.md              # Project README
 ├── srv                    # Django application
 └── web                    # React application
```

## 🖥️ Frontend Architecture

The frontend is built with React 19, TypeScript, and uses Vite as the build tool. It follows a feature-based architecture and uses Redux for state management.

### Directory Structure

```
web/
├── .gitignore              # Frontend specific git ignore rules
├── components.json         # UI component configurations
├── eslint.config.js        # ESLint configuration
├── index.html              # Entry HTML file
├── package.json            # Node.js dependencies and scripts
├── public/                 # Static assets directly served
├── src/
│   ├── assets/             # Images, fonts, icons, and other static files
│   ├── components/         # Reusable UI components
│   │   ├── auth/           # Authentication-related components (login, signup, etc.)
│   │   ├── lottery/        # Lottery-related components (cards, forms, etc.)
│   │   ├── shared/         # Components shared across features
│   │   ├── ui/             # Base UI components (buttons, inputs, etc.)
│   │   └── user/           # User profile related components
│   ├── config/             # Application configuration
│   │   ├── api.ts          # API endpoints configuration
│   │   └── routes.ts       # Frontend route definitions
│   ├── data/               # Mock data for development and testing
│   │   ├── mockLotteries.ts # Sample lottery data
│   │   ├── mockTickets.ts  # Sample ticket data
│   │   └── mockUsers.ts    # Sample user data
│   ├── features/           # Feature-based modules that combine components
│   │   ├── auth/           # Authentication feature
│   │   │   └── RequireAuth.tsx # Protected route wrapper component
│   │   ├── dashboard/      # Dashboard feature components
│   │   └── lottery/        # Lottery management feature components
│   ├── hooks/              # Custom React hooks
│   │   ├── index.ts        # Hook exports
│   │   ├── useAuth.ts      # Authentication related hooks
│   │   ├── useLottery.ts   # Lottery data and interaction hooks
│   │   ├── useMobile.ts    # Responsive design hooks
│   │   ├── useTheme.ts     # Theme management hooks
│   │   ├── useUser.ts      # User data and profile hooks
│   │   └── useWallet.ts    # Web3 wallet integration hooks
│   ├── i18n/               # Internationalization
│   │   ├── index.ts        # i18n configuration
│   │   ├── languages.ts    # Supported languages configuration
│   │   └── translations/   # Translation files by language
│   │       ├── de/         # German translations
│   │       ├── en/         # English translations
│   │       ├── es/         # Spanish translations
│   │       ├── fa/         # Persian translations
│   │       ├── fr/         # French translations
│   │       ├── it/         # Italian translations
│   │       └── ru/         # Russian translations
│   ├── layouts/            # Page layout templates
│   │   ├── AuthLayout.tsx  # Layout for authentication pages
│   │   ├── DashboardLayout.tsx # Layout for dashboard/user pages
│   │   └── MainLayout.tsx  # Main application layout
│   ├── lib/                # Utility libraries and functions
│   │   ├── format.ts       # Data formatting utilities
│   │   ├── utils.ts        # General utility functions
│   │   └── validation.ts   # Form and data validation utilities
│   ├── pages/              # Page components organized by section
│   │   ├── auth/           # Authentication pages
│   │   │   └── User.tsx    # User authentication page
│   │   ├── public/         # Publicly accessible pages
│   │   │   ├── About.tsx   # About the platform
│   │   │   ├── Error.tsx   # General error page
│   │   │   ├── FAQ.tsx     # Frequently asked questions
│   │   │   ├── Features.tsx # Platform features
│   │   │   ├── Forbidden.tsx # Access denied page
│   │   │   ├── Home.tsx    # Landing page
│   │   │   ├── Lotteries.tsx # Public lottery listings
│   │   │   ├── LotteryDetails.tsx # Public lottery details
│   │   │   ├── NotFound.tsx # 404 page
│   │   │   ├── Pricing.tsx # Subscription and fee information
│   │   │   └── Roadmap.tsx # Project roadmap
│   │   ├── static/         # Static information pages
│   │   │   ├── Compliance.tsx # Regulatory compliance
│   │   │   ├── Privacy.tsx # Privacy policy
│   │   │   ├── Security.tsx # Security information
│   │   │   ├── Support.tsx # Support information
│   │   │   └── Terms.tsx   # Terms of service
│   │   └── user/           # User authenticated pages
│   │       ├── Dashboard.tsx # User dashboard
│   │       ├── Lotteries.tsx # User's created lotteries
│   │       ├── LotteryDetails.tsx # User lottery management
│   │       ├── Profile.tsx # User profile management
│   │       ├── TicketDetails.tsx # Ticket information
│   │       └── Tickets.tsx # User's purchased tickets
│   ├── router/             # Routing configuration
│   │   ├── MainRouter.tsx  # Main router component
│   │   └── routes/         # Route group definitions
│   │       ├── AuthRoutes.tsx # Authentication routes
│   │       ├── HomeRoutes.tsx # Public/home routes
│   │       ├── StaticRoutes.tsx # Static page routes
│   │       └── UserRoutes.tsx # User authenticated routes
│   ├── services/           # API and external service integrations
│   │   ├── api/            # API service layer
│   │   │   └── client.ts   # HTTP client configuration
│   │   ├── auth/           # Authentication services
│   │   │   ├── email.ts    # Email authentication service
│   │   │   ├── index.ts    # Auth service exports
│   │   │   ├── siwe.ts     # Sign-In with Ethereum service
│   │   │   └── web3.ts     # Web3 authentication utilities
│   │   ├── lottery/        # Lottery related services
│   │   │   ├── contracts.ts # Smart contract interactions
│   │   │   ├── index.ts    # Lottery service exports
│   │   │   ├── lottery.ts  # Lottery management services
│   │   │   └── tickets.ts  # Ticket management services
│   │   └── user/           # User related services
│   │       ├── index.ts    # User service exports
│   │       ├── profile.ts  # User profile services
│   │       └── wallet.ts   # Wallet management services
│   ├── store/              # Redux store configuration
│   │   ├── index.ts        # Store setup and exports
│   │   ├── middlewares/    # Redux middlewares
│   │   └── slices/         # Redux slices
│   │       ├── authSlice.ts # Authentication state
│   │       └── lotterySlice.ts # Lottery state
│   ├── styles/             # Global styles and theme definitions
│   │   └── theme.ts        # Theme configuration
│   ├── types/              # TypeScript type definitions
│   │   ├── api.types.ts    # API related types
│   │   ├── lottery.types.ts # Lottery related types
│   │   ├── ticket.types.ts # Ticket related types
│   │   └── user.types.ts   # User related types
│   └── utils/              # Utility functions
│       ├── constants.ts    # Application constants
│       └── errorHandling.ts # Error handling utilities
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite build configuration
```

### Key Technologies

- **React 19**: UI library
- **TypeScript**: Type safety
- **Redux Toolkit**: State management
- **React Router**: Navigation
- **ethers.js**: Ethereum interaction
- **SIWE**: Sign-In With Ethereum
- **Tailwind CSS**: Styling
- **Radix UI**: Accessible component primitives
- **i18next**: Internationalization
- **Zod**: Schema validation
- **React Hook Form**: Form handling

## 🧭 Frontend Routes

The application follows a well-structured routing system with language prefixing for internationalization. All routes are defined in a centralized location following the DRY principle.

### Route Structure

```
/:lang/...                   # All routes are prefixed with a language code
```

Where `:lang` is one of the supported languages: `en`, `es`, `fr`, `de`, `it`, `ru`, `fa`

### Public Routes (Landing Pages)
```
/:lang/                      # Home page
/:lang/about                 # About the platform
/:lang/features              # Platform features showcase
/:lang/roadmap               # Project roadmap
/:lang/faq                   # Frequently asked questions
/:lang/pricing               # Subscription and fee information
/:lang/lotteries             # Public lottery listings
/:lang/lotteries/:lotteryId  # Public lottery details
```

### Static/Legal Routes
```
/:lang/terms                 # Terms of service
/:lang/privacy               # Privacy policy
/:lang/compliance            # Regulatory compliance information
/:lang/security              # Security information
/:lang/support               # Support information
```

### Error Routes
```
/:lang/not-found             # 404 page
/:lang/error                 # General error page
/:lang/forbidden             # Access denied page
```

### Authentication Routes
```
/:lang/auth                  # Redirects to user authentication
/:lang/auth/user             # Main authentication page with wallet connect
```

### User Dashboard Routes (Protected)
```
/:lang/dashboard             # Main dashboard
/:lang/dashboard/profile     # User profile settings
/:lang/dashboard/tickets     # User's purchased tickets
/:lang/dashboard/tickets/:ticketId # Specific ticket details
/:lang/dashboard/lotteries   # User's created lotteries
/:lang/dashboard/lotteries/:lotteryId # Specific user lottery management
```

### Route Management

Routes are managed through a combination of:
- Centralized path constants in `config/routes.ts`
- Modular route definitions divided by section
- Language validation and redirection
- Protected routes with authentication guards
- Lazy loading for improved performance

## ⚙️ Backend Architecture

The backend is built with Django 5.2 and follows a modular app-based architecture similar to enterprise-level implementations. It uses Django REST Framework for API development and interacts with the Ethereum blockchain using Web3.py. The system is designed to be horizontally scalable with message queuing and caching.

### Directory Structure

```
srv/
├── analytics/                # Analytics data collection and processing
│   ├── __init__.py           # Package initialization
│   ├── admin.py              # Admin panel configuration
│   ├── apps.py               # App configuration
│   ├── migrations/           # Database migrations
│   ├── models.py             # Data models for analytics
│   ├── tests.py              # Test cases
│   └── views.py              # API endpoints and view logic
│
├── authentication/           # Custom Web3 authentication system
│   ├── __init__.py           # Package initialization
│   ├── admin.py              # Admin configuration
│   ├── apps.py               # App configuration
│   ├── auth.py               # Custom authentication logic
│   ├── migrations/           # Database migrations
│   ├── models.py             # Authentication models
│   ├── serializers.py        # DRF serializers for auth data
│   ├── tests.py              # Test cases
│   ├── urls.py               # URL routing
│   └── views.py              # Authentication endpoints
│
├── core/                     # Core functionality and shared models
│   ├── __init__.py           # Package initialization
│   ├── admin.py              # Admin configuration
│   ├── apps.py               # App configuration
│   ├── migrations/           # Database migrations
│   ├── models.py             # Core data models
│   ├── tests.py              # Test cases
│   └── views.py              # Core API endpoints
│
├── finances/                 # Financial transactions and processing
│   ├── __init__.py           # Package initialization
│   ├── admin.py              # Admin configuration
│   ├── apps.py               # App configuration
│   ├── migrations/           # Database migrations
│   ├── models.py             # Financial models
│   ├── tests.py              # Test cases
│   └── views.py              # Financial API endpoints
│
├── lotteries/                # Lottery creation and management
│   ├── __init__.py           # Package initialization
│   ├── admin.py              # Admin configuration
│   ├── apps.py               # App configuration
│   ├── migrations/           # Database migrations
│   ├── models.py             # Lottery models
│   ├── tests.py              # Test cases
│   └── views.py              # Lottery API endpoints
│
├── srv/                      # Project settings and configuration
│   ├── __init__.py           # Package initialization
│   ├── asgi.py               # ASGI configuration for async
│   ├── settings.py           # Django settings
│   ├── urls.py               # Root URL routing
│   └── wsgi.py               # WSGI configuration
│
├── tickets/                  # Ticket purchasing and management
│   ├── __init__.py           # Package initialization
│   ├── admin.py              # Admin configuration
│   ├── apps.py               # App configuration
│   ├── migrations/           # Database migrations
│   ├── models.py             # Ticket models
│   ├── tests.py              # Test cases
│   └── views.py              # Ticket API endpoints
│
├── users/                    # User profiles and preferences
│   ├── __init__.py           # Package initialization
│   ├── admin.py              # Admin configuration
│   ├── apps.py               # App configuration
│   ├── migrations/           # Database migrations
│   ├── models.py             # User models
│   ├── serializers.py        # User data serializers
│   ├── signals.py            # Signal handlers for user events
│   ├── tests.py              # Test cases
│   ├── urls.py               # User URL routing
│   └── views.py              # User API endpoints
│
├── manage.py                 # Django management script
└── requirements.txt          # Python dependencies
```

### App Responsibilities

- **analytics**: Tracks user behavior, lottery performance metrics, and platform usage statistics
- **authentication**: Handles Web3 wallet authentication via SIWE (Sign-In With Ethereum)
- **core**: Contains shared models, utilities, and base functionality used across the platform
- **finances**: Manages financial transactions, fees, withdrawals, and payment processing
- **lotteries**: Handles lottery creation, configuration, drawing, and winner selection
- **tickets**: Manages ticket purchasing, validation, and ownership
- **users**: Handles user profiles, preferences, settings, and wallet connections

### Standardized App Structure (Enterprise Pattern)

Each Django app follows a consistent structure that includes:

#### Standard Django Files
- `__init__.py` - Package initialization
- `admin.py` - Admin interface configuration
- `apps.py` - App configuration
- `models.py` - Data models
- `tests.py` - Test cases
- `views.py` - View logic

#### Extended Files (As Needed)
- `serializers.py` - REST framework serializers
- `urls.py` - App-specific URL routing
- `signals.py` - Django signal handlers
- `services/` - Business logic services
  - `service_name.py` - Specific service implementations
- `tasks.py` - Celery async tasks
- `utils.py` - App-specific utilities
- `validators.py` - Custom field validators
- `forms.py` - Form definitions (if needed)
- `managers.py` - Custom model managers
- `consumers.py` - WebSocket consumers
- `middleware.py` - Custom middleware
- `permissions.py` - Custom permissions

### Planned Infrastructure Extensions

The architecture is designed to scale with these planned components:

- **Celery**: For background task processing, scheduled jobs, and lottery drawing execution
- **Redis**: For caching, real-time data delivery, and as a message broker
- **WebSockets**: For real-time lottery updates and notifications
- **Subgraph**: For indexing and querying blockchain data efficiently

### Key Technologies

- **Django 5.2**: Web framework
- **Django REST Framework**: API development
- **PostgreSQL**: Database
- **Web3.py**: Ethereum interaction
- **Django CORS Headers**: Cross-origin resource sharing
- **Pydantic**: Data validation
- **Django Signals**: Event-driven architecture
- **Celery (planned)**: Distributed task queue
- **Redis (planned)**: In-memory data structure store
- **Django Channels (planned)**: WebSocket support

## 🔄 API Endpoints

The backend provides a RESTful API structured around the various functional modules. All API endpoints are prefixed with `/api/v1/`.

### Authentication
```
GET    /api/v1/auth/nonce/            # Generate authentication nonce for wallet
POST   /api/v1/auth/verify/           # Verify SIWE signature
POST   /api/v1/auth/logout/           # Invalidate current session
GET    /api/v1/auth/session/          # Check current session status
```

### Users
```
GET    /api/v1/users/me/              # Get authenticated user profile
PATCH  /api/v1/users/me/              # Update authenticated user profile
GET    /api/v1/users/preferences/     # Get user preferences
PATCH  /api/v1/users/preferences/     # Update user preferences
GET    /api/v1/users/check-wallet/    # Check if wallet address is registered
POST   /api/v1/users/delete-account/  # Deactivate user account
GET    /api/v1/users/statistics/      # Get user platform statistics
GET    /api/v1/users/notifications/   # Get user notifications
PATCH  /api/v1/users/notifications/:id/ # Mark notification as read
```

### Lotteries
```
GET    /api/v1/lotteries/             # List all public lotteries with filtering
POST   /api/v1/lotteries/             # Create a new lottery
GET    /api/v1/lotteries/:id/         # Get specific lottery details
PUT    /api/v1/lotteries/:id/         # Update lottery (creator only)
PATCH  /api/v1/lotteries/:id/         # Partial update lottery (creator only)
DELETE /api/v1/lotteries/:id/         # Delete lottery (admin/creator only)
GET    /api/v1/lotteries/types/       # Get available lottery types and configurations
GET    /api/v1/lotteries/my/          # Get lotteries created by authenticated user
GET    /api/v1/lotteries/participating/ # Get lotteries user is participating in
POST   /api/v1/lotteries/:id/publish/ # Publish a draft lottery
PATCH  /api/v1/lotteries/:id/pause/   # Pause an active lottery (creator only)
PATCH  /api/v1/lotteries/:id/resume/  # Resume a paused lottery (creator only)
GET    /api/v1/lotteries/:id/statistics/ # Get lottery performance statistics
```

### Tickets
```
GET    /api/v1/tickets/               # List user's tickets with filtering
POST   /api/v1/tickets/               # Purchase tickets for a lottery
GET    /api/v1/tickets/:id/           # Get specific ticket details
GET    /api/v1/tickets/lottery/:id/   # Get all tickets for a specific lottery
GET    /api/v1/tickets/winning/       # Get user's winning tickets
POST   /api/v1/tickets/:id/claim/     # Claim prize for winning ticket
```

### Finances
```
GET    /api/v1/finances/transactions/ # Get user's transaction history
GET    /api/v1/finances/balance/      # Get user's platform balance
POST   /api/v1/finances/withdraw/     # Request withdrawal to wallet
GET    /api/v1/finances/fees/         # Get current platform fee structure
GET    /api/v1/finances/earnings/     # Get creator earnings statistics
GET    /api/v1/finances/withdrawals/  # Get pending/completed withdrawals
```

### Analytics
```
GET    /api/v1/analytics/performance/ # Get platform performance metrics (admin only)
GET    /api/v1/analytics/users/       # Get user growth metrics (admin only)
GET    /api/v1/analytics/lotteries/   # Get lottery performance metrics (admin only)
GET    /api/v1/analytics/revenue/     # Get revenue metrics (admin only)
GET    /api/v1/analytics/creator/:id/ # Get metrics for a specific creator (admin/creator)
```

### Core
```
GET    /api/v1/core/health/           # API health check endpoint
GET    /api/v1/core/config/           # Get public configuration values
GET    /api/v1/core/chains/           # Get supported blockchain networks
GET    /api/v1/core/gas-estimates/    # Get current gas price estimates
```

### WebSocket Endpoints (Planned)
```
/ws/lotteries/:id/                    # Real-time lottery updates
/ws/tickets/:id/                      # Real-time ticket status updates
/ws/notifications/                    # User notifications
```

### API Features

- **Authentication**: JWT-based authentication with Web3 wallet signing
- **Permissions**: Role-based access control for different endpoints
- **Rate Limiting**: Prevents abuse and ensures fair usage
- **Filtering**: Query parameters for filtering, sorting, and pagination
- **Documentation**: Auto-generated API documentation with Swagger/OpenAPI
- **Versioning**: API versioning to ensure backward compatibility

## 🔒 Smart Contract Architecture

QuantumPick uses Solidity smart contracts on EVM-compatible blockchains:

- **LotteryFactory**: Deploys new lottery instances
- **BaseLottery**: Abstract contract with core lottery functionality
- **StandardLottery**: Implementation of proportional lottery
- **RandomnessProvider**: Interface with VRF services
- **FeeCollector**: Managing platform economics

Smart contracts are deployed, verified, and open-source for full transparency.

## 🛣️ Development Roadmap

### Phase 1: MVP (Current)
- Single lottery type
- Web3 authentication
- Basic user dashboard
- Manual deployment

### Phase 2: Creator Dashboard
- No-code lottery creation
- Custom lottery settings
- Fee estimation
- Preview functionality

### Phase 3: SaaS Features
- Creator earnings dashboard
- Analytics and reporting
- Subscription model
- Vanity URLs for lotteries

### Phase 4: Platform Growth
- Lottery marketplace
- Referral system
- Layer 2 support
- Advanced customization options

## 🧪 Testing

### Frontend

```bash
cd web
npm run test
```

### Backend

```bash
cd srv
python manage.py test
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to submit pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Project Website](https://quantumpick.io)
- [Documentation](https://docs.quantumpick.io)
- [Community Discord](https://discord.gg/quantumpick)

## 📞 Contact

For questions or support, reach out to us at:
- Email: support@quantumpick.io
- Twitter: [@QuantumPickHQ](https://twitter.com/QuantumPickHQ)
