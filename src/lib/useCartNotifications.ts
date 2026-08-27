import { useAuth } from '../components/AuthContext';

export interface CartNotificationPayload {
  itemTitle: string;
  targetStudentId: string;
  price?: number;
}

export const useCartNotifications = () => {
  const { user: currentUser } = useAuth();

  const triggerCartNotification = (itemTitle: string, targetStudentId: string) => {
    // ❌ SÉCURITÉ : Ne rien afficher / envoyer si l'utilisateur est un AGENT ou ADMIN
    if (!currentUser) return;
    
    const roleUpper = (currentUser.role || '').toUpperCase();
    if (roleUpper === 'AGENT' || roleUpper === 'ADMIN') {
      return;
    }

    // ❌ SÉCURITÉ : Vérifier que la notification appartient bien à cet élève spécifique
    if (String(currentUser.id) !== String(targetStudentId)) {
      return;
    }

    // ✅ Déclencher la notification uniquement pour l'étudiant concerné
    fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUser.id,
        target_user_id: currentUser.id,
        target_role: 'STUDENT',
        title: 'Article ajouté au panier',
        content: `Vous avez ajouté "${itemTitle}" à votre panier.`,
        type: 'shopping'
      })
    })
      .then(() => {
        window.dispatchEvent(new CustomEvent('refresh-notifications'));
      })
      .catch((err) => {
        console.error('Cart notification trigger failed:', err);
      });
  };

  return { triggerCartNotification, currentUser };
};

export default useCartNotifications;
