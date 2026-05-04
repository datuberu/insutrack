\# InsuTrack



InsuTrack is a full-stack web application built with React and Django REST Framework. It helps users and caregivers record insulin injections, check recent injection history, and reduce the risk of accidental duplicate injection logging.



The app is designed as a logging and routine-check support tool only. It does not calculate insulin doses, give medical advice, or replace clinician instructions.



\## Project Theme



Healthy Lives \& Well-being



\## Tech Stack



\### Frontend

\- React

\- Vite

\- React Router

\- Axios

\- Tailwind CSS



\### Backend

\- Python

\- Django

\- Django REST Framework

\- Simple JWT Authentication

\- SQLite for local development



\## Main Features



\- User registration

\- User login with JWT authentication

\- Protected frontend routes

\- Dashboard with latest injection summary

\- Injection log creation

\- Injection history page

\- Edit injection logs

\- Delete injection logs

\- Pre-injection check

\- Duplicate-risk detection

\- Override reason for possible duplicate logs

\- Meal reminder prompt after rapid-acting insulin log

\- Responsive UI with Tailwind CSS



\## Insulin Categories



The app uses generic insulin categories instead of brand names:



\- Rapid-acting insulin (bolus)

\- Long-acting insulin (basal)



\## Safety Disclaimer



InsuTrack is a logging and routine-check tool only.



It does not:

\- calculate insulin doses

\- recommend whether a user should inject

\- provide medical advice

\- guarantee prevention of all injection mistakes

\- replace clinician instructions



Users should always follow their clinician’s instructions.



\## Project Structure



```text

insutrack/

├── backend/

│   ├── accounts/

│   ├── config/

│   ├── injections/

│   └── manage.py

│

├── frontend/

│   ├── public/

│   ├── src/

│   │   ├── api/

│   │   ├── features/

│   │   ├── pages/

│   │   ├── routes/

│   │   ├── App.jsx

│   │   └── main.jsx

│   └── package.json

│

├── .gitignore

└── README.md

