// src/api/notes.js

const API_BASE_URL = "http://localhost:4000";

export async function updateNote(id, data) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`, 
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
     console.error('Server response error:', errorText);
    throw new Error(`Failed to update note: ${response.status} ${response.statusText} - ${errorText}`);
  }
  return await response.json();
}
