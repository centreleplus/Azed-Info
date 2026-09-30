import { useState, useEffect } from 'react';

export const useStudentData = (endpoint: string) => {
  const [data, setData] = useState<any[]>([]); // 🟢 RÈGLE ABSOLUE : Initialisation à un tableau VIDE
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    
    // Requête stricte vers l'API sans donnée de secours (fallback mock)
    fetch(endpoint, { credentials: 'include', headers: { 'Cache-Control': 'no-cache' } })
      .then((res) => res.json())
      .then((resData) => {
        if (isMounted) {
          if (resData && resData.success && Array.isArray(resData.data)) {
            setData(resData.data);
          } else if (resData && resData.success && Array.isArray(resData.courses)) {
            setData(resData.courses);
          } else if (resData && resData.success && Array.isArray(resData.documents)) {
            setData(resData.documents);
          } else if (Array.isArray(resData)) {
            setData(resData);
          } else {
            setData([]); // Si aucune donnée n'est renvoyée, forcer un tableau VIDE
          }
        }
      })
      .catch((err) => {
        console.error(`Erreur chargement ${endpoint}:`, err);
        if (isMounted) setData([]); // Ne JAMAIS charger de mock data en cas d'erreur
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [endpoint]);

  return { data, loading, setData };
};

export default useStudentData;
