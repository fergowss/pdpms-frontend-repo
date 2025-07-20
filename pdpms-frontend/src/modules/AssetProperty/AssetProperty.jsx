import React, { useState, useEffect, useRef } from 'react';
import './AssetProperty.css';
import './AssetProperty_pagination.css';
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

export default function AssetProperty({ username }) {
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
  const [expandedRows, setExpandedRows] = useState(new Set());
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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [showAllPages, setShowAllPages] = useState(false);
  const itemsPerPage = 100;

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
        // Deduplicate so that for each base Document ID (without numeric numeric extension) only one main record exists.
        const dedupedData = fetchedData.filter((item, idx, arr) => {
          const extension = getDocumentExtension(item.documentNo);
          // Always keep items that have a numeric extension (e.g., 0001) because they represent transferred assets.
          if (/^\d+$/.test(extension)) {
            return true;
          }
          const baseId = getBaseDocumentId(item.documentNo).toLowerCase();
          // Keep the first occurrence of this baseId that also has no numeric extension.
          return arr.findIndex((it) => {
            const itExt = getDocumentExtension(it.documentNo);
            return !/^\d+$/.test(itExt) && getBaseDocumentId(it.documentNo).toLowerCase() === baseId;
          }) === idx;
        });
        setAllData(dedupedData);
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

  // Handle dropdown toggle for asset transfers
  const toggleRowExpansion = (rowId, event) => {
    event.stopPropagation(); // Prevent row selection when clicking dropdown
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }
      return newSet;
    });
  };

  // Extract base document ID (without extension)
  const getBaseDocumentId = (documentId) => {
    if (!documentId) return '';
    // Remove the extension part (e.g., "PUBL-DOCU-2025-271a20-0001" -> "PUBL-DOCU-2025-271a20")
    const parts = documentId.split('-');
    if (parts.length >= 5) {
      return parts.slice(0, 4).join('-');
    }
    return documentId;
  };

  // Extract extension from document ID
  const getDocumentExtension = (documentId) => {
    if (!documentId) return '';
    const parts = documentId.split('-');
    return parts.length >= 5 ? parts[parts.length - 1] : '';
  };

  // Get transfer properties for a specific document (based on document ID)
  const getTransferProperties = (documentId, properties) => {
    const baseId = getBaseDocumentId(documentId);
    const transfers = [];
    
    properties.forEach(prop => {
      const propBaseId = getBaseDocumentId(prop.documentNo);
      const extension = getDocumentExtension(prop.documentNo);
      
      // If same base document ID but has extension (transferred asset)
      if (propBaseId === baseId && extension && extension !== '0000' && prop.documentNo !== documentId) {
        transfers.push(prop);
      }
    });
    
    // Sort transfers by extension
    transfers.sort((a, b) => {
      const extA = getDocumentExtension(a.documentNo);
      const extB = getDocumentExtension(b.documentNo);
      return extA.localeCompare(extB);
    });
    
    return transfers;
  };

  // Filter data based on date filter and search keyword with defensive checks
  const filteredData = allData.filter(item => {
    const matchesDate = dateAcquiredFilter ? item.dateAcquired === dateAcquiredFilter : true;
    if (!searchKeyword) return matchesDate;
    
    return matchesDate && Object.values(item).some(
      value => value && value.toString().toLowerCase().includes(searchKeyword.toLowerCase())
    );
  });

  // Pagination logic - similar to PublicDocument.jsx
  const motherDocuments = filteredData.filter(item => {
    const extension = getDocumentExtension(item.documentNo);
    return !extension || extension === '0000';
  });

  const totalPages = Math.max(1, Math.ceil(motherDocuments.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMotherDocuments = motherDocuments.slice(startIndex, endIndex);

  // Reset to page 1 when search or date filter changes
  useEffect(() => {
    setCurrentPage(1);
    setExpandedRows(new Set());
  }, [searchKeyword, dateAcquiredFilter]);

  // Pagination handlers
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      setExpandedRows(new Set()); // Clear expanded rows when changing pages
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= 10; i++) {
      pages.push({
        pageNum: i,
        isDisabled: i > totalPages
      });
    }
    return pages;
  };

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
                <th style={{ width: '40px', textAlign: 'center' }}></th>
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
              {paginatedMotherDocuments.length === 0 ? (
                <tr>
                  <td colSpan={12} style={{ textAlign: 'center', color: '#888' }}>
                    No records found.
                  </td>
                </tr>
              ) : (
                paginatedMotherDocuments.flatMap((row, index) => {
                  const transfers = getTransferProperties(row.documentNo, filteredData);
                  const isExpanded = expandedRows.has(row.documentNo);
                  
                  const rows = [
                    // Main property row
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
                      <td style={{ width: '40px', textAlign: 'center', padding: '8px' }}>
                        <button
                          onClick={(e) => toggleRowExpansion(row.documentNo, e)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '3px',
                            transition: 'background-color 0.2s',
                            opacity: transfers.length > 0 ? 1 : 0.3
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                          title={transfers.length > 0 ? `View ${transfers.length} asset transfer(s)` : 'No asset transfers'}
                          disabled={transfers.length === 0}
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            style={{
                              transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                              transition: 'transform 0.2s ease'
                            }}
                          >
                            <path
                              d="M4 2L8 6L4 10"
                              stroke={transfers.length > 0 ? "#666" : "#ccc"}
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </td>
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
                  ];
                  
                  // Add transfer property rows if expanded
                  if (isExpanded && transfers.length > 0) {
                    transfers.forEach((transfer, transferIndex) => {
                      rows.push(
                        <tr
                          key={`${row.documentNo}-transfer-${transferIndex}`}
                          style={{ backgroundColor: '#f8f9fa' }}
                          onClick={() => {
                            console.log('Selected transfer with propertyNo:', transfer.propertyNo);
                            closeAll();
                            setSelectedRow(transfer);
                            setShowEditConfirm(true);
                          }}
                        >
                          <td style={{ width: '40px', textAlign: 'center', padding: '8px' }}>
                            <div style={{
                              width: '6px',
                              height: '6px',
                              backgroundColor: '#666',
                              borderRadius: '50%',
                              margin: '0 auto',
                              position: 'relative'
                            }}></div>
                          </td>
                          <td style={{ paddingLeft: '20px', fontStyle: 'italic', color: '#666' }}>
                            {transfer.propertyNo}
                          </td>
                          <td style={{ color: '#666' }}>{transfer.documentNo}</td>
                          <td style={{ color: '#666' }}>{transfer.parNo}</td>
                          <td className="description-cell" style={{ textAlign: 'justify', color: '#666' }}>{insertNewlines(transfer.description, 5)}</td>
                          <td className="serial-no-cell" style={{ textAlign: 'justify', color: '#666' }}>{insertNewlines(transfer.serialNo, 7)}</td>
                          <td style={{ color: '#666' }}>{transfer.dateAcquired}</td>
                          <td style={{ color: '#666' }}>{transfer.unitCost}</td>
                          <td style={{ color: '#666' }}>{transfer.endUser}</td>
                          <td style={{ color: '#666' }}>{transfer.estimatedLife}</td>
                          <td>
                            <span
                              className={`AssetProperty-Status ${
                                transfer.status ? transfer.status.toLowerCase().replace(/\s+/g, '') : 'unknown'
                              }`}
                              style={{ color: '#666' }}
                            >
                              {transfer.status || 'Unknown'}
                            </span>
                          </td>
                          <td className="remarks-cell" style={{ textAlign: 'justify', color: '#666' }}>{insertNewlines(transfer.remarks, 10)}</td>
                        </tr>
                      );
                    });
                  }
                  
                  return rows;
                })
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
        username={username}
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
          username={username}
        />
      )}

      <EditPropertyModal
        open={editModalOpen && !!selectedRow}
        onClose={closeAll}
        row={selectedRow}
        onUpdate={handleUpdateProperty}
        username={username}
      />
      
      {/* Add Property Modal */}
      <AddPropertyModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={handleAddProperty}
        existingDocumentNos={allData.map(item => item.documentNo?.toLowerCase()).filter(Boolean)}
        username={username}
      />
      
      {/* Add Property Button */}
      <div className="AssetProperty-AddBtnContainer">
        <button
          className="AssetProperty-AddBtn"
          onClick={() => {
            closeAll();
            setAddModalOpen(true);
          }}
        >
          ADD PROPERTY
        </button>
      </div>
      
      {/* Custom Pagination */}
      {(
        <div className="AssetProperty-PaginationContainer">
          <div className="AssetProperty-PaginationWrapper">
            {/* Horizontal pagination row: Back → Pages 1-10 → Next */}
            <div className="AssetProperty-PaginationRow">
              {/* Back Button */}
              <button
                className="AssetProperty-PaginationBackBtn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15,18 9,12 15,6"></polyline>
                </svg>
                Back
              </button>
              
              {/* Page Numbers 1-10 */}
              {getPageNumbers().map(({ pageNum, isDisabled }) => (
                <button
                  key={pageNum}
                  className={`AssetProperty-PaginationNumBtn ${currentPage === pageNum ? 'active' : ''}`}
                  onClick={() => !isDisabled && handlePageChange(pageNum)}
                  disabled={isDisabled}
                >
                  {pageNum}
                </button>
              ))}
              
              {/* Next Button */}
              <button
                className="AssetProperty-PaginationNextBtn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9,18 15,12 9,6"></polyline>
                </svg>
              </button>
            </div>
            
            {/* Page info below pagination */}
            <div className="AssetProperty-PaginationInfo">
              Showing page {currentPage} of {totalPages} ({motherDocuments.length} total properties)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}