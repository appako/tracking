import React from 'react';
import { TrackingObject } from '../types/TrackingObject';

interface ObjectListProps {
  objects: TrackingObject[];
  onEdit: (object: TrackingObject) => void;
  onDelete: (id: string) => void;
  onSelect: (object: TrackingObject) => void;
}

const ObjectList: React.FC<ObjectListProps> = ({ objects, onEdit, onDelete, onSelect }) => {
  return (
    <div style={styles.container}>
      <h3>Tracked Objects ({objects.length})</h3>
      <div style={styles.list}>
        {objects.length === 0 ? (
          <p style={styles.emptyMessage}>No objects tracked yet. Click on the map to add one!</p>
        ) : (
          objects.map((object) => (
            <div
              key={object.id}
              style={styles.item}
              onClick={() => onSelect(object)}
            >
              <div style={styles.itemHeader}>
                <h4 style={styles.itemName}>{object.name}</h4>
                <span style={object.isActive ? styles.activeStatus : styles.inactiveStatus}>
                  {object.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              {object.description && (
                <p style={styles.description}>{object.description}</p>
              )}
              <p style={styles.coordinates}>
                📍 {object.latitude.toFixed(4)}, {object.longitude.toFixed(4)}
              </p>
              <div style={styles.actions}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(object);
                  }}
                  style={styles.editButton}
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Delete "${object.name}"?`)) {
                      onDelete(object.id);
                    }
                  }}
                  style={styles.deleteButton}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    height: '100%',
    overflow: 'auto',
  },
  list: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
  },
  item: {
    padding: '15px',
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'box-shadow 0.2s',
  },
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  itemName: {
    margin: 0,
    fontSize: '16px',
  },
  activeStatus: {
    padding: '4px 8px',
    backgroundColor: '#28a745',
    color: 'white',
    borderRadius: '4px',
    fontSize: '12px',
  },
  inactiveStatus: {
    padding: '4px 8px',
    backgroundColor: '#dc3545',
    color: 'white',
    borderRadius: '4px',
    fontSize: '12px',
  },
  description: {
    margin: '8px 0',
    fontSize: '14px',
    color: '#666',
  },
  coordinates: {
    margin: '8px 0',
    fontSize: '14px',
    color: '#666',
  },
  actions: {
    display: 'flex',
    gap: '8px',
    marginTop: '10px',
  },
  editButton: {
    flex: 1,
    padding: '8px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  deleteButton: {
    flex: 1,
    padding: '8px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  emptyMessage: {
    textAlign: 'center' as const,
    color: '#666',
    padding: '20px',
  },
};

export default ObjectList;
