// src/pages/components/InCatalogNoteEdit.jsx

import React, { useState, useRef } from 'react';
import './InCatalogNote.css';
import StarRating from './StarRating';

const InCatalogNoteEdit = ({ note, onCancel, onSave }) => {
  const [formData, setFormData] = useState({
  id: note.id,
  title: note.title || '',
  genre: note.genre || '',
  director: note.director || '',
  year: note.year || '',
  description: note.description || '',
  imageUrl: note.imageUrl || note.imageurl || '',
  imagePreview: '',
  imageFile: null,
  folderId: note.folderId ?? null,
  rating: note.giveRating || note.rating || 0,
});


  const fileInputRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        imagePreview: previewUrl,
        imageFile: file
      }));
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSaving(true);

  const token = localStorage.getItem("token");
  let uploadedImageUrl = formData.imageUrl;

  try {
    if (formData.imageFile) {
      const formDataToUpload = new FormData();
      formDataToUpload.append("image", formData.imageFile);

      const uploadRes = await fetch("http://localhost:4000/uploads", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToUpload,
      });

      if (!uploadRes.ok) throw new Error("Image upload failed");

      const data = await uploadRes.json();
      uploadedImageUrl = data.url;
    }

    const cleanedBody = {
  title: formData.title?.trim() || "untitled",
  genre: formData.genre?.trim() || null,
  director: formData.director?.trim() || null,
  releaseYear: formData.year?.toString() || null,
  comment: formData.description?.trim() || "",
  imageUrl: uploadedImageUrl || null,
  giveRating:
    typeof formData.rating === "number" && formData.rating > 0
      ? parseFloat(formData.rating.toFixed(1))
      : null,
  folderId: formData.folderId ?? null,
};


    Object.keys(cleanedBody).forEach(
      (key) => cleanedBody[key] === null && delete cleanedBody[key]
    );

    const targetId = note.clonedFrom || formData.id;

    const res = await fetch(`http://localhost:4000/notes/${targetId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(cleanedBody),
    });

    if (!res.ok) throw new Error("Failed to update note");

    const updatedNote = await res.json();

   onSave({
  ...updatedNote,
  imageUrl: updatedNote.imageurl,
  image: updatedNote.imageurl,
  rating: updatedNote.giveRating ?? formData.rating ?? 0,
  year: updatedNote.releaseYear ?? formData.year,
  folderId: formData.folderId,
});


  } catch (err) {
    console.error("Update error:", err.message);
    alert("❌ " + err.message);
  } finally {
    setIsSaving(false);
  }
};


  return (
    <div className="edit-note-wrapper">
      <i className="fa-solid fa-xmark cancel-edit-icon" title="Cancel editing" onClick={onCancel}></i>
      <div className="edit-note-container">
        <form className="edit-form" onSubmit={handleSubmit}>
          <div className="edit-image-preview" onClick={handleImageClick} title="Click to upload image">
            <img
              src={
                formData.imagePreview ||
                (formData.imageUrl ? `http://localhost:4000${formData.imageUrl}` : '/default_note.jpg')
              }
              alt="Preview"
              className="editable-img"
            />
            <div className="image-overlay">
              <i className="fa-solid fa-plus overlay-icon"></i>
            </div>
          </div>

          <input type="file" accept="image/*" style={{ display: 'none' }} ref={fileInputRef} onChange={handleFileChange} />

          <div className="edit-field"><label>Title :</label><input name="title" value={formData.title} onChange={handleChange} /></div>
          <div className="edit-field"><label>Genre :</label><input name="genre" value={formData.genre} onChange={handleChange} /></div>
          <div className="edit-field"><label>Director/Studio :</label><input name="director" value={formData.director} onChange={handleChange} /></div>
          <div className="edit-field"><label>Year :</label><input name="year" value={formData.year} onChange={handleChange} /></div>

          <div className="edit-field rating-field">
            <label>Rate the title :</label>
            <div className="rating-row">
              <StarRating
                value={formData.rating}
                onChange={(val) => setFormData(prev => ({ ...prev, rating: val }))}
                editable={true}
              />
              <button type="button" className="remove-rating-btn" onClick={() => setFormData(prev => ({ ...prev, rating: 0 }))}>remove rating</button>
            </div>
          </div>

          <div className="edit-field"><label>Comment :</label><textarea name="description" value={formData.description} onChange={handleChange} /></div>

          <div className="edit-buttons">
            <button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InCatalogNoteEdit;
