# AI Visualization Gallery

A web-based gallery that showcases AI-generated mathematical visualizations inspired by single words. Each visualization is a React Canvas component with philosophical commentary, created through Claude API integration and stored in Firebase.

## 🎨 Features

- **Dynamic Gallery**: Displays 5 AI-generated mathematical visualizations
- **Manual Generation**: Admin panel for triggering new visualizations with inspiration words
- **Real-time Updates**: Live Firebase integration with automatic gallery updates
- **Responsive Design**: Adaptive grid layout (5-column desktop, mobile-friendly)
- **Canvas Animations**: High-performance 60fps mathematical visualizations
- **Philosophical Depth**: Each visualization includes AI-generated descriptions and themes

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Backend**: Firebase (Firestore, Functions, Hosting)
- **AI Integration**: Claude API for code generation
- **Styling**: CSS Modules with Inter font
- **Testing**: Jest + React Testing Library

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Firebase CLI
- Claude API key

### Installation

1. **Clone and install dependencies**:
   ```bash
   git clone <repository-url>
   cd ai-visualization-gallery
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Add your Firebase config and Claude API key
   ```

3. **Setup Firebase**:
   ```bash
   firebase login
   firebase use --add  # Select your Firebase project
   firebase deploy --only firestore:rules,storage
   ```

4. **Start development server**:
   ```bash
   npm start
   ```

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Gallery.tsx      # Main gallery grid
│   ├── VisualizationCard.tsx  # Individual visualization display
│   └── AdminPanel.tsx   # Generation controls
├── services/           # Firebase and API services
│   ├── firebase.ts     # Firebase configuration
│   ├── firestoreService.ts  # Database operations
│   └── claudeApi.ts    # AI integration
├── types/              # TypeScript definitions
└── styles/             # CSS modules
```

## 🎯 How It Works

1. **Inspiration**: Enter a word in the admin panel
2. **Generation**: Claude API creates React Canvas code with philosophical commentary
3. **Storage**: Visualization is saved to Firestore
4. **Display**: Gallery automatically updates with the new visualization
5. **Curation**: Maintains exactly 5 visualizations (oldest is replaced)

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

## 🚀 Deployment

### Firebase Hosting
```bash
# Build and deploy
npm run build
firebase deploy --only hosting

# Deploy functions
firebase deploy --only functions
```

### Environment Variables
Required environment variables in `.env`:
```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_CLAUDE_API_KEY=your_claude_key
```

## 🎨 Visualization Examples

Each generated visualization includes:
- **Mathematical Patterns**: Perlin noise, spirals, fractals
- **Wireframe Aesthetic**: Clean lines with no fills
- **Philosophical Themes**: AI-interpreted meaning behind each word
- **Interactive Elements**: Responsive animations and visual effects

## 📋 Development Tasks

- [x] ✅ React TypeScript project setup
- [x] ✅ Firebase integration and security rules
- [x] ✅ Responsive gallery grid component
- [x] ✅ Canvas visualization renderer
- [x] ✅ Admin panel with manual triggers
- [x] ✅ Real-time Firestore subscriptions
- [x] ✅ Comprehensive test suite
- [ ] 🔄 Claude API integration
- [ ] 🔄 Firebase Functions deployment
- [ ] 🔄 Production hosting setup

## 🔒 Security

- Firebase Security Rules enforce data access control
- Claude API calls are server-side only (Firebase Functions)
- Input validation and sanitization
- No client-side API key exposure

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request

## 📄 License

This project is part of an AI-generated art exploration. See the code for philosophical commentary embedded within each visualization component.

---

**Built with ❤️ and artificial intelligence - where mathematics meets philosophy through code.**