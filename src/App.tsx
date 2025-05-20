import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import SearchPage from './components/SearchPage';
import SearchResultsPage from './components/SearchResultsPage';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="app-container">
        <nav className="app-nav">
          <Link to="/">Home</Link>
        </nav>
        <main>
          <Routes>
            <Route path="/" element={<SearchPage />} />
            <Route path="/search-results" element={<SearchResultsPage />} />
          </Routes>
        </main>
        <footer className="app-footer">
          <p>Vibe-Coded by David Sint</p>
        </footer>
      </div>
    </Router>
  );
};

export default App;
