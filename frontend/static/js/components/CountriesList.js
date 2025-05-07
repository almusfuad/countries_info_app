const CountriesList = ({ countries, onLogout, setCountries, paginationData, fetchCountries }) => {
    const [filteredCountries, setFilteredCountries] = React.useState([]);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [selectedCountry, setSelectedCountry] = React.useState(null);
    const [showAddModal, setShowAddModal] = React.useState(false);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [totalCount, setTotalCount] = React.useState(paginationData.count || 0);
    const [nextUrl, setNextUrl] = React.useState(paginationData.next || null);
    const [previousUrl, setPreviousUrl] = React.useState(paginationData.previous || null);
    const [loading, setLoading] = React.useState(false);
    const countriesPerPage = 25;

    React.useEffect(() => {
        console.log('Countries prop:', countries);
        console.log('Pagination data:', paginationData);
        console.log('Total count:', totalCount, 'Current page:', currentPage);
        if (!Array.isArray(countries)) {
            console.error('Invalid countries prop:', countries);
            setFilteredCountries([]);
            return;
        }
        const filtered = countries.filter(country => 
            (country.name || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
        console.log('Filtered countries:', filtered);
        setFilteredCountries(filtered);
        setTotalCount(paginationData.count || 0);
        setNextUrl(paginationData.next || null);
        setPreviousUrl(paginationData.previous || null);
    }, [searchTerm, countries, paginationData]);

    const fetchPage = async (url, pageNum) => {
        if (!url) {
            console.warn('No URL provided for fetchPage:', { url, pageNum });
            return;
        }
        setLoading(true);
        const accessToken = getCookie('access');
        try {
            console.log('Fetching page:', url);
            const data = await fetchCountries(accessToken, { url });
            console.log('Fetched data:', data);
            setCountries(data.results.sort((a, b) => (a.name || '').localeCompare(b.name || '')));
            setTotalCount(data.count);
            setNextUrl(data.next);
            setPreviousUrl(data.previous);
            setCurrentPage(pageNum);
        } catch (err) {
            console.error('Fetch page error:', err);
            showNotification('Failed to fetch page. Please try again.', 'is-danger');
        }
        setLoading(false);
    };

    const handlePrevious = () => {
        if (previousUrl) {
            console.log('Navigating to previous page:', previousUrl);
            fetchPage(previousUrl, currentPage - 1);
        }
    };

    const handleNext = () => {
        if (nextUrl) {
            console.log('Navigating to next page:', nextUrl);
            fetchPage(nextUrl, currentPage + 1);
        }
    };

    const handleDetailsClick = (country) => {
        console.log('Selected country:', country);
        setSelectedCountry(country);
    };

    const handleCloseModal = () => {
        setSelectedCountry(null);
    };

    const handleDelete = async (countryId) => {
        setLoading(true);
        const accessToken = getCookie('access');
        try {
            let targetPage = currentPage;
            if (countries.length === 1 && currentPage > 1) {
                targetPage = currentPage - 1;
            }
            console.log('Deleting country ID:', countryId, 'Target page:', targetPage);
            const data = await fetchCountries(accessToken, { page: targetPage });
            console.log('Post-delete data:', data);
            setCountries(data.results.sort((a, b) => (a.name || '').localeCompare(b.name || '')));
            setTotalCount(data.count);
            setNextUrl(data.next);
            setPreviousUrl(data.previous);
            setCurrentPage(targetPage);
            setSelectedCountry(null);
            showNotification('Country deleted successfully.', 'is-success');
        } catch (err) {
            console.error('Error refreshing countries after delete:', err);
            showNotification('Failed to refresh country list.', 'is-danger');
        }
        setLoading(false);
    };

    const handleAddCountry = async (newCountry) => {
        setLoading(true);
        const accessToken = getCookie('access');
        try {
            console.log('Adding country:', newCountry);
            const response = await axios.post('/api/v1/countries/', newCountry, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });
            // Estimate the page where the new country would appear based on its name
            const newCountryName = newCountry.name.toLowerCase();
            const sortedCountries = [...countries, response.data].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            const newIndex = sortedCountries.findIndex(c => c.name.toLowerCase() === newCountryName);
            const targetPage = Math.floor(newIndex / countriesPerPage) + 1;
            console.log('New country index:', newIndex, 'Target page:', targetPage);
            const data = await fetchCountries(accessToken, { page: targetPage });
            console.log('Post-add data:', data);
            setCountries(data.results.sort((a, b) => (a.name || '').localeCompare(b.name || '')));
            setTotalCount(data.count);
            setNextUrl(data.next);
            setPreviousUrl(data.previous);
            setCurrentPage(targetPage);
            showNotification(`Country '${response.data.name}' added successfully.`, 'is-success');
            setShowAddModal(false);
        } catch (err) {
            console.error('Error adding country:', err);
            showNotification(err.response?.data?.detail || 'Failed to add country.', 'is-danger');
        }
        setLoading(false);
    };

    const totalPages = Math.ceil(totalCount / countriesPerPage);
    console.log('Total pages:', totalPages, 'Total count:', totalCount);

    return (
        <div className="container is-max-desktop">
            <section className="section">
                <div className="level">
                    <div className="level-left">
                        <h1 className="title">Countries Information</h1>
                    </div>
                    <div className="level-right">
                        <button 
                            className="button is-primary mr-2" 
                            onClick={() => setShowAddModal(true)}
                            disabled={loading}
                        >
                            Add Country
                        </button>
                        <button 
                            className="button is-danger" 
                            onClick={onLogout}
                            disabled={loading}
                        >
                            Logout
                        </button>
                    </div>
                </div>
                <div className="field">
                    <div className="control has-icons-left is-fullwidth">
                        <input
                            className="input is-fullwidth"
                            type="text"
                            placeholder="Search by country name"
                            value={searchTerm}
                            onChange={(e) => {
                                console.log('Search term:', e.target.value);
                                setSearchTerm(e.target.value);
                            }}
                            style={{ maxWidth: '500px' }}
                        />
                        <span className="icon is-small is-left">
                            <i className="fas fa-search"></i>
                        </span>
                    </div>
                    {searchTerm && (
                        <p className="help">Search applies to current page only.</p>
                    )}
                </div>
                <div className="box" style={{ minHeight: '400px' }}>
                    {loading ? (
                        <div className="has-text-centered">
                            <span className="icon is-large">
                                <i className="fas fa-spinner fa-pulse fa-2x"></i>
                            </span>
                        </div>
                    ) : filteredCountries.length > 0 ? (
                        <>
                            <CountryTable 
                                countries={filteredCountries}
                                onDetailsClick={handleDetailsClick}
                                onDelete={handleDelete}
                            />
                            <nav className="pagination" role="navigation" aria-label="pagination">
                                <button
                                    className="button pagination-previous"
                                    onClick={handlePrevious}
                                    disabled={!previousUrl || loading}
                                >
                                    Previous
                                </button>
                                <button
                                    className="button pagination-next"
                                    onClick={handleNext}
                                    disabled={!nextUrl || loading}
                                >
                                    Next
                                </button>
                                <ul className="pagination-list">
                                    {Array.from({ length: totalPages }, (_, index) => index + 1).map(page => (
                                        <li key={page}>
                                            <button
                                                className={`pagination-link ${page === currentPage ? 'is-current' : ''}`}
                                                onClick={() => fetchPage(`/api/v1/countries/?page=${page}&page_size=${countriesPerPage}`, page)}
                                                disabled={loading}
                                            >
                                                {page}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        </>
                    ) : (
                        <p>No countries found.</p>
                    )}
                </div>
                {selectedCountry && (
                    <DetailsModal
                        country={selectedCountry}
                        countries={countries}
                        onClose={handleCloseModal}
                        onDelete={handleDelete}
                    />
                )}
                {showAddModal && (
                    <AddCountryModal
                        onClose={() => setShowAddModal(false)}
                        onAddCountry={handleAddCountry}
                    />
                )}
            </section>
        </div>
    );
};
