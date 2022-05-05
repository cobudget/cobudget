export function get (key: string) {
    try {
        const text = localStorage.getItem(key);
        return JSON.parse(text);
    }
    catch (err) {
        return null
    }
}

export function set (key: string, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    }
    catch (err) {
        return false;
    }
}