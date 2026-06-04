import { Grid, Ticket, Utensils, User } from 'lucide-react';
import { AppView } from '../types';

interface BottomNavProps {
  currentView: AppView;
  setView: (view: AppView) => void;
}

export function BottomNav({ currentView, setView }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 md:hidden bg-surface/90 backdrop-blur-md border-t border-outline-variant shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] rounded-t-xl overflow-hidden pb-4">
      {/* Mapa */}
      <button 
        onClick={() => setView('map')}
        className={`flex flex-col items-center justify-center px-4 py-1 hover:bg-surface-variant/50 transition-all rounded-lg ${
          currentView === 'map' ? 'text-secondary font-bold font-sans' : 'text-on-surface-variant'
        }`}
      >
        <Grid className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] font-bold uppercase tracking-wider">Mapa</span>
      </button>

      {/* Reservas */}
      <button 
        onClick={() => setView('reservations')}
        className={`flex flex-col items-center justify-center px-4 py-1 hover:bg-surface-variant/50 transition-all rounded-lg ${
          currentView === 'reservations' ? 'text-secondary font-bold' : 'text-on-surface-variant'
        }`}
      >
        <Ticket className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] font-bold uppercase tracking-wider">Reservas</span>
      </button>

      {/* Menu / Cardápio */}
      <button 
        onClick={() => setView('menu')}
        className={`flex flex-col items-center justify-center px-4 py-1 hover:bg-surface-variant/50 transition-all rounded-lg ${
          currentView === 'menu' ? 'text-secondary font-bold' : 'text-on-surface-variant'
        }`}
      >
        <Utensils className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] font-bold uppercase tracking-wider">Menu</span>
      </button>

      {/* Perfil / Settings */}
      <button 
        onClick={() => setView('settings')}
        className={`flex flex-col items-center justify-center px-4 py-1 hover:bg-surface-variant/50 transition-all rounded-lg ${
          currentView === 'settings' ? 'text-secondary font-bold' : 'text-on-surface-variant'
        }`}
      >
        <User className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] font-bold uppercase tracking-wider">Perfil</span>
      </button>
    </nav>
  );
}
