import React from 'react';
import './AddButton.css';
import { FaStickyNote, FaFolder } from 'react-icons/fa';

const AddButton = ({ onCreateNote, onCreateFolder, isInFolder }) => {
  return (
    <div className={`add-button-container ${isInFolder ? 'in-folder' : ''}`}>
      <button
        className={`round-add-button add-folder-button ${isInFolder ? 'fade-out' : ''}`}
        onClick={onCreateFolder}
      >
        <FaFolder />
      </button>

      <button
        className={`round-add-button add-note-button ${isInFolder ? 'moved-in-folder' : ''}`}
        onClick={onCreateNote}
      >
        <FaStickyNote />
      </button>
    </div>
  );
};

export default AddButton;
