import { TrackingObject, CreateTrackingObjectDto, UpdateTrackingObjectDto } from '../types/TrackingObject';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const api = {
  async getAllObjects(): Promise<TrackingObject[]> {
    const response = await fetch(`${API_BASE_URL}/tracking-objects`);
    if (!response.ok) throw new Error('Failed to fetch objects');
    return response.json();
  },

  async createObject(data: CreateTrackingObjectDto): Promise<TrackingObject> {
    const response = await fetch(`${API_BASE_URL}/tracking-objects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create object');
    return response.json();
  },

  async updateObject(id: string, data: UpdateTrackingObjectDto): Promise<TrackingObject> {
    const response = await fetch(`${API_BASE_URL}/tracking-objects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update object');
    return response.json();
  },

  async deleteObject(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/tracking-objects/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete object');
  },
};
