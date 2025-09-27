
// reducer responsible for the logic of state updating

export const initialState = {
  items: [],
  myPicks: [],
  watchlist: [],
};

export function catalogReducer(state, action) {
  switch (action.type) {

  case 'LOAD_ALL': {
  const normalizedItems = (action.payload.items || []).map(item => ({
    ...item,
    rating: item.rating ?? item.giveRating ?? 0,
  }));

  return {
    items: normalizedItems,
    myPicks: action.payload.myPicks ?? state.myPicks, 
    watchlist: action.payload.watchlist ?? state.watchlist,
  };
}



    case 'CREATE_ITEM': {
      const newItem = {
        ...action.payload,
        title:
          action.payload.title && action.payload.title.trim() !== ''
            ? action.payload.title.trim()
            : generateUniqueName(action.payload.type, state.items),
        folderId: action.payload.folderId ?? null,
      };
      return { ...state, items: [...state.items, newItem] };
    }

  case "MOVE_NOTE_TO_FOLDER": {
  const { id, folderId } = action.payload;

  const updateFolderId = (noteList) =>
    noteList.map(note =>
      note.id === id || note.clonedFrom === id
        ? { ...note, folderId }
        : note
    );

  return {
    ...state,
    items: updateFolderId(state.items),
    myPicks: updateFolderId(state.myPicks),
    watchlist: updateFolderId(state.watchlist),
  };
}



    case 'DELETE_FOLDER': {
      const folderId = action.payload;
      return {
        ...state,
        items: state.items.filter(item => item.folderId !== folderId && item.id !== folderId),
        myPicks: state.myPicks.filter(note => note.folderId !== folderId),
        watchlist: state.watchlist.filter(note => note.folderId !== folderId),
      };
    }

    case 'DELETE_NOTE': {
      const noteId = action.payload;
      return {
        ...state,
        items: state.items.filter(item => item.id !== noteId),
        myPicks: state.myPicks.filter(note => note.clonedFrom !== noteId),
        watchlist: state.watchlist.filter(note => note.clonedFrom !== noteId),
      };
    }

   case 'UPDATE_NOTE': {
  const updatedNote = action.payload;
  const originalId = updatedNote.clonedFrom || updatedNote.id;

  const updateFields = {
  title: updatedNote.title,
  genre: updatedNote.genre,
  director: updatedNote.director,
  year: updatedNote.year,
  description: updatedNote.comment,
  image: updatedNote.imageUrl,
  imageUrl: updatedNote.imageUrl,
  rating: updatedNote.giveRating ?? updatedNote.rating ?? 0,
  folderId: updatedNote.folderId ?? updatedNote.folder?.id ?? null,
};


  return {
    ...state,
    items: state.items.map(item =>
      item.id === originalId ? { ...item, ...updateFields } : item
    ),
    myPicks: state.myPicks.map(note =>
      note.clonedFrom === originalId || note.id === updatedNote.id
        ? { ...note, ...updateFields }
        : note
    ),
    watchlist: state.watchlist.map(note =>
      note.clonedFrom === originalId || note.id === updatedNote.id
        ? { ...note, ...updateFields }
        : note
    ),
  };
}



    case 'TOGGLE_MY_PICKS': {
      const existingIndex = state.myPicks.findIndex(
        note => note.clonedFrom === action.payload.id
      );
      if (existingIndex !== -1) {
        const newMyPicks = [...state.myPicks];
        newMyPicks.splice(existingIndex, 1);
        return { ...state, myPicks: newMyPicks };
      } else {
        const newNote = {
          ...action.payload,
          id: crypto.randomUUID(),
          clonedFrom: action.payload.id,
        };
        return { ...state, myPicks: [...state.myPicks, newNote] };
      }
    }

    case 'REMOVE_FROM_MY_PICKS':
      return {
        ...state,
        myPicks: state.myPicks.filter(note => note.id !== action.payload),
      };

    case 'TOGGLE_WATCHLIST': {
      const existingIndex = state.watchlist.findIndex(
        note => note.clonedFrom === action.payload.id
      );
      if (existingIndex >= 0) {
        const updated = [...state.watchlist];
        updated.splice(existingIndex, 1);
        return { ...state, watchlist: updated };
      }
      const clonedNote = {
        ...action.payload,
        id: crypto.randomUUID(),
        clonedFrom: action.payload.id,
      };
      return {
        ...state,
        watchlist: [...state.watchlist, clonedNote],
      };
    }

    case 'REMOVE_FROM_WATCHLIST':
      return {
        ...state,
        watchlist: state.watchlist.filter(note => note.id !== action.payload),
      };

    default:
      return state;
  }
}

function generateUniqueName(type, existingItems) {
  const base = type === 'note' ? 'untitled' : 'untitled folder';
  const usedNames = existingItems
    .filter(item => item.type === type && item.title.startsWith(base))
    .map(item => item.title);

  if (!usedNames.includes(base)) return base;

  let counter = 1;
  while (usedNames.includes(`${base} ${counter}`)) {
    counter++;
  }
  return `${base} ${counter}`;
}


