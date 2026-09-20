import { Menu, Sun, Moon, Book } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function TopBar({ onMenuClick }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="topbar">
      <div className="topbar-left">
        {onMenuClick && (
          <button className="icon-btn mobile-only" onClick={onMenuClick}>
            <Menu size={20} />
          </button>
        )}
        <div className="app-logo">
          <Book size={24} className="accent-color" />
          <h1>Notes</h1>
        </div>
      </div>
      <div className="topbar-right">
        <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>
    </header>
  );
}
