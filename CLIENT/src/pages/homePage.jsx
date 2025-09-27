// pages/homePage.jsx

import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/navBar.jsx";
import Catalog from "./catalog.jsx";
import MyPicks from "./myPicks.jsx";
import Watchlist from "./watchlist.jsx";
import ProfModal from "../ModalWindows/profModal.jsx";

import { useCatalog } from "../context/CatalogContext";

export default function HomePage({ user, onLogout, onNicknameUpdate }) {
  const [showProfModal, setShowProfModal] = useState(false);

  const { state, dispatch } = useCatalog();

  if (!user) {
    return <div>Loading...</div>;
  }

  // notes in MyPicks
  function toggleMyPicks(noteId) {
    const note = state.items.find(item => item.id === noteId || item.clonedFrom === noteId);
    if (note) {
      dispatch({ type: "TOGGLE_MY_PICKS", payload: note });
    }
  }

  // notes in Watchlist
  function toggleWatchlist(noteId) {
    const note = state.items.find(item => item.id === noteId || item.clonedFrom === noteId);
    if (note) {
      dispatch({ type: "TOGGLE_WATCHLIST", payload: note });
    }
  }

  return (
    <div>
      <NavBar
        username={user.username}
        avatarUrl={user.avatarUrl}
        onProfClick={() => setShowProfModal(true)}
      />
      {showProfModal && (
        <ProfModal
          onClose={() => setShowProfModal(false)}
          user={user}
          onLogout={onLogout}
          onNicknameUpdate={onNicknameUpdate}
        />
      )}

                <Routes>
        <Route index element={<Navigate to="catalog" replace />} />
        <Route path="catalog" element={<Catalog />} />
        <Route
          path="my-picks"
          element={<MyPicks notes={state.myPicks} toggleMyPicks={toggleMyPicks} />}
        />
        <Route
          path="watchlist"
          element={<Watchlist notes={state.watchlist} toggleWatchlist={toggleWatchlist} />}
        />
        {/*redirect*/}
        <Route path="*" element={<Navigate to="/homePage/catalog" replace />} />
      </Routes>

    </div>
  );
}
