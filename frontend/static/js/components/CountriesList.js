const { useState, useEffect } = React;

const CountriesList = ({ countries, onLogout, setCountries, paginationData, fetchCountries }) => {
    const [filteredCountries, setFilteredCountries] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(paginationData.count || 0);
    const [nextUrl, setNextUrl] = useState(paginationData.next || null);
    const [previousUrl, setPreviousUrl] = useState(paginationData.previous || null);
    const [loading, setLoading] = useState(false);
    const countriesPerPage = 25;

    useEffect(() => {
        console.log('Countries prop:', countries);
        console.log('Pagination data:', paginationData);
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
        if (!url) return;
        setLoading(true);
        const accessToken = getCookie('access');
        try {
            const data = await fetchCountries(accessToken, { url });
            setCountries(data.results);
            setTotalCount(data.count);
            setNextUrl(data.next);
            setPreviousUrl(data.previous);
            setCurrentPage(pageNum);
        } catch (err) {
            console.error('Fetch page error:', err);
            if (typeof showNotification === 'function') {
                showNotification('Failed to fetch page. Please try again.', 'is-danger');
            } else {
                console.warn('showNotification not defined, using console');
            }
        }
        setLoading(false);
    };

    const handlePrevious = () => {
        if (previousUrl) {
            fetchPage(previousUrl, currentPage - 1);
        }
    };

    const handleNext = () => {
        if (nextUrl) {
            fetchPage(nextUrl, currentPage + 1);
        }
    };

    const handleDetailsClick = (country) => {
        setSelectedCountry(country);
    };

    const handleCloseModal = () => {
        setSelectedCountry(null);
    };

    const totalPages = Math.ceil((searchTerm ? filteredCountries.length : totalCount) / countriesPerPage);

    return (
        <div className="container is-max-desktop">
            <section className="section">
                <div className="level">
                    <div className="level-left">
                        <h1 className="title">Countries Information</h1>
                    </div>
                    <div className="level-right">
                        <button className="button is-danger" onClick={onLogout}>
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
                                                onClick={() => fetchPage(`/api/v1/countries/?page=${page}&page_size=25`, page)}
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
                    />
                )}
            </section>
        </div>
    );
};
