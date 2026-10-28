import { action, makeObservable, observable } from 'mobx';
import { useTypedSearchParams } from 'react-router-typesafe-routes';
import { singleton } from 'tsyringe';
import { ObjectDto } from '~/api/generated.schemas';
import { MapRenderer, ROUTES } from '~/routes';

export interface MapViewport {
    center: { lat: number; lng: number };
    zoom: number;
}

@singleton()
export class MapService {
    private static readonly DEFAULT_RENDERER: MapRenderer = 'webgl';
    private static readonly FALLBACK_RENDERER: MapRenderer = 'leaflet';

    readonly isWebglSupported = MapService.detectWebgl2();

    @observable.ref focus: MapViewport | undefined = undefined;
    @observable selectedId: string | undefined = undefined;

    viewport: MapViewport = { center: { lat: 49, lng: 35 }, zoom: 5 };

    constructor() {
        makeObservable(this);
    }

    @action.bound showObject(object: ObjectDto, zoom: number) {
        this.focus = { center: { lat: object.latitude, lng: object.longitude }, zoom };
        this.selectedId = object.id;
    }

    @action.bound select(id: string | undefined) {
        this.selectedId = id;
    }

    saveViewport(viewport: MapViewport) {
        this.viewport = viewport;
    }

    useRenderer = (): [MapRenderer, (renderer: MapRenderer) => void] => {
        const [{ renderer = MapService.DEFAULT_RENDERER }, setSearchParams] = useTypedSearchParams(ROUTES.MAP);
        const setRenderer = (next: MapRenderer) =>
            setSearchParams(params => ({ ...params, renderer: next }), { replace: true });

        return [this.isWebglSupported ? renderer : MapService.FALLBACK_RENDERER, setRenderer];
    };

    private static detectWebgl2() {
        try {
            return !!document.createElement('canvas').getContext('webgl2');
        } catch {
            return false;
        }
    }
}
