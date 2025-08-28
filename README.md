# InsurePro - Professional Insurance Website

A modern, responsive insurance website built with React, TypeScript, and Tailwind CSS. This project demonstrates a professional insurance company website with comprehensive features and modern design.

## 🚀 Features

- **Modern Design**: Clean, professional insurance website design
- **Responsive Layout**: Mobile-first responsive design that works on all devices
- **Interactive Components**: Hover effects, animations, and smooth transitions
- **Contact Form**: Functional contact form with validation
- **Navigation**: Smooth scrolling navigation with mobile menu
- **Professional Branding**: InsurePro branding with custom colors and typography

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Create React App
- **Backend**: Express.js (Node.js)
- **Package Manager**: npm

## 📁 Project Structure

```
ws/
├── client/                 # React frontend
│   ├── src/
│   │   ├── App.tsx        # Main application component
│   │   ├── App.css        # Custom styles and animations
│   │   └── index.css      # Tailwind CSS imports
│   ├── public/
│   │   ├── index.html     # HTML template
│   │   └── favicon.svg    # Custom insurance icon
│   ├── tailwind.config.js # Tailwind configuration
│   └── postcss.config.js  # PostCSS configuration
├── server/                 # Express backend
│   ├── index.js           # Server entry point
│   └── package.json       # Server dependencies
└── package.json           # Root package.json with dev scripts
```

## 🎨 Design Features

- **Hero Section**: Eye-catching gradient background with call-to-action buttons
- **Services Grid**: Four main insurance services with hover effects
- **About Section**: Company information with animated statistics
- **Contact Form**: Functional contact form with validation
- **Footer**: Comprehensive footer with company information and links
- **Mobile Menu**: Responsive mobile navigation

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ws
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install client dependencies
   cd client
   npm install
   
   # Install server dependencies
   cd ../server
   npm install
   ```

3. **Start development servers**
   ```bash
   # From the root directory
   npm run dev
   ```

   This will start both:
   - **React Client**: http://localhost:3002
   - **Express Server**: http://localhost:5000

### Alternative: Start services individually

```bash
# Start client only
npm run dev:client

# Start server only
npm run dev:server
```

## 🎯 Available Scripts

### Root Directory
- `npm run dev` - Start both client and server concurrently
- `npm run dev:client` - Start React development server
- `npm run dev:server` - Start Express development server

### Client Directory
- `npm start` - Start React development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

### Server Directory
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

## 🌐 Website Sections

1. **Header**: Fixed navigation with logo and mobile menu
2. **Hero**: Main landing section with call-to-action
3. **Services**: Four insurance service offerings
4. **About**: Company information and statistics
5. **Contact**: Contact form and company information
6. **Footer**: Links, social media, and company details

## 🎨 Customization

### Colors
The website uses a custom color palette defined in `tailwind.config.js`:
- Primary Blue: `#2563eb` (Blue 600)
- Secondary Gray: `#64748b` (Slate 500)

### Typography
- **Inter**: Primary font for body text
- **Poppins**: Display font for headings

### Animations
- Hover effects on service cards
- Smooth transitions on buttons
- Animated statistics counters
- Gradient background animation

## 📱 Responsive Design

- **Mobile First**: Designed for mobile devices first
- **Breakpoints**: Responsive grid layouts for all screen sizes
- **Touch Friendly**: Optimized for touch interactions
- **Mobile Menu**: Collapsible navigation for small screens

## 🔧 Development

### Adding New Components
1. Create new component files in `client/src/components/`
2. Import and use in `App.tsx`
3. Add corresponding styles in `App.css`

### Modifying Styles
- Use Tailwind CSS classes for most styling
- Custom CSS in `App.css` for complex animations
- Update `tailwind.config.js` for theme customization

### Backend Integration
- API endpoints in `server/index.js`
- CORS enabled for frontend communication
- Environment variables support with dotenv

## 🚀 Deployment

### Frontend
```bash
cd client
npm run build
# Deploy the build folder to your hosting service
```

### Backend
```bash
cd server
npm start
# Deploy to your preferred hosting service
```

## 📄 License

This project is licensed under the ISC License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support or questions, please contact:
- Email: info@insurepro.com
- Phone: (555) 123-4567

---

**Built with ❤️ using React, TypeScript, and Tailwind CSS**
