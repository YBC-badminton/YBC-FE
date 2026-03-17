// hooks/useAxios.ts
import { useState, useEffect, useCallback } from 'react';
import axios, { AxiosRequestConfig } from 'axios';

export function useAxios<T>(url: string, config?: AxiosRequestConfig) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 데이터를 다시 불러오고 싶을 때 호출할 수 있도록 함수화
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
        const res = await axios.get<T>(url, config);
        setData(res.data);
        } catch (err) {
        if (axios.isAxiosError(err)) {
            setError(err.message);
        } else {
            setError('An unexpected error occurred');
        }
        } finally {
        setLoading(false);
        }
    }, [url, config]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
    }