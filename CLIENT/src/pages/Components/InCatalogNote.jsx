// src/pages/components/InCatalogNote.jsx

import React, { useState, useEffect, useRef } from 'react';
import './InCatalogNote.css';
import StarRating from './StarRating';

const API_BASE_URL = "http://localhost:4000";

const getImageSrc = (imageUrl, fallbackImage = '/default_note.jpg') => {
  if (!imageUrl) return fallbackImage;
  if (imageUrl.startsWith('/uploads/')) {
    return `${API_BASE_URL}${imageUrl}`;
  }
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  return `${API_BASE_URL}/uploads/${imageUrl}`;
};

const InCatalogNote = ({ note, onBack, onEdit }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const commentRef = useRef(null);
  const [isSingleLine, setIsSingleLine] = useState(false);
  const titleRef = useRef(null);
  const [isTitleSingleLine, setIsTitleSingleLine] = useState(false);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  useEffect(() => {
    const el = commentRef.current;
    if (el) {
      const isOverflow = el.scrollHeight > 100;
      setIsOverflowing(isOverflow);

      const computed = window.getComputedStyle(el);
      const lineHeight = parseFloat(computed.lineHeight || "20");
      const lines = Math.round(el.scrollHeight / lineHeight);
      setIsSingleLine(lines === 1);
    }
  }, [note?.description]);

  useEffect(() => {
    const el = titleRef.current;
    if (el) {
      const hasNoSpaces = !(note?.title || '').includes(' ');
      setIsTitleSingleLine(hasNoSpaces);
    }
  }, [note?.title]);

  if (!note) {
    return (
      <div className="in-note-container">
        <p>No note selected.</p>
      </div>
    );
  }

  console.log("🧾 Current note:", note);

  const {
    title = 'title',
    genre = 'Genre',
    director = 'director/studio',
    year = '',
    description = '',
    folder,
    imageurl,
    image,
    imageUrl = imageurl
  } = note;

  const imageSrc = getImageSrc(imageUrl || image, '/default_note.jpg');

  return (
    <div className="in-note-container">
      <div className="in-note-header">
        <span className="back-arrow" onClick={onBack}>
          ← Back to: {folder || 'Catalog'}
        </span>
        <i
          className="fa-solid fa-pen-to-square edit-icon"
          title="Edit note"
          onClick={onEdit}
        />
      </div>

      <div className="note-body">
        <div className="note-left">
          <img src={imageSrc} alt="Note" className="note-image" />
        </div>

        <div ref={titleRef} className="note-right">
          <h2 className={isTitleSingleLine ? 'single-line-title' : 'multi-line-title'}>
            {title}
          </h2>

          <p><strong>Director/Studio :</strong> {director}</p>
          <p><strong>Genre :</strong> {genre}</p>
          <p><strong>Year :</strong> {year}</p>

          <div style={{ marginTop: '18px', marginBottom: '16px' }}>
            <StarRating value={note.rating || 0} editable={false} />
          </div>

          <div
            className={`comment-wrapper ${isExpanded ? 'expanded' : ''} ${
              isOverflowing && !isExpanded ? 'overflowing' : ''
            }`}
            ref={commentRef}
          >
            <p className="comment"><strong>Comment :</strong></p>
            <div className={`comment-text ${isExpanded ? 'expanded' : ''}`}>
              {description || 'description'}
            </div>
          </div>

          {isOverflowing && (
            <button className="see-more-button" onClick={toggleExpand}>
              {isExpanded ? 'See less' : 'See more'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InCatalogNote;
