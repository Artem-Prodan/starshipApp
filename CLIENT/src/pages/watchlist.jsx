// src/pages/Watchlist.jsx


import React, { useEffect, useRef, useState } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import WatchlistHeader from './components/Wheader.jsx';

import InCatalogNote from './components/InCatalogNote';
import InCatalogNoteEdit from './components/InCatalogNoteEdit';
import NoteCard from './components/NoteCard.jsx';
import { useCatalog } from '../context/CatalogContext';
import { SwitchTransition, CSSTransition } from 'react-transition-group';
import { updateNote } from '../api/notes.js'; 

const Watchlist = () => {
  const { state, dispatch } = useCatalog();
  const items = state.watchlist;

  const [scrollY, setScrollY] = useState(0);
  const lastScroll = useRef(0);
  const [scrollDirection, setScrollDirection] = useState(null);
  const [openedNote, setOpenedNote] = useState(null);
  const [editingNote, setEditingNote] = useState(null);

  const listRef = useRef(null);

const handleToggleWatchlist = async (e, item) => {
  if (e?.stopPropagation) e.stopPropagation();

  const id = item.clonedFrom || item.id;

   if (!id || Number.isNaN(Number(id))) {
    console.error("❌ Invalid note ID:", id);
    return alert("Error: incorrect note ID");
  }

  try {
    await updateNote(id, { isWatchlisted: false });
    dispatch({ type: 'REMOVE_FROM_WATCHLIST', payload: item.id });
  } catch (err) {
    console.error("Failed to remove from watchlist", err);
    alert("❌ Failed to update watchlist");
  }
};



  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastScroll.current) {
        setScrollDirection('down');
      } else if (currentY < lastScroll.current) {
        setScrollDirection('up');
      }
      setScrollY(currentY);
      lastScroll.current = currentY;
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    setTimeout(() => {
      const scrollable = document.documentElement.scrollHeight > window.innerHeight;
      if (!scrollable) {
        setScrollDirection('up');
      } else {
        window.scrollBy(0, 1);
        window.scrollBy(0, -1);
      }
    }, 50);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function findNoteInAllSources(state, originalId) {
  return (
    state.items.find(n => n.id === originalId) ||
    state.myPicks.find(n => n.clonedFrom === originalId) ||
    state.watchlist.find(n => n.clonedFrom === originalId)
  );
}


  const scale = scrollDirection === 'down' ? 1 : 1.03;
  const translateY = scrollDirection === 'up' && scrollY < 100
    ? (100 - scrollY) * 0.05
    : 0;

  const transitionStyle = 'transform 0.4s ease, opacity 0.3s ease';

  const handleEditNote = (note) => {
    setOpenedNote(null);
    setEditingNote(note);
    setTimeout(() => {
      const editForm = document.querySelector('.edit-note-container');
      if (editForm) {
        editForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 0);
  };

const handleSaveNote = (updatedNote) => {
  const currentClone = state.watchlist.find(n => n.id === updatedNote.id);
  const clonedFrom = currentClone?.clonedFrom;

  const fullNote = {
    ...updatedNote,
    ...(clonedFrom && { clonedFrom }),
    year: updatedNote.year ?? updatedNote.releaseyear ?? '', 
    rating: updatedNote.rating ?? updatedNote.giverating ?? 0    
  };

  dispatch({ type: 'UPDATE_NOTE', payload: fullNote });
  setEditingNote(null);
  setOpenedNote(fullNote);
};




  const handleCancelEdit = () => {
    setEditingNote(null);
    setOpenedNote(editingNote);
  };

  useEffect(() => {
  if (openedNote) {
    const originalId = openedNote.clonedFrom || openedNote.id;
    const fresh = findNoteInAllSources(state, originalId);
    if (fresh) setOpenedNote(fresh);
  }
}, [state]);


  return (
    <div style={{ paddingTop: '20px' }}>
      {!openedNote && !editingNote && (
        <WatchlistHeader scrollY={scrollY} scrollDirection={scrollDirection} />
      )}

      <div
        style={{
          transform: `translateY(${translateY}px) scale(${scale})`,
          transition: transitionStyle,
          padding: '20px',
          minHeight: 'calc(60vh + 60px)'
        }}
      >
        {editingNote ? (
          <InCatalogNoteEdit
            note={editingNote}
            onSave={handleSaveNote}
            onCancel={handleCancelEdit}
          />
        ) : openedNote ? (
          <InCatalogNote
            note={openedNote}
            onBack={() => setOpenedNote(null)}
            onEdit={() => handleEditNote(openedNote)}
          />
        ) : (
          <SwitchTransition mode="out-in">
            <CSSTransition
              key="watchlist"
              nodeRef={listRef}
              timeout={300}
              classNames="catalog"
              unmountOnExit
            >
              <div ref={listRef} className="catalog-grid">
                {items.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="catalog-card note-card"
                    style={{
                      position: 'relative',
                      padding: '10px',
                      marginBottom: '10px',
                      borderRadius: '8px',
                      userSelect: 'none',
                      cursor: 'default'
                    }}
                    onClick={() => setOpenedNote(item)}
                  >
                    <NoteCard
                      item={item}
                      onClick={() => setOpenedNote(item)}
                      bare={true}
                      showTitle={true}
                      showDescription={true}
                      noControls={true}
                      hideHeart={true}
                      hideFilm={false}
                      onToggleWatchlist={(e) => handleToggleWatchlist(e, item)}
                      isInWatchlist={true}
                      rating={item.rating || 0} 
                      onRatingChange={null}
                    />
                  </div>
                ))}
              </div>
            </CSSTransition>
          </SwitchTransition>
        )}
      </div>
     
      <button
        style={{ margin: '20px', visibility: 'hidden' }}
      >
      .
      </button>
    </div>
  );
};

export default Watchlist;
