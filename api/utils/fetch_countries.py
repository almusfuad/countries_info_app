import requests
import pandas as pd
import numpy as np
from api.models.countries_info import CountryInfo
from django.db import transaction

def fetch_data():
    """Fetch data from the external API.
    This function fetches data from an external API and returns the response.
    
    Returns:
        list: The response from the API.
        str: Error message if any, else None.
    """
    api_url = "https://restcountries.com/v3.1/all"
    countries_data = []
    error_message = None
    
    try:
        response = requests.get(api_url, timeout=10)
        response.raise_for_status()
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
    """Preprocess the fetched data using Pandas.
    This function processes the fetched data to extract relevant information into a structured format.
    
    Args:
        fetched_data (list): The data fetched from the API.
    Returns:
        list: A list of dictionaries containing relevant information about each country.
    """
    if not fetched_data:
        return []

    # Convert fetched data to a Pandas DataFrame
    df = pd.DataFrame(fetched_data)

    # Extract relevant fields using vectorized operations
    processed_data = pd.DataFrame({
        "name": df["name"].apply(lambda x: x.get("common", "") if isinstance(x, dict) else ""),
        "cca2": df["cca2"].fillna(""),
        "capital": df["capital"].apply(lambda x: x[0] if isinstance(x, list) and x else ""),
        "region": df["region"].fillna(""),
        "subregion": df["subregion"].fillna(""),
        "population": df["population"].fillna(0).astype(int),
        "area": df["area"].fillna(0.0).astype(float),
        "languages": df["languages"].apply(lambda x: list(x.values()) if isinstance(x, dict) else []),
        "currencies": df["currencies"].apply(lambda x: list(x.values()) if isinstance(x, dict) else []),
        "timezones": df["timezones"].apply(lambda x: x if isinstance(x, list) else []),
        "flag": df["flags"].apply(lambda x: x.get("png", "") if isinstance(x, dict) else "")
    })

    # Convert DataFrame to list of dictionaries
    return processed_data.to_dict("records")

def populate_database():
    """Populate the database with the processed data using bulk operations.
    This function takes the processed data and populates the database with it.
    
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
    
    # Define editable fields for bulk_update
    editable_fields = [
        "name", "cca2", "capital", "region", "subregion", 
        "population", "area", "languages", "currencies", 
        "timezones", "flag"
    ]
    
    # Convert processed data to CountryInfo objects
    existing_countries = {c.name: c for c in CountryInfo.objects.all()}
    to_create = []
    to_update = []
    
    for country_data in processed_countries:
        country_name = country_data["name"]
        if country_name in existing_countries:
            # Update existing country
            country = existing_countries[country_name]
            for key, value in country_data.items():
                setattr(country, key, value)
            to_update.append(country)
        else:
            # Create new country
            to_create.append(CountryInfo(**country_data))
    
    # Perform bulk operations within a transaction
    try:
        with transaction.atomic():
            if to_create:
                CountryInfo.objects.bulk_create(to_create)
                created_count = len(to_create)
            if to_update:
                CountryInfo.objects.bulk_update(to_update, fields=editable_fields)
                updated_count = len(to_update)
    except Exception as e:
        print(f"Error: Failed to save country data in bulk operation. Error: {str(e)}")
        return
    
    print(f"Database population complete. Created: {created_count}, Updated: {updated_count}")
    