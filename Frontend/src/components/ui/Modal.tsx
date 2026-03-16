import React, { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="ui-modal-overlay">
      <div className="ui-modal-content">
        <button onClick={onClose}>Close</button>
        {children}
      </div>
    </div>
  );
};
