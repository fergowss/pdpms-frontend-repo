import React, { useState } from 'react';
import AddDocumentModal from './AddDocumentModal';
import EditDocumentModal from './EditDocumentModal';
import './PublicDocument.css';

const allData = [
  {
    id: 'PDID00000303', ref: 'ENDR000025', subject: 'Assistance Survey', type: 'Endorsement', date: '06/12/23', received: '02/14/25', remarks: 'Received by June Castro', status: 'On Going', file: '#',
  },
  {
    id: 'PDID00000459', ref: 'MMRM00201', subject: 'Intern Application', type: 'Memorandum', date: '10/06/23', received: '05/12/25', remarks: 'Received by Edwin Agustin', status: 'Completed', file: '#',
  },
  {
    id: 'PDID00000305', ref: 'ENDR000027', subject: 'Barangay Clearance', type: 'Certification', date: '01/04/23', received: '03/04/25', remarks: 'Received by River Joseph', status: 'Completed', file: '#',
  },
  {
    id: 'PDID00000307', ref: 'ENDR000029', subject: 'Barangay ID Application', type: 'Application', date: '01/06/23', received: '03/06/25', remarks: 'Received by Charlie Fleming', status: 'Completed', file: '#',
  },
  {
    id: 'PDID00000309', ref: 'ENDR000031', subject: 'Scholarship Endorsement', type: 'Endorsement', date: '01/08/23', received: '03/08/25', remarks: 'Received by Kira Balinger', status: 'Completed', file: '#',
  },
  {
    id: 'PDID00000311', ref: 'ENDR000033', subject: 'Business Permit Request', type: 'Request', date: '01/10/23', received: '03/10/25', remarks: 'Received by Dustin Yu', status: 'Completed', file: '#',
  },
  {
    id: 'PDID00000313', ref: 'ENDR000035', subject: 'Barangay Residency Certification', type: 'Certification', date: '01/12/23', received: '03/12/25', remarks: 'Received by Jake Pontanes', status: 'Completed', file: '#',
  },
  {
    id: 'PDID00000315', ref: 'ENDR000037', subject: 'Solo Parent ID Application', type: 'Application', date: '01/14/23', received: '03/14/25', remarks: 'Received by Cheska Inciong', status: 'Completed', file: '#',
  },
  {
    id: 'PDID00000317', ref: 'ENDR000039', subject: 'PWD ID Application', type: 'Application', date: '01/16/23', received: '03/16/25', remarks: 'Received by Sandy Ante', status: 'Completed', file: '#',
  },
  {
    id: 'PDID00000319', ref: 'ENDR000041', subject: 'Certificate of Indigency', type: 'Certification', date: '01/18/23', received: '03/18/25', remarks: 'Received by Albert Bautista', status: 'Completed', file: '#',
  },
  {
    id: 'PDID00000321', ref: 'ENDR000043', subject: 'Barangay Business Clearance', type: 'Certification', date: '01/20/23', received: '03/20/25', remarks: 'Received by Jericho Ambrocio', status: 'Completed', file: '#',
  },
  {
    id: 'PDID00000323', ref: 'ENDR000045', subject: 'Barangay Certificate of Good Moral', type: 'Certification', date: '01/22/23', received: '03/22/25', remarks: 'Received by Camila Alfonso', status: 'Completed', file: '#',
  },
  {
    id: 'PDID00000325', ref: 'ENDR000047', subject: 'Late Registration of Birth', type: 'Request', date: '01/24/23', received: '03/24/25', remarks: 'Received by Herson Fergus', status: 'Completed', file: '#',
  },
  {
    id: 'PDID00000327', ref: 'ENDR000049', subject: 'Barangay Blotter Report', type: 'Report', date: '01/26/23', received: '03/26/25', remarks: 'Received by Michael Ernest', status: 'Completed', file: '#',
  },
  {
    id: 'PDID00000329', ref: 'ENDR000051', subject: 'Barangay Indigency for Medical', type: 'Certification', date: '01/28/23', received: '03/28/25', remarks: 'Received by Rhodj Gegabalen', status: 'Completed', file: '#',
  },
  {
    id: 'PDID00000331', ref: 'ENDR000053', subject: 'Barangay Certificate for Employment', type: 'Certification', date: '01/30/23', received: '03/30/25', remarks: 'Received by Jullaine Mendoza', status: 'Completed', file: '#',
  },
];

