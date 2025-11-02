import React, { useState, useEffect } from 'react';
import { TrackingObject, CreateTrackingObjectDto, UpdateTrackingObjectDto } from '../types/TrackingObject';

interface ObjectFormProps {
  object?: TrackingObject | null;
  latitude?: number;
  longitude?: number;
  onSubmit: (data: CreateTrackingObjectDto | UpdateTrackingObjectDto, id?: string) => void;
  onCancel: () => void;
}

const ObjectForm: React.FC<ObjectFormProps> = ({
  object,
  latitude,
  longitude,
  onSubmit,
  onCancel,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [lat, setLat] = useState(latitude || 0);
  const [lng, setLng] = useState(longitude || 0);

  useEffect(() => {
    if (object) {
      setName(object.name);
      setDescription(object.description || '');
      setLat(object.latitude);
      setLng(object.longitude);
    } else if (latitude !== undefined && longitude !== undefined) {
      setLat(latitude);
      setLng(longitude);
    }
  }, [object, latitude, longitude]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name,
      description: description || undefined,
      latitude: lat,
      longitude: lng,
      isActive: true,
    };

    if (object) {
      onSubmit(data, object.id);
    } else {
      onSubmit(data);
    }
  };

  return (
    <div style={styles.formContainer}>
      <h3>{object ? 'Edit Object' : 'Add New Object'}</h3>
      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label>Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        
        <div style={styles.formGroup}>
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={styles.textarea}
          />
        </div>
        
        <div style={styles.formGroup}>
          <label>Latitude *</label>
          <input
            type="number"
            step="any"
            value={lat}
            onChange={(e) => setLat(parseFloat(e.target.value))}
            required
            style={styles.input}
          />
        </div>
        
        <div style={styles.formGroup}>
          <label>Longitude *</label>
          <input
            type="number"
            step="any"
            value={lng}
            onChange={(e) => setLng(parseFloat(e.target.value))}
            required
            style={styles.input}
          />
        </div>
        
        <div style={styles.buttonGroup}>
          <button type="submit" style={styles.submitButton}>
            {object ? 'Update' : 'Create'}
          </button>
          <button type="button" onClick={onCancel} style={styles.cancelButton}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

const styles = {
  formContainer: {
    padding: '20px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  formGroup: {
    marginBottom: '15px',
  },
  input: {
    width: '100%',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
  },
  textarea: {
    width: '100%',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    minHeight: '80px',
    resize: 'vertical' as const,
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
  },
  submitButton: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  cancelButton: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
};

export default ObjectForm;
