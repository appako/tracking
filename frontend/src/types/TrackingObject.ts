export interface TrackingObject {
  id: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  icon?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTrackingObjectDto {
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  icon?: string;
  isActive?: boolean;
}

export interface UpdateTrackingObjectDto {
  name?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  icon?: string;
  isActive?: boolean;
}
