import requests
from django.http import JsonResponse, HttpResponseServerError


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
    

if __name__ == "__main__":
    print("This module is not meant to be run directly.")
    fetch_data()
    print("Countries data fetched successfully.")