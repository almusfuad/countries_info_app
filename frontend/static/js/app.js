const App = () => {
    const [isLoggedIn, setIsLoggedIn] = React.useState(false);
    const [countries, setCountries] = React.useState([]);
    const [paginationData, setPaginationData] = React.useState({ count: 0, next: null, previous: null });
    const [loading, setLoading] = React.useState(true);

    const fetchCountries = async (token, { page = 1, url = null } = {}) => {
        try {
            const fetchUrl = url || `/api/v1/countries/?page=${page}&page_size=25`;
            const response = await fetch(fetchUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });
            if (response.status === 401) {
                const newToken = await refreshAccessToken();
                if (newToken) {
                    return fetchCountries(newToken, { page, url });
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
            return {
                results: normalizedData,
                count: data.count || 0,
                next: data.next || null,
                previous: data.previous || null
            };
        } catch (err) {
            console.error('Fetch countries error:', err);
            showNotification('Failed to fetch countries. Please try again later.', 'is-danger');
            return { results: [], count: 0, next: null, previous: null };
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
            const data = await fetchCountries(accessToken, { page: 1 });
            console.log('Setting countries:', data.results);
            setCountries(data.results);
            setPaginationData({ count: data.count, next: data.next, previous: data.previous });
            setIsLoggedIn(true);
        } catch (err) {
            console.error('Check login status error:', err);
            setIsLoggedIn(false);
            showNotification('Failed to validate session.', 'is-danger');
        }
        setLoading(false);
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
                },
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
                    setPaginationData({ count: 0, next: null, previous: null });
                });
        } else {
            deleteCookie('access');
            deleteCookie('refresh');
            setIsLoggedIn(false);
            setCountries([]);
            setPaginationData({ count: 0, next: null, previous: null });
        }
    };

    React.useEffect(() => {
        checkLoginStatus();
    }, []);

    return (
        <div>
            {loading ? (
                <div className="has-text-centered">
                    <span className="icon is-large">
                        <i className="fas fa-spinner fa-pulse fa-2x"></i>
                    </span>
                </div>
            ) : isLoggedIn ? (
                <CountriesList 
                    countries={countries} 
                    onLogout={handleLogout} 
                    setCountries={setCountries}
                    paginationData={paginationData}
                    fetchCountries={fetchCountries}
                />
            ) : (
                <LoginForm onLoginSuccess={checkLoginStatus} />
            )}
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));
