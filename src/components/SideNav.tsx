import { Map, CalendarCheck, UtensilsCrossed, Settings } from 'lucide-react';
import { AppView } from '../types';

interface SideNavProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  storeName: string;
  eventName: string;
}

export function SideNav({ currentView, setView, storeName, eventName }: SideNavProps) {
  return (
    <nav className="hidden md:flex flex-col h-screen fixed left-0 top-0 py-6 bg-surface-container-low border-r border-outline-variant w-64 pt-20 z-40">
      <div className="px-6 mb-8">
        <h2 className="text-xl font-bold text-secondary">{storeName}</h2>
        <p className="text-xs text-on-surface-variant font-semibold">{eventName}</p>
      </div>

      <div className="flex flex-col gap-1 px-2">
        {/* Mapa de Mesas Button */}
        <button 
          onClick={() => setView('map')}
          className={`w-full text-left rounded-xl px-4 py-3 flex items-center gap-3 transition-all ${
            currentView === 'map' 
              ? 'bg-secondary-container text-on-secondary-container font-bold' 
              : 'text-on-surface-variant hover:bg-surface-variant/40'
          }`}
        >
          <Map className={`w-5 h-5 ${currentView === 'map' ? 'text-secondary' : 'text-on-surface-variant'}`} />
          <span className="text-xs uppercase font-bold tracking-wider">Mapa de Mesas</span>
        </button>

        {/* Minhas Reservas Button */}
        <button 
          onClick={() => setView('reservations')}
          className={`w-full text-left rounded-xl px-4 py-3 flex items-center gap-3 transition-all ${
            currentView === 'reservations' 
              ? 'bg-secondary-container text-on-secondary-container font-bold' 
              : 'text-on-surface-variant hover:bg-surface-variant/40'
          }`}
        >
          <CalendarCheck className={`w-5 h-5 ${currentView === 'reservations' ? 'text-secondary' : 'text-on-surface-variant'}`} />
          <span className="text-xs uppercase font-bold tracking-wider">Minhas Reservas</span>
        </button>

        {/* Cardápio Button */}
        <button 
          onClick={() => setView('menu')}
          className={`w-full text-left rounded-xl px-4 py-3 flex items-center gap-3 transition-all ${
            currentView === 'menu' 
              ? 'bg-secondary-container text-on-secondary-container font-bold' 
              : 'text-on-surface-variant hover:bg-surface-variant/40'
          }`}
        >
          <UtensilsCrossed className={`w-5 h-5 ${currentView === 'menu' ? 'text-secondary' : 'text-on-surface-variant'}`} />
          <span className="text-xs uppercase font-bold tracking-wider">Cardápio</span>
        </button>

        {/* Configurações Button */}
        <button 
          onClick={() => setView('settings')}
          className={`w-full text-left rounded-xl px-4 py-3 flex items-center gap-3 transition-all ${
            currentView === 'settings' 
              ? 'bg-secondary-container text-on-secondary-container font-bold' 
              : 'text-on-surface-variant hover:bg-surface-variant/40'
          }`}
        >
          <Settings className={`w-5 h-5 ${currentView === 'settings' ? 'text-secondary' : 'text-on-surface-variant'}`} />
          <span className="text-xs uppercase font-bold tracking-wider">Configurações</span>
        </button>
      </div>

      <div className="mt-auto px-4">
        <button 
          onClick={() => setView('form')}
          className="w-full bg-primary-container text-on-primary-container font-bold py-3 rounded-xl shadow-md hover:brightness-95 transition-all text-sm uppercase tracking-wider"
        >
          Reservar Agora
        </button>
      </div>
    </nav>
  );
}
