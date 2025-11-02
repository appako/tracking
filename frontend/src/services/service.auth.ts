import { action, computed, makeObservable, observable } from 'mobx';
import { useCallback, useEffect } from 'react';
import { singleton } from 'tsyringe';
import { getAxiosErrorMessage } from '~/api';
import { LoginDto } from '~/api/generated.schemas';
import { ApiService } from './service.api';

@singleton()
export class AuthService {
    @observable isAuthenticated = false;

    constructor(private apiSvc: ApiService) {
        makeObservable(this);
    }

    useVerify = () => {
        const { mutateAsync: verify } = this.apiSvc.useAuthControllerVerify();
        useEffect(() => {
            const apiKey = window.sessionStorage.getItem('apiKey');
            if (!apiKey) return;

            verify({ data: { apiKey } }).then(data => {
                if (data.valid) this.setAuthenticated(data.apiKey);
            });
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

    logout = () => {
        this.setAuthenticated(undefined);
    };

    @action.bound setAuthenticated(value: string | undefined) {
        this.isAuthenticated = !!value;
        this.apiSvc.axios.defaults.headers.common.Authorization = value;
        if (value) window.sessionStorage.setItem('apiKey', value);
        else window.sessionStorage.removeItem('apiKey');
    }

    @computed get apiKey() {
        if (!this.isAuthenticated) return undefined;
        return window.sessionStorage.getItem('apiKey');
    }
}
