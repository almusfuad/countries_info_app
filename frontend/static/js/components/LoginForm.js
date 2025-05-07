const LoginForm = ({ onLoginSuccess }) => {
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post('/auth/v1/login/', {
                username,
                password
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const { access, refresh } = response.data;
            if (access && refresh) {
                setCookie('access', access, 60); // 60 minutes
                setCookie('refresh', refresh, 7 * 24 * 60); // 7 days
                showNotification('Login successful!', 'is-success');
                onLoginSuccess();
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error) {
            console.error('Login error:', error);
            const message = error.response?.status === 400
                ? 'Invalid username or password.'
                : error.response?.data?.detail || 'Login failed. Please try again.';
            showNotification(message, 'is-danger');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="columns is-centered">
            <div className="column is-half">
                <div className="box mx-auto" style={{ maxWidth: '500px' }}>
                    <h1 className="title has-text-centered">Login</h1>
                    <form onSubmit={handleSubmit}>
                        <div className="field">
                            <label className="label">Username</label>
                            <div className="control has-icons-left">
                                <input
                                    className="input"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    placeholder="Enter your username"
                                    disabled={loading}
                                />
                                <span className="icon is-small is-left">
                                    <i className="fas fa-user"></i>
                                </span>
                            </div>
                        </div>
                        <div className="field">
                            <label className="label">Password</label>
                            <div className="control has-icons-left">
                                <input 
                                    className="input"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="Enter your password"
                                    disabled={loading}
                                />
                                <span className="icon is-small is-left">
                                    <i className="fas fa-lock"></i>
                                </span>
                            </div>
                        </div>
                        <div className="field">
                            <div className="control">
                                <button
                                    className={`button is-primary is-fullwidth ${loading ? 'is-loading' : ''}`}
                                    type="submit"
                                    disabled={loading}
                                >
                                    Login
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
