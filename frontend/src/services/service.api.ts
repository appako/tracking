import { singleton } from 'tsyringe';
import { API_AXIOS } from '~/api/axios.instance';
import * as api from '~/api/generated';
import { HttpServiceBase } from './service.base';

@singleton()
export class ApiService extends HttpServiceBase(api) {
    readonly axios = API_AXIOS;
}
