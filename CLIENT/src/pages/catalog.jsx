// src/pages/catalog.jsx

import React, { useEffect, useRef, useState } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css'; //icons
import CatalogHeader from './components/catHeader.jsx';
import CatalogInfoPanel from './components/infoPanels/CatInfo.jsx';
import AddButton from './components/AddButton.jsx';
import CreateModal from '../ModalWindows/CreateModal.jsx';
import '../ModalWindows/CreateModal.css';
import { SwitchTransition, CSSTransition } from 'react-transition-group';
import "./components/infoPanels/CatInfo.css"
import InCatalogNote from './components/InCatalogNote';
import InCatalogNoteEdit from './components/InCatalogNoteEdit';
import NoteCard from './components/NoteCard.jsx';

import { useCatalog } from '../context/CatalogContext';

const Catalog = () => {
  const { state, dispatch } = useCatalog();
  const { items } = state;

  const [modalType, setModalType] = useState(null);
  const [scrollY, setScrollY] = useState(0);
  const lastScroll = useRef(0);
  const [scrollDirection, setScrollDirection] = useState(null);
  const [movingMenuOpen, setMovingMenuOpen] = useState(null);
  const [movingInProgress, setMovingInProgress] = useState(false);

  const menuRef = useRef(null);
  const infoPanelRef = useRef(null);
  const folderHeaderRef = useRef(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const [openedFolder, setOpenedFolder] = useState(null);
  const [openedNote, setOpenedNote] = useState(null);
  const [editingNote, setEditingNote] = useState(null); 

  const catalogRef = useRef(null);
  const folderRef = useRef(null);

  //click outside moving menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (movingMenuOpen !== null && menuRef.current && !menuRef.current.contains(event.target)) {
        setMovingMenuOpen(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [movingMenuOpen]);

  //scroll handling
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

  const scale = scrollDirection === 'down' ? 1 : 1.03;
  const translateY = scrollDirection === 'up' && scrollY < 100
    ? (100 - scrollY) * 0.05
    : 0;

  const transitionStyle = 'transform 0.4s ease, opacity 0.3s ease';

  //Creation handling
  const handleCreate = (item) => {
    const trimmedTitle = item.title.trim();

    const exists = state.items.some(i =>
      i.type === item.type && i.title.trim() === trimmedTitle
    );

    if (exists) {
      alert(`${item.type === 'folder' ? 'Folder' : 'Note'} with this name already exists.`);
      return;
    }

    dispatch({
      type: 'CREATE_ITEM',
      payload: {
        ...item,
        // null if we are outside the folder
        folderId: item.folderId ?? null
      }
    });
    setModalType(null);
  };


async function handleMoveToFolder(id, folderId) {
  try {
    const token = localStorage.getItem("token");

    const data = {
      folderId: folderId,
    };

    console.log("Sending PATCH to server:", data);

    const response = await fetch(`http://localhost:4000/notes/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errData = await response.text();
      throw new Error("Server error: " + errData);
    }

    dispatch({ type: "MOVE_NOTE_TO_FOLDER", payload: { id, folderId } });

  } catch (err) {
    console.error("Move error full:", err);
    alert("❌ Failed to move note: " + err.message);
  } finally {
    setMovingInProgress(false);
    setMovingMenuOpen(null);
  }
}




  const handleCreateNote = () => setModalType({ type: 'note', folder: openedFolder }); //during note creaition inside the folder, note get link to current folder
  const handleCreateFolder = () => setModalType({type:'folder'});
  

    // Handle note editing
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
    dispatch({ type: 'UPDATE_NOTE', payload: updatedNote });
    
    setEditingNote(null);
    setOpenedNote(updatedNote);
  };
  const handleCancelEdit = () => {
    setEditingNote(null);
    setOpenedNote(editingNote);
  };

  function findNoteInAllSources(state, originalId) {
  return (
    state.items.find(n => n.id === originalId) ||
    state.myPicks.find(n => n.clonedFrom === originalId) ||
    state.watchlist.find(n => n.clonedFrom === originalId)
  );
}


useEffect(() => {
  if (openedNote) {
    const originalId = openedNote.clonedFrom || openedNote.id;
    const fresh = findNoteInAllSources(state, originalId);
    if (fresh) setOpenedNote(fresh);
  }
}, [state]);



async function updateNote(id, fields) {
  const token = localStorage.getItem("token");
  const response = await fetch(`http://localhost:4000/notes/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(fields),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update note");
  }

  return await response.json();
}

  const MoveToMenu = ({ folders, onMove, currentFolder }) => (
  <div className="move-menu">
    <p className="menu-label">Move to:</p>
    {folders.length === 0 && !currentFolder ? (
      <p className="no-folders">No folders to move</p>
    ) : (
      <div className="folder-list-scroll">
        <ul>
          {currentFolder && (
            <li
              onClick={() => onMove(null)}
              className="truncated-text"
              style={{ fontStyle: 'italic', color: '#444', cursor: 'pointer' }}
              title="Move back to Catalog"
            >
              &laquo;&laquo; Back to Catalog
            </li>
          )}
          {folders.map(folder => (
            <li
              key={folder.id}
              onClick={() => onMove(folder.id)}
              className="truncated-text"
              style={{ cursor: 'pointer' }}
            >
              {folder.title}
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);


//Add to MyPicks and Watchlist
const handleToggleMyPicks = async (note, e) => {
  e.stopPropagation();
  const isNowFavorite = !state.myPicks.some(n => n.clonedFrom === note.id);

  try {
    await updateNote(note.id, { isFavorite: isNowFavorite });
    dispatch({ type: 'TOGGLE_MY_PICKS', payload: note });
  } catch (err) {
    console.error("Favorite toggle error:", err.message);
    alert("❌ Failed to update favorites");
  }
};


const handleToggleWatchlist = async (note, e) => {
  e.stopPropagation();
  const isNowWatchlisted = !state.watchlist.some(n => n.clonedFrom === note.id);

  try {
    await updateNote(note.id, { isWatchlisted: isNowWatchlisted });
    dispatch({ type: 'TOGGLE_WATCHLIST', payload: note });
  } catch (err) {
    console.error("Watchlist toggle error:", err.message);
    alert("❌ Failed to update watchlist");
  }
};


  const displayedItems = openedFolder
    ? items.filter(i => i.folderId === openedFolder)
    : items.filter(i => !i.folderId);


  return (
    <div style={{ paddingTop: '20px' }}>
     
      {!openedNote && !editingNote &&(
  <>
    <CSSTransition
      nodeRef={infoPanelRef}
      in={!openedFolder}
      timeout={300}
      classNames="info-panel"
      unmountOnExit
    >
      <div ref={infoPanelRef}>
        <CatalogInfoPanel
          notesCount={items.filter(i => i.type === 'note').length}
          foldersCount={items.filter(i => i.type === 'folder').length}
          ratedTitlesCount={0}
        />
      </div>
    </CSSTransition>

    <CatalogHeader scrollY={scrollY} scrollDirection={scrollDirection} />
  </>
)}


      {/* folder navigation panel */}
      <CSSTransition
        in={!!openedFolder}
        timeout={300}
        classNames="folder-header"
        unmountOnExit
        nodeRef={folderHeaderRef}
      >



        <div
          ref={folderHeaderRef}
          className="folder-header"
        >
          <span className='back-to-arrow'> ←</span>{' '}
           <span
          className='back-to-catalog'
          onClick={() => setOpenedFolder(null)}
        >
             Back to Catalog
        </span > {' '} 
        <span className='back-to-is-openfolder'>
          / {items.find(f => f.id === openedFolder)?.title || ''}
          </span>
        </div>


      </CSSTransition>


      {/* catalog content container */}
      <div
        style={{
          transform: `translateY(${translateY}px) scale(${scale})`,
          transition: transitionStyle,
          padding: '20px',
          minHeight: 'calc(60vh + 60px)'
        }}
      >

        {/*/////////// catalog and content (transition handling)////////////////*/}

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
            key={openedFolder ? 'folder' : 'catalog'}
            nodeRef={openedFolder ? folderRef : catalogRef}
            timeout={300}
            classNames={openedFolder ? 'folder' : 'catalog'}
            unmountOnExit
          >
            <div ref={openedFolder ? folderRef : catalogRef} className="catalog-grid">
              {displayedItems.map((item, index) => (
               
               <div
                  key={item.id || index}
                   className={`catalog-card ${item.type === 'folder' ? 'folder-card' : 'note-card'}`}
                  style={{
                    position: 'relative',
                    padding: '10px',
                    marginBottom: '10px',
                    borderRadius: '8px',
                    cursor: item.type === 'folder' ? 'pointer' : 'default',
                    userSelect: 'none'
                  }}
                 
                 onClick={(e) => {
                if (movingMenuOpen === (item.id || index)) return; // blockink open note during moving to folder
                if (item.type === 'folder') {
                  setOpenedFolder(item.id);
                } else if (item.type === 'note') {
                  setOpenedNote(item);
                }
              }}

                >

                  <h4 className="truncated-text">{item.title}</h4>
                  {item.description && (<p className="truncated-text">{item.description}</p>)}


                  {item.type === "folder" && (
                    <>
                    <p className='folder-content-count'>
                     content: {items.filter(i => i.type === "note" && i.folderId === item.id).length}
                    </p>
                    <i
                      className="fa-solid fa-trash note-icons folder-del"
                      title="Delete folder"
                      onClick={async (e) => {
                        e.stopPropagation();
                        const confirmDelete = window.confirm(`Delete folder "${item.title}" and all its notes?`);
                        if (!confirmDelete) return;

                        const token = localStorage.getItem("token");
                        try {
                          const res = await fetch(`http://localhost:4000/folders/${item.id}`, {
                            method: "DELETE",
                            headers: {
                              Authorization: `Bearer ${token}`,
                            },
                          });

                          if (!res.ok) {
                            const err = await res.json();
                            throw new Error(err.message || "Failed to delete folder");
                          }

                          dispatch({ type: 'DELETE_FOLDER', payload: item.id });

                        } catch (err) {
                          console.error("Delete folder error:", err.message);
                          alert("❌ " + err.message);
                        }
                      }}
                    ></i>

                  </>
                  )}

     
                  {item.type === 'note' && (
                    <NoteCard
                      item={item}
                      onClick={(e) => {
                        if (movingMenuOpen === (item.id || index)) return;
                        setOpenedNote(item);
                      }}
                      onMoveClick={(e) => {
                        e.stopPropagation();
                        const rect = e.currentTarget.getBoundingClientRect();
                        setMenuPosition({
                          top: rect.bottom + window.scrollY - 250,
                          left: rect.right + window.scrollX + 10
                        });
                        setMovingMenuOpen(item.id || index);
                      }}
                      onToggleMyPicks={(e) => handleToggleMyPicks(item, e)}
                      onToggleWatchlist={(e) => handleToggleWatchlist(item, e)}
                      onDelete={(id) => dispatch({ type: 'DELETE_NOTE', payload: id })}
                        isInMyPicks={state.myPicks.some(n => n.clonedFrom === item.id)}
                        isInWatchlist={state.watchlist.some(n => n.clonedFrom === item.id)}
                        bare={true}
                        showTitle={false}
                        showDescription={false}
                        rating={item.rating ?? item.giveRating ?? 0}
                        onRatingChange={null}
                      />
                    )}




                  {movingMenuOpen === (item.id || index) && (
                    <div
                      ref={menuRef}
                      className="move-menu-wrapper"
                      style={{
                        position: 'fixed',
                        top: `${menuPosition.top}px`,
                        left: `${menuPosition.left}px`,
                        zIndex: 1000
                      }}
                    >
                      <MoveToMenu
                        folders={items.filter(i => i.type === 'folder' && i.id !== item.folderId)}
                        onMove={folderId => handleMoveToFolder(item.id, folderId)}
                        currentFolder={item.folderId}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CSSTransition>
        </SwitchTransition>
      )}

      {/*////////////////////////////////////////////////////////////////////////*/}

      </div>

      {!openedNote && !editingNote &&(
      <AddButton
        onCreateNote={handleCreateNote}
        onCreateFolder={handleCreateFolder}
        isInFolder={!!openedFolder}
      />
    )}

      {modalType && (
        <CreateModal
          type={modalType.type}
          folder={
            modalType.type === 'note'
              ? state.items.find(i => i.type === 'folder' && i.title === modalType.folder) || null
              : null
          }
          onClose={() => setModalType(null)}
          onCreate={handleCreate}
          existingItems={state.items}
        />
      )}



      <button
      style={{ margin: '20px', visibility: 'hidden' }}>
      .</button>
    </div>
  );
};

export default Catalog;