const archivingData = allData.filter((row, i) => i % 2 === 1); // Just for demo: alternate rows

export default function PublicDocument() {
  const [activeTab, setActiveTab] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const data = activeTab === 'all' ? allData : archivingData;

  return (
    <div className="Public-Document-Container">
      <AddDocumentModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <div className="PublicDocument-HeaderRow">
        <div className="PublicDocument-HeaderTabs">
          <div
            className={`PublicDocument-Tab${activeTab === 'all' ? ' PublicDocument-Tab--active' : ''}`}
            onClick={() => setActiveTab('all')}
            role="button"
            tabIndex={0}
            style={{ userSelect: 'none' }}
          >
            All
          </div>
          <div
            className={`PublicDocument-Tab${activeTab === 'archiving' ? ' PublicDocument-Tab--active' : ''}`}
            onClick={() => setActiveTab('archiving')}
            role="button"
            tabIndex={0}
            style={{ userSelect: 'none' }}
          >
            For Archiving
          </div>
        </div>
        <div className="PublicDocument-SearchBox">
          <input
            className="PublicDocument-SearchInput"
            type="text"
            placeholder="Enter Keyword"
          />
          <button className="PublicDocument-SearchBtn">
            SEARCH
          </button>
        </div>
      </div>
      <div className="PublicDocument-TableContainer" style={{position: 'relative'}}>
        <table className="PublicDocument-Table">
          <thead>
            <tr>
              <th>Document ID</th>
              <th>Reference Code</th>
              <th>Subject</th>
              <th>Document Type</th>
              <th>Date</th>
              <th>Date Received</th>
              <th>Received By</th>
              <th>Status</th>
              <th>Remarks</th>
              <th>File</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              // Try to extract 'Received By' from remarks (e.g., 'Received by Edwin Agustin')
              let receivedBy = '';
              const match = row.remarks && row.remarks.match(/Received by (.+)/i);
              if (match) receivedBy = match[1];
              return (
                <tr key={row.id + i} onClick={activeTab === 'all' ? () => setSelectedRow(row) : activeTab === 'archiving' ? () => setSelectedRow(row) : undefined}>
                  <td>{row.id}</td>
                  <td>{row.ref}</td>
                  <td>{row.subject}</td>
                  <td>{row.type}</td>
                  <td>{row.date}</td>
                  <td>{row.received}</td>
                  <td>{receivedBy}</td>
                  <td>{row.status}</td>
                  <td>{row.remarks}</td>
                  <td><a href={row.file} className="PublicDocument-PDFLink">View PDF</a></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {activeTab === 'all' && selectedRow && !editModalOpen && (
          <div className="PublicDocument-EditNotification">
            <button className="PublicDocument-EditNotification-Close" onClick={() => setSelectedRow(null)} title="Close">×</button>
            <div className="PublicDocument-EditNotification-Title">
              Edit Document<br/>{selectedRow.id}?
            </div>
            <button className="PublicDocument-EditNotification-EditBtn" onClick={() => setEditModalOpen(true)}>
              EDIT
            </button>
          </div>
        )}
        {activeTab === 'all' && editModalOpen && (
          <EditDocumentModal open={editModalOpen} onClose={() => { setEditModalOpen(false); setSelectedRow(null); }} doc={selectedRow} />
        )}
        {activeTab === 'archiving' && selectedRow && (
          <div className="PublicDocument-EditNotification">
            <button className="PublicDocument-EditNotification-Close" onClick={() => setSelectedRow(null)} title="Close">×</button>
            <div className="PublicDocument-EditNotification-Title">
              Archive Document<br/>{selectedRow.id}?
            </div>
            <button className="PublicDocument-ArchiveBtn" onClick={() => {/* TODO: archive logic */}}>
              ARCHIVE
            </button>
          </div>
        )}
      </div>
      <div className="PublicDocument-AddBtnContainer">
        <button className="PublicDocument-AddBtn" onClick={() => setModalOpen(true)}>ADD DOCUMENT</button>
      </div>
    </div>
  );
}

