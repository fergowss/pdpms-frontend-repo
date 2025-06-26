import React from 'react';
import './PublicDocument.css';

export default function AddDocumentModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="PublicDocument-ModalOverlay">
      <div className="PublicDocument-ModalBox">
        <form className="PublicDocument-ModalForm">
          <div className="PublicDocument-ModalGrid">
            <div>
              <label className="PublicDocument-ModalLabel">Reference Code</label>
              <input className="PublicDocument-ModalInput" type="text" />
              <label className="PublicDocument-ModalLabel">Subject</label>
              <input className="PublicDocument-ModalInput" type="text" />
              <label className="PublicDocument-ModalLabel">Document Type</label>
              <select className="PublicDocument-ModalInput">
                <option>Select Document Type</option>
                <option>Endorsement</option>
                <option>Memorandum</option>
                <option>Certification</option>
                <option>Application</option>
                <option>Request</option>
                <option>Report</option>
              </select>
              <label className="PublicDocument-ModalLabel">Date</label>
              <input className="PublicDocument-ModalInput" type="date" />
              <label className="PublicDocument-ModalLabel">Date Received</label>
              <input className="PublicDocument-ModalInput" type="date" />
            </div>
            <div>
              <label className="PublicDocument-ModalLabel">Received by</label>
              <input className="PublicDocument-ModalInput" type="text" disabled style={{background:'#e8eef7'}} value="Herson Fergus Arcanghel" />
              <label className="PublicDocument-ModalLabel">Status</label>
              <select className="PublicDocument-ModalInput">
                <option>Select Status</option>
                <option>On Going</option>
                <option>Completed</option>
              </select>
              <label className="PublicDocument-ModalLabel">Remarks</label>
              <textarea className="PublicDocument-ModalInput PublicDocument-ModalTextarea" rows={4} />
              <label className="PublicDocument-ModalLabel">Upload File <span className="PublicDocument-ModalHint">(PDF Only)</span></label>
              <input className="PublicDocument-ModalInput" type="file" accept="application/pdf" />
            </div>
          </div>
          <div className="PublicDocument-ModalActions">
            <button type="submit" className="PublicDocument-ModalBtn PublicDocument-ModalBtn--primary">ADD</button>
            <button type="button" className="PublicDocument-ModalBtn PublicDocument-ModalBtn--secondary" onClick={onClose}>CANCEL</button>
          </div>
        </form>
      </div>
    </div>
  );
}
