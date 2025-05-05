import requests
from api.models.countries_info import CountryInfo


def fetch_data():
    """Fetch data from the external API.
    This function fetches data from an external API and returns the response.
        
    Returns:
        list: The response from the API.
    """
    
    api_url = "https://restcountries.com/v3.1/all"
    countries_data = []
    error_message = None
    
    
    try:
        response = requests.get(api_url, timeout=10)
        response.raise_for_status()  # Raise an error for bad responses
        countries_data = response.json()
        
        # Sort data alphabetically by country name
        countries_data.sort(key=lambda x: x.get('name', {}).get('common', ''))
        print(f"Number of countries fetched: {len(countries_data)}")
    except requests.exceptions.Timeout:
        error_message = "Error: The request to the API timed out."
    except requests.exceptions.ConnectionError:
        error_message = "Error: Could not connect to the API. Check internet connection."
    except requests.exceptions.HTTPError as http_err:
        error_message = f"Error: HTTP error occurred: {http_err} (Status: {response.status_code})"
    except requests.exceptions.JSONDecodeError:
        error_message = "Error: Failed to decode JSON response from the API."
    except requests.exceptions.RequestException as req_err:
        error_message = f"Error: An issue occurred with the request: {str(req_err)}"
    except Exception as e:
        error_message = f"Error: An unexpected error occurred: {str(e)}"


    if error_message:
        print(error_message)

    return countries_data, error_message  


def preprocess_data(fetched_data):
    """Preprocess the fetched data.
    This function processes the fetched data to extract relevant information.
    
    Args:
        fetched_data (list): The data fetched from the API.
    Returns:
        list: A list of dictionaries containing relevant information about each country.
    """  
    
    processed_data = []
    if not fetched_data:
        return processed_data
    
    
    for country in fetched_data:
        country_info = {
            "name": country.get("name", {}).get("common", ""),
            "capital": country.get("capital", [""])[0],
            "region": country.get("region", ""),
            "subregion": country.get("subregion", ""),
            "population": country.get("population", 0),
            "area": country.get("area", 0.0),
            "languages": list(country.get("languages", {}).values()),
            "currencies": list(country.get("currencies", {}).values()),
            "timezones": country.get("timezones", []),
            "flag": country.get("flags", {}).get("png", ""),
        }
        processed_data.append(country_info)
    return processed_data
    

    
def populate_database():
    """Populate the database with the processed data.
    This function takes the processed data and populates the database with it.
    It uses the Django ORM to create or update records in the database.
    
    
    Returns:
        None
    """
    
    fetched_data, error_msg = fetch_data()
    
    if error_msg:
        print(f"Error: Failed to fetch data from the API: {error_msg}")
        return
    
    if not fetched_data:
        print("Warning: No data fetched from the API.")
        return
    
    
    processed_countries = preprocess_data(fetched_data)
    if not processed_countries:
        print("Warning: No data to process.")
        return
    
    
    print(f"Number of countries to be populated: {len(processed_countries)}")
    created_count = 0
    updated_count = 0
    
    
    for country_data in processed_countries:
        try:
            # Use update_or_create for idempotency
            country, created = CountryInfo.objects.update_or_create(
                name = country_data["name"],
                defaults= country_data
            )
            if created:
                created_count += 1
            else:
                updated_count += 1
        except Exception as e:
            print(f"Error: Failed to save country data: {country_data['name']}. Error: {str(e)}")
            
    print(f"Database population complete. Created: {created_count}, Updated: {updated_count}")
    