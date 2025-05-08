const DetailsModal = ({ country, countries, onClose, onDelete, onUpdate }) => {
    const [isEditing, setIsEditing] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [formData, setFormData] = React.useState({
        name: country.name || '',
        capital: country.capital || '',
        region: country.region || '',
        subregion: country.subregion || '',
        population: country.population || '',
        area: country.area || '',
        languages: Array.isArray(country.languages) ? country.languages.join(', ') : '',
        currencies: Array.isArray(country.currencies) ? country.currencies.join(', ') : '',
        timezones: Array.isArray(country.timezones) ? country.timezones.join(', ') : '',
        flag: country.flag || '',
        cca2: country.cca2 || '',
        is_active: country.is_active !== false,
    });
    const [errors, setErrors] = React.useState({});

    if (!country) {
        console.error('Invalid country data:', country);
        return null;
    }

    console.log('Rendering DetailsModal for country:', country);

    const sameRegionCountries = Array.isArray(countries)
        ? countries.filter(c => c.region === country.region && c.name !== country.name)
        : [];

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const newErrors = {};
        // Name: required, >=2 chars, specific characters
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required.';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters long.';
        } else if (!/^[a-zA-Z\s'\-,.]+$/.test(formData.name.trim())) {
            newErrors.name = 'Name can only contain letters, spaces, apostrophes, hyphens, commas, or periods.';
        }

        // Capital: optional, specific characters
        if (formData.capital && !/^[a-zA-Z\s'\-,.]+$/.test(formData.capital.trim())) {
            newErrors.capital = 'Capital can only contain letters, spaces, apostrophes, hyphens, commas, or periods.';
        }

        // Region: required, specific characters
        if (!formData.region.trim()) {
            newErrors.region = 'Region is required.';
        } else if (formData.region && !/^[a-zA-Z\s'\-,.]+$/.test(formData.region.trim())) {
            newErrors.region = 'Region can only contain letters, spaces, apostrophes, hyphens, commas, or periods.';
        }

        // Subregion: optional, specific characters
        if (formData.subregion && !/^[a-zA-Z\s'\-,.]+$/.test(formData.subregion.trim())) {
            newErrors.subregion = 'Subregion can only contain letters, spaces, apostrophes, hyphens, commas, or periods.';
        }

        // Population: optional, non-negative, <=10^10
        if (formData.population) {
            const pop = parseFloat(formData.population);
            if (isNaN(pop)) {
                newErrors.population = 'Population must be a number.';
            } else if (pop < 0) {
                newErrors.population = 'Population cannot be negative.';
            } else if (pop > 10**10) {
                newErrors.population = 'Population exceeds realistic limits.';
            }
        }

        // Area: optional, non-negative, <=10^8
        if (formData.area) {
            const area = parseFloat(formData.area);
            if (isNaN(area)) {
                newErrors.area = 'Area must be a number.';
            } else if (area < 0) {
                newErrors.area = 'Area cannot be negative.';
            } else if (area > 10**8) {
                newErrors.area = 'Area exceeds realistic limits.';
            }
        }

        // Languages: optional, list of non-empty strings
        const languages = formData.languages ? formData.languages.split(',').map(l => l.trim()).filter(l => l) : [];
        if (languages.length > 100) {
            newErrors.languages = 'Too many languages specified (max 100).';
        } else if (languages.some(lang => !lang)) {
            newErrors.languages = 'Each language must be a non-empty string.';
        }

        // Currencies: optional, list of non-empty strings
        const currencies = formData.currencies ? formData.currencies.split(',').map(c => c.trim()).filter(c => c) : [];
        if (currencies.length > 50) {
            newErrors.currencies = 'Too many currencies specified (max 50).';
        } else if (currencies.some(curr => !curr)) {
            newErrors.currencies = 'Each currency must be a non-empty string.';
        }

        // Timezones: optional, list of non-empty strings
        const timezones = formData.timezones ? formData.timezones.split(',').map(t => t.trim()).filter(t => t) : [];
        if (timezones.length > 50) {
            newErrors.timezones = 'Too many timezones specified (max 50).';
        } else if (timezones.some(tz => !tz)) {
            newErrors.timezones = 'Each timezone must be a non-empty string.';
        }

        // At least one of languages, currencies, or timezones
        if (!languages.length && !currencies.length && !timezones.length) {
            newErrors.general = 'At least one of languages, currencies, or timezones must be provided.';
        }

        // Flag: optional, valid URL
        if (formData.flag && !/^https?:\/\/[^\s<>"]+|www\.[^\s<>"]+$/.test(formData.flag.trim())) {
            newErrors.flag = 'Invalid URL format for flag.';
        }

        // cca2: optional, 2-letter uppercase
        if (formData.cca2 && !/^[A-Z]{2}$/.test(formData.cca2.trim())) {
            newErrors.cca2 = 'cca2 must be a 2-letter uppercase code.';
        }

        return newErrors;
    };

    const handleUpdate = async () => {
        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const payload = {
            name: formData.name.trim(),
            capital: formData.capital.trim() || '',
            region: formData.region.trim(),
            subregion: formData.subregion.trim() || '',
            population: formData.population ? parseFloat(formData.population) : 0,
            area: formData.area ? parseFloat(formData.area) : 0,
            languages: formData.languages ? formData.languages.split(',').map(l => l.trim()).filter(l => l) : [],
            currencies: formData.currencies ? formData.currencies.split(',').map(c => c.trim()).filter(c => c) : [],
            timezones: formData.timezones ? formData.timezones.split(',').map(t => t.trim()).filter(t => t) : [],
            flag: formData.flag.trim() || '',
            cca2: formData.cca2.trim() || '',
        };

        try {
            const accessToken = getCookie('access');
            if (!accessToken) {
                throw new Error('No authentication token found. Please log in.');
            }

            console.log('Sending PATCH request to:', `/api/v1/countries/${country.id}/`, payload);
            const response = await axios.patch(`/api/v1/countries/${country.id}/`, payload, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            showNotification(`Country '${response.data.name}' updated successfully.`, 'is-success');
            if (onUpdate) {
                console.log('Calling onUpdate with updated country:', response.data);
                onUpdate(response.data);
            }
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating country:', error);
            const apiErrors = error.response?.data || {};
            const newErrors = {};
            Object.keys(apiErrors).forEach(key => {
                newErrors[key] = Array.isArray(apiErrors[key]) ? apiErrors[key].join(' ') : apiErrors[key];
            });
            if (Object.keys(newErrors).length === 0) {
                newErrors.general = 'Failed to update country. Please try again.';
            }
            setErrors(newErrors);
        }
    };

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

    const handleCancel = () => {
        setIsEditing(false);
        setFormData({
            name: country.name || '',
            capital: country.capital || '',
            region: country.region || '',
            subregion: country.subregion || '',
            population: country.population || '',
            area: country.area || '',
            languages: Array.isArray(country.languages) ? country.languages.join(', ') : '',
            currencies: Array.isArray(country.currencies) ? country.currencies.join(', ') : '',
            timezones: Array.isArray(country.timezones) ? country.timezones.join(', ') : '',
            flag: country.flag || '',
            cca2: country.cca2 || '',
            is_active: country.is_active !== false,
        });
        setErrors({});
    };

    return (
        <div className="modal is-active">
            <div className="modal-background" onClick={onClose}></div>
            <div className="modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title">
                        {isEditing ? 'Edit Country' : (country.name || 'Country Details')}
                    </p>
                    <button className="delete" aria-label="close" onClick={onClose} disabled={isDeleting}></button>
                </header>
                <section className="modal-card-body">
                    {isEditing ? (
                        <form>
                            {errors.general && <p className="help is-danger mb-4">{errors.general}</p>}
                            <div className="field">
                                <label className="label">Name *</label>
                                <div className="control">
                                    <input
                                        className={`input ${errors.name ? 'is-danger' : ''}`}
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter country name"
                                        disabled={isDeleting}
                                    />
                                </div>
                                {errors.name && <p className="help is-danger">{errors.name}</p>}
                            </div>
                            <div className="field">
                                <label className="label">Capital</label>
                                <div className="control">
                                    <input
                                        className={`input ${errors.capital ? 'is-danger' : ''}`}
                                        type="text"
                                        name="capital"
                                        value={formData.capital}
                                        onChange={handleChange}
                                        placeholder="Enter capital"
                                        disabled={isDeleting}
                                    />
                                </div>
                                {errors.capital && <p className="help is-danger">{errors.capital}</p>}
                            </div>
                            <div className="field">
                                <label className="label">Region *</label>
                                <div className="control">
                                    <input
                                        className={`input ${errors.region ? 'is-danger' : ''}`}
                                        type="text"
                                        name="region"
                                        value={formData.region}
                                        onChange={handleChange}
                                        placeholder="Enter region"
                                        disabled={isDeleting}
                                    />
                                </div>
                                {errors.region && <p className="help is-danger">{errors.region}</p>}
                            </div>
                            <div className="field">
                                <label className="label">Subregion</label>
                                <div className="control">
                                    <input
                                        className={`input ${errors.subregion ? 'is-danger' : ''}`}
                                        type="text"
                                        name="subregion"
                                        value={formData.subregion}
                                        onChange={handleChange}
                                        placeholder="Enter subregion"
                                        disabled={isDeleting}
                                    />
                                </div>
                                {errors.subregion && <p className="help is-danger">{errors.subregion}</p>}
                            </div>
                            <div className="field">
                                <label className="label">Population</label>
                                <div className="control">
                                    <input
                                        className={`input ${errors.population ? 'is-danger' : ''}`}
                                        type="text"
                                        name="population"
                                        value={formData.population}
                                        onChange={handleChange}
                                        placeholder="Enter population (e.g., 1000000)"
                                        disabled={isDeleting}
                                    />
                                </div>
                                {errors.population && <p className="help is-danger">{errors.population}</p>}
                            </div>
                            <div className="field">
                                <label className="label">Area in km²</label>
                                <div className="control">
                                    <input
                                        className={`input ${errors.area ? 'is-danger' : ''}`}
                                        type="text"
                                        name="area"
                                        value={formData.area}
                                        onChange={handleChange}
                                        placeholder="Enter area (e.g., 123456)"
                                        disabled={isDeleting}
                                    />
                                </div>
                                {errors.area && <p className="help is-danger">{errors.area}</p>}
                            </div>
                            <div className="field">
                                <label className="label">Languages (comma-separated)</label>
                                <div className="control">
                                    <input
                                        className={`input ${errors.languages ? 'is-danger' : ''}`}
                                        type="text"
                                        name="languages"
                                        value={formData.languages}
                                        onChange={handleChange}
                                        placeholder="e.g., English, French"
                                        disabled={isDeleting}
                                    />
                                </div>
                                {errors.languages && <p className="help is-danger">{errors.languages}</p>}
                            </div>
                            <div className="field">
                                <label className="label">Currencies (comma-separated)</label>
                                <div className="control">
                                    <input
                                        className={`input ${errors.currencies ? 'is-danger' : ''}`}
                                        type="text"
                                        name="currencies"
                                        value={formData.currencies}
                                        onChange={handleChange}
                                        placeholder="e.g., USD, EUR"
                                        disabled={isDeleting}
                                    />
                                </div>
                                {errors.currencies && <p className="help is-danger">{errors.currencies}</p>}
                            </div>
                            <div className="field">
                                <label className="label">Timezones (comma-separated)</label>
                                <div className="control">
                                    <input
                                        className={`input ${errors.timezones ? 'is-danger' : ''}`}
                                        type="text"
                                        name="timezones"
                                        value={formData.timezones}
                                        onChange={handleChange}
                                        placeholder="e.g., UTC+01:00, UTC+02:00"
                                        disabled={isDeleting}
                                    />
                                </div>
                                {errors.timezones && <p className="help is-danger">{errors.timezones}</p>}
                            </div>
                            <div className="field">
                                <label className="label">Flag URL</label>
                                <div className="control">
                                    <input
                                        className={`input ${errors.flag ? 'is-danger' : ''}`}
                                        type="text"
                                        name="flag"
                                        value={formData.flag}
                                        onChange={handleChange}
                                        placeholder="e.g., https://example.com/flag.png"
                                        disabled={isDeleting}
                                    />
                                </div>
                                {errors.flag && <p className="help is-danger">{errors.flag}</p>}
                            </div>
                            <div className="field">
                                <label className="label">CCA2 (2-letter code)</label>
                                <div className="control">
                                    <input
                                        className={`input ${errors.cca2 ? 'is-danger' : ''}`}
                                        type="text"
                                        name="cca2"
                                        value={formData.cca2}
                                        onChange={handleChange}
                                        placeholder="e.g., NL"
                                        disabled={isDeleting}
                                    />
                                </div>
                                {errors.cca2 && <p className="help is-danger">{errors.cca2}</p>}
                            </div>
                        </form>
                    ) : (
                        <>
                            <h2 className="subtitle">Region</h2>
                            <p>{country.region || 'N/A'}</p>
                            <h2 className="subtitle mt-4">Subregion</h2>
                            <p>{country.subregion || 'N/A'}</p>
                            <h2 className="subtitle mt-4">Capital</h2>
                            <p>{country.capital || 'N/A'}</p>
                            <h2 className="subtitle mt-4">Population</h2>
                            <p>{typeof country.population === 'number' ? country.population.toLocaleString() : 'N/A'}</p>
                            <h2 className="subtitle mt-4">Area (km²)</h2>
                            <p>{typeof country.area === 'number' ? country.area.toLocaleString() : 'N/A'}</p>
                            <h2 className="subtitle mt-4">Spoken Languages</h2>
                            <p>{Array.isArray(country.languages) && country.languages.length > 0 ? country.languages.join(', ') : 'N/A'}</p>
                            <h2 className="subtitle mt-4">Currencies</h2>
                            <p>{Array.isArray(country.currencies) && country.currencies.length > 0 ? country.currencies.join(', ') : 'N/A'}</p>
                            <h2 className="subtitle mt-4">Timezones</h2>
                            <p>{Array.isArray(country.timezones) && country.timezones.length > 0 ? country.timezones.join(', ') : 'N/A'}</p>
                            <h2 className="subtitle mt-4">Flag URL</h2>
                            <p>{country.flag || 'N/A'}</p>
                            <h2 className="subtitle mt-4">CCA2</h2>
                            <p>{country.cca2 || 'N/A'}</p>
                            <h2 className="subtitle mt-4">Active Status</h2>
                            <p>{country.is_active ? 'Active' : 'Inactive'}</p>
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
                        </>
                    )}
                </section>
                <footer className="modal-card-foot" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    {isEditing ? (
                        <>
                            <button
                                className="button"
                                onClick={handleCancel}
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button
                                className="button is-primary"
                                onClick={handleUpdate}
                                disabled={isDeleting}
                            >
                                Save
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                className="button"
                                onClick={onClose}
                                disabled={isDeleting}
                            >
                                Close
                            </button>
                            <button
                                className="button is-info"
                                onClick={() => setIsEditing(true)}
                                disabled={isDeleting}
                            >
                                Update
                            </button>
                            <button
                                className="button is-danger"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                style={{ display: 'inline-block', visibility: 'visible' }}
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </>
                    )}
                </footer>
            </div>
        </div>
    );
};
