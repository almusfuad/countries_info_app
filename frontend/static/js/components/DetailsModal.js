const DetailsModal = ({ country, countries, onClose, onDelete }) => {
    if (!country) {
        console.error('Invalid country data:', country);
        return null;
    }

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

        try {
            const accessToken = getCookie('access');
            if (!accessToken) {
                throw new Error('No authentication token found. Please log in.');
            }

            await axios.delete(`/api/v1/countries/${country.id}/`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            showNotification(`Country '${country.name}' has been soft-deleted.`, 'is-success');
            if (onDelete) {
                onDelete(country.id);
            }
            onClose();
        } catch (error) {
            console.error('Error deleting country:', error);
            const message = error.response?.data?.detail || 'Failed to delete country. Please try again.';
            showNotification(message, 'is-danger');
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
                <footer className="modal-card-foot">
                    <button className="button" onClick={onClose}>Close</button>
                    <button className="button is-danger" onClick={handleDelete}>Delete</button>
                </footer>
            </div>
        </div>
    );
};
