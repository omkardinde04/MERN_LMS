// Local Storage utility functions

export const getUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

export const setUser = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
};

export const removeUser = () => {
    localStorage.removeItem('user');
};

export const isAuthenticated = () => {
    return !!getUser();
};

export const getUserRole = () => {
    const user = getUser();
    return user?.role || null;
};

// Get data from localStorage
export const getLocalData = (key, defaultValue = []) => {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error(`Error reading ${key} from localStorage:`, error);
        return defaultValue;
    }
};

// Save data to localStorage
export const setLocalData = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error saving ${key} to localStorage:`, error);
    }
};

// Remove data from localStorage
export const removeLocalData = (key) => {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error(`Error removing ${key} from localStorage:`, error);
    }
};
