import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface EditorState {
  body: string;
  searchQuery: string;
  editor: any; // Complex object, potentially non-serializable
  setBody: (newBody: string) => void;
  setSearchQuery: (newSearchQuery: string) => void;
  setEditor: (newEditor: any) => void;
}

// Type representing only the serializable part of the state
interface PersistedEditorState {
  body: string;
  searchQuery: string;
}

const useStore = create<EditorState>()(
  persist(
    (set) => ({
      body: '',
      searchQuery: '',
      editor: {}, // Initial value, will not be persisted
      setBody: (newBody: string) => set((state) => ({ ...state, body: newBody })),
      setSearchQuery: (newSearchQuery: string) => set((state) => ({ ...state, searchQuery: newSearchQuery })),
      setEditor: (newEditor: any) => set((state) => ({ ...state, editor: newEditor })),
    }),
    {
      name: 'my-store', // Unique name for localStorage
      storage: {
        getItem: (name) => {
          const value = localStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: (name, value) => localStorage.setItem(name, JSON.stringify(value)),
        removeItem: (name) => localStorage.removeItem(name),
      },
      // Persist only the serializable part of the state
      partialize: (state: EditorState): PersistedEditorState => ({
        body: state.body,
        searchQuery: state.searchQuery,
      }),
    }
  )
);

export default useStore;
