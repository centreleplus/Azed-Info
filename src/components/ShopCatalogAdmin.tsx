import React from 'react';
import { AdminBoutiqueCatalog } from './AdminBoutiqueCatalog';
import { Product } from '../types';

export interface ShopCatalogAdminProps {
  products?: Product[];
  onRefresh?: () => void;
  showFeedback?: (message: string, type?: 'success' | 'error') => void;
}

export const ShopCatalogAdmin: React.FC<ShopCatalogAdminProps> = ({
  showFeedback
}) => {
  return (
    <AdminBoutiqueCatalog
      onSuccessToast={(msg) => {
        if (showFeedback) showFeedback(msg, 'success');
      }}
    />
  );
};

export default ShopCatalogAdmin;
