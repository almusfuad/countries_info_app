const AddCountryModal = ({ onClose, onAddCountry }) => {
    const [formData, setFormData] = React.useState({
        name: '',
        capital: '',
        region: '',
        subregion: '',
        population: '',
        area: '',
        languages: '',
        currencies: '',
        timezones: '',
        flag: '',
        cca2: '',
    });
    const [loading, setLoading] = React.useState(false);
    const [errors, setErrors] = React.useState({});

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

        // Region: optional, specific characters
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
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
            await onAddCountry(payload);
        } catch (err) {
            console.error('Submission error:', err);
            const apiErrors = err.response?.data || {};
            const newErrors = {};
            Object.keys(apiErrors).forEach(key => {
                newErrors[key] = Array.isArray(apiErrors[key]) ? apiErrors[key].join(' ') : apiErrors[key];
            });
            if (Object.keys(newErrors).length === 0) {
                newErrors.general = 'Failed to add country. Please try again.';
            }
            setErrors(newErrors);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal is-active">
            <div className="modal-background" onClick={onClose}></div>
            <div className="modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title">Add New Country</p>
                    <button className="delete" aria-label="close" onClick={onClose} disabled={loading}></button>
                </header>
                <section className="modal-card-body">
                    <form onSubmit={handleSubmit}>
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
                                    disabled={loading}
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
                                    disabled={loading}
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
                                    disabled={loading}
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
                                    disabled={loading}
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
                                    disabled={loading}
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
                                    disabled={loading}
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
                                    disabled={loading}
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
                                    disabled={loading}
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
                                    disabled={loading}
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
                                    disabled={loading}
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
                                    disabled={loading}
                                />
                            </div>
                            {errors.cca2 && <p className="help is-danger">{errors.cca2}</p>}
                        </div>
                    </form>
                </section>
                <footer className="modal-card-foot">
                    <div className="buttons">
                        <button 
                            className="button" 
                            onClick={onClose} 
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button 
                            className="button is-primary" 
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? 'Adding...' : 'Add Country'}
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};
