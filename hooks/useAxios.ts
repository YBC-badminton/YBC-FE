import { useState, useEffect, useCallback } from 'react';
import api from '../lib/axios';
import { AxiosRequestConfig } from 'axios';

export function useAxios<T>(url: string, config?: AxiosRequestConfig) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get<T>(url, config);
            setData(res.data);
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } }; message?: string })
                ?.response?.data?.message
                || (err as { message?: string })?.message
                || 'An unexpected error occurred';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [url, config]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
}
