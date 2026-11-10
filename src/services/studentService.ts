import { useState, useEffect, useCallback } from 'react';
import {
  getFileAccessUrl,
  mergeAndPersistDocuments,
  getDeletedDocumentIds,
  clearStudentSessionCache
} from '../utils/documentAccess';
import { filterDocuments, DocumentFilterOptions } from '../utils/documentFilter';

export const deleteStudentFromDB = async (studentId: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/admin/students/${studentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok || (data.success !== undefined && !data.success)) {
      throw new Error(data.message || data.msg || "Échec de la suppression dans la base de données.");
    }

    return true;
  } catch (error) {
    console.error("Erreur deleteStudentFromDB:", error);
    throw error;
  }
};

export async function fetchStudentDocumentsFromDB(
  user: any,
  options?: DocumentFilterOptions,
  signal?: AbortSignal
): Promise<any[]> {
  const userId = String(user?.id || user?._id || '');
  const userGrade = String(user?.grade || user?.level || user?.niveau || '');
  const userStream = String(user?.stream || user?.section || user?.filiere || '');
  const userRole = String(user?.role || 'student');
  const userBadge = String(
    user?.activeBadge ||
      user?.badge ||
      user?.pack ||
      user?.subscriptionPlan ||
      user?.forfait ||
      'FREEMIUM'
  );

  const headers: Record<string, string> = {
    'x-user-id': userId,
    'x-user-grade': userGrade,
    'x-user-section': userStream,
    'x-user-stream': userStream,
    'x-user-role': userRole,
    'x-user-badge': userBadge,
    'x-user-plan': userBadge
  };

  const [studentRes, adminRes] = await Promise.allSettled([
    fetch('/api/student/documents', {
      cache: 'no-store',
      signal,
      headers
    }).then((r) => (r.ok ? r.json() : [])),
    fetch('/api/admin/documents', {
      cache: 'no-store',
      signal
    }).then((r) => (r.ok ? r.json() : []))
  ]);

  const studentDocs =
    studentRes.status === 'fulfilled'
      ? Array.isArray(studentRes.value?.documents)
        ? studentRes.value.documents
        : Array.isArray(studentRes.value)
        ? studentRes.value
        : []
      : [];

  const adminDocs =
    adminRes.status === 'fulfilled'
      ? Array.isArray(adminRes.value?.documents)
        ? adminRes.value.documents
        : Array.isArray(adminRes.value)
        ? adminRes.value
        : []
      : [];

  const merged = mergeAndPersistDocuments([...adminDocs, ...studentDocs]);
  const deletedIds = getDeletedDocumentIds();

  return merged
    .filter((item: any) => item && item.id && !deletedIds.has(String(item.id)))
    .map((item: any) => {
      const resolvedUrl = getFileAccessUrl(item);
      return {
        ...item,
        fileUrl: resolvedUrl,
        videoUrl: resolvedUrl,
        fileData: '',
        blobUrl: ''
      };
    })
    .filter((item: any) => filterDocuments(item, user, options));
}

export function useStudentDocuments(user: any, options?: DocumentFilterOptions) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchStudentDocumentsFromDB(user, options);
      setDocuments(list);
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        setError(err?.message || 'Erreur lors du chargement des documents.');
      }
    } finally {
      setLoading(false);
    }
  }, [user, options]);

  useEffect(() => {
    refetch();
    const handleSync = () => {
      clearStudentSessionCache();
      refetch();
    };
    window.addEventListener('zed-document-sync', handleSync);
    window.addEventListener('zed-documents-updated', handleSync);
    window.addEventListener('realtime-event', handleSync);
    return () => {
      window.removeEventListener('zed-document-sync', handleSync);
      window.removeEventListener('zed-documents-updated', handleSync);
      window.removeEventListener('realtime-event', handleSync);
    };
  }, [refetch]);

  return { documents, loading, error, refetch };
}

