import React from 'react';
import './AssetProperty.css';

export default function AddPropertyModal({ open, onClose, onAdd }) {
  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onAdd) onAdd();
  };

  return (
    <div className="AssetProperty-AddModalOverlay">
      <div className="AssetProperty-AddModalBox">
        <form className="AssetProperty-ModalForm" onSubmit={handleSubmit}>
          <div className="AssetProperty-ModalGrid">
            <div>
              <label className="AssetProperty-ModalLabel">PAR No.</label>
              <input className="AssetProperty-ModalInput" type="text" />

              <label className="AssetProperty-ModalLabel">Description</label>
              <textarea className="AssetProperty-ModalInput AssetProperty-ModalTextarea" rows={4} />

              <label className="AssetProperty-ModalLabel">Serial No.</label>
              <input className="AssetProperty-ModalInput" type="text" />

              <label className="AssetProperty-ModalLabel">Date Acquired</label>
              <input className="AssetProperty-ModalInput" type="date" />

              <label className="AssetProperty-ModalLabel">Unit Cost</label>
              <input className="AssetProperty-ModalInput" type="number" step="0.01" />
            </div>
            <div>
              <label className="AssetProperty-ModalLabel">End User</label>
              <input className="AssetProperty-ModalInput" type="text" />

              <label className="AssetProperty-ModalLabel">Estimated Life Use</label>
              <input className="AssetProperty-ModalInput" type="text" placeholder="0 Years" />

              <label className="AssetProperty-ModalLabel">Remarks</label>
              <textarea className="AssetProperty-ModalInput AssetProperty-ModalTextarea" rows={4} />

              <label className="AssetProperty-ModalLabel">Status</label>
              <select className="AssetProperty-ModalInput">
                <option>Select Status</option>
                <option>Active</option>
                <option>Inactive</option>
                <option>Disposed</option>
              </select>
            </div>
          </div>
          <div className="AssetProperty-ModalActions">
            <button type="submit" className="AssetProperty-ModalBtn AssetProperty-ModalBtn--primary">ADD</button>
            <button type="button" className="AssetProperty-ModalBtn AssetProperty-ModalBtn--secondary" onClick={onClose}>CANCEL</button>
          </div>
        </form>
      </div>
    </div>
  );
}
