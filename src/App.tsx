import React from 'react';
import { Routes, Route } from 'react-router-dom';
import styled, { ThemeProvider } from 'styled-components';

// Pages
import Home from './pages/Home';
import PlanCrawl from './pages/PlanCrawl';
import ViewCrawl from './pages/ViewCrawl';

// Components
import Header from './components/Header';
import Footer from './components/Footer';

// Theme
const theme = {
  colors: {
    primary: '#FF6B6B',
    secondary: '#4ECDC4',
    dark: '#292F36',
    light: '#F7FFF7',
    warning: '#FFE66D',
    danger: '#F25F5C',
    success: '#8ACB88'
  },
  fontSizes: {
    small: '0.875rem',
    medium: '1rem',
    large: '1.25rem',
    xlarge: '1.5rem',
    xxlarge: '2rem'
  },
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1200px'
  }
};

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <AppContainer>
        <Header />
        <MainContent>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/plan" element={<PlanCrawl />} />
            <Route path="/crawl/:id" element={<ViewCrawl />} />
          </Routes>
        </MainContent>
        <Footer />
      </AppContainer>
    </ThemeProvider>
  );
};

export default App; 