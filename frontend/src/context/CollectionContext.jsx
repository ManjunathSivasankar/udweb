import React, { createContext, useState, useEffect, useContext } from "react";

const CollectionContext = createContext();

export const useCollection = () => useContext(CollectionContext);

export const CollectionProvider = ({ children }) => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000" : "https://my-shop-backend-z7jb.onrender.com");

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetch(`${API_URL}/api/collections`);
        const data = await response.json();
        if (Array.isArray(data)) {
          setCollections(data);
        } else {
          console.error("Failed to load collections:", data);
        }
      } catch (error) {
        console.error("Error fetching collections:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, [API_URL]);

  return (
    <CollectionContext.Provider value={{ collections, loading }}>
      {children}
    </CollectionContext.Provider>
  );
};

