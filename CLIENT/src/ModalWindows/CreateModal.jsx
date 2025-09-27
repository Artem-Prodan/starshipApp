// src/ModalWindows/CreateModal.jsx

import React, { useState, useRef, useEffect } from 'react';
import './CreateModal.css';

const CreateModal = ({ type, folder, onClose, onCreate, existingItems = [] }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalCreateRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalCreateRef.current && !modalCreateRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleSubmit = async () => {
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    const finalTitle = trimmedTitle || generateUniqueName(type, existingItems);
    const token = localStorage.getItem("token");

    if (existingItems.some(item => item.type === type && item.title.trim().toLowerCase() === finalTitle.toLowerCase())) {
      alert("Item with this title already exists.");
      return;
    }

    if (!token) {
      alert("Not authenticated.");
      return;
    }

    setIsSubmitting(true);

    try {
      let payload;

      if (type === "note") {
        const response = await fetch("http://localhost:4000/notes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: finalTitle,
            comment: trimmedDescription || '',
            imageUrl: undefined,
            genre: undefined,
            director: undefined,
            releaseYear: undefined,
            giveRating: undefined,
            folderId: folder?.id ?? null,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Server response:", errorText);
          throw new Error("Failed to create note.");
        }

        const newNote = await response.json();

        // folder_id → folderId
        const transformedNote = {
          ...newNote,
          folderId: newNote.folder_id,
        };

        payload = {
          ...transformedNote,
          type: "note",
          description: transformedNote.comment || '',
          folderId: transformedNote.folderId ?? folder?.id ?? undefined,
        };

      } else if (type === "folder") {
        const response = await fetch("http://localhost:4000/folders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: finalTitle }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Server response:", errorText);
          throw new Error("Failed to create folder.");
        }

        const newFolder = await response.json();
        payload = { id: newFolder.id, title: newFolder.name, type: "folder" };
      }

      onCreate(payload);
      onClose();

    } catch (err) {
      console.error("Creation error:", err.message);
      alert("❌ " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" ref={modalCreateRef}>
        <h2 className="element-title">Create {type === 'note' ? 'Note' : 'Folder'}</h2>

        <input
          type="text"
          placeholder={type === 'note' ? 'Title' : 'Folder title'}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />

        {type === 'note' && (
          <textarea
            className="custom-textarea"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        )}

        <div className="modal-actions">
          <button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create'}
          </button>
          <button onClick={onClose} className="cancel-button">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default CreateModal;

// unique name
function generateUniqueName(type, existingItems) {
  const base = type === 'note' ? 'untitled' : 'untitled folder';
  const usedTitles = new Set(
    existingItems
      .filter(item => item.type === type && item.title.toLowerCase().startsWith(base))
      .map(item => item.title.toLowerCase())
  );

  if (!usedTitles.has(base)) return base;

  let count = 1;
  while (usedTitles.has(`${base} ${count}`)) {
    count++;
  }
  return `${base} ${count}`;
}
