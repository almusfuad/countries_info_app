# External API App

## Project Overview
A full-stack web application built with Django (backend) and React (frontend) to manage country information. Features include viewing, adding, updating, and deleting countries with pagination, search, and JWT-based authentication. The backend uses a PostgreSQL database and integrates with an external API for country data, while the frontend provides a responsive UI with Bulma CSS.
GitHub Repository: https://github.com/almusfuad/external_api_app


## Cloning the Repository

1. Clone the repository:
   `bash`
   ```git clone https://github.com/almusfuad/external_api_app.git```


2. Navigate to the project directory:
    `bash`
    ```cd external_api_app```



## Creating and Activating the Environment

1. Create a Python virtual environment:
    `bash`
    ```python -m venv venv```


2. Activate the environment:
- On Linux/Mac:
    `bash`
    ```source venv/bin/activate```


- On Windows:
    `bash`
    ```venv\Scripts\activate```





## Installing Dependencies
Install Python dependencies from requirements.txt:
    `bash`
    ```pip install -r requirements.txt```


## Running the Project

Start the Django development server:
    `bash`
    ```python manage.py runserver```



## Creating a Superuser
Create an admin user to log in:
    `bash`\n
    ```python manage.py createsuperuser```

Follow prompts to set username, email, and password.

## Accessing the UI
Open your browser and navigate to:
    `plain`
    ```http://127.0.0.1:8000```


Happy coding! 🌍
