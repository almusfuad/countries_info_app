const DetailsModal = ({ country, countries, onClose, onDelete }) => {
    const [isDeleting, setIsDeleting] = React.useState(false);

    if (!country) {
        console.error('Invalid country data:', country);
        return null;
    }

    console.log('Rendering DetailsModal for country:', country);

    const sameRegionCountries = Array.isArray(countries)
        ? countries.filter(c => c.region === country.region && c.name !== country.name)
        : [];
    const languages = Array.isArray(country.languages) && country.languages.length > 0
        ? country.languages.join(', ')
        : 'N/A';
    const currencies = Array.isArray(country.currencies) && country.currencies.length > 0
        ? country.currencies.join(', ')
        : 'N/A';

    const handleDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete ${country.name}?`)) {
            return;
        }

        setIsDeleting(true);
        console.log('Attempting to delete country ID:', country.id);

        try {
            const accessToken = getCookie('access');
            if (!accessToken) {
                throw new Error('No authentication token found. Please log in.');
            }

            console.log('Sending DELETE request to:', `/api/v1/countries/${country.id}/`);
            await axios.delete(`/api/v1/countries/${country.id}/`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            showNotification(`Country '${country.name}' has been soft-deleted.`, 'is-success');
            if (onDelete) {
                console.log('Calling onDelete with ID:', country.id);
                onDelete(country.id);
            }
            onClose();
        } catch (error) {
            console.error('Error deleting country:', error);
            const message = error.response?.data?.detail || 'Failed to delete country. Please try again.';
            showNotification(message, 'is-danger');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="modal is-active">
            <div className="modal-background" onClick={onClose}></div>
            <div className="modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title">{country.name || 'Country Details'}</p>
                    <button className="delete" aria-label="close" onClick={onClose}></button>
                </header>
                <section className="modal-card-body">
                    <h2 className="subtitle">Region</h2>
                    <p>{country.region || 'N/A'}</p>
                    <h2 className="subtitle mt-4">Subregion</h2>
                    <p>{country.subregion || 'N/A'}</p>
                    <h2 className="subtitle mt-4">Area (km²)</h2>
                    <p>{typeof country.area === 'number' ? country.area.toLocaleString() : 'N/A'}</p>
                    <h2 className="subtitle mt-4">Spoken Languages</h2>
                    <p>{languages}</p>
                    <h2 className="subtitle mt-4">Currencies</h2>
                    <p>{currencies}</p>
                    <h2 className="subtitle mt-4">Same Region Countries ({country.region || 'N/A'})</h2>
                    {sameRegionCountries.length > 0 ? (
                        <ul>
                            {sameRegionCountries.map(c => (
                                <li key={c.name || Math.random()}>{c.name || 'Unknown'}</li>
                            ))}
                        </ul>
                    ) : (
                        <p>No other countries in this region.</p>
                    )}
                </section>
                <footer className="modal-card-foot" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button className="button" onClick={onClose} disabled={isDeleting}>Close</button>
                    <button 
                        className="button is-danger" 
                        onClick={handleDelete} 
                        disabled={isDeleting}
                        style={{ display: 'inline-block', visibility: 'visible' }}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                </footer>
            </div>
        </div>
    );
};
