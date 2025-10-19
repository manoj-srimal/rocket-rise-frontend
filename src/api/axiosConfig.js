import axios from 'axios';

// 1. Environment variable එකෙන් URL එක ගන්නවා
const liveApiUrl = process.env.REACT_APP_API_URL;
const localApiUrl = 'http://localhost:8080/api';

// 2. Live URL එකක් තියෙනවද බලලා, ඒකේ අග තියෙන "/" ලකුණ (තිබේ නම්) අයින් කරනවා
const getBaseUrl = () => {
    if (liveApiUrl) {
        return liveApiUrl.replace(/\/$/, ''); // Removes trailing slash
    }
    return localApiUrl; // Live එකක් නැත්නම්, local එක පාවිච්චි කරනවා
};

const api = axios.create({
    baseURL: getBaseUrl()
});

// 3. Request එක යවන්න කලින්, Token එක header එකට එකතු කරනවා
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;