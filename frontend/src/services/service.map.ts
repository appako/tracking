import { action, makeObservable, observable } from 'mobx';
import { singleton } from 'tsyringe';
import { ObjectDto } from '~/api/generated.schemas';

@singleton()
export class MapService {
    @observable center: L.LatLngExpression = { lat: 49, lng: 35 };
    @observable zoom = 5;

    constructor() {
        makeObservable(this);
    }

    @action.bound setZoom(zoom: number) {
        this.zoom = zoom;
    }

    @action.bound setView(center: Pick<ObjectDto, 'latitude' | 'longitude'>, zoom: number) {
        this.center = { lat: center.latitude, lng: center.longitude };
        this.zoom = zoom;
    }

    @action.bound flyTo(center: Pick<ObjectDto, 'latitude' | 'longitude'>, zoom?: number) {
        this.center = { lat: center.latitude, lng: center.longitude };
        if (zoom !== undefined) {
            this.zoom = zoom;
        }
    }
}
