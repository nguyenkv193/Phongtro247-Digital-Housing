# Rental Room Backend

This project is a backend application for a rental room web application. It provides authentication functionalities, including user registration and login, using Node.js and Express.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [License](#license)

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd rental-room-backend
   ```

3. Install the dependencies:
   ```
   npm install
   ```

4. Set up your environment variables. Create a `.env` file in the root directory and add your database connection string and any other necessary configurations.

## Usage

To start the server, run:
```
npm start
```

The server will run on `http://localhost:3000` by default. You can change the port in the `src/app.js` file.

## API Endpoints

### Authentication

- **POST /api/auth/register**
  - Registers a new user.
  - Request body: `{ "username": "string", "email": "string", "password": "string" }`

- **POST /api/auth/login**
  - Authenticates a user and returns a token.
  - Request body: `{ "username": "string", "password": "string" }`

## License

This project is licensed under the MIT License. See the LICENSE file for details.