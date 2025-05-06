const CountryTable = ({ countries, onDetailsClick }) => {
    if (!countries || !Array.isArray(countries)) {
        console.error('Invalid countries data:', countries);
        return <p>No countries available.</p>;
    }

    return (
        <table className="table is-striped is-hoverable is-fullwidth">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Capital</th>
                    <th>Population</th>
                    <th>Timezones</th>
                    <th>Flag</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {countries.map((country, index) => {
                    console.log('Country:', country);
                    return (
                        <tr key={country.name || index}>
                            <td>{country.name || 'N/A'}</td>
                            <td>{country.capital || 'N/A'}</td>
                            <td>{typeof country.population === 'number' ? country.population.toLocaleString() : 'N/A'}</td>
                            <td>{Array.isArray(country.timezones) ? country.timezones.join(', ') : 'N/A'}</td>
                            <td>
                                {country.flag ? (
                                    <img
                                        src={country.flag}
                                        alt={`${country.name || 'Country'} flag`}
                                        style={{ width: '50px', height: 'auto' }}
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                ) : (
                                    'N/A'
                                )}
                            </td>
                            <td>
                                <button
                                    className="button is-info is-small"
                                    onClick={() => onDetailsClick(country)}
                                >
                                    Details
                                </button>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
};
