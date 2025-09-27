
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { catalogReducer, initialState } from '../reducers/catalogReducer';

const CatalogContext = createContext();

export const CatalogProvider = ({ children }) => {
  const [state, dispatch] = useReducer(catalogReducer, initialState);

  // Load catalog from server if token exists
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadCatalogDataFromServer(dispatch);
    }
  }, []);

  // Caching state in localStorage
  useEffect(() => {
    localStorage.setItem('catalog-items', JSON.stringify(state.items));
    localStorage.setItem('catalog-mypicks', JSON.stringify(state.myPicks));
    localStorage.setItem('catalog-watchlist', JSON.stringify(state.watchlist));
  }, [state.items, state.myPicks, state.watchlist]);

  return (
    <CatalogContext.Provider value={{ state, dispatch }}>
      {children}
    </CatalogContext.Provider>
  );
};

export const useCatalog = () => useContext(CatalogContext);

export async function loadCatalogDataFromServer(dispatch) {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const [notesRes, foldersRes] = await Promise.all([
      fetch("http://localhost:4000/notes", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch("http://localhost:4000/folders", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    const rawNotes = await notesRes.json();
    const rawFolders = await foldersRes.json();

    const notes = rawNotes.map(note => ({
      id: note.id,
      type: 'note',
      title: note.title || 'untitled',
       genre: note.genre ?? '',         
      director: note.director ?? '',  
      rating: note.giverating ?? 0,
      year: note.releaseyear ?? '',
      description: note.comment ?? '',
      folderId: note.folder_id ?? null,
      imageUrl: note.imageurl ?? '',
      isFavorite: note.isfavorite ?? false,
      isWatchlisted: note.iswatchlisted ?? false,
    }));

    const folders = rawFolders.map(folder => ({
      ...folder,
      type: 'folder',
      title: folder.name || 'untitled folder',
    }));

    const allItems = [...folders, ...notes];

    const savedMyPicks = JSON.parse(localStorage.getItem('catalog-mypicks') || '[]');
    const savedWatchlist = JSON.parse(localStorage.getItem('catalog-watchlist') || '[]');

    const fallbackMyPicks = savedMyPicks.length
      ? savedMyPicks
      : notes
          .filter(note => note.isFavorite)
          .map(note => ({
            ...note,
            id: crypto.randomUUID(),
            clonedFrom: note.id,
          }));

    const fallbackWatchlist = savedWatchlist.length
      ? savedWatchlist
      : notes
          .filter(note => note.isWatchlisted)
          .map(note => ({
            ...note,
            id: crypto.randomUUID(),
            clonedFrom: note.id,
          }));

    dispatch({
      type: "LOAD_ALL",
      payload: {
        items: allItems,
        myPicks: fallbackMyPicks,
        watchlist: fallbackWatchlist,
      },
    });
  } catch (error) {
    console.error("Failed to load catalog data:", error);
  }
}
