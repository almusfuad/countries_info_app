const { useState, useEffect } = React;

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [countries, setCountries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);


    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 5000);
    };


    const refreshAccessToken = async () => {
        const refreshToken = getCookie('refresh');
        if (!refreshToken) {
            deleteCookie('access');
            deleteCookie('refresh');
            setIsLoggedIn(false);
            showNotification('Session expired. Please log in again.', 'is-danger');
            return null;
        }


        try {
            const response = await fetch('/auth/v1/token/refresh/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refresh: refreshToken }),
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            if (data.access) {
                setCookie('access', data.access, 60);
                return data.access;
            } else {
                throw new Error("Invalid response from server");
            }
        } catch (err) {
            deleteCookie('access');
            deleteCookie('refresh');
            setIsLoggedIn(false);
            showNotification('Session expired. Please log in again.', 'is-danger');
            return null;
        }
    };



    const fetchCountries = async (token) => {
        try {
            const response = await fetch('/api/v1/countries/', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });
            if (response.status === 401) {
                const newToken = await refreshAccessToken();
                if (newToken) {
                    return fetchCountries(newToken);
                }
                throw new Error('Unauthorized');
            }
            if (!response.ok) {
                throw new Error(`Failed to fetch countries: ${response.status}`);
            }
            const data = await response.json();
            console.log('Raw countries data:', data);
            const normalizedData = Array.isArray(data.results) ? data.results : [];
            if (normalizedData.length === 0) {
                console.warn('No countries in results:', data);
            }
            return normalizedData;
        } catch (err) {
            console.error('Fetch countries error:', err);
            showNotification('Failed to fetch countries. Please try again later.', 'is-danger');
            return [];
        }
    };


    const checkLoginStatus = async () => {
        const accessToken = getCookie('access');
        if (!accessToken) {
            setIsLoggedIn(false);
            setLoading(false);
            return;
        }


        setLoading(true);
        try {
            const data = await fetchCountries(accessToken);
            console.log('Setting countries:', data);
            setCountries(data);
            setIsLoggedIn(true);
        }
        catch (err) {
            console.error('Check login status error:', err);
            setIsLoggedIn(false);
            showNotification('Failed to validate session.', 'is-danger');
        }
        setLoading(false);
    };


    useEffect(() => {
        checkLoginStatus();
    }, []);


    const handleLoginSuccess = () => {
        checkLoginStatus();
    };


    const handleLogout = () => {
        const refreshToken = getCookie('refresh');
        const accessToken = getCookie('access');
        if (refreshToken) {
            fetch(`/auth/v1/logout/?refresh_token=${refreshToken}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            })
                .then(response => {
                    if (response.ok) {
                        showNotification('Logout successful!', 'is-success');
                    } else {
                        showNotification('Logout failed.', 'is-danger');
                    }
                })
                .catch(() => {
                    showNotification('Error during logout.', 'is-danger');
                })
                .finally(() => {
                    deleteCookie('access');
                    deleteCookie('refresh');
                    setIsLoggedIn(false);
                    setCountries([]);
                });
        } else {
            deleteCookie('access');
            deleteCookie('refresh');
            setIsLoggedIn(false);
            setCountries([]);
        }
    };


    return (
        <div>
            {notification && (
                <div className={`notification ${notification.type}`}>
                    <button className="delete" onClick={() => setNotification(null)}></button>
                    {notification.message}
                </div>
            )}
            {loading ? (
                <div className="has-text-centered">
                    <span className="icon is-large">
                        <i className="fas fa-spinner fa-pulse fa-2x"></i>
                    </span>
                </div>
            ) : isLoggedIn ? (
                <CountriesList countries={countries} onLogout={handleLogout} />
            ): (
                <LoginForm onLoginSuccess={handleLoginSuccess} />
            )}
        </div>
    );
};


ReactDOM.render(<App />, document.getElementById('root'));