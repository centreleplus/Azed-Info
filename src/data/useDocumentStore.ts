import { useState, useEffect } from 'react';
import { initialDocuments } from './mockData';

export function useDocumentStore() {
  const [documents, setDocuments] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('admin_documents');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return initialDocuments;
  });

  useEffect(() => {
    try {
      localStorage.setItem('admin_documents', JSON.stringify(documents));
    } catch (e) {}
  }, [documents]);

  const addDocument = (doc: any) => {
    const tiers = (Array.isArray(doc.allowedTiers) && doc.allowedTiers.length > 0)
      ? doc.allowedTiers
      : ['FREEMIUM'];
    const newDoc = {
      ...doc,
      allowedTiers: tiers,
      accessTiers: tiers,
      tiers: tiers,
      targetTiers: tiers
    };
    setDocuments((prev) => [newDoc, ...prev]);
  };

  return { documents, setDocuments, addDocument };
}

export default useDocumentStore;
