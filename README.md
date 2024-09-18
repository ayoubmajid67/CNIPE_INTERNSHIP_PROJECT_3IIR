Here is the full `README.md` code with the logo path specified and without the license section:


# Poste de Maroc Internship Project

![Project Logo](./dev/front-end/imgs/logo.jpg)

This project is part of my internship at **Poste de Maroc**. The goal of this project was to develop a digital platform using **Flask** and **MongoDB** for the internal management of operations, such as role-based controls for admin, agent postale, and chef de siège. The platform allows for product shipments, transaction logs, and tariff management.

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

### Step 2: Install Dependencies

Ensure you have `pip` installed and run the following command to install the required dependencies:

```bash
pip install -r requirements.txt
```

### Step 3: Set Up MongoDB

1. Install **MongoDB** and open **MongoDB Compass**.
2. Create a new database named `dnau`.

### Step 4: Run the Backend

To start the backend, navigate to the backend folder:

```bash
cd dev/backend
```

Run the backend using:

```bash
python run.py
```

### Step 5: Add an Owner Account

To add an owner account, go to the `user.py` file and run the `add_owner` function:

1. Navigate to the `user.py` file:

   ```bash
   cd dev/backend/app/models
   ```

2. Open `user.py` in your editor and add the following function call to create an owner account:

   ```python
   add_owner("youbista", "ayoubmajjid@gmail.com", "MajjidDev2024")
   ```


   This will create an owner account with the specified credentials.

## Usage

After setting up MongoDB and running the backend, the platform is ready for use. Log in using your credentials, and based on your user role, you will have access to specific features.


## Conclusion

This project was developed as part of my internship at Poste de Maroc, demonstrating the integration of front-end technologies (HTML, CSS, JavaScript) with a Flask-based back-end and MongoDB for database management.


