// src/pages/components/NoteCard.jsx

import React from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './infoPanels/CatInfo.css';
import '../../ModalWindows/CreateModal.css';
import StarRating from './StarRating';


const NoteCard = ({
  item,
  onClick,
  onMoveClick,
  onToggleMyPicks,
  onToggleWatchlist,
  onDelete,
  isInMyPicks,
  isInWatchlist,
  hideHeart = false,
  hideFilm = false,
  bare = false,
  showTitle = true,
  showDescription = true,
  rating = 0,
  onRatingChange = null,
}) => {

  const effectiveRating = item.rating ?? item.giveRating ?? rating ?? 0;

  const handleDelete = async (e) => {
  e.stopPropagation();
  const confirmDelete = window.confirm(`Delete note "${item.title}"?`);
  if (!confirmDelete) return;

  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`http://localhost:4000/notes/${item.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Failed to delete note");

    onDelete?.(item.id); // note ID for dispatch
  } catch (err) {
    console.error("Delete error:", err.message);
    alert("❌ " + err.message);
  }
};


  const content = (
    <>
      {onMoveClick && (
        <i
          className="fa-solid fa-share move-icon"
          onClick={onMoveClick}
          title="Move to folder"
        ></i>
      )}

      {showTitle && item.title && <h4 className="truncated-text">{item.title}</h4>}
      {showDescription && item.description && (
        <p className="truncated-text">{item.description}</p>
      )}

      <div className="rating-wrapper">
        <StarRating
          value={effectiveRating}
          editable={!!onRatingChange}
          onChange={onRatingChange}
        />
      </div>

      <div className="note-icons">
        {!hideHeart && (
          <i
            className={`fas fa-heart ${isInMyPicks ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleMyPicks?.(e, item);
            }}
            title={isInMyPicks ? 'Remove from My Picks' : 'Add to My Picks'}
          ></i>
        )}

        {!hideFilm && (
          <i
            className={`fas fa-film ${isInWatchlist ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleWatchlist?.(e, item);
            }}
            title={isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
          ></i>
        )}

        {onDelete && (
          <i
            className="fa-solid fa-trash"
            title="Delete note"
            onClick={handleDelete}
          ></i>
        )}
      </div>
    </>
  );

  return bare ? content : (
    <div
      className="catalog-card note-card"
      style={{
        position: 'relative',
        padding: '10px',
        paddingBottom: '36px',
        marginBottom: '10px',
        borderRadius: '8px',
        cursor: 'default',
        userSelect: 'none',
      }}
      onClick={onClick}
    >
      {content}
    </div>
  );
};

export default NoteCard;
