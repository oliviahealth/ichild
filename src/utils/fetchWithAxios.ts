import axios, { AxiosRequestConfig } from "axios";
import useAppStore from "../stores/useAppStore";

type HttpMethod = 'GET' | 'POST' | 'DELETE';

interface IAxiosRequestHeaders extends AxiosRequestConfig {
    name: string,
    content: string
}


const axiosInstance = axios.create({ withCredentials: true })

/*
    This function acts as a wrapper around axios.
    If there is an error, pass the error to the zustand error state
    If there is not error, return the data
*/
const fetchWithAxios = async (url: string, method: HttpMethod = 'GET', payload: any = null, requestHeaders: IAxiosRequestHeaders | null = null) => {
    try {
        let response;

        const headers = requestHeaders
            ? {
                headers: {
                    [requestHeaders.name]: requestHeaders.content,
                },
            }
            : {};

        switch (method) {
            case 'GET':
                response = await axiosInstance.get(url, headers);
                break;
            case 'POST':
                response = await axiosInstance.post(url, payload, headers);
                break;
            case 'DELETE':
                response = await axiosInstance.delete(url, headers);
                break;
            default:
                throw new Error(`Unsupported method: ${method}`);
        }

        return response?.data;
    } catch (error: any) {
        const errorMessage = error.response.data.error ?? error.message;

        useAppStore.setState({ error: errorMessage });
        return null;
    };
}

export default fetchWithAxios;