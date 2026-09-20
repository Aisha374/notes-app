import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import HomePage from './pages/HomePage';
import SharePage from './pages/SharePage';

function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/note/:noteId" element={<HomePage />} />
        <Route path="/share/:token" element={<SharePage />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
