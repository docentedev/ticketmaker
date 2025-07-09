import { useState } from 'react';

export interface ModalState {
  isOpen: boolean;
  title: string;
  content: React.ReactNode;
  type: 'info' | 'success' | 'error' | 'warning';
}

export const useModal = () => {
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    title: '',
    content: null,
    type: 'info'
  });

  const showModal = (
    title: string, 
    content: React.ReactNode, 
    type: 'info' | 'success' | 'error' | 'warning' = 'info'
  ) => {
    setModal({
      isOpen: true,
      title,
      content,
      type
    });
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  return {
    modal,
    showModal,
    closeModal
  };
};
