import React from 'react';
import Modal from './Modal.jsx';

const titleByVariant = {
  info: 'Notice',
  success: 'Success',
  error: 'Something went wrong',
};

const TextDialog = ({ message, variant = 'info', onRequestClose }) => {
  const isOpen = Boolean(message);

  return (
    <Modal
      isOpen={isOpen}
      title={titleByVariant[variant] ?? titleByVariant.info}
      onClose={onRequestClose}
      primaryAction={{
        label: 'OK',
        onClick: onRequestClose,
      }}
    >
      <p className="text-sm text-edueats-textMuted">{message}</p>
    </Modal>
  );
};

export default TextDialog;
