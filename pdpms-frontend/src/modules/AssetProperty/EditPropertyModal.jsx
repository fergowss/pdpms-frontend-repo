import React from 'react';
import './AssetProperty.css';

export default function EditPropertyModal({ open, onClose, row }) {
  if (!open || !row) return null;

  return (
    <div className="AssetProperty-EditModalOverlay">
      <div className="AssetProperty-EditModalBox">
        <form className="AssetProperty-ModalForm">
          <div className="AssetProperty-ModalGrid">
            <div>
              <label className="AssetProperty-ModalLabel">Property No.</label>
              <input className="AssetProperty-ModalInput" type="text" value={row.propertyNo || ''} disabled style={{background:'#e8eef7'}} />

              <label className="AssetProperty-ModalLabel">Document No.</label>
              <input className="AssetProperty-ModalInput" type="text" value={row.documentNo || ''} disabled style={{background:'#e8eef7'}} />

              <label className="AssetProperty-ModalLabel">PAR No.</label>
              <input className="AssetProperty-ModalInput" type="text" value={row.parNo || ''} disabled style={{background:'#e8eef7'}} />

              <label className="AssetProperty-ModalLabel">Description</label>
              <textarea className="AssetProperty-ModalInput AssetProperty-ModalTextarea" rows={3} defaultValue={row.description || ''} />
            </div>
            <div>
              <label className="AssetProperty-ModalLabel">Serial No.</label>
              <input className="AssetProperty-ModalInput" type="text" defaultValue={row.serialNo || ''} />

              <label className="AssetProperty-ModalLabel">Date Acquired</label>
              <input className="AssetProperty-ModalInput" type="date" defaultValue={row.dateAcquired || ''} />

              <label className="AssetProperty-ModalLabel">Unit Cost</label>
              <input className="AssetProperty-ModalInput" type="text" defaultValue={row.unitCost || ''} />

              <label className="AssetProperty-ModalLabel">End User</label>
              <input className="AssetProperty-ModalInput" type="text" defaultValue={row.endUser || ''} />
            </div>
            <div>
              <label className="AssetProperty-ModalLabel">Estimated Life Use</label>
              <input className="AssetProperty-ModalInput" type="text" defaultValue={row.estimatedLife || ''} />

              <label className="AssetProperty-ModalLabel">Status</label>
              <select className="AssetProperty-ModalInput" defaultValue={row.status || ''}>
                <option value="">Select Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="For Repair">For Repair</option>
                <option value="Disposed">Disposed</option>
              </select>

              <label className="AssetProperty-ModalLabel">Remarks</label>
              <textarea className="AssetProperty-ModalInput AssetProperty-ModalTextarea" rows={3} defaultValue={row.remarks || ''} />
            </div>
          </div>
          <div className="AssetProperty-ModalActions">
            <button type="submit" className="AssetProperty-ModalBtn AssetProperty-ModalBtn--primary">UPDATE</button>
            <button type="button" className="AssetProperty-ModalBtn AssetProperty-ModalBtn--secondary" onClick={onClose}>CANCEL</button>
          </div>
        </form>
      </div>
    </div>
  );
}
