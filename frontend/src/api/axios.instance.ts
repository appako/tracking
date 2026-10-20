import axios, { isAxiosError, type AxiosRequestConfig } from 'axios';

export const API_AXIOS = axios.create({
    baseURL: process.env.API_HOST,
    headers: {
        common: new axios.AxiosHeaders({ 'Cache-Control': 'no-cache', Pragma: 'no-cache', Expires: '0' }),
    },
});

export const axiosInstance = <T>(options: AxiosRequestConfig): Promise<T> =>
    API_AXIOS<T>(options).then(({ data }) => data);

export function getAxiosErrorMessage<T extends { statusCode: number; message: string }>(error: unknown) {
    if (isAxiosError<T>(error)) {
        if (error.response?.data && 'message' in error.response.data) {
            return error.response.data.message;
        } else return error.message;
    }
}
