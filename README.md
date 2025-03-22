# CrawlMe - Food Crawl Planner

CrawlMe is a web application that helps users design personalized food crawls by finding and organizing restaurants in their area.

## Features

- Search for restaurants by food category, location, and other filters
- View results in both list and map views
- Create an optimized route for your food crawl
- Share your food crawl with friends
- Mobile-friendly design for on-the-go planning

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- NPM (v8 or higher)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/crawlme.git
cd crawlme
```

2. Install dependencies:
```bash
npm install
```

3. Set up API keys (see API Configuration section)

4. Start the development server:
```bash
npm start
```

5. Open your browser and navigate to `http://localhost:3000`

## API Configuration

### Google Maps API

This application uses the Google Maps JavaScript API for mapping and routing. You need to configure your API key properly for both development and production.

#### Restricting Your Google Maps API Key

To properly secure your Google Maps API key:

1. **For Local Testing:**
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to "APIs & Services" > "Credentials"
   - Select your API key
   - Under "Application restrictions", select "HTTP referrers (websites)"
   - Add the following referrers:
     - `http://localhost:*`
     - `http://127.0.0.1:*`

2. **For Hosting on GitHub Pages (kumarjdas.github.io):**
   - Add the following referrer:
     - `https://kumarjdas.github.io/*`

3. **API Restrictions:**
   - Under "API restrictions", restrict the key to only the necessary APIs:
     - Maps JavaScript API
     - Places API
     - Directions API
     - Geocoding API

4. **Update the key in the application:**
   - The key is set in `src/components/MapView.tsx`
   - In a production environment, you should use environment variables

### Yelp Fusion API

This application uses the Yelp Fusion API for restaurant data. To use it:

1. Get a Yelp API key from the [Yelp Fusion Dashboard](https://www.yelp.com/developers/v3/manage_app)
2. Update the API key in `src/services/YelpService.ts`

Note: For a production application, you should never include API keys directly in your frontend code. Instead, create a backend service to handle API requests securely.

## Deployment

To deploy the application to GitHub Pages:

1. Install the gh-pages package:
```bash
npm install --save-dev gh-pages
```

2. Add the following to your package.json:
```json
"homepage": "https://kumarjdas.github.io/crawlme",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

3. Deploy the application:
```bash
npm run deploy
```

## Built With

- React - Frontend framework
- TypeScript - Type checking
- Styled Components - Styling
- Google Maps API - Mapping and routing
- Yelp Fusion API - Restaurant data

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 