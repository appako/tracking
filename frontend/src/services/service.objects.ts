import { action, computed, makeObservable, observable, runInAction } from 'mobx';
import { useEffect } from 'react';
import { singleton } from 'tsyringe';
import { ObjectDto } from '~/api/generated.schemas';
import { ApiService } from './service.api';

@singleton()
export class ObjectsService {
    private readonly objects = observable.map<string, ObjectDto>();
    private readonly objectsInactivityTimeout = 5 * 60 * 1000; // 5 minutes

    constructor(private apiSvc: ApiService) {
        makeObservable(this);
        setInterval(() => {
            console.log('Objects internality check running');
            this.items.forEach(obj => {
                if (Date.now() - new Date(obj.updatedAt).getTime() > this.objectsInactivityTimeout) {
                    console.log(`Object ${obj.id} removed due to inactivity`);
                    runInAction(() => this.objects.delete(obj.id));
                }
            });
        }, 10000);
    }

    @computed get items() {
        return Array.from(this.objects.values());
    }

    @computed get itemsCount() {
        return this.objects.size;
    }

    useObjectsList = () => {
        const { data } = this.apiSvc.useObjectsControllerGetList();
        useEffect(() => {
            if (!data) return;
            data.forEach(obj => this.setObject(obj));
        }, [data]);
    };

    @action.bound setObject(object: ObjectDto) {
        this.objects.set(object.id, object);
    }

    @action.bound removeObject(objectId: string) {
        this.objects.delete(objectId);
    }
}
