import { Menu, Bell, User } from 'lucide-react';
import { AppView } from '../types';

interface HeaderProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  reservationsCount: number;
  storeName: string;
  eventName: string;
}

export function Header({ currentView, setView, reservationsCount, storeName, eventName }: HeaderProps) {
  return (
    <header className="bg-surface border-b border-outline-variant shadow-sm flex justify-between items-center px-4 md:px-8 h-16 w-full fixed top-0 z-50">
      <div className="flex items-center gap-4">
        {/* Mobile menu indicator indicator */}
        <button 
          onClick={() => setView('map')}
          className="p-2 rounded-full hover:bg-surface-container transition-colors active:opacity-80 active:scale-95 duration-150 md:hidden"
          title="Ver Mapa"
        >
          <Menu className="w-6 h-6 text-primary" />
        </button>
        <span 
          onClick={() => setView('map')}
          className="text-lg md:text-xl font-bold text-secondary cursor-pointer hover:opacity-90 select-none flex items-center gap-2"
        >
          🏕️ <span className="hidden sm:inline">{eventName} do</span> {storeName}
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        <button 
          onClick={() => setView('reservations')}
          className="p-2 rounded-full hover:bg-surface-container transition-colors relative"
          title="Minhas Reservas"
        >
          <Bell className="w-5 h-5 text-primary" />
          {reservationsCount > 0 && (
            <span id="badge-reservations" className="absolute top-1 right-1 w-4 h-4 bg-secondary text-white text-[9px] rounded-full flex items-center justify-center font-bold">
              {reservationsCount}
            </span>
          )}
        </button>
        
        <button 
          onClick={() => setView('settings')}
          className={`p-2 rounded-full hover:bg-surface-container transition-colors ${currentView === 'settings' ? 'bg-primary-container text-on-primary-container' : ''}`}
          title="Minha Conta"
        >
          <User className="w-5 h-5 text-primary" />
        </button>
      </div>
    </header>
  );
}
