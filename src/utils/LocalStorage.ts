export function setItem(key : string, value : unknown) {
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error("Error setting item in localStorage: ", e);
    }
}

export function getItem(key : string) {
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (e) {
        console.error("Error getting item from localStorage: ", e);
        return null;
    }
}