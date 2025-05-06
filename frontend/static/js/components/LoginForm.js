const { useState } = React;

    const LoginForm = ({ onLoginSuccess }) => {
        const [username, setUsername] = useState('');
        const [password, setPassword] = useState('');
        const [notification, setNotification] = useState(null);
        const [loading, setLoading] = useState(false);


        const showNotification = (message, type) => {
            setNotification({ message, type });
            setTimeout(() => setNotification(null), 5000);
        }


        const handleSubmit = async (e) => {
            e.preventDefault();
            setLoading(true);
            setNotification(null);


            fetch('/auth/v1/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password }),
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.access && data.refresh) {
                        setCookie('access', data.access, 60);
                        setCookie('refresh', data.refresh, 7 * 24 * 60);
                        setLoading(false);
                        showNotification('Login successful!', 'is-success');
                        onLoginSuccess();
                    } else {
                        throw new Error("Invalid response from server");
                    }
                })
                .catch(err => {
                    setLoading(false);
                    showNotification(err.message || 'Login failed. Please check your credentials.', 'is-danger');
                });
        };


        return (
            <div className="columns is-centered">
                <div className="column is-half">
                    <div className="box mx-auto" style={{ maxWidth: '500px' }}>
                        <h1 className="title has-text-centered">Login</h1>
                        {notification && (
                            <div className={`notification ${notification.type}`}>
                                <button className="delete" onClick={() => setNotification(null)}></button>
                                {notification.message}
                            </div>
                        )}
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
                                    onClick={handleSubmit}
                                    disabled={loading}
                                >
                                    Login
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };
