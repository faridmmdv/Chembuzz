--this is a university project 

Datenbanken und Web-Techniken 
Project Task Summer Semester 2025

# Overview
ChemBuzz is a full-stack web application that allows users to explore the cultural sites of Chemnitz, the European Capital of Culture 2025. The app features an interactive map, user profiles, favorite places, a shop for city merchandise, and a real-time leaderboard.
The project demonstrates best practices in modern web development using Django REST Framework, React, PostgreSQL, JWT authentication, and responsive UI with Tailwind CSS.

## Features:

🔐 User registration, login, JWT authentication

🗺️ Explore Chemnitz via interactive map (Leaflet)

🎭 Browse and filter places (museums, galleries, theatres, hotels, etc.)

📌 Add places to favorites/profile

🛒 Shop preview for Chemnitz merchandise (non-functional, preview only)

📈 Leaderboard and achievements

📸 Modern UI, responsive on all devices


**Name:** Farid Mammadov  
**Study Course:** Web Engineering  


Backend dependencies:
Go to the backend/ folder and install all required Python libraries:

cd backend
pip install -r requirements.txt

### *Main backend dependencies:
  -Django 5.x
  -djangorestframework
  -djangorestframework-simplejwt
  -Pillow
  -corsheaders
  -psycopg2

### *Frontend dependencies:
Go to the frontend/ folder and install all npm libraries:
Main frontend dependencies:

  -react
  -react-dom
- -react-router-dom
  -vite
  -tailwindcss
  -leaflet
  -lucide-react


### Database setup:

PostgreSQL should be installed and running on your machine.

Configure your database credentials in backend/settings.py:

`DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'postgres',
        'USER': 'postgres',
        'PASSWORD': 'your_password_here',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}`

Run migrations to create tables:  -python manage.py migrate
Create a Django superuser:  -python manage.py createsuperuser

## **How to Run the App**

**Start the backend server:**

cd backend
python manage.py runserver

**Start the frontend development server:**

cd ../frontend
npm run dev

## License
MIT License – see LICENSE file.

## Author & Credits
Farid Mammadov
Web Engineering @ TU Chemnitz
GitHub: [FaridMammadov](https://github.com/faridmmdv)
Special thanks to DBW course instructors

## Acknowledgments
Chemnitz 2025 official open data
Django & React community
Open source libraries used in this project

"# uni_project_" 
