import React from 'react';
import './PublicDocument.css';

export default function EditDocumentModal({ open, onClose, doc }) {
  if (!open || !doc) return null;
  return (
    <div className="PublicDocument-ModalOverlay">
      <div className="PublicDocument-ModalBox">
        <form className="PublicDocument-ModalForm">
          <div className="PublicDocument-ModalGrid">
            <div>
              <label className="PublicDocument-ModalLabel">Document ID</label>
              <input className="PublicDocument-ModalInput" type="text" value={doc.id || 'PDID000000459'} disabled style={{background:'#f2f4f8'}} />
              <label className="PublicDocument-ModalLabel">Reference Code</label>
              <input className="PublicDocument-ModalInput" type="text" defaultValue={doc.ref || 'PDID000000459'} />
              <label className="PublicDocument-ModalLabel">Subject</label>
              <input className="PublicDocument-ModalInput" type="text" value={doc.subject || 'Intern Application'} disabled style={{background:'#f2f4f8'}} />
              <label className="PublicDocument-ModalLabel">Document Type</label>
              <select className="PublicDocument-ModalInput" value={doc.type || 'Memorandum'} disabled style={{background:'#f2f4f8'}}>
                <option>Endorsement</option>
                <option>Memorandum</option>
                <option>Certification</option>
                <option>Application</option>
                <option>Request</option>
                <option>Report</option>
              </select>
              <label className="PublicDocument-ModalLabel">Date</label>
              <input className="PublicDocument-ModalInput" type="text" value={doc.date || '10/06/23'} />
              <label className="PublicDocument-ModalLabel">Date Received</label>
              <input className="PublicDocument-ModalInput" type="text" value={doc.received || '05/12/25'} />
            </div>
            <div>
              <label className="PublicDocument-ModalLabel">Received by</label>
              <input className="PublicDocument-ModalInput" type="text" value={doc.receivedBy || 'Edwin Agustin'} disabled style={{background:'#f2f4f8'}} />
              <label className="PublicDocument-ModalLabel">Status</label>
              <select className="PublicDocument-ModalInput" defaultValue={doc.status || 'Completed'}>
                <option>On Going</option>
                <option>Completed</option>
              </select>
              <label className="PublicDocument-ModalLabel">Remarks</label>
              <textarea className="PublicDocument-ModalInput PublicDocument-ModalTextarea" rows={4} defaultValue={doc.remarks || 'Must be presented to DILG in June 30, 2026'} />
              <label className="PublicDocument-ModalLabel">Upload File <span className="PublicDocument-ModalHint">(PDF Only)</span></label>
              <input className="PublicDocument-ModalInput" type="text" value={doc.fileName || 'PubDoc2121.pdf'} disabled style={{background:'#f2f4f8'}} />
            </div>
          </div>
          <div className="PublicDocument-ModalActions">
            <button type="submit" className="PublicDocument-ModalBtn PublicDocument-ModalBtn--primary">UPDATE</button>
            <button type="button" className="PublicDocument-ModalBtn PublicDocument-ModalBtn--secondary" onClick={onClose}>CANCEL</button>
          </div>
        </form>
      </div>
    </div>
  );
}
