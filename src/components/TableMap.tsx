import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Table, AppView, MapDecoration } from '../types';
import { 
  Sparkles, 
  CheckCircle2, 
  ZoomIn, 
  ZoomOut, 
  Search, 
  Compass, 
  RotateCcw, 
  Sliders, 
  Plus, 
  Trash2, 
  Grid, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  HelpCircle,
  Share2
} from 'lucide-react';
import { initialTables } from '../data/tables';
import { initialDecorations } from '../data/decorations';

interface TableMapProps {
  tables: Table[];
  selectedTableId: number;
  onSelectTable: (id: number) => void;
  setView: (view: AppView) => void;
  onUpdateTables: (updater: Table[] | ((prev: Table[]) => Table[])) => void;
  decorations?: MapDecoration[];
  onUpdateDecorations?: (updater: MapDecoration[] | ((prev: MapDecoration[]) => MapDecoration[])) => void;
  storeWhatsapp?: string;
  storeName?: string;
  eventName?: string;
}

export function TableMap({ 
  tables, 
  selectedTableId, 
  onSelectTable, 
  setView, 
  onUpdateTables,
  decorations = initialDecorations,
  onUpdateDecorations,
  storeWhatsapp = '',
  storeName = 'Cia do Chopp',
  eventName = 'São João 2025'
}: TableMapProps) {
  const isSharedMap = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('share') === 'map';
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const [zoom, setZoom] = useState<number>(0.85);

  const handleAutoFit = () => {
    if (mapContainerRef.current) {
      const parentWidth = mapContainerRef.current.clientWidth;
      // Subtract layout padding to capture actual map arena space
      const padding = window.innerWidth < 768 ? 32 : 48;
      const availableWidth = parentWidth - padding;
      if (availableWidth > 0) {
        // Compute precise scale to fit 1150px floor plan perfectly inside available width has minimum bound of 0.22
        const calculatedScale = Math.max(0.20, Math.min(1.2, availableWidth / 1150));
        setZoom(Math.round(calculatedScale * 1000) / 1000);
      }
    } else {
      if (typeof window !== 'undefined') {
        const isMobile = window.innerWidth < 768;
        setZoom(isMobile ? 0.30 : 0.85);
      }
    }
  };

  useEffect(() => {
    // Wait for layout hydration elements to sit perfectly
    const timer = setTimeout(() => {
      handleAutoFit();
    }, 150);

    const handleResize = () => {
      handleAutoFit();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  
  // Selected Decoration Item Tracker
  const [selectedDecoId, setSelectedDecoId] = useState<string | null>(null);
  
  // Local state for duplicate ID warnings during table properties edits
  const [editingIdText, setEditingIdText] = useState<string>('');
  const [errorText, setErrorText] = useState<string>('');

  // Find currently selected
  const selectedTable = useMemo(() => {
    return tables.find(t => t.id === selectedTableId) || tables[0];
  }, [tables, selectedTableId]);

  // Flash searched table on search match
  const searchedTableIds = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return tables
      .filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || String(t.id) === searchQuery.trim())
      .map(t => t.id);
  }, [tables, searchQuery]);

  // Handle zooming bounds safely
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.15, 1.3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.15, 0.55));
  const handleResetZoom = () => handleAutoFit();

  // Drag and drop handler accommodating zoom scale factor
  const startDrag = (e: React.MouseEvent | React.TouchEvent, tableId: number) => {
    if (!isAdminMode) return;
    
    // Select this table immediately upon clicking/touching
    onSelectTable(tableId);
    setSelectedDecoId(null);

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const targetTable = tables.find(t => t.id === tableId);
    if (!targetTable) return;
    
    const initialX = targetTable.x;
    const initialY = targetTable.y;
    
    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      const currentX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const currentY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;
      
      // Calculate delta adjusted for zoom
      const dx = (currentX - clientX) / zoom;
      const dy = (currentY - clientY) / zoom;
      
      // Snap positions to 5px grids for clean visual alignment
      const newX = Math.round((initialX + dx) / 5) * 5;
      const newY = Math.round((initialY + dy) / 5) * 5;
      
      // Constraint bounds within the 1150x630 coordinate map wrapper
      const constrainedX = Math.max(10, Math.min(1080, newX));
      const constrainedY = Math.max(10, Math.min(580, newY));
      
      onUpdateTables(prev => 
        prev.map(t => t.id === tableId ? { ...t, x: constrainedX, y: constrainedY } : t)
      );
    };
    
    const handleEnd = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
    
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove, { passive: true });
    window.addEventListener('touchend', handleEnd);
  };

  // Drag and drop handler for map decorations/labels in admin mode
  const startDragDeco = (e: React.MouseEvent | React.TouchEvent, decoId: string) => {
    if (!isAdminMode) return;
    
    // Select this decoration immediately and deselect any table
    setSelectedDecoId(decoId);

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const targetDeco = decorations.find(d => d.id === decoId);
    if (!targetDeco) return;
    
    const initialX = targetDeco.x;
    const initialY = targetDeco.y;
    
    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      const currentX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const currentY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;
      
      const dx = (currentX - clientX) / zoom;
      const dy = (currentY - clientY) / zoom;
      
      const newX = Math.round((initialX + dx) / 5) * 5;
      const newY = Math.round((initialY + dy) / 5) * 5;
      
      const constrainedX = Math.max(0, Math.min(1150 - targetDeco.width, newX));
      const constrainedY = Math.max(0, Math.min(630 - targetDeco.height, newY));
      
      if (onUpdateDecorations) {
        onUpdateDecorations(prev => 
          prev.map(d => d.id === decoId ? { ...d, x: constrainedX, y: constrainedY } : d)
        );
      }
    };
    
    const handleEnd = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
    
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove, { passive: true });
    window.addEventListener('touchend', handleEnd);
  };

  // Nudge coordinate helpers (Fine placement controls)
  const nudgeTable = (direction: 'up' | 'down' | 'left' | 'right', step = 5) => {
    if (!selectedTable) return;
    let newX = selectedTable.x;
    let newY = selectedTable.y;

    if (direction === 'up') newY = Math.max(10, selectedTable.y - step);
    if (direction === 'down') newY = Math.min(580, selectedTable.y + step);
    if (direction === 'left') newX = Math.max(10, selectedTable.x - step);
    if (direction === 'right') newX = Math.min(1080, selectedTable.x + step);

    onUpdateTables(prev =>
      prev.map(t => t.id === selectedTable.id ? { ...t, x: newX, y: newY } : t)
    );
  };

  // Nudge coordinate helper for decorations
  const nudgeDeco = (direction: 'up' | 'down' | 'left' | 'right', step = 5) => {
    const selectedDeco = decorations.find(d => d.id === selectedDecoId);
    if (!selectedDeco || !onUpdateDecorations) return;
    let newX = selectedDeco.x;
    let newY = selectedDeco.y;

    if (direction === 'up') newY = Math.max(0, selectedDeco.y - step);
    if (direction === 'down') newY = Math.min(630 - selectedDeco.height, selectedDeco.y + step);
    if (direction === 'left') newX = Math.max(0, selectedDeco.x - step);
    if (direction === 'right') newX = Math.min(1150 - selectedDeco.width, selectedDeco.x + step);

    onUpdateDecorations(prev =>
      prev.map(d => d.id === selectedDeco.id ? { ...d, x: newX, y: newY } : d)
    );
  };

  // Add new template table
  const handleAddNewTable = () => {
    // Generate a unique numeric ID
    let newId = 1;
    while (tables.some(t => t.id === newId)) {
      newId++;
    }

    const newTable: Table = {
      id: newId,
      name: `Mesa ${newId}`,
      area: 'Salão',
      capacity: 4,
      type: 'Mesa Redonda',
      isVip: false,
      bookingFee: 0,
      status: 'available',
      x: 520, // Spawn centered
      y: 280,
      shape: 'circle'
    };

    onUpdateTables(prev => [...prev, newTable]);
    onSelectTable(newId);
    setSelectedDecoId(null); // deselect decoration
    setErrorText('');
    setEditingIdText(String(newId));
  };

  // Add new customization element/label
  const handleAddNewDeco = () => {
    let newNum = 1;
    while (decorations.some(d => d.id === `deco-custom-${newNum}`)) {
      newNum++;
    }
    const newDecoId = `deco-custom-${newNum}`;
    const newDeco: MapDecoration = {
      id: newDecoId,
      label: `Novo Item ${newNum}`,
      sublabel: 'Arraste ou Edite',
      type: 'custom',
      x: 480, // Spawn centered
      y: 250,
      width: 150,
      height: 60
    };

    if (onUpdateDecorations) {
      onUpdateDecorations(prev => [...prev, newDeco]);
      setSelectedDecoId(newDecoId);
    }
  };

  // Remove table securely
  const handleRemoveTable = (id: number) => {
    const isConfirmed = window.confirm(`Deseja realmente remover a Mesa ${id}?`);
    if (!isConfirmed) return;

    onUpdateTables(prev => prev.filter(t => t.id !== id));
    
    // Auto-select another table
    const remaining = tables.filter(t => t.id !== id);
    if (remaining.length > 0) {
      onSelectTable(remaining[0].id);
    }
  };

  // Remove decoration securely
  const handleRemoveDeco = (id: string) => {
    const deco = decorations.find(d => d.id === id);
    if (!deco) return;
    const isConfirmed = window.confirm(`Deseja realmente remover o elemento "${deco.label}"?`);
    if (!isConfirmed) return;

    if (onUpdateDecorations) {
      onUpdateDecorations(prev => prev.filter(d => d.id !== id));
      setSelectedDecoId(null);
    }
  };

  // Mass restore default template layout
  const handleRestoreDefaults = () => {
    const isConfirmed = window.confirm("Aviso: Isso irá redefinir todas as posições, mesas personalizadas e elementos do cenário para a planta baixa original de São João. Deseja continuar?");
    if (!isConfirmed) return;

    onUpdateTables(initialTables);
    if (onUpdateDecorations) {
      onUpdateDecorations(initialDecorations);
    }
    onSelectTable(16);
    setSelectedDecoId(null);
    setErrorText('');
  };

  // Update decoration properties
  const handleUpdateDecoProp = <K extends keyof MapDecoration>(key: K, value: MapDecoration[K]) => {
    if (!selectedDecoId || !onUpdateDecorations) return;
    onUpdateDecorations(prev =>
      prev.map(d => d.id === selectedDecoId ? { ...d, [key]: value } : d)
    );
  };

  // Update specialized properties with safety validation checks
  const handleUpdateTableProp = <K extends keyof Table>(key: K, value: Table[K]) => {
    if (!selectedTable) return;

    // Direct validation of table ID updates to guarantee unique identifier constraints
    if (key === 'id') {
      const numId = Number(value);
      if (isNaN(numId) || numId <= 0) {
        setErrorText('O número identificador deve ser um inteiro válido maior que 0.');
        return;
      }
      if (numId !== selectedTable.id && tables.some(t => t.id === numId)) {
        setErrorText(`Conflito: A Mesa nº ${numId} já existe no mapa.`);
        return;
      }
      setErrorText('');
      
      // Update ID itself across tables state with cascade rename
      onUpdateTables(prev => 
        prev.map(t => t.id === selectedTable.id ? { ...t, id: numId, name: t.name === `Mesa ${t.id}` ? `Mesa ${numId}` : t.name } : t)
      );
      onSelectTable(numId);
      return;
    }

    // Default direct mapping updates
    onUpdateTables(prev =>
      prev.map(t => t.id === selectedTable.id ? { ...t, [key]: value } : t)
    );
  };

  return (
    <div className="flex-1 space-y-6 w-full">
      {/* Header descriptive bar info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-on-surface mb-1 tracking-tight flex items-center gap-2">
            🏕️ Mapa Físico de Mesas
          </h1>
          <p className="text-sm text-on-surface-variant">
            Visualize a localização em tempo real das mesas e altere o layout arrastando os componentes.
          </p>
        </div>

        {/* Quick Search, Reset and MODE switcher controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Share Map Link */}
          {!isSharedMap && (
            <button
              onClick={() => {
                try {
                  const shareUrl = window.location.origin + window.location.pathname + '?share=map';
                  navigator.clipboard.writeText(shareUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                } catch (err) {
                  console.warn('Failed to copy link', err);
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                copied 
                  ? 'bg-green-100 text-green-800 border-green-300 shadow-sm' 
                  : 'bg-surface-container-low text-on-surface border-outline hover:bg-surface-container-high'
              }`}
              title="Copiar link do mapa para compartilhar"
            >
              <Share2 className="w-3.5 h-3.5 text-secondary" />
              <span>{copied ? 'Copiado! 📋' : 'Compartilhar Mapa 🔗'}</span>
            </button>
          )}

          {/* Mode Switcher */}
          {!isSharedMap && (
            <button
              onClick={() => {
                setIsAdminMode(!isAdminMode);
                setErrorText('');
              }}
              className={`flex items-center gap-1.5 px-4 py-2 border rounded-xl text-xs font-bold transition-all ml-auto md:ml-0 cursor-pointer ${
                isAdminMode 
                  ? 'bg-secondary text-on-secondary border-secondary shadow-md'
                  : 'bg-surface-container-low text-on-surface border-outline hover:bg-surface-container-high'
              }`}
            >
              <Sliders className="w-4 h-4" />
              {isAdminMode ? '🛠️ Modo Layout (Edição)' : '🌴 Modo Reserva (Cliente)'}
            </button>
          )}

          <div className="relative flex-1 md:flex-initial">
            <Search className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar Mesa (Ex: 16)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full md:w-56 text-xs font-semibold rounded-xl border border-outline bg-surface-container-lowest focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
            />
          </div>
          
          <div className="flex items-center bg-surface-container-lowest rounded-xl border border-outline px-2 py-1 gap-1 shrink-0">
            <button 
              onClick={handleZoomOut} 
              className="p-1 text-on-surface-variant hover:text-secondary hover:bg-surface rounded transition-colors"
              title="Afastar"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-mono font-bold px-1 text-on-surface-variant select-none">
              {Math.round(zoom * 100)}%
            </span>
            <button 
              onClick={handleZoomIn} 
              className="p-1 text-on-surface-variant hover:text-secondary hover:bg-surface rounded transition-colors"
              title="Aproximar"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button 
              onClick={handleResetZoom} 
              className="p-1 text-on-surface-variant hover:text-secondary hover:bg-surface rounded transition-colors border-l border-outline/30 pl-1.5 ml-0.5"
              title="Redimensionar para Caber"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {isAdminMode && (
        <div className="p-4 bg-secondary/10 border-2 border-dashed border-secondary rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex gap-3">
            <Grid className="w-10 h-10 text-secondary shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-secondary">🔧 Editor Interativo de Layout Ativo</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                <strong>Arraste qualquer mesa livremente</strong> com seu mouse ou dedo direto na planta baixa abaixo! 
                Suas edições serão salvas automaticamente e persistem no dispositivo em tempo real.
              </p>
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto shrink-0 flex-wrap">
            <button
              onClick={handleAddNewTable}
              className="flex-1 md:flex-none flex items-center justify-center gap-1 bg-secondary text-on-secondary px-4 py-2.5 rounded-xl font-bold text-xs hover:brightness-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Adicionar Mesa
            </button>
            <button
              onClick={handleAddNewDeco}
              className="flex-1 md:flex-none flex items-center justify-center gap-1 bg-surface-container-high border border-outline hover:bg-surface-container-highest px-3 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer text-on-surface-variant"
              title="Adicionar elemento decorativo, texto ou setor ao mapa"
            >
              <Plus className="w-4 h-4 text-secondary" /> Elemento / Área
            </button>
            <button
              onClick={handleRestoreDefaults}
              className="flex-1 md:flex-none flex items-center justify-center gap-1 bg-surface-container-high border border-outline hover:bg-surface-container-highest px-3 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer text-on-surface-variant"
              title="Recuperar mesas e cenário padrão originais da planta"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Planta Original
            </button>
          </div>
        </div>
      )}

      {isSharedMap && (
        <div className="w-full space-y-3">
          {/* Landscape orientation friendly reminder */}
          <div className="block sm:hidden text-center text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3 font-bold select-none leading-relaxed">
            🔄 Para a melhor experiência e para visualizar todas as mesas, gire o seu celular na horizontal (modo Paisagem)!
          </div>

          <div className="w-full bg-emerald-50 border border-emerald-200 text-emerald-800 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs animate-fade-in select-none text-left">
            <div className="flex items-center gap-3">
              <span className="text-3xl shrink-0">💬</span>
              <div>
                <h3 className="text-sm md:text-base font-extrabold pb-0.5 text-emerald-950 uppercase tracking-tight">Quer Reservar uma Mesa?</h3>
                <p className="text-xs text-emerald-700 font-medium">Confira as mesas disponíveis no mapa físico abaixo e toque no botão para falar diretamente no nosso WhatsApp de atendimento!</p>
              </div>
            </div>
            {storeWhatsapp ? (
              <a
                href={`https://wa.me/55${storeWhatsapp.replace(/\D/g, "")}?text=Olá!%20Gostaria%20de%20reservar%20uma%20mesa%20para%20o%20evento%20${encodeURIComponent(eventName)}%20da%20${encodeURIComponent(storeName)}.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl transition-all shadow-xs hover:scale-[1.02] active:scale-95 text-xs md:text-sm uppercase tracking-wider cursor-pointer font-sans"
              >
                Conversar pelo WhatsApp 🟢
              </a>
            ) : (
              <div className="text-xs text-emerald-600 bg-emerald-100/60 px-3 py-2 rounded-lg border border-emerald-200/50 italic font-medium">
                WhatsApp de atendimento pendente de cadastro nas configurações.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Map Legend info strip */}
      <div className="flex flex-wrap items-center gap-4 p-3 bg-surface-container-low rounded-xl border border-outline-variant text-[11px] font-bold">
        <span className="text-on-surface-variant uppercase tracking-wider text-[10px]">Legenda:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-white border border-outline rounded"></span>
          <span className="text-on-surface-variant/80">Livre</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-primary-container border border-primary rounded gold-glow"></span>
          <span className="text-secondary">Selecionada</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-red-500 border border-red-650 rounded shadow-sm"></span>
          <span className="font-extrabold text-red-600">{isAdminMode ? "Reservada (Editor pode alterar)" : "Reservada"}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-1.5 bg-secondary rounded"></span>
          <span className="text-secondary-fixed-dim">Enclave VIP (Churrasqueira)</span>
        </div>
        {isAdminMode && (
          <div className="ml-auto flex items-center gap-1 text-[10px] text-secondary font-bold uppercase animate-pulse">
            <span className="w-2 h-2 bg-secondary rounded-full"></span>
            Modo Layout Ativo
          </div>
        )}
      </div>

      {/* MAIN CONTAINER: Split map and layout properties editor side-by-side if admin mode is true */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        
        {/* Interactive visual floor plan scroll container */}
        <div ref={mapContainerRef} className="flex-1 bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-auto p-4 md:p-6 min-h-[480px]">
          {/* Dynamic panning grid according to zoom setting */}
          <div 
            className="relative border border-dashed border-outline-variant bg-surface/30 rounded-xl transition-transform duration-150 origin-top-left"
            style={{ 
              width: '1150px', 
              height: '630px', 
              transform: `scale(${zoom})`,
              marginRight: `calc((1150px * ${zoom}) - 1150px)`,
              marginBottom: `calc((630px * ${zoom}) - 630px)`
            }}
          >
            
            {/* DYNAMIC ENVIRONMENT DECORATIONS */}
            {decorations.map((deco) => {
              const isDecoSelected = selectedDecoId === deco.id;
              
              // Base interactive styles in Admin Mode versus Viewer mode
              const adminStyles = isAdminMode 
                ? `!pointer-events-auto hover:ring-2 hover:ring-secondary/50 active:scale-[1.01] cursor-move ${
                    isDecoSelected ? 'ring-2 ring-primary bg-primary-container/20 border-primary' : 'border-dashed border-secondary/35 bg-surface/10'
                  }` 
                : 'pointer-events-none bg-transparent';

              let typeClasses = "";
              let content = null;

              if (deco.type === 'stage') {
                typeClasses = "bg-secondary-container/40 border-2 border-secondary/35 rounded-lg flex flex-col items-center justify-center p-2 text-center";
                content = (
                  <>
                    <span className="text-sm font-extrabold text-on-secondary-container select-none uppercase tracking-tight">{deco.label}</span>
                    {deco.sublabel && <span className="text-[9px] text-secondary font-bold select-none leading-none mt-0.5">{deco.sublabel}</span>}
                  </>
                );
              } else if (deco.type === 'bar') {
                typeClasses = "border-b border-dashed border-outline-variant/65 flex items-center justify-center text-center p-1 bg-amber-500/5";
                content = (
                  <span className="text-xs uppercase font-extrabold tracking-widest text-on-surface-variant/80 select-none">{deco.label}</span>
                );
              } else if (deco.type === 'zone') {
                typeClasses = "border-2 border-secondary rounded-xl bg-secondary-container/5 flex flex-col justify-between p-3 text-left";
                content = (
                  <>
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-secondary select-none">
                      {deco.label}
                    </div>
                    {deco.sublabel && (
                      <div className="text-[9px] font-extrabold text-center text-secondary/75 uppercase tracking-widest mt-auto select-none">
                        {deco.sublabel}
                      </div>
                    )}
                  </>
                );
              } else if (deco.type === 'kitchen') {
                typeClasses = "bg-surface-container border border-outline-variant/50 rounded flex items-center justify-center p-1 text-center";
                content = (
                  <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant select-none">{deco.label}</span>
                );
              } else if (deco.type === 'adega' || deco.type === 'pizzaria') {
                typeClasses = "text-right flex flex-col justify-center select-none uppercase p-1";
                content = (
                  <>
                    <p className="text-[11px] font-extrabold uppercase tracking-widest text-on-surface">{deco.label}</p>
                    {deco.sublabel && <p className="text-[9px] text-on-surface-variant uppercase font-semibold leading-none mt-0.5">{deco.sublabel}</p>}
                  </>
                );
              } else if (deco.type === 'salon') {
                typeClasses = "opacity-20 flex items-center justify-center select-none text-center";
                content = (
                  <span className="text-3xl font-extrabold tracking-[1em] text-on-surface pl-[1.1em]">{deco.label}</span>
                );
              } else { // 'custom' or others
                typeClasses = "bg-surface-container/60 border border-secondary/25 rounded-xl flex flex-col items-center justify-center p-2 text-center shadow-xs";
                content = (
                  <>
                    <span className="text-xs font-bold text-on-surface select-none">{deco.label}</span>
                    {deco.sublabel && <span className="text-[9px] text-on-surface-variant font-medium select-none">{deco.sublabel}</span>}
                  </>
                );
              }

              return (
                <div
                  key={deco.id}
                  onMouseDown={(e) => {
                    if (isAdminMode) {
                      e.stopPropagation();
                      startDragDeco(e, deco.id);
                    }
                  }}
                  onTouchStart={(e) => {
                    if (isAdminMode) {
                      e.stopPropagation();
                      startDragDeco(e, deco.id);
                    }
                  }}
                  onClick={(e) => {
                    if (isAdminMode) {
                      e.stopPropagation();
                      setSelectedDecoId(deco.id);
                    }
                  }}
                  className={`absolute transition-colors ${typeClasses} ${adminStyles}`}
                  style={{
                    left: `${deco.x}px`,
                    top: `${deco.y}px`,
                    width: `${deco.width}px`,
                    height: `${deco.height}px`,
                    touchAction: isAdminMode ? 'none' : 'auto'
                  }}
                  title={isAdminMode ? `Clique ou Arraste para editar: ${deco.label}` : deco.label}
                >
                  {content}
                  
                  {/* Small badge marker inside element showing selected status under layout view */}
                  {isAdminMode && isDecoSelected && (
                    <div className="absolute top-0 right-0 bg-primary text-white text-[8px] font-extrabold px-1 rounded-bl">
                      EDITANDO
                    </div>
                  )}
                </div>
              );
            })}

            {/* RENDERING TABLES CHAIRS IN COGNIZANCE WITH DESIGN PDF BLUEPRINT */}
            {tables.map(table => {
              const isSelected = table.id === selectedTableId;
              const isReserved = table.status === 'reserved';
              const isSearchMatch = searchedTableIds.includes(table.id);

              // Shape styles config for physical accuracy
              let tableShapeClass = "";
              let widthClass = "w-11 h-11";
              let chairsList: { top?: string, bottom?: string, left?: string, right?: string }[] = [];

              if (table.shape === 'circle') {
                tableShapeClass = "rounded-full";
                chairsList = [
                  { top: '-top-2 left-3.5' },
                  { bottom: '-bottom-2 left-3.5' },
                  { left: '-left-2 top-3.5' },
                  { right: '-right-2 top-3.5' }
                ];
              } else if (table.shape === 'rectangle') {
                widthClass = "w-16 h-10";
                tableShapeClass = "rounded-lg";
                chairsList = [
                  { top: '-top-1.5 left-2' },
                  { top: '-top-1.5 left-10' },
                  { bottom: '-bottom-1.5 left-2' },
                  { bottom: '-bottom-1.5 left-10' },
                  { left: '-left-2 top-2' },
                  { right: '-right-2 top-2' }
                ];
              } else {
                tableShapeClass = "rounded"; // square
                chairsList = [
                  { top: '-top-2 left-3.5' },
                  { bottom: '-bottom-2 left-3.5' },
                  { left: '-left-2 top-3.5' },
                  { right: '-right-2 top-3.5' }
                ];
              }

              // Interactive state colors matching layout specs
              let colors = "bg-white border-outline text-on-surface hover:border-secondary transition-all";
              if (isReserved && !isAdminMode) {
                colors = "bg-rose-50 border-rose-350 text-rose-800 ring-2 ring-red-400 font-bold hover:scale-100 cursor-not-allowed";
              } else if (isSelected) {
                colors = "bg-primary-container border-secondary font-bold text-secondary gold-glow scale-105 z-10 index-50 animate-pulse";
              } else if (isSearchMatch) {
                colors = "bg-yellow-105 border-secondary ring-4 ring-secondary animate-bounce font-bold scale-[1.08] z-20";
              }

              // Special treatment in admin mode: slightly transparent if reserved, but still selectable/movable
              if (isAdminMode && isReserved) {
                colors = `bg-neutral-100 border-dashed border-secondary/50 text-neutral-800 ${isSelected ? 'ring-2 ring-secondary' : ''}`;
              }

              return (
                <div
                  key={table.id}
                  onMouseDown={(e) => startDrag(e, table.id)}
                  onTouchStart={(e) => startDrag(e, table.id)}
                  onClick={() => {
                    const isSharedMap = new URLSearchParams(window.location.search).get('share') === 'map';
                    if (isAdminMode) {
                      onSelectTable(table.id);
                      setSelectedDecoId(null);
                    } else if (!isReserved) {
                      onSelectTable(table.id);
                      if (!isSharedMap) {
                        setView('form'); // AO CLICAR NA MESA ABRIR O "Finalizar Reserva" DIRECTAMENTE
                      }
                    }
                  }}
                  className={`absolute cursor-pointer select-none group flex items-center justify-center border text-[11px] font-sans ${tableShapeClass} ${widthClass} ${colors} ${
                    isAdminMode ? 'hover:scale-105 active:scale-110 !cursor-move' : ''
                  }`}
                  style={{ 
                    left: `${table.x}px`, 
                    top: `${table.y}px`,
                    touchAction: 'none', // Prevents default browser scrolling on touch drag
                    transition: 'background-color 0.15s, border-color 0.15s'
                  }}
                  title={
                    isAdminMode 
                      ? `Arraste para mover ${table.name}` 
                      : `${table.name} (${table.area}) - comporta até ${table.capacity} lugares`
                  }
                >
                  {/* Physical Chairs representation matching PDF visual */}
                  {chairsList.map((chair, idx) => {
                    let chairPos = "";
                    if (chair.top) chairPos = chair.top;
                    else if (chair.bottom) chairPos = chair.bottom;
                    else if (chair.left) chairPos = chair.left;
                    else if (chair.right) chairPos = chair.right;

                    return (
                      <span 
                        key={idx}
                        className={`absolute w-3.5 h-3.5 bg-outline-variant/70 border border-outline/30 rounded-sm group-hover:bg-secondary/40 transition-colors pointer-events-none z-0 ${
                          isSelected ? 'bg-secondary/50 border-secondary' : ''
                        } ${(isReserved && !isAdminMode) ? 'bg-rose-300/40 border-rose-400' : ''} ${chairPos}`}
                      />
                    );
                  })}

                  {/* Table Number Identifier Label inside */}
                  <span className="relative z-10 font-bold tracking-tighter select-none flex flex-col items-center justify-center">
                    {table.id}
                    {isAdminMode && isReserved && (
                      <span className="text-[7px] text-red-500 font-extrabold uppercase leading-none mt-0.5">R</span>
                    )}
                  </span>

                  {/* Custom tooltip helper popup on hover desktop */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:block bg-inverse-surface text-inverse-on-surface text-[9px] p-2 rounded-lg pointer-events-none shadow-lg z-50 whitespace-nowrap leading-tight">
                    <p className="font-bold">{table.name}</p>
                    <p>{table.area}</p>
                    <p>Capac.: {table.capacity} pessoas • {table.type}</p>
                    {table.isVip && <p className="text-primary-fixed font-bold">⭐ VIP (Taxa: R$ {table.bookingFee})</p>}
                    {isAdminMode && <p className="text-secondary font-semibold mt-1">↕ Arraste para mover • Clique para editar</p>}
                  </div>
                </div>
              );
            })}

          </div>
        </div>

        {/* ADMIN SIDEBAR PRODUCING METADATA WRITING CONTROLS */}
        {isAdminMode && (
          <div className="w-full lg:w-[350px] bg-surface-container border border-outline-variant rounded-2xl p-5 flex flex-col gap-4 shadow-sm select-none animate-[slideIn_0.2s_ease-out]">
            {selectedDecoId ? (
              // EDIT DECORATIONS SIDEBAR PANEL
              (() => {
                const selectedDeco = decorations.find(d => d.id === selectedDecoId);
                if (!selectedDeco) return <p className="text-xs text-on-surface-variant font-medium">Elemento de cenário não encontrado</p>;
                return (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
                      <div>
                        <h4 className="text-sm font-bold text-on-surface uppercase tracking-wide text-secondary">
                          🎨 Propriedades do Item
                        </h4>
                        <p className="text-[11px] text-on-surface-variant font-medium">Editar informações e dimensões no mapa</p>
                      </div>
                      <button
                        onClick={() => setSelectedDecoId(null)}
                        className="text-[10px] font-bold px-2 py-0.5 bg-outline-variant text-on-surface-variant rounded hover:bg-outline hover:text-on-surface"
                      >
                        Fechar
                      </button>
                    </div>

                    <div className="space-y-3 text-xs">
                      {/* Name/Label */}
                      <div>
                        <label className="block text-[10px] font-extrabold text-on-surface-variant uppercase mb-1">
                          Texto Principal (Label)
                        </label>
                        <input
                          type="text"
                          value={selectedDeco.label}
                          onChange={(e) => handleUpdateDecoProp('label', e.target.value)}
                          className="w-full px-3 py-1.5 bg-surface-container-low text-on-surface border border-outline rounded-lg font-bold focus:outline-none focus:border-secondary"
                          placeholder="Ex: PALCO, BAR, etc."
                        />
                      </div>

                      {/* Subtitle/Sublabel */}
                      <div>
                        <label className="block text-[10px] font-extrabold text-on-surface-variant uppercase mb-1">
                          Subtexto de Apoio
                        </label>
                        <input
                          type="text"
                          value={selectedDeco.sublabel || ''}
                          onChange={(e) => handleUpdateDecoProp('sublabel', e.target.value)}
                          className="w-full px-3 py-1.5 bg-surface-container-low text-on-surface border border-outline rounded-lg font-semibold focus:outline-none focus:border-secondary"
                          placeholder="Ex: Área Externa, VIP"
                        />
                      </div>

                      {/* Decoration Type Selector */}
                      <div>
                        <label className="block text-[10px] font-extrabold text-on-surface-variant uppercase mb-1">
                          Estilo Visual / Formato
                        </label>
                        <select
                          value={selectedDeco.type}
                          onChange={(e) => handleUpdateDecoProp('type', e.target.value as any)}
                          className="w-full px-3 py-1.5 bg-surface-container-low text-on-surface border border-outline rounded-lg font-medium focus:outline-none focus:border-secondary"
                        >
                          <option value="stage">🎸 Palco principal (Cinza / Linha)</option>
                          <option value="bar">🍺 Bar central (Tracejado / Fundo)</option>
                          <option value="zone">🥩 Setor cercado (Churrasqueira)</option>
                          <option value="kitchen">🍳 Área de Serviço / Cozinha</option>
                          <option value="adega">🍷 Adega (Alinhado Direita)</option>
                          <option value="pizzaria">🍕 Pizzaria (Alinhado Direita)</option>
                          <option value="salon">🛋️ Salão central / Título Gigante</option>
                          <option value="custom">⚙️ Layout Simples (Borda Fina)</option>
                        </select>
                      </div>

                      {/* Dimension Settings */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-extrabold text-on-surface-variant uppercase mb-1">
                            Largura-Width (px)
                          </label>
                          <input
                            type="number"
                            min="20"
                            max="1150"
                            step="5"
                            value={selectedDeco.width}
                            onChange={(e) => handleUpdateDecoProp('width', Number(e.target.value))}
                            className="w-full px-2 py-1.5 bg-surface-container-low text-on-surface border border-outline rounded-lg font-semibold focus:outline-none focus:border-secondary"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-extrabold text-on-surface-variant uppercase mb-1">
                            Altura-Height (px)
                          </label>
                          <input
                            type="number"
                            min="15"
                            max="630"
                            step="5"
                            value={selectedDeco.height}
                            onChange={(e) => handleUpdateDecoProp('height', Number(e.target.value))}
                            className="w-full px-2 py-1.5 bg-surface-container-low text-on-surface border border-outline rounded-lg font-semibold focus:outline-none focus:border-secondary"
                          />
                        </div>
                      </div>

                      {/* NUDGE CONTROLLER FOR DECO */}
                      <div className="p-3 bg-surface-container-low rounded-xl border border-outline/30 text-center space-y-2">
                        <span className="block text-[9px] font-extrabold text-on-surface-variant uppercase tracking-wider">
                          🎯 Ajuste de Posição Fino (Coordenadas)
                        </span>
                        
                        <div className="flex items-center justify-center gap-4 text-[10px] font-mono text-on-surface-variant font-bold mb-1">
                          <span>X: <strong className="text-secondary">{selectedDeco.x}px</strong></span>
                          <span>Y: <strong className="text-secondary">{selectedDeco.y}px</strong></span>
                        </div>

                        <div className="flex flex-col items-center gap-1.5">
                          <button 
                            type="button"
                            onClick={() => nudgeDeco('up', 5)}
                            className="p-1 text-on-surface bg-surface border border-outline rounded hover:bg-surface-container-high transition-colors text-xs inline-flex items-center justify-center"
                            title="Mover Para Cima"
                          >
                            <ChevronUp className="w-4 h-4 text-secondary" />
                          </button>

                          <div className="flex items-center gap-4">
                            <button 
                              type="button"
                              onClick={() => nudgeDeco('left', 5)}
                              className="p-1 text-on-surface bg-surface border border-outline rounded hover:bg-surface-container-high transition-colors text-xs inline-flex items-center justify-center"
                              title="Mover Para Esquerda"
                            >
                              <ChevronLeft className="w-4 h-4 text-secondary" />
                            </button>
                            
                            <span className="p-1 text-[9px] uppercase font-bold text-on-surface-variant opacity-75">Nudge</span>
                            
                            <button 
                              type="button"
                              onClick={() => nudgeDeco('right', 5)}
                              className="p-1 text-on-surface bg-surface border border-outline rounded hover:bg-surface-container-high transition-colors text-xs inline-flex items-center justify-center"
                              title="Mover Para Direita"
                            >
                              <ChevronRight className="w-4 h-4 text-secondary" />
                            </button>
                          </div>

                          <button 
                            type="button"
                            onClick={() => nudgeDeco('down', 5)}
                            className="p-1 text-on-surface bg-surface border border-outline rounded hover:bg-surface-container-high transition-colors text-xs inline-flex items-center justify-center"
                            title="Mover Para Baixo"
                          >
                            <ChevronDown className="w-4 h-4 text-secondary" />
                          </button>
                        </div>
                      </div>

                      {/* DELETE DECO BUTTON */}
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => handleRemoveDeco(selectedDeco.id)}
                          className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold hover:bg-red-100 transition-colors text-[11px] cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remover Elemento do Mapa
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : selectedTable ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-on-surface uppercase tracking-wide">
                      📝 Propriedades da Mesa
                    </h4>
                    <p className="text-[11px] text-on-surface-variant font-medium">Editar informações e geometria física</p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-secondary-container text-secondary rounded font-bold">
                    MESA {selectedTable.id}
                  </span>
                </div>

                {/* Error notifications */}
                {errorText && (
                  <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-[10px] text-red-700 font-semibold animate-pulse leading-normal">
                    ⚠️ {errorText}
                  </div>
                )}

                <div className="space-y-3 text-xs">
                  
                  {/* ID Identifier Nudge */}
                  <div>
                    <label className="block text-[10px] font-extrabold text-on-surface-variant uppercase mb-1">
                      Nº Identificador (ID)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={editingIdText || selectedTable.id}
                      onChange={(e) => {
                        const txt = e.target.value;
                        setEditingIdText(txt);
                        if (txt) {
                          handleUpdateTableProp('id', Number(txt));
                        }
                      }}
                      className="w-full px-3 py-1.5 bg-surface-container-low text-on-surface border border-outline rounded-lg font-bold focus:outline-none focus:border-secondary"
                    />
                  </div>

                  {/* Name Field */}
                  <div>
                    <label className="block text-[10px] font-extrabold text-on-surface-variant uppercase mb-1">
                      Nome da Mesa
                    </label>
                    <input
                      type="text"
                      value={selectedTable.name}
                      onChange={(e) => handleUpdateTableProp('name', e.target.value)}
                      className="w-full px-3 py-1.5 bg-surface-container-low text-on-surface border border-outline rounded-lg font-semibold focus:outline-none focus:border-secondary"
                      placeholder={`Ex: Mesa ${selectedTable.id}`}
                    />
                  </div>

                  {/* Sector Dropdown selector */}
                  <div>
                    <label className="block text-[10px] font-extrabold text-on-surface-variant uppercase mb-1">
                      Setor / Área Física
                    </label>
                    <select
                      value={selectedTable.area}
                      onChange={(e) => handleUpdateTableProp('area', e.target.value)}
                      className="w-full px-3 py-1.5 bg-surface-container-low text-on-surface border border-outline rounded-lg font-medium focus:outline-none focus:border-secondary"
                    >
                      <option value="Salão">Salão Central</option>
                      <option value="Churrasqueira">🥩 Setor Churrasqueira VIP</option>
                      <option value="Balcão">🍺 Balcão do Bar</option>
                      <option value="Área Externa Leste">🍃 Área Externa Leste</option>
                      <option value="Área Externa Norte">🪵 Área Externa Norte</option>
                      <option value="Pizzaria / Adega">🍷 Pizzaria / Adega 27</option>
                    </select>
                  </div>

                  {/* Table Shape layout */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-extrabold text-on-surface-variant uppercase mb-1">
                        Formato da Mesa
                      </label>
                      <select
                        value={selectedTable.shape}
                        onChange={(e) => handleUpdateTableProp('shape', e.target.value as 'circle'|'square'|'rectangle')}
                        className="w-full px-2 py-1.5 bg-surface-container-low text-on-surface border border-outline rounded-lg font-medium focus:outline-none focus:border-secondary text-[11px]"
                      >
                        <option value="circle">⭕ Redonda</option>
                        <option value="square">⬜ Quadrada</option>
                        <option value="rectangle">🟩 Retangular</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-on-surface-variant uppercase mb-1">
                        Capacidade (Lugares)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="12"
                        value={selectedTable.capacity}
                        onChange={(e) => handleUpdateTableProp('capacity', Number(e.target.value))}
                        className="w-full px-2 py-1.5 bg-surface-container-low text-on-surface border border-outline rounded-lg font-semibold focus:outline-none focus:border-secondary"
                      />
                    </div>
                  </div>

                  {/* Booking Fee / VIP settings */}
                  <div>
                    <label className="block text-[10px] font-extrabold text-on-surface-variant uppercase mb-1">
                      Mobiliário / Tipo de Assento
                    </label>
                    <input
                      type="text"
                      value={selectedTable.type}
                      onChange={(e) => handleUpdateTableProp('type', e.target.value)}
                      className="w-full px-3 py-1.5 bg-surface-container-low text-on-surface border border-outline rounded-lg font-medium focus:outline-none focus:border-secondary"
                      placeholder="Ex: Madeira, Estofado Luxo, Banqueta Alta"
                    />
                  </div>

                  <div className="p-3 bg-surface-container-low rounded-xl border border-outline/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-on-surface">⭐ Mesa do Setor VIP?</span>
                      <input
                        type="checkbox"
                        checked={selectedTable.isVip}
                        onChange={(e) => {
                          const check = e.target.checked;
                          handleUpdateTableProp('isVip', check);
                          // Set default booking fee of R$ 30 or R$ 50 if toggled VIP and was zero
                          if (check && selectedTable.bookingFee === 0) {
                            handleUpdateTableProp('bookingFee', 30);
                          } else if (!check) {
                            handleUpdateTableProp('bookingFee', 0);
                          }
                        }}
                        className="w-4 h-4 text-secondary accent-secondary focus:ring-secondary rounded cursor-pointer"
                      />
                    </div>

                    {selectedTable.isVip && (
                      <div>
                        <label className="block text-[9px] font-bold text-secondary uppercase mb-1">
                          Taxa de Reserva Kobrada (R$)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="5"
                          value={selectedTable.bookingFee}
                          onChange={(e) => handleUpdateTableProp('bookingFee', Number(e.target.value))}
                          className="w-full px-2 py-1 bg-surface text-on-surface border border-outline rounded font-mono font-bold focus:outline-none focus:border-secondary text-xs"
                        />
                      </div>
                    )}
                  </div>

                  {/* PIXEL POSITION & NUDGE CONTROL PAD (ARROW MOVER) */}
                  <div className="p-3 bg-surface-container-low rounded-xl border border-outline/30 text-center space-y-2">
                    <span className="block text-[9px] font-extrabold text-on-surface-variant uppercase tracking-wider">
                      🎯 Ajuste de Posição Fino (Coordenadas)
                    </span>
                    
                    {/* Coordinates Indicators */}
                    <div className="flex items-center justify-center gap-4 text-[10px] font-mono text-on-surface-variant font-bold mb-1">
                      <span>X: <strong className="text-secondary">{selectedTable.x}px</strong></span>
                      <span>Y: <strong className="text-secondary">{selectedTable.y}px</strong></span>
                    </div>

                    {/* Arrow Pad Layout */}
                    <div className="flex flex-col items-center gap-1.5">
                      <button 
                        type="button"
                        onClick={() => nudgeTable('up', 5)}
                        className="p-1 text-on-surface bg-surface border border-outline rounded hover:bg-surface-container-high transition-colors text-xs inline-flex items-center justify-center"
                        title="Mover Para Cima (Subir)"
                      >
                        <ChevronUp className="w-4 h-4 text-secondary" />
                      </button>

                      <div className="flex items-center gap-4">
                        <button 
                          type="button"
                          onClick={() => nudgeTable('left', 5)}
                          className="p-1 text-on-surface bg-surface border border-outline rounded hover:bg-surface-container-high transition-colors text-xs inline-flex items-center justify-center"
                          title="Mover Para Esquerda"
                        >
                          <ChevronLeft className="w-4 h-4 text-secondary" />
                        </button>
                        
                        <span className="p-1 text-[9px] uppercase font-bold text-on-surface-variant opacity-75">Nudge</span>
                        
                        <button 
                          type="button"
                          onClick={() => nudgeTable('right', 5)}
                          className="p-1 text-on-surface bg-surface border border-outline rounded hover:bg-surface-container-high transition-colors text-xs inline-flex items-center justify-center"
                          title="Mover Para Direita"
                        >
                          <ChevronRight className="w-4 h-4 text-secondary" />
                        </button>
                      </div>

                      <button 
                        type="button"
                        onClick={() => nudgeTable('down', 5)}
                        className="p-1 text-on-surface bg-surface border border-outline rounded hover:bg-surface-container-high transition-colors text-xs inline-flex items-center justify-center"
                        title="Mover Para Baixo (Descer)"
                      >
                        <ChevronDown className="w-4 h-4 text-secondary" />
                      </button>
                    </div>
                  </div>

                  {/* REMOVE TABLE COMPONENT */}
                  <div>
                    <button
                      type="button"
                      onClick={() => handleRemoveTable(selectedTable.id)}
                      className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold hover:bg-red-100 transition-colors text-[11px] cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remover Mesa {selectedTable.id}
                    </button>
                  </div>

                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-on-surface-variant/60 text-xs italic">
                Nenhum item selecionado para edição. Selecione uma mesa ou elemento decorativo no mapa para configurar suas propriedades.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dynamic CTA box for selected table */}
      {selectedTable && !isAdminMode && !isSharedMap && (
        <div className="p-4 bg-secondary-container/20 rounded-xl border border-secondary-container/35 flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
          <div className="text-center sm:text-left">
            <span className="text-[10px] font-extrabold uppercase mt-1 tracking-wider text-secondary flex items-center justify-center sm:justify-start gap-1">
              ⭐ MESA SELECIONADA
            </span>
            <h4 className="text-base font-bold text-on-surface">
              {selectedTable.name} ({selectedTable.area}) • {selectedTable.capacity} Lugares ({selectedTable.type})
            </h4>
            <p className="text-xs text-on-surface-variant">
              {selectedTable.isVip 
                ? `Esta mesa está no Setor VIP Coberto de São João. Taxa de Reserva: R$ ${selectedTable.bookingFee.toFixed(2)}`
                : 'Mesa gratuita! Sem taxa de reserva para esta localização.'
              }
            </p>
          </div>
          <button
            onClick={() => setView('form')}
            className="px-6 py-3.5 bg-secondary text-on-secondary font-bold rounded-xl shadow-md hover:brightness-95 active:scale-98 transition-all text-xs uppercase tracking-wider flex items-center gap-1.5 self-stretch sm:self-auto justify-center cursor-pointer"
          >
            Avançar para Reservar <span className="text-sm">→</span>
          </button>
        </div>
      )}

      {/* Decorative hints */}
      {!isSharedMap && (
        <div className="p-4 bg-primary-container/10 border border-primary-container/20 rounded-xl flex gap-3 select-none">
          <Compass className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-on-surface">💡 Planta Baixa Totalmente Customizável</p>
            <p className="text-on-surface-variant mt-0.5 leading-relaxed">
              Ative o <strong>Modo Layout (Botão 🛠️ ao lado do zoom)</strong> para reorganizar livremente as coordenadas de todas as mesas, excluir mesas indesejadas, criar novas posições de assentos ou editar dados de capacidade e cobrança VIP de forma imediata!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
