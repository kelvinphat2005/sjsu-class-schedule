import { getItem, setItem } from "../utils/LocalStorage";
import { useEffect, useState } from "react";

export function usePersistedState<T>(key: string, initialValue: T) {
    const [value, setValue] = useState<T>(() => {
        const localValue = getItem(key);
        return (localValue as T) || initialValue;
    });

    useEffect( () => {
        setItem(key, value);
    }, [value]);

    return [value, setValue] as const;
}