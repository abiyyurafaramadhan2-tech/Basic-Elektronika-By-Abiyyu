import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { AppContextType, PageId, ComponentId } from '../types';

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPageState] = useState<PageId>('home');
  const [ghostActive, setGhostActive] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<ComponentId | null>(null);
  const [currentFlow, setCurrentFlowState] = useState({ voltage: 9, resistance: 100 });

  const setCurrentPage = useCallback((page: PageId) => {
    setCurrentPageState(page);
    setSelectedComponent(null);
  }, []);

  const setCurrentFlow = useCallback((v: { voltage: number; resistance: number }) => {
    setCurrentFlowState(v);
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        ghostActive,
        setGhostActive,
        selectedComponent,
        setSelectedComponent,
        currentFlow,
        setCurrentFlow,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
