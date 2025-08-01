"use client";

import { useState, useEffect } from "react";

interface JsonItem {
  id: string;
  isNew?: boolean; // flag to detect new entries
}

export default function Home() {
  const [items, setItems] = useState<JsonItem[]>([]);
  const [newId, setNewId] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  // Fetch latest gist JSON from GitHub API
  useEffect(() => {
    const fetchGist = async () => {
      try {
        const response = await fetch(
          "https://api.github.com/gists/478e7b10fade2d4953b2563c6319490b"
        );
        const data = await response.json();

        const jsonContent = data.files["viditest.json"].content;
        const parsedData: JsonItem[] = JSON.parse(jsonContent);

        // Mark all existing items as not new (read-only)
        const existingItems = parsedData.map((item) => ({
          ...item,
          isNew: false,
        }));

        setItems(existingItems);
      } catch (err) {
        console.error("Error fetching gist:", err);
      }
    };

    fetchGist();
  }, []);

  // Add a new ID
  const addItem = () => {
    if (!newId.trim()) return;
    setItems([...items, { id: newId.trim(), isNew: true }]);
    setNewId("");
  };

  // Delete an ID
  const deleteItem = (index: number) => {
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  // Update Gist (save all items to Gist)
  const updateGist = async () => {
    try {
      // Strip isNew before sending to Gist
      const gistData = items.map(({ id }) => ({ id }));

      const response = await fetch("/api/update-gist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonData: gistData }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("✅ Gist updated successfully!");

        // Refresh latest data from GitHub API after save
        const latest = await fetch(
          "https://api.github.com/gists/478e7b10fade2d4953b2563c6319490b"
        );
        const latestData = await latest.json();
        const jsonContent = latestData.files["viditest.json"].content;
        const refreshedItems: JsonItem[] = JSON.parse(jsonContent).map(
          (item) => ({ ...item, isNew: false })
        );
        setItems(refreshedItems);
      } else {
        setMessage("❌ Error: " + data.error);
      }
    } catch (err: any) {
      setMessage("❌ Error: " + err.message);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Klaviyo Custom Feed please enter the variant or product id here</h1>

      <ul>
        {items.map((item, index) => (
          <li key={index} style={{ marginBottom: 8 }}>
            <input
              type="text"
              value={item.id}
              readOnly={!item.isNew} // Existing IDs are read-only
              onChange={(e) => {
                if (item.isNew) {
                  const updated = [...items];
                  updated[index].id = e.target.value;
                  setItems(updated);
                }
              }}
              style={{
                marginRight: 10,
                backgroundColor: item.isNew ? "white" : "#f0f0f0",
                cursor: item.isNew ? "text" : "not-allowed",
              }}
            />
            <button onClick={() => deleteItem(index)}>❌ Delete</button>
          </li>
        ))}
      </ul>

      <div style={{ marginTop: 10 }}>
        <input
          type="text"
          placeholder="Enter new ID"
          value={newId}
          onChange={(e) => setNewId(e.target.value)}
          style={{ marginRight: 10 }}
        />
        <button onClick={addItem}>➕ Add</button>
      </div>

      <div style={{ marginTop: 20 }}>
        <button onClick={updateGist}>💾 Update Gist</button>
      </div>

      <p>{message}</p>
    </div>
  );
}
