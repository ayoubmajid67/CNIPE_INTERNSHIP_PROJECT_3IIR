from PIL import Image
import shutil
from flask import Blueprint, jsonify, request, current_app, send_from_directory, abort
from functools import wraps
import jwt
import datetime
import os


# from bson.objectid import ObjectId
# from app import mongo
import app.models.user as user_model
import app.models.formation as formation_model
import app.utile as utile
import bcrypt
import app.file_utils as file_utils
import app.models.course as course_model

bp = Blueprint('api', __name__)


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].replace('Bearer ', '')
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        try:
            data = jwt.decode(
                token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = user_model.get_All_by_email(data['email'])
            if not current_user:
                return jsonify({'error': 'User not found!'}), 404
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Token is invalid!'}), 401
        return f(current_user, *args, **kwargs)
    return decorated


def admin_required(f):
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if current_user['accountType'] not in ['admin', 'owner']:
            return jsonify({'error': 'Admin access required!'}), 403
        return f(current_user, *args, **kwargs)
    return decorated


def owner_required(f):
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if current_user['accountType'] != 'owner':
            return jsonify({'error': 'Owner access required!'}), 403
        return f(current_user, *args, **kwargs)
    return decorated


# User routes

@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    required_fields = ['username', 'email', 'password']
    missing_fields = [
        field for field in required_fields if field not in data or not data[field]]

    if missing_fields:
        return jsonify({'error': f'Missing fields: {", ".join(missing_fields)}'}), 400

    email = str(data['email']).strip().lower()
    password = str(data['password']).strip()
    username = str(data['username']).strip()

    if not utile.validate_email(email):
        return jsonify({'error': 'Invalid email format'}), 400

    if not utile.validate_password(password):
        return jsonify({'error': 'Invalid password format'}), 400

    if user_model.get_user_by_email(email):
        return jsonify({'error': 'User already exists'}), 400

    if user_model.get_user_by_username(username):
        return jsonify({'error': 'User already exists'}), 400

 # Define the directory to store the profile images
    profiles_dir = os.path.abspath(os.path.join(
        current_app.root_path, '..', 'data', 'profiles'))

    # Path to the default profile image
    default_profile_img = os.path.join(profiles_dir, 'default_profile.webp')

    # Path for the new profile image, save it without extension as {username}_profile
    profile_img_filename = f"{username}_profile.webp"
    new_profile_img_path = os.path.join(profiles_dir, profile_img_filename)

    try:
        # Copy the default profile image to the new user profile image
        shutil.copy(default_profile_img, new_profile_img_path)
        # Create user in the database with the profile image URL
        result = user_model.add_user(username, email, password)

    except Exception as e:
        return jsonify({'error': 'Error copying profile image', 'details': str(e)}), 500

    return jsonify({'message': 'User registered successfully'}), 201


@bp.route('/profile', methods=['GET'])
@token_required
def get_current_user_profile(current_user):

    user = user_model.get_user_any_Type_by_username(current_user['username'])

    if not user:
        return jsonify({'error': 'User not found'}), 404

    print("the current user : ", user)

    return jsonify({'user': user}), 200


@bp.route('/admins', methods=['POST'])
@token_required
@owner_required
def register_Admin(current_user):
    data = request.get_json() or {}
    required_fields = ['username', 'email', 'password']
    missing_fields = [
        field for field in required_fields if field not in data or not data[field]]

    if missing_fields:
        return jsonify({'error': f'Missing fields: {", ".join(missing_fields)}'}), 400

    email = str(data['email']).strip().lower()
    password = str(data['password']).strip()
    username = str(data['username']).strip()

    if not utile.validate_email(email):
        return jsonify({'error': 'Invalid email format'}), 400

    if not utile.validate_password(password):
        return jsonify({'error': 'Invalid password format'}), 400

    if user_model.get_All_by_email(email):
        return jsonify({'error': 'Admin already exists'}), 400

    if user_model.get_All_by_username(username):
        return jsonify({'error': 'Admin already exists'}), 400

    result = user_model.add_admin(username, email, password)
    targetAdmin = user_model.get_admin_by_username(username)

    return jsonify({'message': 'Admin registered successfully', 'user': targetAdmin}), 201


@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    required_fields = ['email', 'password']
    missing_fields = [
        field for field in required_fields if field not in data or not data[field]]

    if missing_fields:
        return jsonify({'error': f'Missing fields: {", ".join(missing_fields)}'}), 400

    email = str(data.get('email')).strip().lower()
    password = str(data.get('password')).strip()

    user = user_model.get_All_by_email(email)
    if not user or not bcrypt.checkpw(password.encode('utf-8'), user['password']):
        return jsonify({'error': 'Invalid credentials'}), 401

    token = utile.generate_token(email)
    username = user["username"]
    profileImg = user["profileImg"]
    return jsonify({'message': "User login successfully", 'token': token, 'username': username, 'profileImg': profileImg})


@bp.route('/dropUser', methods=['DELETE'])
@token_required
@admin_required
def drop_user(current_user):
    data = request.get_json() or {}
    email = data.get('email')

    if not email:
        return jsonify({'error': 'Email is required to drop a user'}), 400

    user = user_model.get_user_by_email(email)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    user_model.delete_user(email)
    return jsonify({'message': 'User deleted successfully'}), 200


@bp.route('/admins/<username>', methods=['DELETE'])
@token_required
@owner_required
def drop_admin(current_user, username):
    admin = user_model.get_admin_by_username(username)
    if not admin:
        return jsonify({'error': 'Admin not found'}), 404

    user_model.delete_admin(username)
    return jsonify({'message': 'Admin deleted successfully'}), 200


@bp.route('/admins/<username>', methods=['PUT'])
@token_required
@owner_required
def update_admin(current_user, username):
    data = request.get_json()

    allowed_roles = ['admin', 'normal']
    allowed_statuses = ['active', 'inactive']
    allowed_can_comment = [True, False]

    # Extract the values (empty strings handled later if missing)
    email = data.get('email')
    password = data.get('password')
    role = data.get('accountType')
    status = data.get('status')
    can_comment = data.get('canComment')

    updated_fields = {}

    # Email validation
    if email:
        if not utile.validate_email(email):
            return jsonify({"error": "Invalid email format"}), 400
        updated_fields['email'] = email

    # Password validation
    if password:
        if not utile.validate_password(password):
            return jsonify({"error": "Invalid password format. [6 characters, 1 number, and 1 special character]"}), 400
        updated_fields['password'] = hashed_password = bcrypt.hashpw(
            password.encode('utf-8'), bcrypt.gensalt())

    # Role validation
    if role:
        if role not in allowed_roles:
            return jsonify({"error": "Invalid role. Allowed values: 'admin', 'normal'"}), 400
        updated_fields['accountType'] = role

    # Status validation
    if status:
        if status not in allowed_statuses:
            return jsonify({"error": "Invalid status. Allowed values: 'active', 'inactive'"}), 400
        updated_fields['status'] = status

    # canComment validation
    if can_comment is not None:
        if can_comment not in allowed_can_comment:
            return jsonify({"error": "Invalid canComment value. Allowed values: true, false"}), 400
        updated_fields['canComment'] = can_comment

    if not updated_fields:
        return jsonify({"error": "No fields to update"}), 400

    try:
        admin = user_model.get_admin_by_username(username)
        if not admin:
            return jsonify({'message': 'Admin not found!'}), 404

        user_model.update_admin(username, updated_fields)
        return jsonify({'message': 'Admin updated successfully!'}), 200

    except Exception as e:
        return jsonify({'message': 'Failed to update Admin details', 'detail': str(e)}), 500


@bp.route('/getUsers', methods=['GET'])
@token_required
@admin_required
def get_users(current_user):
    users = user_model.get_users()
    return jsonify(users), 200


@bp.route('/admins', methods=['GET'])
@token_required
@owner_required
def get_admins(current_user):
    users_and_admins = user_model.get_admins()
    return jsonify(users_and_admins), 200


@bp.route('/getUsersAndAdmins', methods=['GET'])
@token_required
@owner_required
def get_users_and_admins(current_user):
    users_and_admins = user_model.get_users_and_admins()
    return jsonify(users_and_admins), 200


# enroll course :
@bp.route('/formations/<category_name>/courses/<course_name>/enroll', methods=['POST'])
@token_required
def enroll_course(current_user, category_name, course_name):
    # Sanitize inputs
    category_name = category_name.strip().lower()
    course_name = course_name.strip().lower()

    # Check if course exists
    course = formation_model.get_course_from_formation_by_name(
        category_name, course_name)
    if not course:
        return jsonify({'error': 'Course not found'}), 404

    # Check if the user is already enrolled in the course
    if user_model.is_user_enrolled(current_user['_id'], category_name, course_name):
        return jsonify({'error': 'User is already enrolled in this course'}), 400

    # Enroll the user in the course
    enroll_result = user_model.enroll_user_in_course(
        current_user['_id'], category_name, course_name)
    if not enroll_result.modified_count:
        return jsonify({'error': 'Failed to enroll in the course'}), 500

    # Increment the number of users in the course
    increment_result = formation_model.increment_number_of_users(
        category_name, course_name)
    if not increment_result.modified_count:
        return jsonify({'error': 'Failed to update course user count'}), 500

    return jsonify({'message': f'User {current_user["username"]} successfully enrolled in {course_name}'}), 200


@bp.route('/formations/<category_name>/courses/<course_name>/enroll', methods=['GET'])
@token_required
def is_enroll_course(current_user, category_name, course_name):
    # Sanitize inputs
    category_name = category_name.strip().lower()
    course_name = course_name.strip().lower()

    # Check if course exists
    course = formation_model.get_course_from_formation_by_name(
        category_name, course_name)
    if not course:
        return jsonify({'error': 'Course not found'}), 404

    # Check if the user is already enrolled in the course
    if user_model.is_user_enrolled(current_user['_id'], category_name, course_name):
        return jsonify({'isEnroll': True}), 200
    else:
        return jsonify({'isEnroll': False}), 200


@bp.route('/formations/<category_name>/courses/<course_name>/enrolled', methods=['GET'])
@token_required
def check_enrollment(current_user, category_name, course_name):
    # Sanitize inputs
    category_name = category_name.strip().lower()
    course_name = course_name.strip().lower()

    # Check if the user is enrolled in the course using the category name and course name
    is_enrolled = user_model.is_user_enrolled(
        current_user['_id'], category_name, course_name)

    if is_enrolled:
        return jsonify({
            'enrolled': True,
            'message': f'User {current_user["username"]} is enrolled in {course_name} under {category_name}.'
        }), 200
    else:
        return jsonify({
            'enrolled': False,
            'message': f'User {current_user["username"]} is not enrolled in {course_name} under {category_name}.'
        }), 200


@bp.route('/stats', methods=['GET'])
def get_stats():
    # Get the count of users
    user_count = user_model.get_number_of_users()

    # Get the count of courses
    formation_count = formation_model.get_number_of_formations()
    course_count = 0
    video_count = 0

    # Count courses and videos
    formations = formation_model.get_simple_formations()
    for formation in formations:
        courses = formation.get('courses', [])
        course_count += len(courses)
        for course in courses:
            videos = course.get('courseContent', [])
            video_count += len(videos)

    stats = {
        "numberOfUsers": user_count,
        "numberOfCategories": formation_count,
        "numberOfCourses": course_count,
        "numberOfVideos": video_count
    }

    return jsonify(stats), 200


@bp.route('/userRole', methods=['GET'])
@token_required
def get_user_role(current_user):
    user_role = current_user.get('accountType')
    if not user_role:
        return jsonify({"error": "invalid user type"})
    return jsonify({"role": user_role}), 200


# Formation routes
@bp.route('/formations', methods=['GET'])
def get_all_formations():
    formations = formation_model.get_formations()
    return jsonify(formations)


@bp.route('/profiles/<filename>', methods=['GET'])
def uploaded_file(filename):
    try:
        # Ensure filename is safe and properly sanitized
        safe_filename = os.path.basename(filename)

        # Construct the path to the directory where profiles are stored
        profile_directory = os.path.abspath(os.path.join(
            current_app.root_path, '..', 'data', 'profiles'))

        # Check if file exists
        file_path = os.path.join(profile_directory, safe_filename)
        if not os.path.exists(file_path):
            return jsonify({'error': 'File not found'}), 404

        # Serve the file from the specified directory
        return send_from_directory(profile_directory, safe_filename)
    except Exception as e:
        return jsonify({'error': 'Error serving file', 'details': str(e)}), 500


@bp.route('/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    data = request.form  # Assuming form data for image upload
    files = request.files  # To handle profile image upload

    # Retrieve the user from the database using the token
    user = current_user

    if not data.get('password') and not files.get('profileImg'):
        return jsonify({'error': 'You should update at least one on field [password,profileImg]'}), 400

    # Update password if provided
    if 'password' in data and data['password']:
        password = data['password'].strip()

        if not utile.validate_password(password):
            return jsonify({'error': 'Invalid password format'}), 400

        hashed_password = bcrypt.hashpw(
            password.encode('utf-8'), bcrypt.gensalt())
        user['password'] = hashed_password

    # Update profile image if provided
    if 'profileImg' in files and files['profileImg']:
        profile_img = files['profileImg']
        if profile_img and not utile.allowed_file_img(profile_img.filename):
            return jsonify({'error': f'invalid thumbnail file extension format allowed : {current_app.config["ALLOWED_IMG_EXTENSIONS"]} '}), 400

        # Define the directory to store the profile images
        profiles_dir = os.path.abspath(os.path.join(
            current_app.root_path, '..', 'data', 'profiles'))

        # Get the current user's profile image filename
        old_profile_img = user['profileImg'].split('/')[-1]

        # Create the new profile image path
        new_profile_img_filename = old_profile_img

        new_profile_img_path = os.path.join(
            profiles_dir, new_profile_img_filename)

    try:
        # Open the uploaded image
        img = Image.open(profile_img)

        # Convert the image to 'webp' format and save it
        img.save(new_profile_img_path, format='webp')

    except Exception as e:
        return jsonify({'error': 'Error processing image', 'details': str(e)}), 500

    # Save the updated user info to the database
    return user_model.update_user(user)


# @bp.route('/test', methods=['GET'])
# def test():
#     file_utils.create_category_dir("cours sur l'images")
#     file_utils.create_category_dir("cours sur le son")
#     file_utils.create_category_dir("cours sur le montage")
#     file_utils.create_category_dir("cours sur l'éclairage")


# formations :
@bp.route('/formations', methods=['POST'])
@token_required
@admin_required
def create_formation(current_user):
    data = request.form
    missing_fields = utile.validate_fields(
        data, ['categoryName', "description"])
    if missing_fields:
        return jsonify({'error': f'Missing fields: {", ".join(missing_fields)}'}), 400

    categoryName = str(data["categoryName"]).strip().lower()

    sanitized_categoryName = file_utils.sanitize_filename(categoryName)
    description = str(data["description"]).strip()
    thumbnail_file = request.files.get('thumbnail')
    if thumbnail_file and not utile.allowed_file_img(thumbnail_file.filename):
        return jsonify({'error': f'invalid thumbnail file extension format allowed : {current_app.config["ALLOWED_IMG_EXTENSIONS"]} '}), 400

    if formation_model.get_formation_by_category(sanitized_categoryName):
        return jsonify({'error': 'Formation with this category already exists'}), 400

    file_utils.create_category_dir(sanitized_categoryName)
    file_utils.save_category_thumbnail(sanitized_categoryName, thumbnail_file)
    formation = formation_model.add_formation(
        sanitized_categoryName, description)

    return jsonify({'message': f'Formation created successfully :', 'formationData': formation}), 201


@bp.route('/formations/<category_name>/introVideo', methods=['POST'])
@token_required
@admin_required
def add_intro_video_to_formation(current_user, category_name):
    category_name = file_utils.sanitize_filename(category_name)
    formation = formation_model.get_formation_by_category(category_name)

    if not formation:
        return jsonify({'error': 'Formation not found'}), 404

    intro_video = request.files.get('introVideo')

    if not intro_video:
        return jsonify({'error': 'Missing intro video file'}), 400

    if not utile.allowed_file_video(intro_video.filename):
        return jsonify({'error': f'invalid intro video file extension format allowed : {current_app.config["ALLOWED_VIDEO_EXTENSIONS"]} '}), 400

    file_utils.save_category_intro_video(category_name, intro_video)
    video_link = file_utils.get_intro_video_link(category_name)

    formation_model.update_formation_by_category(
        category_name, {'introVideo': video_link})

    return jsonify({'message': 'Intro video added successfully', 'introVideo': video_link}), 200


@bp.route('/formations/<category_name>/introVideo/', methods=['GET'])
def get_category_intro_video(category_name):
    category_name = file_utils.sanitize_filename(category_name.strip().lower())
    category_dir = os.path.join(file_utils.CATEGORIES_DIR, category_name)
    if os.path.exists(f"{category_dir}/{category_name}_introVideo.mp4"):
        return send_from_directory(category_dir, f"{category_name}_introVideo.mp4")
    else:
        return jsonify({"error": "intro video not found"}), 404


@bp.route('/formations/<category_name>/introVideo', methods=['DELETE'])
@token_required
@admin_required
def delete_intro_video_to_formation(current_user, category_name):
    category_name = file_utils.sanitize_filename(category_name)
    formation = formation_model.get_formation_by_category(category_name)

    if not formation:
        return jsonify({'error': 'Formation not found'}), 404

    file_utils.delete_category_intro_video(category_name)

    formation_model.update_formation_by_category(
        category_name, {'introVideo': None})

    return jsonify({'message': 'Intro video deleted successfully'}), 200


@bp.route('/formations/<category_name>/thumbnails/', methods=['GET'])
def get_category_thumbnail(category_name):
    category_name = file_utils.sanitize_filename(category_name.strip().lower())
    category_dir = os.path.join(file_utils.CATEGORIES_DIR, category_name)
    return send_from_directory(category_dir, f"{category_name}_thumbnail.jpg")


@bp.route('/formations', methods=['POST'])
def get_formations():
    formations = formation_model.get_formations()

    return jsonify(formations), 201


@bp.route('/formations/<category_name>', methods=['GET'])
def get_single_formation_by_category(category_name):
    sanitized_category_name = file_utils.sanitize_filename(
        category_name.strip().lower())
    formation = formation_model.get_formation_by_category(
        sanitized_category_name)
    if formation:
        return jsonify(formation)
    return jsonify({'error': 'Formation not found'}), 404


@bp.route('/formations/<category_name>', methods=['PUT'])
@token_required
@admin_required
def update_single_formation_category(current_user, category_name):
    data = request.form
    sanitized_category_name = file_utils.sanitize_filename(
        category_name.strip().lower())

    formation = formation_model.get_formation_by_category(
        sanitized_category_name)
    if not formation:
        return jsonify({'error': 'Formation not found'}), 404

    new_category_name = str(data.get('newCategoryName', '')).strip().lower()
    sanitized_new_category_name = file_utils.sanitize_filename(
        new_category_name)
    new_description = str(data.get('newDescription', '')).strip()
    thumbnail_file = request.files.get('thumbnail')

    if not new_category_name and not new_description and not thumbnail_file:
        return jsonify({'error': 'Either newCategoryName or newDescription  or thumbnail must be provided'}), 400

    if new_category_name and formation_model.get_formation_by_category(sanitized_new_category_name):
        return jsonify({'error': 'Category name already exists'}), 400

    if thumbnail_file and not utile.allowed_file_img(thumbnail_file.filename):
        return jsonify({'error': f'invalid thumbnail file extension format allowed : {current_app.config["ALLOWED_IMG_EXTENSIONS"]} '}), 400

    if thumbnail_file:
        file_utils.save_category_thumbnail(category_name, thumbnail_file)

    update_fields = {}

    if new_category_name:
        update_fields['categoryName'] = sanitized_new_category_name
        file_utils.update_category_dir(
            sanitized_category_name, sanitized_new_category_name)

    if new_description:
        update_fields['description'] = new_description

    updated_dir_data = formation_model.update_formation_by_category(
        sanitized_category_name, update_fields)

    if new_category_name:
        return jsonify({'message': 'Formation updated successfully', "thumbnail": updated_dir_data["thumbnail"], "introVideo": updated_dir_data["introVideo"]})
    return jsonify({'message': 'Formation updated successfully'})


@bp.route('/formations/<category_name>', methods=['DELETE'])
@token_required
@admin_required
def delete_single_formation_by_category(current_user, category_name):
    sanitized_category_name = file_utils.sanitize_filename(
        category_name.strip().lower())
    result = formation_model.delete_formation_by_category(
        sanitized_category_name)
    if result.deleted_count:
        file_utils.delete_category_dir(sanitized_category_name)
        return jsonify({'message': 'Formation deleted successfully'})
    return jsonify({'error': 'Formation not found'}), 404


# Course routes
@bp.route('/formations/<category_name>/courses', methods=['POST'])
@token_required
@admin_required
def create_course(current_user, category_name):
    data = request.form
    category_name = file_utils.sanitize_filename(category_name.strip().lower())
    course_name = file_utils.sanitize_filename(
        str(data.get('courseName', '')).strip().lower())

    if formation_model.get_course_from_formation_by_name(category_name, course_name):
        return jsonify({'error': f'Formation with {category_name} category already contains {course_name} course'}), 404

    missing_fields = utile.validate_fields(data, ['courseName', 'description'])
    if missing_fields:
        return jsonify({'error': f'Missing fields: {", ".join(missing_fields)}'}), 400

    course_description = str(data.get('description', '')).strip().lower()

    if not formation_model.get_formation_by_category(category_name):
        return jsonify({'error': 'Formation with this category does not exist'}), 404
    thumbnail_file = request.files.get('thumbnail')

    if thumbnail_file and not utile.allowed_file_img(thumbnail_file.filename):
        return jsonify({'error': f'invalid thumbnail file extension format allowed : {current_app.config["ALLOWED_IMG_EXTENSIONS"]} '}), 400

    file_utils.create_course_dir(category_name, course_name)
    file_utils.save_course_thumbnail(
        category_name, course_name, thumbnail_file)
    formation_model.add_course_to_formation(
        category_name, course_name, course_description)

    # Fetch the newly created course details
    course_data = formation_model.get_course_from_formation_by_name(
        category_name, course_name)

    return jsonify({'message': 'Course created successfully', 'courseData': course_data}), 201


@bp.route('/formations/<category_name>/courses/<course_name>/thumbnails/', methods=['GET'])
def get_course_thumbnail(category_name, course_name):

    category_name = file_utils.sanitize_filename(category_name.strip().lower())
    course_name = file_utils.sanitize_filename(course_name.strip().lower())
    course_dir = os.path.join(
        file_utils.CATEGORIES_DIR, category_name, course_name)

    return send_from_directory(course_dir, f"{course_name}_thumbnail.jpg")


@bp.route('/formations/<category_name>/courses/<course_name>', methods=['GET'])
@token_required
def get_course_by_name(current_user, category_name, course_name):
    category_name = file_utils.sanitize_filename(category_name.strip().lower())
    course_name = file_utils.sanitize_filename(course_name.strip().lower())

    # Retrieve the course details
    course = formation_model.get_course_from_formation_by_name(
        category_name, course_name)

    if course:
        # Check if the current user is enrolled in the course
        tracking_info = user_model.get_enrolled_course_data(
            current_user, category_name, course_name)

        if not tracking_info:
            tracking_info = {
                'currentContent': 0,
                'maxContent': 0,
                'currentDuration': 0,
            }

        # Add the enrollment status to the response
        response = {
            'courseDetails': course,
            'trackingInfo': tracking_info
        }

        return jsonify(response)

    return jsonify({'error': 'Course not found'}), 404


@bp.route('/formations/<category_name>/courses/<course_name>', methods=['PUT'])
@token_required
@admin_required
def update_course_route(current_user, category_name, course_name):
    category_name = file_utils.sanitize_filename(category_name.lower().strip())
    course_name = file_utils.sanitize_filename(course_name.lower().strip())

    if not formation_model.get_course_from_formation_by_name(category_name, course_name):
        return jsonify({'error': f'Formation with {category_name} category does not contain {course_name} course'}), 404

    data = {**request.form.to_dict(), **request.files.to_dict()}

    if not (data.get('courseName') or data.get('description') or data.get('thumbnail')):
        return jsonify({'error': 'At least one field (courseName or description or thumbnail) is required'}), 400

    new_course_name = file_utils.sanitize_filename(
        str(data.get('courseName', '')).strip().lower())
    new_course_description = str(data.get('description', '')).strip()

    if new_course_name:
        existing_course = formation_model.get_course_from_formation_by_name(
            category_name, new_course_name)
        if existing_course:
            return jsonify({'error': 'Course name already exists'}), 400

    thumbnail_file = request.files.get('thumbnail')
    if thumbnail_file:
        if not utile.allowed_file_img(thumbnail_file.filename):
            return jsonify({'error': f'invalid thumbnail file extension format allowed : {current_app.config["ALLOWED_IMG_EXTENSIONS"]} '}), 400

        file_utils.save_course_thumbnail(
            category_name, course_name, thumbnail_file)

    update_fields = {}
    if new_course_name:
        update_fields['courseName'] = new_course_name

        file_utils.update_course_dir(
            category_name, course_name, new_course_name)
    if new_course_description:
        update_fields['description'] = new_course_description

    formation_model.update_course_in_formation(
        category_name, course_name, update_fields)

    return jsonify({'message': 'Course updated successfully'})


@bp.route('/formations/<category_name>/courses/<course_name>', methods=['DELETE'])
@token_required
@admin_required
def delete_course_route(current_user, category_name, course_name):
    category_name = file_utils.sanitize_filename(category_name.strip().lower())
    course_name = file_utils.sanitize_filename(course_name.strip().lower())

    result = formation_model.remove_course_from_formation(
        category_name, course_name)
    if result.modified_count:
        file_utils.delete_course_dir(category_name, course_name)
        return jsonify({'message': 'Course deleted successfully'})
    return jsonify({'error': 'Course not found'}), 404


def add_course_content(current_user, category_name, course_name):
    category_name = category_name.strip().lower()
    course_name = course_name.strip().lower()

    if 'video' not in request.files:
        return jsonify({'error': 'Video file is required'}), 400

    video_file = request.files['video']
    if not utile.allowed_file_video(video_file.filename):
        return jsonify({'error': f'invalid intro video file extension format allowed : {current_app.config["ALLOWED_VIDEO_EXTENSIONS"]} '}), 400

    title = file_utils.sanitize_filename(
        str(request.form.get('title', '')).strip().lower())
    description = str(request.form.get('description', '')).strip()
    thumbnail = request.files.get('thumbnail')

    if thumbnail and not utile.allowed_file_img(thumbnail.filename):
        return jsonify({'error': f'invalid thumbnail file extension format allowed : {current_app.config["ALLOWED_IMG_EXTENSIONS"]} '}), 400

    if not title:
        return jsonify({'error': 'Title is required'}), 400

    if not formation_model.get_course_from_formation_by_name(category_name, course_name):
        return jsonify({'error': 'Course not found'}), 404

    existing_content = formation_model.get_course_content_by_title(
        category_name, course_name, title)
    if existing_content:
        return jsonify({'error': 'Course content with the same title already exists'}), 400

    video_info = file_utils.save_video_and_thumbnail(
        category_name, course_name, title, video_file, thumbnail)

    course_content = formation_model.create_course_content_object(
        category_name, course_name, title, video_info, description)

    result = formation_model.create_course_content(
        category_name, course_name, course_content)
    print(result)

    if result.modified_count:
        target_content = formation_model.get_course_content_in_db(
            current_user, category_name, course_name, title)

        return jsonify({'message': 'Course content added successfully', 'contentDetails': target_content}), 201
    return jsonify({'error': 'Failed to add course content'}), 500


@bp.route('/formations/<category_name>/courses/<course_name>/content/<title>/like', methods=['POST'])
@token_required
def like_course_content(current_user, category_name, course_name, title):
    """
    Adds a 'like' to a video (course content) in a course.
    """
    category_name = file_utils.sanitize_filename(category_name.strip().lower())
    course_name = file_utils.sanitize_filename(course_name.strip().lower())

    # Check if the course content (video) exists
    content = formation_model.get_course_content_by_title(
        category_name, course_name, title)
    if not content:
        return jsonify({'error': 'Course content not found'}), 404

    # Increment the number of likes on the course content (video)
    content_like_result = formation_model.increment_content_likes(
        category_name, course_name, title)

    # Increment the number of likes on the entire course
    course_like_result = formation_model.increment_course_likes(
        category_name, course_name)

    if content_like_result.modified_count > 0 and course_like_result.modified_count > 0:
        return jsonify({'message': 'Content liked and course like incremented successfully'})

    return jsonify({'error': 'Failed to like content or increment course likes'}), 500


@bp.route('/formations/<category_name>/courses/<course_name>/content', methods=['POST'])
@token_required
@admin_required
def add_course_content_route(current_user, category_name, course_name):
    return add_course_content(current_user, category_name, course_name)


@bp.route('/formations/<category_name>/courses/<course_name>/videos/<filename>', methods=['GET'])
def get_video(category_name, course_name, filename):
    category_name = file_utils.sanitize_filename(category_name.strip().lower())
    course_name = file_utils.sanitize_filename(course_name.strip().lower())
    filename = file_utils.sanitize_filename(filename)

    video_dir = os.path.join(file_utils.CATEGORIES_DIR,
                             category_name, course_name, 'videos', filename)
    return send_from_directory(video_dir, f"{filename}_video.mp4")


@bp.route('/formations/<category_name>/courses/<course_name>/thumbnails/<filename>', methods=['GET'])
def get_thumbnail(category_name, course_name, filename):
    category_name = file_utils.sanitize_filename(category_name.strip().lower())
    course_name = file_utils.sanitize_filename(course_name.strip().lower())
    thumbnail_dir = os.path.join(
        file_utils.CATEGORIES_DIR, category_name, course_name, 'videos', filename)
    return send_from_directory(thumbnail_dir, f"{filename}_thumbnail.jpg")


@bp.route('/formations/<category_name>/courses/<course_name>/content/<title>', methods=['PUT'])
@token_required
@admin_required
def update_course_content(current_user, category_name, course_name, title):

    if 'video' not in request.files and 'thumbnail' not in request.files and 'title' not in request.form and 'description' not in request.form:
        return jsonify({"error": "No video, thumbnail, ,description, or title provided"}), 400

    # Find the course content to be deleted
    title = file_utils.sanitize_filename(title.lower().strip())
    course_content = formation_model.get_course_content_by_title(
        category_name, course_name, title)

    if not course_content:
        return jsonify({"error": 'Course content not found'}), 404

    video_file = request.files.get('video')
    thumbnail_file = request.files.get('thumbnail')

    new_title = str(request.form.get("title", "")).lower().strip()
    new_description = str(request.form.get("description", "")).strip()

    if thumbnail_file and not utile.allowed_file_img(thumbnail_file.filename):
        return jsonify({'error': f'invalid thumbnail file extension format allowed : {current_app.config["ALLOWED_IMG_EXTENSIONS"]} '}), 400

    if video_file and not utile.allowed_file_video(video_file.filename):
        return jsonify({'error': f'invalid intro video file extension format allowed : {current_app.config["ALLOWED_VIDEO_EXTENSIONS"]} '}), 400

    new_title = file_utils.sanitize_filename(new_title)

    if new_title and formation_model.get_course_content_by_title(category_name, course_name, new_title):
        return jsonify({'error': ' video Title already exists'}), 400

    update_data = {}

    if thumbnail_file:
        file_utils.save_thumbnail(
            category_name, course_name, title, thumbnail_file)

    if video_file:
        duration = file_utils.save_video(
            category_name, course_name, title, video_file)
        update_data['duration'] = duration

    if new_title:
        update_data['title'] = new_title
        file_utils. update_course_content_dir(
            category_name, course_name, title, new_title)

    if new_description:
        update_data['description'] = new_description

    # Update the course content in the database
    result = formation_model.update_course_content_in_db(
        category_name, course_name, title, update_data)

    course_content = ""

    if new_title:
        course_content = formation_model.get_course_content_by_title(
            category_name, course_name, new_title)
    else:
        course_content = formation_model.get_course_content_by_title(
            category_name, course_name, title)

    return jsonify({"message": 'Course content updated successfully', "courseContent": course_content}), 200


def update_users_progress(current_user, category_name, course_name, deleted_content_index):

    try:
        category_name = file_utils.sanitize_filename(
            category_name.strip().lower())
        course_name = file_utils.sanitize_filename(course_name.strip().lower())

        # Fetch the target course by categoryName and courseName
        course = formation_model.get_course_from_formation_by_name(
            category_name, course_name)

        course_content = course.get('courseContent', [])
        current_max_content = len(course_content)

        if not course:
            return jsonify({'error': 'Course not found'}), 404

        if deleted_content_index < 0 or deleted_content_index >= current_max_content:
            return jsonify({'error': f'invalid courseContent index [{deleted_content_index}]'})

         # Iterate over all users enrolled in this course
        users = user_model.get_users_enrolled_a_course(
            category_name, course_name, True)

        updated_users_count = 0

        for user in users:

            updated = False

            for enrolled_course in user.get('enrolledCourses', []):

                if enrolled_course['courseName'] == course_name and enrolled_course['categoryName'] == category_name:

                    enrolled_course['maxContent'] = int(
                        enrolled_course['maxContent'])
                    enrolled_course['currentContent'] = int(
                        enrolled_course['currentContent'])
                    if current_max_content == 1:
                        enrolled_course['maxContent'] = 0
                        enrolled_course['currentContent'] = 0
                        break

                    # Check if currentContent exceeds maxContent after deletion
                    if enrolled_course['maxContent'] > current_max_content:
                        enrolled_course['maxContent'] = current_max_content

                    if enrolled_course['maxContent'] > 0 and enrolled_course['maxContent'] >= deleted_content_index:
                        enrolled_course['maxContent'] -= 1

                    if enrolled_course['currentContent'] > 0 and enrolled_course['currentContent'] >= deleted_content_index:
                        enrolled_course['currentDuration'] = 0
                        enrolled_course['currentContent'] -= 1

                    # If the currentContent exceeds maxContent, reset it to maxContent
                    if enrolled_course['currentContent'] > enrolled_course['maxContent'] and user['accountType'] == 'normal':

                        enrolled_course['currentContent'] = enrolled_course['maxContent']

                    updated = True

                    break

            if updated:
                # Update the user's enrolled courses with the new progress
                user_model.update_user_enrolled_courses(
                    user['_id'], user['enrolledCourses'])
                updated_users_count += 1

        users = user_model.get_users_enrolled_a_course(
            category_name, course_name)
        return {
            'message': 'Course content deleted successfully',
            'messageSecondary': 'User progress updated successfully.',
            'updated_users_count': updated_users_count,
            'users': users,
        }

    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500


@bp.route('/formations/<category_name>/courses/<course_name>/content/<title>', methods=['DELETE'])
@token_required
@admin_required
def delete_course_content(current_user, category_name, course_name, title):

    try:

        # Find the course content to be deleted
        category_name = file_utils.sanitize_filename(
            category_name.strip().lower())
        course_name = file_utils.sanitize_filename(course_name.strip().lower())
        title = file_utils.sanitize_filename(title.lower().strip())

        course_content = formation_model.get_course_content_by_title(
            category_name, course_name, title)

        if not course_content:
            return jsonify({"error": 'Course content not found'}), 404
            # Find the index of the content by its title

        # Fetch the target course by categoryName and courseName
        course = formation_model.get_course_contents_in_db(
            category_name, course_name, title)

        course_content = course['courses'][0].get('courseContent', [])
        target_content_index = None

        for idx, content in enumerate(course_content):
            if content.get('title') == title:
                target_content_index = idx
                break

        updatedContent = update_users_progress(
            current_user, category_name, course_name, target_content_index)

        contentPath = os.path.join(
            file_utils.CATEGORIES_DIR, category_name, course_name, 'videos', title)

        if os.path.exists(contentPath):
            shutil.rmtree(contentPath)

        # Remove the course content from the database
        result = formation_model.delete_course_content_in_db(
            category_name, course_name, title)

        return jsonify(updatedContent), 200

    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500


@bp.route('/formations/<category_name>/courses/<course_name>/tracking', methods=['PUT'])
@token_required
def update_tracking_info(current_user, category_name, course_name):
    # Sanitize inputs
    category_name = file_utils.sanitize_filename(category_name.strip().lower())
    course_name = file_utils.sanitize_filename(course_name.strip().lower())

    # Get request data
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400
        is_enrolled = user_model.is_user_enrolled(
            current_user['_id'], category_name, course_name)

    is_enrolled = user_model.is_user_enrolled(
        current_user['_id'], category_name, course_name)

    if not is_enrolled:
        return jsonify({'error': 'You have to enroll the course before do this operation'}), 400

    current_content = data.get('currentContent')
    max_content = data.get('maxContent', -1)
    current_duration = data.get('currentDuration', 0)
    # Validate content values
    if not utile.validate_content_values(current_content, max_content, current_duration):
        return jsonify({'error': 'Invalid content values'}), 400

    current_content = int(current_content)
    max_content = int(max_content)
    current_duration = int(current_duration)

    # Get course details to retrieve `courseContent` length
    course = formation_model.get_course_from_formation_by_name(
        category_name, course_name)
    if not course:
        return jsonify({'error': 'Course not found'}), 404

    # Get the length of the course content
    course_content_length = len(course.get('courseContent', []))

    # Validate that `currentContent` and `maxContent` are not greater than the course content length
    if max_content > course_content_length:
        max_content = course_content_length
    if current_content >= course_content_length:
        return jsonify({
            'error': 'Tracking info exceeds course content length',
            'courseContentLength': course_content_length
        }), 400

    # Update the tracking info within the enrolled courses
    updated_enrolled_courses = user_model.update_user_enrolled_course_tracking(
        current_user['enrolledCourses'], category_name, course_name, current_content, max_content, current_duration)

    # Update the user document
    if user_model.update_user_enrolled_courses(current_user['_id'], updated_enrolled_courses):
        return jsonify(user_model.get_enrolled_course_data(current_user, category_name, course_name)), 200
    else:
        return jsonify({'error': 'Failed to update tracking information'}), 500


@bp.route('/formations/<category_name>/courses/<course_name>/content/<content_title>', methods=['GET'])
@token_required
def get_course_content_by_title_endpoint(current_user, category_name, course_name, content_title):

    # Sanitize inputs
    category_name = file_utils.sanitize_filename(category_name.strip().lower())
    course_name = file_utils.sanitize_filename(course_name.strip().lower())
    content_title = file_utils.sanitize_filename(content_title.strip().lower())

    # Get the target content by title
    target_content = formation_model.get_course_content_in_db(
        current_user, category_name, course_name, content_title)

    if target_content:
        return target_content
    else:
        return jsonify({'error': 'Content not found'}), 404


@bp.route('/formations/<category_name>/courses/<course_name>/tracking', methods=['GET'])
@token_required
def get_course_tracking_info(current_user, category_name, course_name):
    category_name = file_utils.sanitize_filename(category_name.strip().lower())
    course_name = file_utils.sanitize_filename(course_name.strip().lower())

    # Retrieve the course details
    course = formation_model.get_course_from_formation_by_name(
        category_name, course_name)

    if course:
        # Check if the current user is enrolled in the course
        tracking_info = user_model.get_enrolled_course_data(
            current_user, category_name, course_name)

        if not tracking_info:
            tracking_info = {
                'categoryName': category_name,
                'currentDuration': 0,
                'currentContent': 0,
                'maxContent': 0
            }

        return jsonify(tracking_info)

    return jsonify({'error': 'Course not found'}), 404

# Comment routes


@bp.route('/formations/<category_name>/courses/<course_name>/comments', methods=['POST'])
@token_required
def create_comment(current_user, category_name, course_name):
    data = request.get_json() or {}
    missing_fields = utile.validate_fields(data, ['message'])
    if missing_fields:
        return jsonify({'error': f'Missing fields: {", ".join(missing_fields)}'}), 400

    category_name = file_utils.sanitize_filename(category_name.strip().lower())
    course_name = file_utils.sanitize_filename(course_name.strip().lower())
    is_enrolled = user_model.is_user_enrolled(
        current_user['_id'], category_name, course_name)

    if not is_enrolled and not utile.check_admin_or_owner(current_user):
        return jsonify({'error': 'You have to enroll the course before do this operation'}), 400

    if not formation_model.get_course_from_formation_by_name(category_name, course_name):
        return jsonify({'error': 'Course not found'}), 404

    message = str(data['message']).strip()

    comment = formation_model.add_comment_to_course_by_name(
        category_name, course_name, message, current_user)

    return jsonify({'message': 'Comment added successfully', 'comment': comment})


@bp.route('/formations/<category_name>/courses/<course_name>/comments/<comment_id>', methods=['PUT'])
@token_required
def update_comment(current_user, category_name, course_name, comment_id):
    category_name = file_utils.sanitize_filename(category_name.strip().lower())
    course_name = file_utils.sanitize_filename(course_name.strip().lower())
    data = request.get_json() or {}
    message = str(data.get('message', "")).strip()
    if 'message' not in data or not message:
        return jsonify({'error': 'Message field is required'}), 400

    course = formation_model.get_course_from_formation_by_name(
        category_name, course_name)
    if not course:
        return jsonify({'error': 'Course not found'}), 404

    comment = next((c for c in course.get('comments', [])
                   if str(c['_id']) == comment_id), None)
    if not comment:
        return jsonify({'error': 'Comment not found'}), 404

    if comment['username'] == current_user['username']:
        result = formation_model.update_comment_message(
            category_name, course_name, comment_id, message)
        if result.modified_count == 1:
            return jsonify({'message': 'Comment updated successfully'})
        else:
            return jsonify({'error': 'Failed to update comment'}), 500
    else:
        return jsonify({'error': 'Permission denied'}), 403


@bp.route('/formations/<category_name>/courses/<course_name>/comments/<comment_id>', methods=['DELETE'])
@token_required
def delete_comment(current_user, category_name, course_name, comment_id):
    category_name = file_utils.sanitize_filename(category_name.strip().lower())
    course_name = file_utils.sanitize_filename(course_name.strip().lower())

    course = formation_model.get_course_from_formation_by_name(
        category_name, course_name)
    if not course:
        return jsonify({'error': 'Course not found'}), 404

    comment = next((c for c in course.get('comments', [])
                   if str(c['_id']) == comment_id), None)

    if not comment:
        return jsonify({'error': 'Comment not found'}), 404

    if utile.check_admin_or_owner(current_user) or comment['email'] == current_user['email']:
        result = formation_model.delete_comment_from_course_by_name(
            category_name, course_name, comment_id)
        if result.modified_count == 1:
            return jsonify({'message': 'Comment deleted successfully'})
        else:
            return jsonify({'error': 'Failed to delete comment'}), 500
    else:
        return jsonify({'error': 'Permission denied'}), 403


@bp.route('/formations/<category_name>/courses/<course_name>/comments/pullUp/<comment_id>', methods=['PATCH'])
@token_required
def pull_up_comment(current_user, category_name, course_name, comment_id):
    category_name = file_utils.sanitize_filename(category_name.strip().lower())
    course_name = file_utils.sanitize_filename(course_name.strip().lower())

    is_enrolled = user_model.is_user_enrolled(
        current_user['_id'], category_name, course_name)

    if not is_enrolled and not utile.check_admin_or_owner(current_user):
        return jsonify({'error': 'You have to enroll the course before do this operation'}), 400

    course = formation_model.get_course_from_formation_by_name(
        category_name, course_name)
    if not course:
        return jsonify({'error': 'Course not found'}), 404

    comment = next((c for c in course.get('comments', [])
                   if str(c['_id']) == comment_id), None)
    if not comment:
        return jsonify({'error': 'Comment not found'}), 404
    pull_down_status = False
    if current_user['username'] in comment.get('usersPullUpList', []):
        pull_down_status = True

    if comment['username'] != current_user['username']:
        if (pull_down_status):
            formation_model.pull_down_comment(
                category_name, course_name, comment_id, current_user)
            return jsonify({'message': 'Comment pulled down successfully', 'comment': {'pullDownStatus': pull_down_status, 'nbrPullUp': comment.get('nbrPullUp', 0)-1}})
        else:
            formation_model.pull_up_comment(
                category_name, course_name, comment_id, current_user)

            return jsonify({'message': 'Comment pulled up successfully',  'comment': {'pullDownStatus': pull_down_status, 'nbrPullUp': comment.get('nbrPullUp', 0) + 1}})

    else:
        return jsonify({'error': 'Permission denied'}), 403


@bp.route('/formations/<category_name>/courses/<course_name>/comments/<comment_id>/reply', methods=['POST'])
@token_required
def create_reply_comment(current_user, category_name, course_name, comment_id):
    category_name = file_utils.sanitize_filename(category_name.strip().lower())
    course_name = file_utils.sanitize_filename(course_name.strip().lower())

    data = request.get_json() or {}
    missing_fields = utile.validate_fields(data, ['message'])
    if missing_fields:
        return jsonify({'error': f'Missing fields: {", ".join(missing_fields)}'}), 400
    is_enrolled = user_model.is_user_enrolled(
        current_user['_id'], category_name, course_name)

    if not is_enrolled and not utile.check_admin_or_owner(current_user):
        return jsonify({'error': 'You have to enroll the course before do this operation'}), 400

    course = formation_model.get_course_from_formation_by_name(
        category_name, course_name)
    if not course:
        return jsonify({'error': 'Course not found'}), 404

    comment = next((c for c in course.get('comments', [])
                   if str(c['_id']) == comment_id), None)

    if not comment:
        return jsonify({'error': 'Comment not found'}), 404

    message = str(data['message']).strip()

    comment = formation_model.add_comment_replay_to_course_by_name(
        category_name, course_name, message, current_user, comment_id)

    return jsonify({'message': 'Comment added successfully', 'comment': comment})


@bp.route('/formations/<category_name>/courses/<course_name>/comments/<root_comment_id>/reply/<comment_id>/pullUp', methods=['PATCH'])
@token_required
def pull_up_reply_comment(current_user, category_name, course_name, root_comment_id, comment_id):
    category_name = file_utils.sanitize_filename(category_name.strip().lower())
    course_name = file_utils.sanitize_filename(course_name.strip().lower())

    is_enrolled = user_model.is_user_enrolled(
        current_user['_id'], category_name, course_name)

    if not is_enrolled and not utile.check_admin_or_owner(current_user):
        return jsonify({'error': 'You have to enroll the course before do this operation'}), 400
    print("reply comment :", comment_id)
    comment = formation_model.get_reply_comment_by_id(
        category_name, course_name, root_comment_id, comment_id)
    if not comment:
        return jsonify({'error': 'Reply comment not found'}), 404

    pull_down_status = current_user['username'] in comment.get(
        'usersPullUpList', [])

    if comment['username'] != current_user['username']:
        if pull_down_status:
            formation_model.pull_down_reply_comment(
                category_name, course_name, root_comment_id, comment_id, current_user)
            return jsonify({'message': 'Reply comment pulled down successfully',  'comment': {'pullDownStatus': pull_down_status, 'nbrPullUp': comment.get('nbrPullUp', 0)-1}})
        else:
            formation_model.pull_up_reply_comment(
                category_name, course_name, root_comment_id, comment_id, current_user)
            return jsonify({'message': 'Reply comment pulled up successfully',  'comment': {'pullDownStatus': pull_down_status, 'nbrPullUp': comment.get('nbrPullUp', 0)+1}})
    else:
        return jsonify({'error': 'Permission denied'}), 403


@bp.route('/formations/<category_name>/courses/<course_name>/comments/<root_comment_id>/reply/<comment_id>', methods=['DELETE'])
@token_required
def delete_reply_comment(current_user, category_name, course_name, root_comment_id, comment_id):
    category_name = file_utils.sanitize_filename(category_name.strip().lower())
    course_name = file_utils.sanitize_filename(course_name.strip().lower())

    comment = formation_model.get_reply_comment_by_id(
        category_name, course_name, root_comment_id, comment_id)
    if not comment:
        return jsonify({'error': 'Reply comment not found'}), 404

    if utile.check_admin_or_owner(current_user) or comment['username'] == current_user['username']:
        result = formation_model.delete_reply_comment_from_course_by_name(
            category_name, course_name, root_comment_id, comment_id)
        if result.modified_count == 1:
            return jsonify({'message': 'Reply comment deleted successfully'})
        else:
            return jsonify({'error': 'Failed to delete reply comment'}), 500
    else:
        return jsonify({'error': 'Permission denied'}), 403


@bp.route('/formations/<category_name>/courses/<course_name>/comments/<root_comment_id>/reply/<comment_id>', methods=['PUT'])
@token_required
def update_reply_comment(current_user, category_name, course_name, root_comment_id, comment_id):
    category_name = file_utils.sanitize_filename(category_name.strip().lower())
    course_name = file_utils.sanitize_filename(course_name.strip().lower())
    data = request.get_json() or {}
    message = str(data.get('message', "")).strip()
    if 'message' not in data or not message:
        return jsonify({'error': 'Message field is required'}), 400

    comment = formation_model.get_reply_comment_by_id(
        category_name, course_name, root_comment_id, comment_id)
    if not comment:
        return jsonify({'error': 'Reply comment not found'}), 404

    if comment['username'] == current_user['username']:
        result = formation_model.update_reply_comment_message(
            category_name, course_name, root_comment_id, comment_id, message)
        if result.modified_count == 1:
            return jsonify({'message': 'Reply comment updated successfully'})
        else:
            return jsonify({'error': 'Failed to update reply comment'}), 500
    else:
        return jsonify({'error': 'Permission denied'}), 403

# review section :


@bp.route('/formations/<category_name>/courses/<course_name>/reviews', methods=['POST'])
@token_required
def create_review(current_user, category_name, course_name):
    category_name = file_utils.sanitize_filename(category_name.strip().lower())
    course_name = file_utils.sanitize_filename(course_name.strip().lower())

    data = request.get_json() or {}
    missing_fields = utile.validate_fields(data, ['rating'])
    if missing_fields:
        return jsonify({'error': f'Missing fields: {", ".join(missing_fields)}'}), 400
    is_enrolled = user_model.is_user_enrolled(
        current_user['_id'], category_name, course_name)

    if not is_enrolled:
        return jsonify({'error': 'You have to enroll the course before do this operation'}), 400

    review = str(data.get('review', "")).strip()
    if not utile.is_numeric(data.get('rating', 0)):
        return jsonify({'error': f'the rating should be a numeric value'}), 400
    rating = float(data.get('rating', 0))

    if not 0 <= rating <= 5:
        return jsonify({'error': 'Rating must be between 0 and 5'}), 400

    course = formation_model.get_course_from_formation_by_name(
        category_name, course_name)
    if not course:
        return jsonify({'error': 'Course not found'}), 404

    existing_review = formation_model.get_user_review(
        category_name, course_name, current_user['username'])
    if existing_review:
        return jsonify({'error': 'You have already reviewed this course'}), 400

    review_result, average_rating = formation_model.add_review_to_course(
        category_name, course_name, review, rating, current_user)
    if review_result:

        return jsonify({'message': 'Review added successfully', 'review': review_result, 'averageRating': average_rating}), 201
    else:
        return jsonify({'error': 'Failed to add review'}), 500


@bp.route('/formations/<category_name>/courses/<course_name>/reviews', methods=['DELETE'])
@token_required
def delete_review(current_user, category_name, course_name):
    category_name = file_utils.sanitize_filename(category_name.strip().lower())
    course_name = file_utils.sanitize_filename(course_name.strip().lower())

    result, average_rating = formation_model.delete_user_review(
        category_name, course_name, current_user['username'])

    if not result:
        return jsonify({'error': 'Failed to delete review'}), 500

    if result and result.modified_count == 1:
        return jsonify({'message': 'Review deleted successfully', 'averageRating': average_rating})
    elif result and result.modified_count == 0:
        return jsonify({'message': 'Review not found'})


@bp.route('/formations/<category_name>/courses/<course_name>/content/<title>/resources', methods=['POST'])
@token_required
@admin_required
def add_resource(current_user, category_name, course_name, title):
    category_name = file_utils.sanitize_filename(category_name.strip().lower())
    course_name = file_utils.sanitize_filename(course_name.strip().lower())

    required_fields = ['title', 'link']
    request_data = request.get_json()

    # Validate missing fields
    missing_fields = utile.validate_fields(request_data, required_fields)
    if missing_fields:
        return jsonify({"error": f"Missing fields: {', '.join(missing_fields)}"}), 400

    # Check if the course content (video) exists
    content = formation_model.get_course_content_by_title(
        category_name, course_name, title)
    if not content:
        return jsonify({'error': 'Course content not found'}), 404

    try:
        resource_data = {
            "title": request_data['title'],
            "description": request_data.get('description', ""),
            "link": request_data['link']
        }

        # Call the helper function to add the resource
        return jsonify(course_model.add_resource_to_course(
            category_name, course_name, title, resource_data))

    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@bp.route('/formations/<category_name>/courses/<course_name>/content/<title>/resources', methods=['GET'])
@token_required
def get_resources(current_user, category_name, course_name, title):
    category_name = file_utils.sanitize_filename(category_name.strip().lower())
    course_name = file_utils.sanitize_filename(course_name.strip().lower())

    content = formation_model.get_course_content_by_title(
        category_name, course_name, title)
    if not content:
        return jsonify({'error': 'Course content not found'}), 404

    resources = content.get('resources', [])

    return jsonify({'resources': resources})


@bp.route('/formations/<category_name>/courses/<course_name>/content/<title>/resources/<resource_id>', methods=['PUT'])
@token_required
@admin_required
def update_resource(current_user, category_name, course_name, title, resource_id):
    category_name = file_utils.sanitize_filename(category_name.strip().lower())
    course_name = file_utils.sanitize_filename(course_name.strip().lower())

    request_data = request.get_json()

    if not request_data:
        return jsonify({"error": "No update data provided"}), 400

    if request_data.get("title") == "" or request_data.get("link") == "":
        return jsonify({"error": "the title and the link should not be empty"})

    try:

        result = course_model.update_resource_in_course(
            category_name, course_name, title, resource_id, request_data)

        return jsonify(result)

    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@bp.route('/formations/<category_name>/courses/<course_name>/content/<title>/resources/<resource_id>', methods=['DELETE'])
@token_required
@admin_required
def delete_resource(current_user, category_name, course_name, title, resource_id):
    category_name = file_utils.sanitize_filename(category_name.strip().lower())
    course_name = file_utils.sanitize_filename(course_name.strip().lower())

    try:
        result = course_model.delete_resource_from_course(
            category_name, course_name, title, resource_id)

        return jsonify(result)

    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500
