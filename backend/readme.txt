This is the Backend server code. In Production this will be hosted on its own dedicated section of the azure instance.
for development purposes it can be run locally. to do this, once you have the app running in development mode (npx expo start)
open a new terminal and navigate to the backend directory (cd backend). You will need a .env file containing the information
to connect to the database and a ca security certificate. This information should be provided to you, but can also be found on
the azure instance.