const { useState, useEffect } = React;

const CountriesList = ({ countries, onLogout }) => {
    const [filteredCountries, setFilteredCountries] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const countriesPerPage = 25;

    useEffect(() => {
        console.log('Countries prop:', countries);
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
        setCurrentPage(1);
    }, [searchTerm, countries]);

    const indexOfLastCountry = currentPage * countriesPerPage;
    const indexOfFirstCountry = indexOfLastCountry - countriesPerPage;
    const currentCountries = filteredCountries.slice(indexOfFirstCountry, indexOfLastCountry);
    const totalPages = Math.ceil(filteredCountries.length / countriesPerPage);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleDetailsClick = (country) => {
        setSelectedCountry(country);
    };

    const handleCloseModal = () => {
        setSelectedCountry(null);
    };

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
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ maxWidth: '500px' }}
                        />
                        <span className="icon is-small is-left">
                            <i className="fas fa-search"></i>
                        </span>
                    </div>
                </div>
                <div className="box" style={{ minHeight: '400px' }}>
                    {filteredCountries.length > 0 ? (
                        <>
                            <CountryTable 
                                countries={currentCountries}
                                onDetailsClick={handleDetailsClick}
                            />
                            <nav className="pagination" role="navigation" aria-label="pagination">
                                <button
                                    className="button pagination-previous"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </button>
                                <button
                                    className="button pagination-next"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </button>
                                <ul className="pagination-list">
                                    {Array.from({ length: totalPages }, (_, index) => index + 1).map(page => (
                                        <li key={page}>
                                            <button
                                                className={`pagination-link ${page === currentPage ? 'is-current' : ''}`}
                                                onClick={() => handlePageChange(page)}
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
