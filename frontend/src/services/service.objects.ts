import { action, computed, makeObservable, observable } from 'mobx';
import { singleton } from 'tsyringe';
import { ObjectDto } from '~/api/generated.schemas';
import { ApiService } from './service.api';

@singleton()
export class ObjectsService {
    // The backend does not announce removals: objects that stop receiving updates are dropped here
    private static readonly INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000;
    private static readonly CLEANUP_INTERVAL_MS = 10 * 1000;

    private readonly objects = observable.map<string, ObjectDto>(undefined, { deep: false });
    private cleanupTimer?: ReturnType<typeof setInterval>;

    constructor(private apiSvc: ApiService) {
        makeObservable(this);
    }

    @computed get items() {
        return Array.from(this.objects.values());
    }

    @computed get itemsCount() {
        return this.objects.size;
    }

    load = async () => {
        const objects = await this.apiSvc.objectsControllerGetList();
        this.setMany(objects);
    };

    @action.bound setMany(objects: ObjectDto[]) {
        objects.forEach(object => {
            const current = this.objects.get(object.id);
            if (current && Date.parse(current.updatedAt) > Date.parse(object.updatedAt)) return;
            this.objects.set(object.id, object);
        });
    }

    @action.bound clear() {
        this.objects.clear();
    }

    startCleanup() {
        if (this.cleanupTimer) return;
        this.cleanupTimer = setInterval(this.removeInactive, ObjectsService.CLEANUP_INTERVAL_MS);
    }

    stopCleanup() {
        clearInterval(this.cleanupTimer);
        this.cleanupTimer = undefined;
    }

    @action.bound private removeInactive() {
        const now = Date.now();
        this.objects.forEach((object, id) => {
            if (now - Date.parse(object.updatedAt) > ObjectsService.INACTIVITY_TIMEOUT_MS) this.objects.delete(id);
        });
    }
}
