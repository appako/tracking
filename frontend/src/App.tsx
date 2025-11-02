import React, { useState, useEffect } from 'react';
import './App.css';
import MapView from './components/MapView';
import ObjectForm from './components/ObjectForm';
import ObjectList from './components/ObjectList';
import { TrackingObject, CreateTrackingObjectDto, UpdateTrackingObjectDto } from './types/TrackingObject';
import { api } from './services/api';
import { socketService } from './services/socket';

function App() {
  const [objects, setObjects] = useState<TrackingObject[]>([]);
  const [selectedObject, setSelectedObject] = useState<TrackingObject | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formLatLng, setFormLatLng] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadObjects();
    setupWebSocket();

    return () => {
      socketService.removeAllListeners();
      socketService.disconnect();
    };
  }, []);

  const setupWebSocket = () => {
    socketService.connect();

    socketService.onObjectCreated((object) => {
      setObjects((prev) => {
        if (prev.find((o) => o.id === object.id)) {
          return prev;
        }
        return [...prev, object];
      });
    });

    socketService.onObjectUpdated((object) => {
      setObjects((prev) => prev.map((o) => (o.id === object.id ? object : o)));
    });

    socketService.onObjectDeleted((id) => {
      setObjects((prev) => prev.filter((o) => o.id !== id));
    });
  };

  const loadObjects = async () => {
    try {
      setLoading(true);
      const data = await api.getAllObjects();
      setObjects(data);
      setError(null);
    } catch (err) {
      setError('Failed to load objects. Make sure the backend is running.');
      console.error('Error loading objects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    setFormLatLng({ lat, lng });
    setSelectedObject(null);
    setShowForm(true);
  };

  const handleMarkerClick = (object: TrackingObject) => {
    setSelectedObject(object);
    setFormLatLng(null);
    setShowForm(false);
  };

  const handleCreateOrUpdate = async (
    data: CreateTrackingObjectDto | UpdateTrackingObjectDto,
    id?: string
  ) => {
    try {
      if (id) {
        await api.updateObject(id, data as UpdateTrackingObjectDto);
      } else {
        await api.createObject(data as CreateTrackingObjectDto);
      }
      setShowForm(false);
      setSelectedObject(null);
      setFormLatLng(null);
    } catch (err) {
      console.error('Error creating/updating object:', err);
      alert('Failed to save object. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteObject(id);
    } catch (err) {
      console.error('Error deleting object:', err);
      alert('Failed to delete object. Please try again.');
    }
  };

  const handleEdit = (object: TrackingObject) => {
    setSelectedObject(object);
    setFormLatLng(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedObject(null);
    setFormLatLng(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🗺️ Object Tracking System</h1>
        <p>Real-time tracking with interactive map</p>
      </header>

      {error && (
        <div className="error-banner">
          ⚠️ {error}
        </div>
      )}

      <div className="App-container">
        <div className="App-sidebar">
          {showForm && (
            <ObjectForm
              object={selectedObject}
              latitude={formLatLng?.lat}
              longitude={formLatLng?.lng}
              onSubmit={handleCreateOrUpdate}
              onCancel={handleCancel}
            />
          )}

          {!showForm && !loading && (
            <ObjectList
              objects={objects}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSelect={handleMarkerClick}
            />
          )}

          {loading && (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              Loading objects...
            </div>
          )}
        </div>

        <div className="App-map">
          <MapView
            objects={objects}
            onMapClick={handleMapClick}
            onMarkerClick={handleMarkerClick}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
