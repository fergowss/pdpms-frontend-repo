import React, { useState, useEffect, useRef } from 'react';
import './AssetProperty.css';
import AddPropertyModal from './AddPropertyModal';
import EditPropertyModal from './EditPropertyModal';
import TransferPropertyModal from './TransferPropertyModal';
import axios from 'axios';

// SVG for stack icon
const StackIcon = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="16" width="20" height="4" rx="1" fill="#223354"/>
    <rect x="4" y="10" width="16" height="4" rx="1" fill="#223354"/>
    <rect x="6" y="4" width="12" height="4" rx="1" fill="#223354"/>
  </svg>
);

// Utility: insert newlines after every `wordsPerLine` words (default 10)
const insertNewlines = (text, wordsPerLine = 10) => {
  if (!text) return '';
  const words = text.split(/\s+/).filter(word => word.length > 0);
  const lines = [];
  for (let i = 0; i < words.length; i += wordsPerLine) {
    lines.push(words.slice(i, i + wordsPerLine).join(' '));
  }
  return lines.join('\n');
};

export default function AssetProperty() {
  const [transferNotif, setTransferNotif] = useState({ open: false, endUser: '' });
  const [showAddNotif, setShowAddNotif] = useState(false);
  const [showUpdateNotif, setShowUpdateNotif] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [allData, setAllData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [validation, setValidation] = useState({
    isOpen: false,
    type: 'error',
    title: '',
    message: '',
  });
  // Date Acquired filter states
  const [dateAcquiredFilter, setDateAcquiredFilter] = useState('');
  const [showDateAcquiredFilter, setShowDateAcquiredFilter] = useState(false);
  const [datePickerPos, setDatePickerPos] = useState({ top: 0, left: 0 });
  const dateInputRef = useRef(null);

  useEffect(() => {
    if (showDateAcquiredFilter && dateInputRef.current) {
      dateInputRef.current.focus();
      if (dateInputRef.current.showPicker) dateInputRef.current.showPicker();
    }
  }, [showDateAcquiredFilter]);

  // API endpoint
  const API_URL = 'http://127.0.0.1:8000';
  const PROPERTIES_ENDPOINT = `${API_URL}/pdpms/manila-city-hall/properties/`;

  // Fetch data using axios
  useEffect(() => {
    setIsLoading(true);
    axios
      .get(PROPERTIES_ENDPOINT)
      .then((response) => {
        console.log('Raw API response:', response.data);
        const fetchedData = Array.isArray(response.data)
          ? response.data
              .filter((item) => item && typeof item === 'object')
              .map((item) => {
                if (!item.property_no) return null;
                return {
                  propertyNo: item.property_no || '',
                  documentNo: item.document_id || '',
                  parNo: item.par_no || '',
                  description: item.description || '',
                  serialNo: item.serial_no || '',
                  dateAcquired: item.date_acquired || '',
                  unitCost: item.unit_cost != null ? item.unit_cost.toLocaleString('en-US', { minimumFractionDigits: 0 }) : '',
                  endUser: item.end_user || '',
                  estimatedLife: item.estimated_life_use != null ? item.estimated_life_use.toString() : '',
                  status: item.property_status || 'Unknown',
                  remarks: item.remarks || '',
                };
              })
              .filter((item) => item !== null)
          : [];
        console.log('Processed allData:', fetchedData);
        setAllData(fetchedData);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching properties:', error);
        setIsLoading(false);
      });
  }, []);

  // Handle search on input change
  const handleSearch = (value) => {
    setSearchTerm(value);
    setSearchKeyword(value);
  };

  // Filter data based on date filter and search keyword with defensive checks
  const filteredData = allData.filter(item => {
    const matchesDate = dateAcquiredFilter ? item.dateAcquired === dateAcquiredFilter : true;
    if (!searchKeyword) return matchesDate;
    
    return matchesDate && Object.values(item).some(
      value => value && value.toString().toLowerCase().includes(searchKeyword.toLowerCase())
    );
  });

  // Handler for adding a property
  const handleAddProperty = async (newProperty) => {
    try {
      // Validate required fields
      if (!newProperty.endUser || !newProperty.status) {
        throw new Error('End User and Status are required.');
      }
      const backendProperty = {
        property_no: newProperty.propertyNo,
        document_id: newProperty.documentNo,
        par_no: newProperty.parNo || null,
        description: newProperty.description || '',
        serial_no: newProperty.serialNo || null,
        date_acquired: newProperty.dateAcquired || null,
        unit_cost: newProperty.unitCost ? parseFloat(newProperty.unitCost) : null,
        end_user: newProperty.endUser,
        estimated_life_use: newProperty.estimatedLife ? parseInt(newProperty.estimatedLife) : null,
        property_status: newProperty.status || 'Serviceable',
        remarks: newProperty.remarks?.trim() || 'N/A',
      };
      console.log('Adding property with payload:', backendProperty);
      const response = await axios.post(PROPERTIES_ENDPOINT, backendProperty);
      console.log('Backend response:', response.data);
      setAllData((prevData) => [
        ...prevData,
        {
          propertyNo: response.data.property_no,
          documentNo: response.data.document_id,
          parNo: response.data.par_no || '',
          description: response.data.description || '',
          serialNo: response.data.serial_no || '',
          dateAcquired: response.data.date_acquired || '',
          unitCost: response.data.unit_cost != null ? response.data.unit_cost.toLocaleString('en-US', { minimumFractionDigits: 0 }) : '',
          endUser: response.data.end_user || '',
          estimatedLife: response.data.estimated_life_use != null ? response.data.estimated_life_use.toString() : '',
          status: response.data.property_status || 'Unknown',
          remarks: response.data.remarks || '',
        },
      ]);
      closeAll();
      setShowAddNotif(true);
      setTimeout(() => setShowAddNotif(false), 3000);
    } catch (error) {
      console.error('Error adding property:', error.response ? error.response.data : error);
      setValidation({
        isOpen: true,
        type: 'error',
        title: 'Add Property Error',
        message: error.response?.data?.detail || JSON.stringify(error.response?.data) || error.message || 'Failed to add property. Please try again.',
      });
    }
  };

  // Handler for updating property
  const handleUpdateProperty = async (updatedData) => {
    try {
      // Validate required fields
      if (!updatedData.endUser || !updatedData.status) {
        throw new Error('End User and Status are required.');
      }
      console.log('Updating property with propertyNo:', updatedData.propertyNo);
      const response = await axios.get(`${PROPERTIES_ENDPOINT}${updatedData.propertyNo}/`);
      const currentData = response.data;

      const backendUpdate = {
        property_no: currentData.property_no || updatedData.propertyNo,
        document_id: currentData.document_id || updatedData.documentNo,
        par_no: updatedData.parNo || currentData.par_no || '',
        description: currentData.description || updatedData.description || '',
        serial_no: updatedData.serialNo || currentData.serial_no || '',
        date_acquired: currentData.date_acquired || updatedData.dateAcquired || '',
        unit_cost: updatedData.unitCost != null ? parseFloat(updatedData.unitCost) : currentData.unit_cost,
        end_user: updatedData.endUser || currentData.end_user || '',
        estimated_life_use: updatedData.estimatedLife ? parseInt(updatedData.estimatedLife) : currentData.estimated_life_use,
        property_status: updatedData.status || currentData.property_status || 'Serviceable',
        remarks: updatedData.remarks?.trim() || currentData.remarks || 'N/A',
      };

      await axios.put(`${PROPERTIES_ENDPOINT}${updatedData.propertyNo}/`, backendUpdate);

      setAllData((prevData) =>
        prevData.map((item) =>
          item.propertyNo === updatedData.propertyNo
            ? {
                ...item,
                serialNo: updatedData.serialNo || '',
                unitCost: updatedData.unitCost != null ? parseFloat(updatedData.unitCost).toLocaleString('en-US', { minimumFractionDigits: 0 }) : '',
                endUser: updatedData.endUser,
                estimatedLife: updatedData.estimatedLife != null ? updatedData.estimatedLife.toString() : '',
                status: updatedData.status || 'Unknown',
                remarks: updatedData.remarks || '',
                parNo: updatedData.parNo || '',
              }
            : item
        )
      );
      closeAll();
      setShowUpdateNotif(true);
      setTimeout(() => setShowUpdateNotif(false), 3000);
    } catch (error) {
      console.error('Error updating property:', error.response ? error.response.data : error);
      let errorMessage = error.message || 'Failed to update property. Please try again.';
      if (error.response?.status === 404) {
        errorMessage = 'Property not found. It may have been deleted. Refreshing property list...';
        axios.get(PROPERTIES_ENDPOINT)
          .then((response) => {
            const fetchedData = Array.isArray(response.data)
              ? response.data
                  .filter((item) => item && typeof item === 'object')
                  .map((item) => {
                    if (!item.property_no) return null;
                    return {
                      propertyNo: item.property_no || '',
                      documentNo: item.document_id || '',
                      parNo: item.par_no || '',
                      description: item.description || '',
                      serialNo: item.serial_no || '',
                      dateAcquired: item.date_acquired || '',
                      unitCost: item.unit_cost != null ? item.unit_cost.toLocaleString('en-US', { minimumFractionDigits: 0 }) : '',
                      endUser: item.end_user || '',
                      estimatedLife: item.estimated_life_use != null ? item.estimated_life_use.toString() : '',
                      status: item.property_status || 'Unknown',
                      remarks: item.remarks || '',
                    };
                  })
                  .filter((item) => item !== null)
              : [];
            setAllData(fetchedData);
          })
          .catch((fetchError) => console.error('Error refetching properties:', fetchError));
      } else {
        errorMessage = error.response?.data?.detail || JSON.stringify(error.response?.data) || errorMessage;
      }
      setValidation({
        isOpen: true,
        type: 'error',
        title: 'Update Property Error',
        message: errorMessage,
      });
    }
  };

  // Handler for transferring property
  const handleTransferProperty = async (transferData) => {
    try {
      // Validate required fields
      if (!transferData.endUser || !transferData.status) {
        throw new Error('End User and Status are required.');
      }

      const backendProperty = {
        property_no: transferData.propertyNo,
        document_id: transferData.documentNo,
        par_no: transferData.parNo || null,
        description: transferData.description || '',
        serial_no: transferData.serialNo || null,
        date_acquired: transferData.dateAcquired || null,
        unit_cost: transferData.unitCost ? parseFloat(transferData.unitCost) : null,
        end_user: transferData.endUser,
        estimated_life_use: transferData.estimatedLife ? parseInt(transferData.estimatedLife) : null,
        property_status: transferData.status || 'Serviceable',
        remarks: transferData.remarks?.trim() || 'N/A',
      };

      console.log('Transferring property with payload:', backendProperty);
      const response = await axios.post(PROPERTIES_ENDPOINT, backendProperty);
      console.log('Backend response for transfer:', response.data);

      // Add the new transferred property to allData
      setAllData((prevData) => [
        ...prevData,
        {
          propertyNo: response.data.property_no,
          documentNo: response.data.document_id,
          parNo: response.data.par_no || '',
          description: response.data.description || '',
          serialNo: response.data.serial_no || '',
          dateAcquired: response.data.date_acquired || '',
          unitCost: response.data.unit_cost != null ? response.data.unit_cost.toLocaleString('en-US', { minimumFractionDigits: 0 }) : '',
          endUser: response.data.end_user || '',
          estimatedLife: response.data.estimated_life_use != null ? response.data.estimated_life_use.toString() : '',
          status: response.data.property_status || 'Unknown',
          remarks: response.data.remarks || '',
        },
      ]);

      // Show transfer notification
      setTransferModalOpen(false);
      setTransferNotif({ open: true, endUser: transferData.endUser });
      setTimeout(() => setTransferNotif({ open: false, endUser: '' }), 3000);
    } catch (error) {
      console.error('Error transferring property:', error.response ? error.response.data : error);
      setValidation({
        isOpen: true,
        type: 'error',
        title: 'Transfer Property Error',
        message: error.response?.data?.detail || JSON.stringify(error.response?.data) || error.message || 'Failed to transfer property. Please try again.',
      });
    }
  };

  // Handler for opening the Add Property modal
  const handleOpenAddModal = () => {
    console.log('Opening Add Property modal');
    closeAll();
    setAddModalOpen(true);
  };

  // Handler for closing all modals and notifications
  const closeAll = () => {
    setAddModalOpen(false);
    setEditModalOpen(false);
    setShowEditConfirm(false);
    setSelectedRow(null);
    setShowAddNotif(false);
    setShowUpdateNotif(false);
    setTransferModalOpen(false);
    setTransferNotif({ open: false, endUser: '' });
  };

  return (
    <div className="AssetProperty-Container">
      {/* Notifications */}
      {showAddNotif && (
        <div className="AssetProperty-NotificationOverlay">
          <div className="AssetProperty-NotificationBox">
            <div className="AssetProperty-NotificationContent" style={{ flexDirection: 'row', gap: '0.6rem', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', marginRight: '0.4rem' }}>
                {StackIcon}
              </span>
              <span style={{ fontSize: '0.97rem', color: '#223354', fontWeight: 400 }}>New Asset Property Has Been Added.</span>
            </div>
          </div>
        </div>
      )}
      {showUpdateNotif && (
        <div className="AssetProperty-NotificationOverlay">
          <div className="AssetProperty-NotificationBox">
            <div className="AssetProperty-NotificationContent" style={{ flexDirection: 'row', gap: '0.6rem', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', marginRight: '0.4rem' }}>
                {StackIcon}
              </span>
              <span style={{ fontSize: '0.97rem', color: '#223354', fontWeight: 400 }}>Asset Property Has Been Updated.</span>
            </div>
          </div>
        </div>
      )}
      {validation.isOpen && (
        <div className="AssetProperty-NotificationOverlay">
          <div className="AssetProperty-NotificationBox">
            <div className="AssetProperty-NotificationContent" style={{ flexDirection: 'column', gap: '0.6rem', alignItems: 'center' }}>
              <h3>{validation.title}</h3>
              <p>{validation.message}</p>
              <button
                onClick={() => setValidation({ ...validation, isOpen: false })}
                style={{ padding: '5px 10px', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header with Search */}
      <div className="AssetProperty-HeaderRow">
        <div className="AssetProperty-HeaderTabs">
          <div className="AssetProperty-Title">Asset Properties</div>
        </div>
        <div className="AssetProperty-SearchBox">
          <div className="AssetProperty-SearchBarRow">
            <input
              className="AssetProperty-SearchBar"
              type="text"
              placeholder="Enter Keyword"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="AssetProperty-TableContainer">
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
            Loading...
          </div>
        ) : (
          <table className="AssetProperty-Table">
            <thead>
              <tr>
                <th>Property No.</th>
                <th>Document ID </th>
                <th>PAR No.</th>
                <th>Description</th>
                <th>Serial No.</th>
                <th style={{ position: 'sticky', top: 0, cursor: 'pointer', background: '#f6f8fa', zIndex: 2 }} onClick={(e) => {
                  e.stopPropagation();
                  const rect = e.currentTarget.getBoundingClientRect();
                  setDatePickerPos({ top: rect.bottom + 2, left: rect.left });
                  setShowDateAcquiredFilter(prev => !prev);
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    Date Acquired
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="#223354" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                  {showDateAcquiredFilter && (
                    <div style={{ position: 'fixed', top: datePickerPos.top, left: datePickerPos.left, zIndex: 9999, backgroundColor: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: 'max-content', minWidth: '160px', borderRadius: '4px' }}>
                      <input
                        ref={dateInputRef}
                        type="date"
                        value={dateAcquiredFilter}
                        onChange={(e) => setDateAcquiredFilter(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onBlur={() => setShowDateAcquiredFilter(false)}
                        style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
                      />
                    </div>
                  )}
                </th>
                <th>Unit Cost</th>
                <th>End User</th>
                <th>Estimated Life Use</th>
                <th>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: 'center', color: '#888' }}>
                    No records found.
                  </td>
                </tr>
              ) : (
                filteredData.map((row, index) => (
                  <tr
                    key={index}
                    onClick={() => {
                      console.log('Selected row with propertyNo:', row.propertyNo);
                      closeAll();
                      setSelectedRow(row);
                      setShowEditConfirm(true);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>{row.propertyNo}</td>
                    <td>{row.documentNo}</td>
                    <td>{row.parNo}</td>
                    <td className="description-cell" style={{ textAlign: 'justify' }}>{insertNewlines(row.description, 5)}</td>
                    <td className="serial-no-cell" style={{ textAlign: 'justify' }}>{insertNewlines(row.serialNo, 7)}</td>
                    <td>{row.dateAcquired}</td>
                    <td>{row.unitCost}</td>
                    <td>{row.endUser}</td>
                    <td>{row.estimatedLife}</td>
                    <td>
                      <span
                        className={`AssetProperty-Status ${
                          row.status ? row.status.toLowerCase().replace(/\s+/g, '') : 'unknown'
                        }`}
                      >
                        {row.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="remarks-cell" style={{ textAlign: 'justify' }}>{insertNewlines(row.remarks, 10)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Property Button at bottom */}
      <div className="AssetProperty-AddBtnContainer">
        <button
          className="AssetProperty-AddBtn"
          onClick={handleOpenAddModal}
          type="button"
        >
          ADD PROPERTY
        </button>
      </div>

      {/* Modals */}
      <AddPropertyModal 
        open={addModalOpen} 
        onClose={closeAll} 
        onAdd={handleAddProperty} 
        existingDocIds={allData.map(item => item.documentNo?.toLowerCase()).filter(Boolean)}
        existingParNos={allData.map(item => item.parNo?.toLowerCase()).filter(Boolean)}
      />
      
      {showEditConfirm && selectedRow && (
        <div className="AssetProperty-EditNotificationOverlay">
          <div className="AssetProperty-EditNotification">
            <button
              className="AssetProperty-EditNotification-Close"
              onClick={closeAll}
              aria-label="Close"
            >
              ×
            </button>
            <div className="AssetProperty-EditNotification-Content">
              <div className="AssetProperty-EditNotification-Title">
                <div>Manage Property <b>{selectedRow.propertyNo}</b>?</div>
              </div>
              <div className="AssetProperty-EditNotification-Actions">
                <button
                  className="AssetProperty-EditNotification-EditBtn"
                  onClick={() => {
                    setShowEditConfirm(false);
                    setEditModalOpen(true);
                  }}
                >
                  EDIT
                </button>
                <button
                  className="AssetProperty-EditNotification-TransferBtn"
                  onClick={() => {
                    setShowEditConfirm(false);
                    setTransferModalOpen(true);
                  }}
                >
                  ASSET TRANSFER
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Transfer Notification Popup */}
      {transferNotif.open && (
        <div className="AssetProperty-NotificationOverlay">
          <div className="AssetProperty-NotificationBox">
            <div className="AssetProperty-NotificationContent">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{marginRight: '0.7rem'}} xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="12" fill="#e6f0ff"/>
                <path d="M17 10.5V7.75C17 6.23122 15.7688 5 14.25 5H6.75C5.23122 5 4 6.23122 4 7.75V16.25C4 17.7688 5.23122 19 6.75 19H14.25C15.7688 19 17 17.7688 17 16.25V13.5" stroke="#2a5db0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 12L17 16M21 12L17 8M21 12H9" stroke="#2a5db0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontWeight: 500, fontSize: '1.13rem', color: '#223354' }}>
                The asset property has been transferred to {transferNotif.endUser}.
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* Transfer Property Modal */}
      {transferModalOpen && selectedRow && (
        <TransferPropertyModal
          open={transferModalOpen}
          onClose={() => setTransferModalOpen(false)}
          existingParNos={allData.map(item => item.parNo?.toLowerCase()).filter(Boolean)}
          row={selectedRow}
          onTransfer={handleTransferProperty}
        />
      )}

      <EditPropertyModal
        open={editModalOpen && !!selectedRow}
        onClose={closeAll}
        row={selectedRow}
        onUpdate={handleUpdateProperty}
      />
    </div>
  );
}