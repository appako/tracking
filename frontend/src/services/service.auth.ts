import { action, computed, makeObservable, observable } from 'mobx';
import { useCallback, useEffect } from 'react';
import { singleton } from 'tsyringe';
import { getAxiosErrorMessage } from '~/api';
import { LoginDto } from '~/api/generated.schemas';
import { queryClient } from '~/api/query.client';
import { ApiService } from './service.api';
import { ObjectsService } from './service.objects';

export type AuthStatus = 'verifying' | 'authenticated' | 'anonymous';

@singleton()
export class AuthService {
    private static readonly API_KEY_STORAGE_KEY = 'apiKey';

    @observable apiKey: string | null = null;
    @observable status: AuthStatus = 'verifying';

    constructor(
        private apiSvc: ApiService,
        private objectsSvc: ObjectsService,
    ) {
        makeObservable(this);
    }

    @computed get isAuthenticated() {
        return this.status === 'authenticated';
    }

    useVerify = () => {
        const { mutateAsync: verify } = this.apiSvc.useAuthControllerVerify();
        useEffect(() => {
            const apiKey = window.sessionStorage.getItem(AuthService.API_KEY_STORAGE_KEY);
            if (!apiKey) {
                this.setStatus('anonymous');
                return;
            }

            verify({ data: { apiKey } })
                .then(data => {
                    if (data.valid) this.setAuthenticated(data.apiKey);
                    else this.logout();
                })
                // Keep the stored key on network errors so the session survives a backend restart
                .catch(() => this.setStatus('anonymous'));
        }, [verify]);
    };

    useLogin = (onError: (message: string | undefined) => void) => {
        const { mutateAsync: login } = this.apiSvc.useAuthControllerLogin();

        const onSubmit = useCallback(
            (data: LoginDto) =>
                login({ data })
                    .then(data => {
                        if (data.valid) this.setAuthenticated(data.apiKey);
                    })
                    .catch(err => {
                        const message = getAxiosErrorMessage(err);
                        onError(message);
                    }),
            [login, onError],
        );

        return { onSubmit };
    };

    @action.bound logout() {
        this.apiKey = null;
        this.status = 'anonymous';
        delete this.apiSvc.axios.defaults.headers.common.Authorization;
        window.sessionStorage.removeItem(AuthService.API_KEY_STORAGE_KEY);
        this.objectsSvc.clear();
        queryClient.clear();
    }

    @action.bound private setStatus(status: AuthStatus) {
        this.status = status;
    }

    @action.bound private setAuthenticated(apiKey: string) {
        this.apiKey = apiKey;
        this.status = 'authenticated';
        this.apiSvc.axios.defaults.headers.common.Authorization = apiKey;
        window.sessionStorage.setItem(AuthService.API_KEY_STORAGE_KEY, apiKey);
    }
}
