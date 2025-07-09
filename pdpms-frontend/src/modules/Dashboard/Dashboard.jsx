import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { dashboardAPI } from '../../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// Error Boundary component
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error in chart component:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div className="chart-error">Chart could not be displayed</div>;
    }
    return this.props.children;
  }
}

// Constants
const STATUS_COLORS = {
  'Serviceable': '#31456A',
  'Unserviceable': '#7894BA',
  'For Repair': '#CFE0FF',
  'Condemned': '#20324F',
  'Complete': '#4CAF50',
  'In Progress': '#2196F3',
  'Not Started': '#FFC107',
  'Pending': '#F44336'
};

const DOCUMENT_STATUS_CONFIG = [
  { label: 'On Going', key: 'inProgress', color: '#CFE0FF' },
  { label: 'Completed', key: 'complete', color: '#7894BA' },
  { label: 'Archived', key: 'archived', color: '#31456A' }
];

export default function Dashboard({ user }) {
  // Extract first name from full_name or use first part of username
  const firstName = user?.full_name ? user.full_name.split(' ')[0] : (user?.username || '');
  const [documentStatus, setDocumentStatus] = useState({
    complete: 0,
    inProgress: 0,
    archived: 0,
    total: 0
  });
  
  const [propertyStatus, setPropertyStatus] = useState([
    { name: 'Serviceable', value: 0, color: STATUS_COLORS.Serviceable },
    { name: 'Unserviceable', value: 0, color: STATUS_COLORS.Unserviceable },
    { name: 'For Repair', value: 0, color: STATUS_COLORS['For Repair'] },
    { name: 'Condemned', value: 0, color: STATUS_COLORS.Condemned }
  ]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [now] = useState(new Date());

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch document status from API
        const [docStatusRes, propertyStatusRes] = await Promise.all([
          dashboardAPI.getDocumentStatus(),
          dashboardAPI.getPropertyStatus()
        ]);

        setDocumentStatus({
            complete: docStatusRes.data.complete || 0,
            inProgress: docStatusRes.data.inProgress || 0,
            archived: docStatusRes.data.archived || 0,
            total: docStatusRes.data.total || 0
          });

        setPropertyStatus(
            propertyStatus.map(item => {
              const apiItem = propertyStatusRes.data.find(api => api.status === item.name);
              return {
                ...item,
                value: apiItem ? parseInt(apiItem.count) || 0 : 0
              };
            })
          );
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  const totalDocuments = documentStatus.inProgress + documentStatus.complete + documentStatus.archived;
  const formattedDate = now.toLocaleDateString('en-US', { 
    month: '2-digit', 
    day: '2-digit', 
    year: '2-digit' 
  });
  
  const formattedTime = now.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  }).toUpperCase();

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome back, {firstName || 'User'}!</h1>
      </div>

      <div className="dashboard-main">
        {/* Document Status Section */}
        <div className="document-status-section">
          <div className="document-status-section__header">
            <h2 className="document-status-section__title">Document Status</h2>
            <span className="document-status-section__timestamp">
              As of {formattedDate} | {formattedTime}
            </span>
            <div className="document-status-divider"></div>
          </div>
          
          <div className="document-status-section__bars">
            {DOCUMENT_STATUS_CONFIG.map(({ label, key, color }) => (
              <StatusBar 
                key={key}
                label={label}
                count={documentStatus[key] || 0}
                percentage={calculatePercentage(documentStatus[key] || 0, totalDocuments)}
                color={color}
              />
            ))}
          </div>
        </div>

        {/* Property Status Section */}
        <div className="property-status-section">
          <div className="donut-container">
            <ErrorBoundary>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart
                
                >
                  <Pie
                    isAnimationActive={false}
                    data={propertyStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius="40%"
                    outerRadius="85%"
                    paddingAngle={0}
                    dataKey="value"
                    nameKey="name"
                    label={renderPieLabel}
                    labelLine={false}
                  >
                    {propertyStatus.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        stroke="#fff" 
                        strokeWidth={2}
                        onMouseEnter={() => {}}
                        onMouseLeave={() => {}}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={formatTooltip}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                    itemStyle={{ color: '#333' }}
                    labelStyle={{ fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ErrorBoundary>
            <div className="legend-container">
              {propertyStatus.map((entry, index) => (
                <div key={`legend-${index}`} className="legend-item">
                  <span 
                    className="legend-icon" 
                    style={{ backgroundColor: entry.color }}
                    aria-hidden="true"
                  />
                  <span className="legend-text">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="property-footer">
            <h2>Property Status</h2>
            <span className="timestamp">
              As of {formattedDate} | {formattedTime}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for status bars
function StatusBar({ label, count, percentage, color }) {
  return (
    <div className="document-status-bar">
      <span className="document-status-bar__label">{label}</span>
      <div className="document-status-bar__progress-container">
        <div 
          className="document-status-bar__progress" 
          style={{ 
            width: `${percentage}%`,
            backgroundColor: color,
            boxShadow: `0 0 6px ${color}60`
          }}
          aria-valuenow={percentage}
          aria-valuemin="0"
          aria-valuemax="100"
          role="progressbar"
        />
      </div>
      <span className="document-status-bar__count">
        {count.toLocaleString()}
      </span>
    </div>
  );
}

// Helper function to render pie chart labels
function renderPieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value }) {
  try {
    // Skip rendering if values are invalid or percentage is too small
    if (!cx || !cy || value <= 0 || percent < 0.06) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = 20 + (innerRadius || 0) + ((outerRadius || 0) - (innerRadius || 0));
    const x = cx + radius * Math.cos(-(midAngle || 0) * RADIAN);
    const y = cy + radius * Math.sin(-(midAngle || 0) * RADIAN);
    
    // Don't render if coordinates are invalid
    if (isNaN(x) || isNaN(y)) return null;
    
    return (
      <text
        x={x}
        y={y}
        fill="#1a237e"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        style={{
          fontSize: '11px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.3px',
          pointerEvents: 'none',
          textShadow: '0 0 3px white, 0 0 3px white, 0 0 3px white',
          opacity: 1
        }}
      >
        {`${name || ''} (${value})`}
      </text>
    );
  } catch (error) {
    console.error('Error rendering pie label:', error);
    return null;
  }
}

// Helper function to format tooltip
function formatTooltip(value, name, props) {
  try {
    if (!props || !props.payload || !Array.isArray(props.payload)) {
      return [`${value}`, name];
    }
    const total = props.payload.reduce((sum, item) => sum + (item?.value || 0), 0);
    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
    return [`${value} (${percentage}%)`, name];
  } catch (error) {
    console.error('Error in tooltip formatter:', error);
    return [`${value}`, name];
  }
}

// Helper function to calculate percentage
function calculatePercentage(value, total) {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}