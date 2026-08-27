import React, { useState, useEffect } from 'react';
import { AdminDemoListView } from './AdminDemoListView';
import { AdminDemoFormView } from './AdminDemoFormView';
import { DemoItem } from '../types/demo';

interface AdminDemoManagerProps {
  onSuccessToast?: (msg: string) => void;
}

export const AdminDemoManager: React.FC<AdminDemoManagerProps> = ({ onSuccessToast }) => {
  const [demos, setDemos] = useState<DemoItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedDemo, setSelectedDemo] = useState<DemoItem | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const fetchDemos = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/demos');
      if (res.ok) {
        const data = await res.json();
        setDemos(data);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des vidéos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemos();
  }, []);

  const handleOpenCreate = () => {
    setSelectedDemo(null);
    setErrorMsg('');
    setViewMode('create');
  };

  const handleOpenEdit = (demo: DemoItem) => {
    setSelectedDemo(demo);
    setErrorMsg('');
    setViewMode('edit');
  };

  const handleBackToList = () => {
    setSelectedDemo(null);
    setErrorMsg('');
    setViewMode('list');
  };

  const handleSave = async (formData: Partial<DemoItem>) => {
    setErrorMsg('');
    setSaving(true);
    try {
      const payload = {
        title: formData.title?.trim(),
        description: formData.description?.trim(),
        videoUrl: formData.videoUrl?.trim(),
        thumbnailUrl: formData.thumbnailUrl?.trim(),
        category: formData.category || 'Extrait Cours',
        duration: formData.duration?.trim(),
        order: Number(formData.displayOrder || formData.order) || 1,
        displayOrder: Number(formData.displayOrder || formData.order) || 1,
        featured: Boolean(formData.isFeatured ?? formData.featured),
        isFeatured: Boolean(formData.isFeatured ?? formData.featured),
      };

      const url = selectedDemo ? `/api/demos/${selectedDemo.id}` : '/api/demos';
      const method = selectedDemo ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.msg || 'Erreur lors de la sauvegarde.');
      }

      await fetchDemos();
      handleBackToList();
      if (onSuccessToast) {
        onSuccessToast(selectedDemo ? 'Vidéo démo modifiée avec succès !' : 'Nouvelle vidéo démo publiée avec succès !');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Une erreur est survenue.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, demoTitle: string) => {
    if (!window.confirm(`Êtes-vous certain de vouloir supprimer la vidéo "${demoTitle}" ?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/demos/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchDemos();
        if (onSuccessToast) {
          onSuccessToast('Vidéo démo supprimée.');
        }
      } else {
        alert('Erreur lors de la suppression de la vidéo.');
      }
    } catch (err) {
      console.error('Erreur suppression démo:', err);
    }
  };

  if (viewMode === 'create' || viewMode === 'edit') {
    return (
      <AdminDemoFormView
        demoToEdit={selectedDemo}
        onBack={handleBackToList}
        onSave={handleSave}
        saving={saving}
        errorMsg={errorMsg}
      />
    );
  }

  return (
    <AdminDemoListView
      demos={demos}
      loading={loading}
      onCreateClick={handleOpenCreate}
      onEditClick={handleOpenEdit}
      onDeleteClick={handleDelete}
      onRefresh={fetchDemos}
    />
  );
};

export default AdminDemoManager;
