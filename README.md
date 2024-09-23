
# CNIPE Internship Project

![Project Logo](./dev/front-end/imgs/logo.jpg)

This project is part of my internship at **CNIPE (Centre National des Innovations Pédagogiques et de l'Expérimentation)**. The goal of this project was to develop a digital platform using **Flask** and **MongoDB** for the internal management of operations, such as role-based controls for admin, agent postale, and chef de siège. The platform allows for product shipments, transaction logs, and tariff management.

## Features

- Role-based access control: Admin, agent postale, and chef de siège.
- Management of Coles and Courier product shipments.
- Transaction logs with role-specific visibility.
- Admin-controlled tariff updates.

## Prerequisites

Ensure the following dependencies are installed:

1. **MongoDB**: You can install MongoDB using [MongoDB Compass](https://www.mongodb.com/try/download/compass). If you need help, follow this [tutorial video](https://youtu.be/gB6WLkSrtJk?si=TgRaMFesh-g5vYpP) for installation instructions.
2. **Python**: Download and install Python from the official website [here](https://www.python.org/downloads/).

## Setup Instructions

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-repo/project.git
cd project/dev/backend
```

### Step 2: Create a Virtual Environment

In the `dev/backend` directory, create a virtual environment using `venv`:

```bash
python -m venv venv
```

### Step 3: Activate the Virtual Environment

- **On Windows**:
  ```bash
  venv\Scripts\activate
  ```
- **On macOS/Linux**:
  ```bash
  source venv/bin/activate
  ```

### Step 4: Install Dependencies

Ensure you have `pip` installed and run the following command to install the required dependencies:

```bash
pip install -r requirements.txt
```

### Step 5: Set Up MongoDB

1. Install **MongoDB** and open **MongoDB Compass**.
2. Create a new database named `dnau`.

### Step 6: Add the Add Owners Endpoint

1. Open the `user.py` file located in `dev/backend/app/models`.
2. Ensure the following function is defined:

   ```python
   def add_owners():
       user_model.add_owner("youbista", "ayoubmajjid@gmail.com", "MajjidDev2024")
       user_model.add_owner("dnau", "dnau@gmail.com", "dnauDev2024")
   ```
3. Add the endpoint to your `routes.py`:

   ```python
   @bp.route('/addOwners', methods=['POST'])
   def add_owners():
       add_owners()
       return jsonify({})
   ```

### Step 7: Run the Backend

To start the backend, navigate to the backend folder:

```bash
cd dev/backend
```

Run the backend using Waitress:

```bash
waitress-serve --host=0.0.0.0 --port=5000 run:app
```

### Step 8: Test the Endpoint with Postman

Use Postman to send a POST request to the following URL to add owner accounts:

```
POST http://localhost:5000/addOwners
```

## Usage

After setting up MongoDB and running the backend, the platform is ready for use. Log in using your credentials, and based on your user role, you will have access to specific features.

## Conclusion

This project was developed as part of my internship at CNIPE, demonstrating the integration of front-end technologies (HTML, CSS, JavaScript) with a Flask-based back-end and MongoDB for database management.
