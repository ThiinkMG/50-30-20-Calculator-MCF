# 50-30-20 Budget Calculator

A modern, responsive budget calculator that helps you allocate your income using the 50-30-20 rule (50% needs, 30% wants, 20% savings).

## Features

- Interactive budget calculator with the 50-30-20 rule
- Modern, responsive UI built with React and Tailwind CSS
- PDF report generation
- Social sharing capabilities
- Email integration with EmailJS
- Google Drive integration
- Dark/light theme support

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

4. Preview the production build:
   ```bash
   npm run preview
   ```

## Deployment

This project is configured for GitHub Pages deployment. The site will be available at:
`https://yourusername.github.io/50-30-20-Calculator-MCF/`

### GitHub Pages Setup

1. Push your code to a GitHub repository
2. Go to repository Settings → Pages
3. Under Source, select "GitHub Actions"
4. The deployment workflow will automatically build and deploy your site

### Environment Variables

For full functionality, you'll need to configure:

- EmailJS service ID, template ID, and public key
- Google Drive API credentials (if using Google Drive features)

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Radix UI components
- Wouter for routing
- React Query for state management
- Chart.js for data visualization
- EmailJS for email functionality
- jsPDF for PDF generation

## License

MIT
