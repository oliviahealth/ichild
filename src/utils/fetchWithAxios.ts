import axios from "axios";
import useAppStore from "../stores/useAppStore";

type HttpMethod = 'GET' | 'POST' | 'DELETE';

const axiosInstance = axios.create({ withCredentials: true })

/*
    This function acts as a wrapper around axios.
    If there is an error, pass the error to the zustand error state
    If there is not error, return the data
*/
const fetchWithAxios = async (url: string, method: HttpMethod = 'GET', payload: any = null, headers: any = null) => {
    try {
        let response;

        if (method === 'GET') {
            response = await axiosInstance.get(url, { headers });
        } else if (method === 'POST') {
            response = await axiosInstance.post(url, payload, { headers });
        } else if (method === 'DELETE') {
            response = await axiosInstance.delete(url, { headers });
        }

        return response?.data
    } catch (error: any) {
        const errorMessage = error.response.data.error ?? error.message;

        useAppStore.setState({ error: errorMessage });
        return null;
    };
}

export default fetchWithAxios;