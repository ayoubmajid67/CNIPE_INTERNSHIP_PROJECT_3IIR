import jwt
from flask import current_app
from datetime import datetime, timedelta
import re


def generate_token(email, user_type="normal", expirationDays=30):
    payload = {
        'email': email,
        'userType': user_type,
        'exp': datetime.utcnow() + timedelta(days=expirationDays)  # Token expires in 1 hour
    }
    token = jwt.encode(
        payload, current_app.config['SECRET_KEY'], algorithm="HS256")
    return token


def validate_fields(data, required_fields):
    missing_fields = [
        field for field in required_fields
        if field not in data or (isinstance(data[field], str) and not data[field].strip())
    ]
    return missing_fields


def validate_email(email):
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(email_regex, email) is not None


def validate_password(password):
    # Example: Password must be at least 8 characters, contain at least one number, one uppercase letter, and one special character
    password_regex = r'^(?=.*[0-9])(?=.*[!@#$%^&*().?/])[a-zA-Z0-9!@#$%^&*().?/]{6,}$'
    return re.match(password_regex, password) is not None


def are_all_strings(*args):
    return all(isinstance(arg, str) for arg in args)


def allowed_file_img(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in current_app.config["ALLOWED_IMG_EXTENSIONS"]


def allowed_file_video(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in current_app.config["ALLOWED_VIDEO_EXTENSIONS"]


def validate_content_values(current_content, max_content, current_duration):
    if current_content is None:
        return False
    try:
        int(current_content)
        int(max_content)
        int(current_duration)
        return True
    except ValueError:
        return False
def check_admin_or_owner(current_user):
    return current_user['accountType'] in ['admin','owner']
def is_numeric(value):
    if isinstance(value, (int, float, complex)):
        return True
    try:
        # Try converting the string to a float (works for both int and float strings)
        float(value)
        return True
    except (ValueError, TypeError):
        return False
