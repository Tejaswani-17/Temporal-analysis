Real-time Spatio-Temporal Analysis Dashboard

An interactive dashboard for visualizing dynamic data over maps and timelines, featuring polygon creation and color-coded data display based on selected datasets. Built with React, Next.js, and TypeScript.

✨ Features

Interactive Timeline Control: Navigate through 30-day windows with hourly resolution
Real-time Map Visualization: Full Leaflet integration with OpenStreetMap tiles
Polygon Drawing Tools: Create custom regions with 3-12 points
Dynamic Data Sources: Multiple configurable data sources with threshold-based coloring
Color-coded Insights: Automatic polygon coloring based on user-defined rules
Open-Meteo API Integration: Real weather data visualization
Responsive Design: Works seamlessly across desktop and mobile devices


🚀 Setup and Run Instructions
Prerequisites
Node.js 18.0 or later
npm, yarn, or pnpm package manager
Modern web browser with JavaScript enabled

Installation

Clone the repository

git clone https://github.com/Tejaswani-17/Temporal-analysis.git
cd geo-dashboard
Install dependencies

npm install
# or
yarn install
# or
pnpm install
Install shadcn/ui components

npx shadcn@latest init
When prompted, choose:

TypeScript: Yes
Style: Default
Base color: Slate
Global CSS: src/app/globals.css
CSS variables: Yes
Tailwind config: tailwind.config.ts
Components alias: src/components
Utils alias: src/lib/utils
Install required components:

npx shadcn@latest add button card input label switch select badge separator
Development
Start the development server

npm run dev
# or
yarn dev
# or
pnpm dev
Open your browser Navigate to http://localhost:3000 [blocked]

Production Build
Build the application

npm run build
# or
yarn build
# or
pnpm build
Start the production server

npm start
# or
yarn start
# or
pnpm start
📚 Libraries Used
Core Framework
Next.js 14 - React framework with App Router
React 18 - UI library with hooks and concurrent features
TypeScript - Type-safe JavaScript
State Management
Zustand - Lightweight state management solution
UI Components & Styling
shadcn/ui - Re-usable component library built on Radix UI
Tailwind CSS - Utility-first CSS framework
Lucide React - Beautiful & consistent icon library
Radix UI - Low-level UI primitives
Mapping & Geospatial
Leaflet - Interactive map library
OpenStreetMap - Map tile provider
Data & API
Open-Meteo API - Weather data provider
Native Fetch API - HTTP client for API requests
Development Tools
ESLint - Code linting and formatting
PostCSS - CSS processing tool


🏗️ Project Structure
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── data-sources-sidebar.tsx
│   ├── timeline-control.tsx
│   ├── interactive-map.tsx
│   └── map-info-panel.tsx
├── store/                # State management
│   └── dashboard-store.ts # Zustand store
├── types/                # TypeScript definitions
│   └── dashboard.ts      # Type definitions
├── utils/                # Utility functions
│   ├── api.ts           # API helpers
│   └── map-utils.ts     # Map calculations
├── lib/                  # Library configurations
│   └── utils.ts         # Utility functions
└── dashboard.tsx         # Main dashboard component

🎨 Design & Development Remarks

Architecture Decisions

State Management: Chose Zustand over Redux for its simplicity and minimal boilerplate while maintaining TypeScript support and devtools integration.

Component Library: Selected shadcn/ui for its modern design system, accessibility features, and customization capabilities without vendor lock-in.

Map Integration: Implemented Leaflet with dynamic loading to reduce initial bundle size and provide fallback for environments where external CDN access might be restricted.

Performance Optimizations

Dynamic Imports: Leaflet library is loaded dynamically to reduce initial bundle size
Memoized Calculations: Polygon centroid and bounding box calculations are cached
Efficient Re-renders: Zustand's selective subscriptions prevent unnecessary component updates
Optimized Map Rendering: Polygon layers are managed efficiently to prevent memory leaks
Accessibility Features
Keyboard Navigation: All interactive elements support keyboard navigation
Screen Reader Support: Proper ARIA labels and semantic HTML structure
Color Contrast: Meets WCAG 2.1 AA standards for color contrast
Focus Management: Clear focus indicators and logical tab order
Responsive Design
Mobile-First Approach: Designed for mobile devices and progressively enhanced for larger screens
Flexible Layouts: CSS Grid and Flexbox for adaptive layouts
Touch-Friendly: Appropriate touch targets and gesture support
Code Quality
TypeScript Strict Mode: Full type safety with strict TypeScript configuration
ESLint Configuration: Comprehensive linting rules for code consistency
Component Composition: Reusable, composable components following React best practices
Error Boundaries: Proper error handling and user feedback
API Integration
Error Handling: Comprehensive error handling for API failures
Rate Limiting: Respectful API usage with appropriate request throttling
Data Validation: Runtime type checking for API responses
Caching Strategy: Intelligent caching to reduce API calls
Future Enhancements
Real-time Updates: WebSocket integration for live data streaming
Advanced Analytics: Statistical analysis and trend visualization
Export Functionality: GeoJSON and KML export capabilities
User Authentication: Multi-user support with saved configurations
Custom Data Sources: Plugin system for additional data providers
🤝 Contributing
Fork the repository
Create your feature branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add some amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request
📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

🙏 Acknowledgments
Open-Meteo for providing free weather data API
OpenStreetMap contributors for map data
shadcn for the excellent UI component library
Leaflet team for the robust mapping library
