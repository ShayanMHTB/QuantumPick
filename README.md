# QuantumPick: Transparent Web3 Lottery Platform

<p align="center">
  <img src="/api/placeholder/400/180" alt="QuantumPick Logo" />
</p>

<div align="center">
  
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14.1.0-000000.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-3178c6.svg)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.3.0-e0234e.svg)](https://nestjs.com/)
[![Web3](https://img.shields.io/badge/Web3-7.10.0-f16822.svg)](https://web3js.readthedocs.io/)
[![Prisma](https://img.shields.io/badge/Prisma-5.9.0-2D3748.svg)](https://www.prisma.io/)

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

- Node.js (v18+)
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
- pgAdmin (development only)
- Redis and RedisInsight (development only) 
- NestJS backend
- Next.js frontend

4. **Access the application**

- Frontend: http://localhost:3001
- Backend API: http://localhost:3000/api
- API Documentation: http://localhost:3000/api/docs
- pgAdmin: http://localhost:5050
- RedisInsight: http://localhost:8001

## 🛠️ Project Structure

```
QuantumPick/
 ├── .env                   # Environmental variables
 ├── .env.example           # Example of environmental variables
 ├── .gitignore             # Project root .gitignore
 ├── dbs                    # Copy of postgreSQL, and pgAdmin docker volumes
 ├── docker-compose.yml     # Docker compose file
 ├── img                    # Docker images
 │   ├── nest               # NestJS Dockerfile and entrypoint
 │   ├── next               # Next.js Dockerfile and entrypoint
 │   └── postgres           # PostgreSQL Dockerfile and entrypoint
 ├── LICENSE                # Project LICENSE
 ├── README.md              # Project README
 ├── DOCUMENTATION.md       # Business documentation
 ├── srv                    # NestJS application
 └── web                    # Next.js application
```

## 🖥️ Frontend Architecture (Next.js)

The frontend is built with Next.js 14, TypeScript, and uses the App Router for improved SEO and Static Site Generation capabilities. It follows a feature-based architecture and uses Redux for state management.

### Directory Structure

```
web/
├── .gitignore              # Frontend specific git ignore rules
├── components.json         # UI component configurations
├── eslint.config.js        # ESLint configuration
├── next.config.js          # Next.js configuration
├── package.json            # Node.js dependencies and scripts
├── public/                 # Static assets directly served
├── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── (auth)/         # Authentication related pages
│   │   ├── (dashboard)/    # Dashboard pages (protected routes)
│   │   ├── (marketing)/    # Public pages
│   │   ├── api/            # API routes for frontend
│   │   └── [locale]/       # Internationalized routes
│   ├── assets/             # Images, fonts, icons, and other static files
│   ├── components/         # Reusable UI components
│   │   ├── auth/           # Authentication-related components
│   │   ├── lottery/        # Lottery-related components 
│   │   ├── shared/         # Components shared across features
│   │   ├── ui/             # Base UI components from shadcn
│   │   └── user/           # User profile related components
│   ├── config/             # Application configuration
│   │   ├── api.ts          # API endpoints configuration
│   │   └── routes.ts       # Frontend route definitions
│   ├── context/            # React context providers
│   ├── hooks/              # Custom React hooks
│   │   ├── index.ts        # Hook exports
│   │   ├── useAuth.ts      # Authentication related hooks
│   │   ├── useLottery.ts   # Lottery data and interaction hooks
│   │   ├── useMobile.ts    # Responsive design hooks
│   │   ├── useTheme.ts     # Theme management hooks
│   │   ├── useUser.ts      # User data and profile hooks
│   │   └── useWallet.ts    # Web3 wallet integration hooks
│   ├── i18n/               # Internationalization
│   ├── lib/                # Utility libraries and functions
│   ├── providers/          # React providers
│   ├── redux/              # Redux store configuration
│   ├── services/           # API and external service integrations
│   │   ├── api/            # API service layer
│   │   ├── auth/           # Authentication services
│   │   ├── lottery/        # Lottery related services
│   │   └── user/           # User related services
│   ├── styles/             # Global styles and theme definitions
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── tailwind.config.js      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

### Key Technologies

- **Next.js 14**: React framework with App Router and SSR/SSG
- **TypeScript**: Type safety
- **Redux Toolkit**: State management
- **ethers.js**: Ethereum interaction
- **SIWE**: Sign-In With Ethereum
- **Tailwind CSS**: Styling
- **Shadcn UI**: Component library built on Radix UI
- **i18next**: Internationalization
- **Zod**: Schema validation
- **React Hook Form**: Form handling
- **Sentry**: Error tracking

## 🧭 Backend Architecture (NestJS)

The backend is built with NestJS, TypeScript, and Prisma ORM. It follows a modular architecture with well-defined domains and clear separation of concerns.

### Directory Structure

```
srv/
├── .env                   # Environment variables (development only)
├── .gitignore             # Backend specific git ignore rules
├── nest-cli.json          # NestJS CLI configuration
├── package.json           # Node.js dependencies and scripts
├── prisma/                # Prisma ORM configuration
│   ├── migrations/        # Database migrations
│   └── schema.prisma      # Database schema
├── src/
│   ├── app.module.ts      # Root application module
│   ├── main.ts            # Application entry point
│   ├── common/            # Shared utilities and modules
│   │   ├── constants/     # Application constants
│   │   ├── decorators/    # Custom decorators
│   │   ├── dto/           # Shared DTOs
│   │   ├── exceptions/    # Custom exceptions
│   │   ├── filters/       # Exception filters
│   │   ├── guards/        # Authentication guards
│   │   ├── interfaces/    # Common interfaces
│   │   ├── middlewares/   # HTTP middlewares
│   │   ├── pipes/         # Validation pipes
│   │   └── utils/         # Utility functions
│   ├── config/            # Application configuration
│   │   ├── app.config.ts  # App configuration
│   │   ├── auth.config.ts # Auth configuration
│   │   ├── database.config.ts # Database configuration
│   │   └── index.ts       # Configuration module
│   ├── modules/           # Feature modules
│   │   ├── analytics/     # Analytics module
│   │   ├── auth/          # Authentication module
│   │   ├── blockchain/    # Blockchain integration module
│   │   ├── core/          # Core functionality module
│   │   ├── finances/      # Financial transactions module
│   │   ├── lotteries/     # Lottery management module
│   │   ├── tickets/       # Ticket management module
│   │   └── users/         # User management module
│   ├── prisma/            # Prisma service
│   └── websockets/        # WebSocket gateway
├── test/                  # End-to-end tests
├── tsconfig.json          # TypeScript configuration
└── tsconfig.build.json    # TypeScript build configuration
```

### Feature Module Structure

Each feature module follows a consistent structure:

```
modules/feature-name/
├── controllers/            # HTTP controllers
├── dtos/                   # Data Transfer Objects
├── entities/               # Entity definitions
├── exceptions/             # Feature-specific exceptions
├── interfaces/             # Feature-specific interfaces
├── repositories/           # Repository pattern implementations
├── services/               # Business logic services
├── feature-name.module.ts  # Module definition
```

### Key Technologies

- **NestJS**: Progressive Node.js framework
- **TypeScript**: Type safety
- **Prisma**: ORM for database interactions
- **Redis**: Cache and message broker
- **RabbitMQ**: Advanced message queue (optional alternative to Redis)
- **Passport**: Authentication framework
- **Web3.js**: Ethereum integration
- **Socket.io**: WebSocket implementation
- **Swagger**: API documentation
- **Jest**: Testing framework
- **Prometheus**: Metrics collection

## 📊 Database Schema

The database schema is defined using Prisma and includes the following key models:

### Core Models

- **AppConfig**: Global platform settings
- **AppAudit**: System-level event logging

### User-Related Models

- **User**: User account information
- **Wallet**: User's blockchain wallet addresses
- **UserPreference**: User settings and preferences 
- **UserNotification**: User notifications
- **UserActivity**: User activity logs

### Lottery-Related Models

- **Lottery**: Lottery configuration and state
- **LotterySetting**: Lottery templates and settings
- **LotteryParticipant**: Maps users to lotteries
- **LotteryStatistics**: Analytics for lottery performance

### Ticket Models

- **Ticket**: Purchased lottery tickets
- **TicketBatch**: Grouped ticket purchases

### Financial Models

- **Transaction**: Financial transaction records
- **CreatorEarning**: Earnings by lottery creators
- **PlatformEarning**: Platform revenue tracking

### Analytics Models

- **UserSnapshot**: Periodic snapshots of user metrics
- **LotterySnapshot**: Periodic snapshots of lottery metrics
- **PageView**: Page view and engagement tracking

## 🔒 Smart Contract Architecture

QuantumPick uses Solidity smart contracts on EVM-compatible blockchains:

- **LotteryFactory**: Deploys new lottery instances
- **BaseLottery**: Abstract contract with core lottery functionality
- **StandardLottery**: Implementation of proportional lottery
- **RandomnessProvider**: Interface with VRF services
- **FeeCollector**: Managing platform economics

Smart contracts are deployed, verified, and open-source for full transparency.

## 🔌 Integration & API

### API Standards

- RESTful API design with versioning
- Swagger documentation for all endpoints
- JWT-based authentication
- GraphQL API (optional) for complex data queries
- WebSocket API for real-time updates

### Key API Endpoints

```
# Authentication
/api/v1/auth/nonce           # Generate nonce for SIWE
/api/v1/auth/verify          # Verify SIWE signature
/api/v1/auth/logout          # End session

# Users
/api/v1/users/me             # Current user profile
/api/v1/users/wallets        # User wallet management

# Lotteries
/api/v1/lotteries            # Lottery CRUD operations
/api/v1/lotteries/templates  # Lottery templates
/api/v1/lotteries/{id}/stats # Lottery statistics

# Tickets
/api/v1/tickets              # Ticket purchase and management
/api/v1/tickets/batch        # Batch ticket purchases

# Finances
/api/v1/finances/transactions # Financial transactions
/api/v1/finances/earnings     # Creator earnings
```

## 🛣️ Development Roadmap

See [DOCUMENTATION.md](DOCUMENTATION.md) for the complete product roadmap.

## 🧪 Testing

### Frontend (Next.js)

```bash
cd web
npm run test             # Run Jest tests
npm run test:e2e         # Run end-to-end tests
npm run lint             # Run ESLint
```

### Backend (NestJS)

```bash
cd srv
npm run test             # Run Jest tests
npm run test:e2e         # Run end-to-end tests
npm run test:cov         # Generate coverage report
```

## 🔍 Monitoring & Observability

- **Prometheus**: Metrics collection
- **Grafana**: Metrics visualization
- **Sentry**: Error tracking and performance monitoring
- **ELK Stack**: Centralized logging
- **Netdata**: Real-time system monitoring

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
