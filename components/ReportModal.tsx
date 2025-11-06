import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  title: string;
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, onSubmit, title }) => {
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    if (reason.trim()) {
      onSubmit(reason);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Please provide a reason for your report..."
          rows={4}
          className="w-full bg-brand-bg border border-brand-surface focus:border-brand-blue focus:ring-brand-blue rounded-md p-2 text-white"
        />
        <div className="flex justify-end space-x-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!reason.trim()}>Submit Report</Button>
        </div>
      </div>
    </Modal>
  );
};

export default ReportModal;