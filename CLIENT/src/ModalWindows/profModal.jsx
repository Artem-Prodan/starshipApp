// profModal.jsx

import './profModal.css';
import { useState } from 'react';

export default function ProfModal({ onClose, onLogout, user, onNicknameUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState(user.username || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (nickname.trim().length < 2) {
      setError("Nickname must be at least 2 characters.");
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:4000/auth/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nickName: nickname.trim() }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to update nickname");
      }

      const updated = await res.json();
      setIsEditing(false);
      setError('');
      onNicknameUpdate(updated.username);
      window.location.reload();

    } catch (err) {
      console.error("Nickname update error:", err.message);
      setError("❌ " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content scale-in">
        <h2 className="modal-title">Your Profile</h2>
        <img src={user.avatarUrl} alt="avatar" className="profile-avatar" />

        <div className="profile-nickname">
        {isEditing ? (
          <>
            <span className="label-inline">Nickname:</span>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              disabled={saving}
              className="nickname-input"
            />
            <button onClick={handleSave} disabled={saving} className="btn btn-save">Save</button>
            <button onClick={() => setIsEditing(false)} disabled={saving} className="btn btn-cancel">Cancel</button>
          </>
        ) : (
          <>
            <span className="label-inline">Nickname:</span>
            <strong className="nickname-text">{nickname}</strong>
            <button onClick={() => setIsEditing(true)} className="btn btn-edit">Edit</button>
          </>
        )}
      </div>


        {error && <p className="error-message">{error}</p>}

        <div className="button-row">
          <button onClick={onClose} className="btn btn-close">Close</button>
          <button onClick={onLogout} className="btn btn-logout">Log Out</button>
        </div>
      </div>
    </div>
  );
}
