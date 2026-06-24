import { createContext, useContext, useState, useCallback } from "react";

const ModalContext = createContext(null);

/**
 * Supported modal IDs: "proposal" | "sponsor"
 */
export function ModalProvider({ children }) {
  const [activeModal, setActiveModal] = useState(null); // null | "proposal" | "sponsor"

  const openModal  = useCallback((id) => setActiveModal(id), []);
  const closeModal = useCallback(() => setActiveModal(null), []);

  return (
    <ModalContext.Provider value={{ activeModal, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModal must be used inside <ModalProvider>");
  return ctx;
}
