export function getUser() {
    const userStr = localStorage.getItem('user');
    try {
        return userStr ? JSON.parse(userStr) : null;
    } catch {
        return null;
    }
}

export function setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
}

export function removeUser() {
    localStorage.removeItem('user');
}
