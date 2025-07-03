import React, { useState, useEffect } from 'react';
import './AssetProperty.css';
import AddPropertyModal from './AddPropertyModal';
import EditPropertyModal from './EditPropertyModal';
import axios from 'axios';

// SVG for stack icon (from user screenshot)
const StackIcon = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="16" width="20" height="4" rx="1" fill="#223354"/>
    <rect x="4" y="10" width="16" height="4" rx="1" fill="#223354"/>
    <rect x="6" y="4" width="12" height="4" rx="1" fill="#223354"/>
  </svg>
);

export default function AssetProperty() {
  const [showAddNotif, setShowAddNotif] = useState(false);
  const [showUpdateNotif, setShowUpdateNotif] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
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

  // API endpoint
  const API_URL = 'http://127.0.0.1:8000';
  const PROPERTIES_ENDPOINT = `${API_URL}/pdpms/manila-city-hall/properties/`;

  // Fetch data using axios
  useEffect(() => {
    setIsLoading(true);
    axios
      .get(PROPERTIES_ENDPOINT)
      .then((response) => {
        // Log the full response to debug
        console.log('Fetched properties:', response.data);
        // Map backend fields to frontend fields, with validation
        const fetchedData = Array.isArray(response.data)
          ? response.data
              .filter((item) => item && typeof item === 'object')
              .map((item, index) => {
                if (!item.property_no) return null;
                return {
                  propertyNo: item.property_no || '',
                  documentNo: item.document_id || '',
                  parNo: item.par_no || '',
                  description: item.description || '',
                  serialNo: item.serial_no || '',
                  dateAcquired: item.date_acquired || '',
                  unitCost: item.unit_cost != null ? item.unit_cost.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '',
                  endUser: item.end_user || '',
                  estimatedLife: item.estimated_life_use != null ? item.estimated_life_use.toString() : '',
                  status: item.property_status || 'Unknown',  // Default to 'Unknown' if undefined
                  remarks: item.remarks || '',
                };
              })
              .filter((item) => item !== null) // Remove invalid records
          : [];
        setAllData(fetchedData);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching properties:', error.response ? error.response.data : error);
        setValidation({
          isOpen: true,
          type: 'error',
          title: 'Fetch Error',
          message: 'Failed to load properties. Please check your connection or backend server.',
        });
        setIsLoading(false);
      });
  }, []);

  // Handle search on input change
  const handleSearch = (value) => {
    setSearchTerm(value);
    setSearchKeyword(value);
  };

  // Filter data based on search keyword with defensive checks
  const filteredData = searchKeyword
    ? allData.filter((item) =>
        item &&
        Object.values(item).some((val) =>
          val != null ? val.toString().toLowerCase().includes(searchKeyword.toLowerCase()) : false
        )
      )
    : allData;

  // Handler for when a property is added
  const handleAddProperty = async (newProperty) => {
    try {
      const backendProperty = {
        property_no: newProperty.propertyNo,
        document_id: newProperty.documentNo,
        par_no: newProperty.parNo,
        description: newProperty.description,
        serial_no: newProperty.serialNo,
        date_acquired: newProperty.dateAcquired,
        unit_cost: newProperty.unitCost ? parseFloat(newProperty.unitCost) : null,
        end_user: newProperty.endUser,
        estimated_life_use: newProperty.estimatedLife ? parseInt(newProperty.estimatedLife) : null,
        property_status: newProperty.status || 'Serviceable',
        remarks: newProperty.remarks,
      };
      const response = await axios.post(PROPERTIES_ENDPOINT, backendProperty);
      setAllData((prevData) => [
        ...prevData,
        {
          propertyNo: response.data.property_no,
          documentNo: response.data.document_id,
          parNo: response.data.par_no,
          description: response.data.description,
          serialNo: response.data.serial_no,
          dateAcquired: response.data.date_acquired,
          unitCost: response.data.unit_cost != null ? response.data.unit_cost.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '',
          endUser: response.data.end_user,
          estimatedLife: response.data.estimated_life_use != null ? response.data.estimated_life_use.toString() : '',
          status: response.data.property_status || 'Unknown',
          remarks: response.data.remarks,
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
        message: error.response?.data?.detail || 'Failed to add property. Please try again.',
      });
    }
  };

  // Handler for when a property is updated
  const handleUpdateProperty = async (updatedData) => {
    try {
      const backendUpdate = {
        property_no: updatedData.propertyNo,
        document_id: updatedData.documentNo,
        par_no: updatedData.parNo,
        description: updatedData.description,
        serial_no: updatedData.serialNo,
        date_acquired: updatedData.dateAcquired,
        unit_cost: updatedData.unitCost ? parseFloat(updatedData.unitCost) : null,
        end_user: updatedData.endUser,
        estimated_life_use: updatedData.estimatedLife ? parseInt(updatedData.estimatedLife) : null,
        property_status: updatedData.status || 'Serviceable',
        remarks: updatedData.remarks,
      };
      await axios.put(`${PROPERTIES_ENDPOINT}${updatedData.propertyNo}/`, backendUpdate);
      setAllData((prevData) =>
        prevData.map((item) =>
          item.propertyNo === selectedRow.propertyNo
            ? {
                propertyNo: updatedData.propertyNo,
                documentNo: updatedData.documentNo,
                parNo: updatedData.parNo,
                description: updatedData.description,
                serialNo: updatedData.serialNo,
                dateAcquired: updatedData.dateAcquired,
                unitCost: updatedData.unitCost != null ? updatedData.unitCost.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '',
                endUser: updatedData.endUser,
                estimatedLife: updatedData.estimatedLife != null ? updatedData.estimatedLife.toString() : '',
                status: updatedData.status || 'Unknown',
                remarks: updatedData.remarks,
              }
            : item
        )
      );
      setSelectedRow(null);
      setShowUpdateNotif(true);
      setTimeout(() => setShowUpdateNotif(false), 3000);
    } catch (error) {
      console.error('Error updating property:', error.response ? error.response.data : error);
      setValidation({
        isOpen: true,
        type: 'error',
        title: 'Update Property Error',
        message: error.response?.data?.detail || 'Failed to update property. Please try again.',
      });
    }
  };

  // Handler for closing all modals and notifications
  const closeAll = () => {
    setAddModalOpen(false);
    setEditModalOpen(false);
    setShowEditConfirm(false);
    setSelectedRow(null);
    setShowAddNotif(false);
    setShowUpdateNotif(false);
  };

  return (
    <div className="AssetProperty-Container">
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
      <div className="AssetProperty-HeaderRow">
        <div className="AssetProperty-HeaderTabs">
          <div className="AssetProperty-Title"></div>
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

      <div className="AssetProperty-TableContainer">
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
            Loading...
          </div>
        ) : filteredData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
            No records found.
          </div>
        ) : (
          <table className="AssetProperty-Table">
            <thead>
              <tr>
                <th>Property No.</th>
                <th>Document No.</th>
                <th>PAR No.</th>
                <th>Description</th>
                <th>Serial No.</th>
                <th>Date Acquired</th>
                <th>Unit Cost</th>
                <th>End User</th>
                <th>Estimated Life Use</th>
                <th>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, index) => (
                <tr
                  key={index}
                  onClick={() => {
                    closeAll();
                    setSelectedRow(row);
                    setShowEditConfirm(true);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <td>{row.propertyNo}</td>
                  <td>{row.documentNo}</td>
                  <td>{row.parNo}</td>
                  <td className="description-cell">
                    {row.description.includes('"ASUS POWERLOGIC') 
                      ? row.description.replace('"ASUS POWERLOGIC', '\n"ASUS POWERLOGIC')
                      : row.description
                    }
                  </td>
                  <td className="serial-no-cell">
                    {row.serialNo
                      ? row.serialNo.split(',').map((part, idx, arr) => {
                          const trimmedPart = part.trim();
                          // If the part contains a quote, it's a component name
                          if (trimmedPart.includes('"') && !trimmedPart.endsWith('"')) {
                            // This is a component name, format it with the next part
                            const nextPart = arr[idx + 1] ? arr[idx + 1].trim() : '';
                            return (
                              <div key={idx} style={{ marginBottom: '4px' }}>
                                {trimmedPart.replace(/"/g, '')} {nextPart}
                              </div>
                            );
                          }
                          // Skip if this is a serial number that was already included with its component
                          if (idx > 0 && arr[idx - 1].includes('"') && !arr[idx - 1].endsWith('"')) {
                            return null;
                          }
                          // For any remaining parts that don't match the pattern
                          return (
                            <div key={idx} style={{ marginBottom: '4px' }}>
                              {trimmedPart}
                            </div>
                          );
                        })
                      : ''}
                  </td>
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
                  <td>{row.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
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
      <AddPropertyModal open={addModalOpen} onClose={closeAll} onAdd={handleAddProperty} />
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
            <div className="AssetProperty-EditNotification-Title">
              Edit Property
              <br />
              <b>{selectedRow.propertyNo}</b>?
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
            </div>
          </div>
        </div>
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