import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SideNav } from './components/SideNav';
import { BottomNav } from './components/BottomNav';
import { TableMap } from './components/TableMap';
import { ReservationForm } from './components/ReservationForm';
import { SummaryCard } from './components/SummaryCard';
import { ReservationsView } from './components/ReservationsView';
import { MenuList } from './components/MenuList';
import { SettingsView } from './components/SettingsView';
import { initialTables } from './data/tables';
import { initialDecorations } from './data/decorations';
import { AppView, Reservation, Table, MapDecoration } from './types';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';

export default function App() {
  const [view, setView] = useState<AppView>('map');
  const [mapOnlyMode, setMapOnlyMode] = useState<boolean>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('share') === 'map' || params.get('mapOnly') === 'true';
    } catch (e) {
      return false;
    }
  });

  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  const [tables, setTables] = useState<Table[]>(() => {
    try {
      const saved = localStorage.getItem('sao_joao_tables_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return initialTables;
  });

  const [decorations, setDecorations] = useState<MapDecoration[]>(() => {
    try {
      const saved = localStorage.getItem('sao_joao_decorations_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return initialDecorations;
  });
  
  // Custom store, event names state
  const [storeName, setStoreName] = useState<string>(() => {
    return localStorage.getItem('sao_joao_store_name_v2') || 'Cia do Chopp';
  });
  const [eventName, setEventName] = useState<string>(() => {
    return localStorage.getItem('sao_joao_event_name_v2') || 'São João 2025';
  });
  const [storeWhatsapp, setStoreWhatsapp] = useState<string>(() => {
    return localStorage.getItem('sao_joao_store_whatsapp_v2') || '';
  });

  // Commissioned booking salespeople / agents
  const [agentsList, setAgentsList] = useState<Array<{ name: string, defaultCommission: number }>>(() => {
    try {
      const saved = localStorage.getItem('sao_joao_agents_list_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [
      { name: 'Arthur', defaultCommission: 10 },
      { name: 'Mariana', defaultCommission: 15 },
      { name: 'Carlos', defaultCommission: 12 },
    ];
  });

  const [selectedTableId, setSelectedTableId] = useState<number>(16); // Default table 16 VIP
  const [guests, setGuests] = useState<number>(4);
  const [reservations, setReservations] = useState<Reservation[]>(() => {
    try {
      const saved = localStorage.getItem('sao_joao_reservations_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);

  // Sync states in useEffect cleanly to make local fallback resilient
  useEffect(() => {
    try {
      localStorage.setItem('sao_joao_tables_v2', JSON.stringify(tables));
    } catch (e) {}
  }, [tables]);

  useEffect(() => {
    try {
      localStorage.setItem('sao_joao_decorations_v2', JSON.stringify(decorations));
    } catch (e) {}
  }, [decorations]);

  useEffect(() => {
    try {
      localStorage.setItem('sao_joao_reservations_v2', JSON.stringify(reservations));
    } catch (e) {}
  }, [reservations]);

  useEffect(() => {
    localStorage.setItem('sao_joao_store_name_v2', storeName);
  }, [storeName]);

  useEffect(() => {
    localStorage.setItem('sao_joao_event_name_v2', eventName);
  }, [eventName]);

  useEffect(() => {
    localStorage.setItem('sao_joao_store_whatsapp_v2', storeWhatsapp);
  }, [storeWhatsapp]);

  useEffect(() => {
    try {
      localStorage.setItem('sao_joao_agents_list_v2', JSON.stringify(agentsList));
    } catch (e) {}
  }, [agentsList]);

  // Firestore Real-Time Listener: Configuration
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'config', 'general'), async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.storeName !== undefined) setStoreName(data.storeName);
        if (data.eventName !== undefined) setEventName(data.eventName);
        if (data.storeWhatsapp !== undefined) setStoreWhatsapp(data.storeWhatsapp);
        if (data.agentsList !== undefined) setAgentsList(data.agentsList);
      } else {
        // Bootstrap config document once
        try {
          await setDoc(doc(db, 'config', 'general'), {
            storeName,
            eventName,
            storeWhatsapp,
            agentsList,
          });
        } catch (e) {
          const errMsg = handleFirestoreError(e, OperationType.WRITE, 'config/general');
          setFirebaseError(errMsg);
        }
      }
    }, (error) => {
      const errMsg = handleFirestoreError(error, OperationType.GET, 'config/general');
      setFirebaseError(errMsg);
    });
    return unsub;
  }, []);

  // Firestore Real-Time Listener: Tables
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'tables'), async (snapshot) => {
      if (snapshot.empty) {
        const batch = writeBatch(db);
        initialTables.forEach((t) => {
          const ref = doc(db, 'tables', String(t.id));
          batch.set(ref, t);
        });
        try {
          await batch.commit();
        } catch (e) {
          const errMsg = handleFirestoreError(e, OperationType.WRITE, 'tables');
          setFirebaseError(errMsg);
        }
      } else {
        const list: Table[] = [];
        snapshot.forEach(docSnap => {
          list.push(docSnap.data() as Table);
        });
        list.sort((a, b) => a.id - b.id);
        setTables(list);
      }
    }, (error) => {
      const errMsg = handleFirestoreError(error, OperationType.LIST, 'tables');
      setFirebaseError(errMsg);
    });
    return unsub;
  }, []);

  // Firestore Real-Time Listener: Decorations (Scenarios)
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'decorations'), async (snapshot) => {
      if (snapshot.empty) {
        const batch = writeBatch(db);
        initialDecorations.forEach((d) => {
          const ref = doc(db, 'decorations', d.id);
          batch.set(ref, d);
        });
        try {
          await batch.commit();
        } catch (e) {
          const errMsg = handleFirestoreError(e, OperationType.WRITE, 'decorations');
          setFirebaseError(errMsg);
        }
      } else {
        const list: MapDecoration[] = [];
        snapshot.forEach(docSnap => {
          list.push(docSnap.data() as MapDecoration);
        });
        setDecorations(list);
      }
    }, (error) => {
      const errMsg = handleFirestoreError(error, OperationType.LIST, 'decorations');
      setFirebaseError(errMsg);
    });
    return unsub;
  }, []);

  // Firestore Real-Time Listener: Reservations
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'reservations'), (snapshot) => {
      const list: Reservation[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as Reservation);
      });
      list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setReservations(list);
    }, (error) => {
      const errMsg = handleFirestoreError(error, OperationType.LIST, 'reservations');
      setFirebaseError(errMsg);
    });
    return unsub;
  }, []);

  // Synchronizers pushing individual config updates directly to Firestore
  const handleSetStoreName = async (name: string) => {
    setStoreName(name); // Immediate visual feedback
    try {
      await setDoc(doc(db, 'config', 'general'), { storeName: name }, { merge: true });
    } catch (e) {
      const errMsg = handleFirestoreError(e, OperationType.WRITE, 'config/general');
      setFirebaseError(errMsg);
    }
  };

  const handleSetEventName = async (name: string) => {
    setEventName(name); // Immediate visual feedback
    try {
      await setDoc(doc(db, 'config', 'general'), { eventName: name }, { merge: true });
    } catch (e) {
      const errMsg = handleFirestoreError(e, OperationType.WRITE, 'config/general');
      setFirebaseError(errMsg);
    }
  };

  const handleSetStoreWhatsapp = async (whatsapp: string) => {
    setStoreWhatsapp(whatsapp); // Immediate visual feedback
    try {
      await setDoc(doc(db, 'config', 'general'), { storeWhatsapp: whatsapp }, { merge: true });
    } catch (e) {
      const errMsg = handleFirestoreError(e, OperationType.WRITE, 'config/general');
      setFirebaseError(errMsg);
    }
  };

  const handleUpdateAgentsList = async (agents: Array<{ name: string, defaultCommission: number }>) => {
    setAgentsList(agents); // Immediate visual feedback
    try {
      await setDoc(doc(db, 'config', 'general'), { agentsList: agents }, { merge: true });
    } catch (e) {
      const errMsg = handleFirestoreError(e, OperationType.WRITE, 'config/general');
      setFirebaseError(errMsg);
    }
  };

  // Drag layouts or table state triggers: Calculate only modifications/deletions and apply via write batch
  const handleUpdateTables = async (updater: Table[] | ((prev: Table[]) => Table[])) => {
    const nextTables = typeof updater === 'function' ? updater(tables) : updater;
    setTables(nextTables); // Immediate local update
    try {
      const nextIds = new Set(nextTables.map(t => t.id));
      const batch = writeBatch(db);
      let ops = 0;

      // 1. Created or Updated items
      nextTables.forEach(t => {
        const existingTable = tables.find(curr => curr.id === t.id);
        if (!existingTable || JSON.stringify(existingTable) !== JSON.stringify(t)) {
          batch.set(doc(db, 'tables', String(t.id)), t);
          ops++;
        }
      });

      // 2. Deleted items
      tables.forEach(t => {
        if (!nextIds.has(t.id)) {
          batch.delete(doc(db, 'tables', String(t.id)));
          ops++;
        }
      });

      if (ops > 0) {
        await batch.commit();
      }
    } catch (e) {
      const errMsg = handleFirestoreError(e, OperationType.WRITE, 'tables');
      setFirebaseError(errMsg);
    }
  };

  // Drag backgrounds or custom decorations triggers: Apply via write batch
  const handleUpdateDecorations = async (updater: MapDecoration[] | ((prev: MapDecoration[]) => MapDecoration[])) => {
    const nextDecos = typeof updater === 'function' ? updater(decorations) : updater;
    setDecorations(nextDecos); // Immediate local update
    try {
      const nextIds = new Set(nextDecos.map(d => d.id));
      const batch = writeBatch(db);
      let ops = 0;

      // 1. Set added or updated
      nextDecos.forEach(d => {
        const existingDeco = decorations.find(curr => curr.id === d.id);
        if (!existingDeco || JSON.stringify(existingDeco) !== JSON.stringify(d)) {
          batch.set(doc(db, 'decorations', d.id), d);
          ops++;
        }
      });

      // 2. Delete removed
      decorations.forEach(d => {
        if (!nextIds.has(d.id)) {
          batch.delete(doc(db, 'decorations', d.id));
          ops++;
        }
      });

      if (ops > 0) {
        await batch.commit();
      }
    } catch (e) {
      const errMsg = handleFirestoreError(e, OperationType.WRITE, 'decorations');
      setFirebaseError(errMsg);
    }
  };

  const selectedTable = tables.find(t => t.id === selectedTableId) || tables[0] || initialTables[0];

  const handleSelectTable = (id: number) => {
    setSelectedTableId(id);
    const tbl = tables.find(t => t.id === id);
    if (tbl) {
      setGuests(Math.min(guests, tbl.capacity));
    }
  };

  const handleSubmitReservation = async (
    name: string, 
    phone: string, 
    date: string, 
    time: string, 
    selectedGuests: number,
    bookingFeeCharged: number,
    paymentStatus: 'paid' | 'pending',
    paymentMethod: 'dinheiro' | 'cartao' | 'pix' | 'none',
    agentName: string,
    agentCommission: number
  ) => {
    if (editingReservation) {
      const updatedReservation: Reservation = {
        ...editingReservation,
        name,
        phone,
        date,
        time,
        guests: selectedGuests,
        total: bookingFeeCharged,
        bookingFeeCharged,
        paymentStatus,
        paymentMethod,
        agentName,
        agentCommission
      };

      // Apply optimistic update immediately
      setReservations(prev => prev.map(r => r.id === editingReservation.id ? updatedReservation : r));
      
      if (editingReservation.tableId !== selectedTable.id) {
        setTables(prev => prev.map(t => {
          if (t.id === editingReservation.tableId) return { ...t, status: 'available' };
          if (t.id === selectedTable.id) return { ...t, status: 'reserved' };
          return t;
        }));
      } else {
        setTables(prev => prev.map(t => t.id === selectedTable.id ? { ...t, status: 'reserved' } : t));
      }

      try {
        const batch = writeBatch(db);
        // Save the updated reservation doc
        batch.set(doc(db, 'reservations', editingReservation.id), updatedReservation);

        // If selectedTable has changed, make previous table available and new one reserved
        if (editingReservation.tableId !== selectedTable.id) {
          const oldTable = tables.find(t => t.id === editingReservation.tableId);
          if (oldTable) {
            batch.set(doc(db, 'tables', String(oldTable.id)), { ...oldTable, status: 'available' });
          }
          batch.set(doc(db, 'tables', String(selectedTable.id)), { ...selectedTable, status: 'reserved' });
        } else {
          batch.set(doc(db, 'tables', String(selectedTable.id)), { ...selectedTable, status: 'reserved' });
        }

        await batch.commit();
      } catch (error) {
        const errMsg = handleFirestoreError(error, OperationType.WRITE, 'reservations');
        setFirebaseError(errMsg);
      }

      setEditingReservation(null);
      setView('reservations');
      return;
    }

    const confirmationId = `SJC-${Math.floor(1000 + Math.random() * 9000)}`;

    const newReservation: Reservation = {
      id: confirmationId,
      tableId: selectedTable.id,
      tableName: selectedTable.name,
      area: selectedTable.area,
      date,
      time,
      guests: selectedGuests,
      name,
      phone,
      total: bookingFeeCharged,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      paymentStatus,
      paymentMethod,
      agentName,
      agentCommission,
      bookingFeeCharged
    };

    // Apply optimistic update immediately
    setReservations(prev => [newReservation, ...prev]);
    if (selectedTable) {
      setTables(prev => prev.map(t => t.id === selectedTable.id ? { ...t, status: 'reserved' } : t));
    }

    try {
      const batch = writeBatch(db);
      // Upload confirmation reservation doc
      batch.set(doc(db, 'reservations', confirmationId), newReservation);
      // Update linked table status
      if (selectedTable) {
        batch.set(doc(db, 'tables', String(selectedTable.id)), { ...selectedTable, status: 'reserved' });
      }
      await batch.commit();
    } catch (error) {
      const errMsg = handleFirestoreError(error, OperationType.WRITE, 'reservations');
      setFirebaseError(errMsg);
    }

    setView('reservations');
  };

  const handleEditReservation = (id: string) => {
    const reservationToEdit = reservations.find(r => r.id === id);
    if (!reservationToEdit) return;

    setEditingReservation(reservationToEdit);
    setSelectedTableId(reservationToEdit.tableId);
    setGuests(reservationToEdit.guests);
    setView('form');
  };

  const handleCancelReservation = async (id: string) => {
    const targetReservation = reservations.find(r => r.id === id);
    if (!targetReservation) return;

    // Apply optimistic update immediately
    setReservations(prev => prev.filter(r => r.id !== id));
    setTables(prev => prev.map(t => t.id === targetReservation.tableId ? { ...t, status: 'available' } : t));

    try {
      const batch = writeBatch(db);
      // Delete reservation doc
      batch.delete(doc(db, 'reservations', id));
      
      // Make table available again
      const table = tables.find(t => t.id === targetReservation.tableId);
      if (table) {
        batch.set(doc(db, 'tables', String(table.id)), { ...table, status: 'available' });
      }

      await batch.commit();
    } catch (error) {
      const errMsg = handleFirestoreError(error, OperationType.DELETE, `reservations/${id}`);
      setFirebaseError(errMsg);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface">
      {!mapOnlyMode && (
        <Header 
          currentView={view} 
          setView={setView} 
          reservationsCount={reservations.filter(r => r.status === 'confirmed').length}
          storeName={storeName}
          eventName={eventName}
        />
      )}
      
      {!mapOnlyMode && (
        <SideNav 
          currentView={view} 
          setView={setView} 
          storeName={storeName}
          eventName={eventName}
        />
      )}
      
      <main className={`${mapOnlyMode ? 'pt-6 pb-20 px-4 md:px-6' : 'md:ml-64 pt-24 pb-28 px-4 md:px-8'} max-w-[1240px] mx-auto w-full`}>
        {mapOnlyMode && (
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-center bg-surface-container-low border border-outline-variant rounded-2xl p-4 gap-4 animate-fade-in shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏕️</span>
              <div>
                <h2 className="text-base font-extrabold text-secondary uppercase tracking-tight">{storeName}</h2>
                <p className="text-xs text-on-surface-variant font-semibold">{eventName} — Mapa Físico e Disponibilidade das Mesas</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              <span className="text-xs font-bold text-green-700 uppercase tracking-widest">Tempo Real</span>
              
              {!(typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('share') === 'map') && (
                <button 
                  onClick={() => setMapOnlyMode(false)}
                  className="ml-3 px-3 py-1.5 bg-surface text-on-surface hover:bg-surface-container-high border border-outline text-[11px] font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  Voltar para o Painel ⚙️
                </button>
              )}
            </div>
          </div>
        )}
        
        {firebaseError && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 flex items-start gap-3 shadow-xs animate-fade-in relative">
            <span className="text-sm">⚠️</span>
            <div className="flex-1">
              <p className="font-bold mb-1">Modo Offline Ativado (Armazenamento Local) 📂</p>
              <p className="leading-relaxed">
                As configurações e reservas estão sendo salvas localmente no seu navegador. Não foi possível sincronizar com o banco de dados Firebase devido a restrições de permissão ou conexão pendente. 
              </p>
              <details className="mt-2 text-[10px] text-amber-700 font-mono bg-amber-100/50 p-2 rounded border border-amber-200">
                <summary className="cursor-pointer font-bold select-none mb-1">Ver detalhes técnicos do erro</summary>
                {firebaseError}
              </details>
              <p className="mt-2 font-semibold">
                💡 Dica: Verifique se o seu banco de dados Firestore no console do Firebase (projeto ID: <span className="font-mono">mapareserva-fed01</span>) está ativo, e se as Regras de Segurança permitem leituras e gravações.
              </p>
            </div>
            <button 
              onClick={() => setFirebaseError(null)} 
              className="absolute top-2 right-2 p-1 text-amber-400 hover:text-amber-600 text-sm font-bold cursor-pointer"
              title="Dispensar aviso"
            >
              ×
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Main Action View Switcher */}
          {mapOnlyMode ? (
            <>
              <TableMap 
                tables={tables} 
                selectedTableId={selectedTableId} 
                onSelectTable={handleSelectTable} 
                setView={setView} 
                onUpdateTables={handleUpdateTables}
                decorations={decorations}
                onUpdateDecorations={handleUpdateDecorations}
                storeWhatsapp={storeWhatsapp}
                storeName={storeName}
                eventName={eventName}
              />
            </>
          ) : (
            <>
              {view === 'map' && (
                <>
                  <TableMap 
                    tables={tables} 
                    selectedTableId={selectedTableId} 
                    onSelectTable={handleSelectTable} 
                    setView={setView} 
                    onUpdateTables={handleUpdateTables}
                    decorations={decorations}
                    onUpdateDecorations={handleUpdateDecorations}
                    storeWhatsapp={storeWhatsapp}
                    storeName={storeName}
                    eventName={eventName}
                  />
                  <SummaryCard selectedTable={selectedTable} guestsCount={guests} />
                </>
              )}

              {view === 'form' && (
                <>
                  <ReservationForm 
                    selectedTable={selectedTable} 
                    guests={guests} 
                    setGuests={setGuests} 
                    onSubmitReservation={handleSubmitReservation} 
                    onBackToMap={() => {
                      setEditingReservation(null);
                      setView('map');
                    }}
                    agentsList={agentsList}
                    editingReservation={editingReservation}
                  />
                  <SummaryCard selectedTable={selectedTable} guestsCount={guests} />
                </>
              )}

              {view === 'reservations' && (
                <ReservationsView 
                  reservations={reservations} 
                  tables={tables} 
                  onCancelReservation={handleCancelReservation} 
                  onEditReservation={handleEditReservation}
                  onGoToMap={() => setView('map')} 
                  storeName={storeName}
                  eventName={eventName}
                />
              )}

              {view === 'menu' && (
                <MenuList />
              )}

              {view === 'settings' && (
                <SettingsView 
                  storeName={storeName}
                  setStoreName={handleSetStoreName}
                  eventName={eventName}
                  setEventName={handleSetEventName}
                  storeWhatsapp={storeWhatsapp}
                  setStoreWhatsapp={handleSetStoreWhatsapp}
                  agentsList={agentsList}
                  onUpdateAgents={handleUpdateAgentsList}
                />
              )}
            </>
          )}

        </div>
      </main>

      {!mapOnlyMode && <BottomNav currentView={view} setView={setView} />}
    </div>
  );
}
