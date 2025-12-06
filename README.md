# Signalist 📈

A modern, full-stack stock market tracking and analysis application built with Next.js. Signalist provides real-time stock data, interactive charts, personalized watchlists, and comprehensive market insights.

![Signalist](https://img.shields.io/badge/Next.js-15.5.7-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.1.0-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green?style=for-the-badge&logo=mongodb)

## ✨ Features

### 📊 Dashboard
- **Market Overview**: Real-time market data and trends
- **Stock Heatmap**: Visual representation of market performance
- **TradingView Integration**: Interactive charts and technical analysis tools
- **Top Stories**: Latest financial news and market updates

### 🔍 Stock Search
- **Quick Search**: Fast stock lookup by symbol or company name (Ctrl/Cmd + K)
- **Popular Stocks**: Browse trending stocks
- **Watchlist Integration**: Add stocks to watchlist directly from search results
- **Real-time Results**: Instant search with debounced queries

### ⭐ Watchlist
- **Personalized Lists**: Create and manage your stock watchlist
- **One-Click Add/Remove**: Toggle stocks with star icon
- **Stock Details**: Quick access to detailed stock information
- **News Feed**: Relevant news for your watched stocks

### 📈 Stock Details
- **Comprehensive Data**: Company profiles, financial metrics, and market data
- **Interactive Charts**: TradingView widgets for technical analysis
- **News & Updates**: Latest news and press releases
- **Historical Data**: Price history and performance metrics

### 🔐 Authentication
- **Secure Sign-up/Sign-in**: Email-based authentication with Better Auth
- **User Profiles**: Personalized experience with user preferences
- **Session Management**: Secure session handling

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.5.7** - React framework with App Router
- **React 19.1.0** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **Sonner** - Toast notifications

### Backend
- **Next.js API Routes** - Server-side API
- **Better Auth** - Authentication system
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB

### External Services
- **Finnhub API** - Stock market data
- **TradingView** - Chart widgets
- **Nodemailer** - Email service
- **Inngest** - Background job processing
- **Google Gemini API** - AI features

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ 
- MongoDB database (local or cloud)
- Finnhub API key ([Get one here](https://finnhub.io/))
- (Optional) TradingView account for advanced charts
- (Optional) Nodemailer credentials for email features
- (Optional) Gemini API key for AI features

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/stocks_app.git
   cd stocks_app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   MONGODB_URI=your_mongodb_connection_string
   
   # Authentication
   BETTER_AUTH_SECRET=your_secret_key_here
   BETTER_AUTH_URL=http://localhost:3000
   
   # Finnhub API
   FINNHUB_API_KEY=your_finnhub_api_key
   
   # Email (Optional)
   NODEMAILER_EMAIL=your_email@example.com
   NODEMAILER_PASSWORD=your_app_password
   
   # AI Features (Optional)
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Test database connection**
   ```bash
   npm run test:db
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
stocks_app/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication routes
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (root)/            # Protected routes
│   │   ├── page.tsx       # Dashboard
│   │   ├── search/        # Search page
│   │   ├── watchlist/     # Watchlist page
│   │   └── stocks/         # Stock details
│   └── api/               # API routes
├── components/            # React components
│   ├── forms/            # Form components
│   ├── ui/               # UI primitives
│   └── ...               # Feature components
├── database/             # Database models
│   └── models/
├── lib/                  # Utilities and actions
│   ├── actions/         # Server actions
│   ├── better-auth/     # Auth configuration
│   └── constants.ts     # App constants
├── hooks/               # Custom React hooks
├── middleware/          # Next.js middleware
└── types/               # TypeScript type definitions
```

## 🎯 Key Features Implementation

### Search Functionality
- **Debounced Search**: Optimized search with 300ms debounce
- **Watchlist Toggle**: Star icon to add/remove stocks instantly
- **Keyboard Shortcut**: Press `Ctrl/Cmd + K` to open search
- **Real-time Updates**: Instant UI updates on watchlist changes

### Watchlist Management
- **Persistent Storage**: MongoDB-backed watchlist
- **User-specific**: Each user has their own watchlist
- **Quick Actions**: Add/remove stocks from multiple locations

### Stock Data
- **Cached Responses**: Optimized API calls with Next.js caching
- **Error Handling**: Graceful fallbacks for API failures
- **Real-time Updates**: Fresh data with configurable revalidation

## 📝 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test:db` - Test MongoDB connection

## 🔒 Security

- **Environment Variables**: Sensitive data stored in `.env.local`
- **Server Actions**: Secure server-side operations
- **Authentication**: Better Auth with secure session management
- **Input Validation**: Form validation with react-hook-form

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

The app is optimized for Vercel deployment with:
- Automatic serverless function optimization
- Edge network caching
- Zero-configuration deployment

### Other Platforms

The app can be deployed to any platform supporting Next.js:
- **Netlify**: Use Next.js build plugin
- **AWS**: Deploy with AWS Amplify or EC2
- **Docker**: Containerize with Next.js Docker image

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Finnhub](https://finnhub.io/) for stock market data API
- [TradingView](https://www.tradingview.com/) for chart widgets
- [Next.js](https://nextjs.org/) team for the amazing framework
- [Better Auth](https://www.better-auth.com/) for authentication solution

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

Made with ❤️ using Next.js and TypeScript
