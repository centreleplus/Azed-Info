import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  title: string;
  price: number;
  [key: string]: any; // Conserve les autres propriétés du produit
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: CartItem) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    // 1. DÉDOUBLONNAGE AUTO À L'INITIALISATION (LocalStorage / Hydratation)
    const savedCart = localStorage.getItem('azed_cart');
    if (savedCart) {
      try {
        const parsed: CartItem[] = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          // Conserver uniquement la première occurrence de chaque produit
          return Array.from(new Map(parsed.map(item => [item.id, { ...item, quantity: 1 }])).values());
        }
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Synchronisation sécurisée avec le LocalStorage
  useEffect(() => {
    localStorage.setItem('azed_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // 2. AJOUT SÉCURISÉ : EMPÊCHER LES DOUBLONS
  const addToCart = (product: CartItem) => {
    setCartItems((prevItems) => {
      // Vérifier si le produit existe déjà dans le panier
      const exists = prevItems.some((item) => String(item.id) === String(product.id));

      if (exists) {
        // Le produit existe déjà : on retourne le tableau inchangé (1 seule occurrence conservée)
        return prevItems;
      }

      // Si le produit n'existe pas, on l'ajoute avec quantité = 1
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => String(item.id) !== String(productId)));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart doit être utilisé à l'intérieur de CartProvider");
  }
  return context;
};

export default CartContext;
