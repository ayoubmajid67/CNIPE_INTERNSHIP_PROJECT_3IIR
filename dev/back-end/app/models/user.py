from bson.objectid import ObjectId
from app import mongo
import bcrypt


from flask import request


def get_user_json_structure(username, email, password, accountType):
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    # Construct the full path to the default profile image
    
    server_ip = request.host.split(':')[0]
    print("the server ip : ",server_ip)
    server_port = request.host.split(':')[1] if ':' in request.host else '80'
    user_profile_image = f"http://{server_ip}:{
        server_port}/profiles/{username}_profile.webp"

    user = {
        'username': username,
        'email': email,
        'password': hashed_password,
        'accountType': accountType,
        'status': 'active',
        "profileImg": user_profile_image,
        'canComment': True,
        'enrolledCourses': [],
    }
    return user

# User Functions


def update_user(user_data):
    try:
        # Assuming `mongo` is the MongoDB client instance and `users` is the collection
        result = mongo.db.users.update_one(
            # Search by email (unique identifier)
            {'email': user_data['email']},
            {'$set': {
                'username': user_data['username'],
                'password': user_data['password'],
                'profileImg': user_data['profileImg'],
                'accountType': user_data.get('accountType', 'user'),
                'status': user_data.get('status', 'active'),
                'canComment': user_data.get('canComment', True)
            }}
        )

        if result.matched_count > 0:
            return {'profileImg': user_data['profileImg'], 'message': 'User updated successfully'}
        else:
            return {'error': 'User not found'}

    except Exception as e:
        print(f"An error occurred while updating the user: {str(e)}")
        return {'error': 'Failed to update user'}


def add_user(username, email, password):
    user = get_user_json_structure(username, email, password, "normal")
    return mongo.db.users.insert_one(user)


def get_user_by_email(email):
    return mongo.db.users.find_one({'email': email, 'accountType': 'normal'}, {'_id': 0})


def get_user_by_username(username):
    return mongo.db.users.find_one({'username': username, 'accountType': 'normal'}, {'_id': 0})


def get_formation_by_category_with_id(category_id):
    return mongo.db.formations.find_one({'_id': ObjectId(category_id)})


def get_course_from_formation_by_id(category_id, course_id):
    formation = get_formation_by_category_with_id(category_id)
    if formation and 'courses' in formation:
        return next((course for course in formation['courses'] if str(course['_id']) == course_id), None)
    return None


def get_user_any_Type_by_username(username):
    user = mongo.db.users.find_one({'username': username}, {
                                   '_id': 0, 'password': 0})

    if user and 'enrolledCourses' in user:
        for course in user['enrolledCourses']:
            category_id = course['categoryId']
            course_id = course['courseId']

            # Get formation (category) name
            formation = get_formation_by_category_with_id(str(category_id))
            category_name = formation['categoryName'] if formation else 'Unknown Category'

            # Get course name
            course_info = get_course_from_formation_by_id(
                category_id, str(course_id))
            course_name = course_info['courseName'] if course_info else 'Unknown Course'

            # Add new attributes to the course object
            course['categoryName'] = category_name
            course['courseName'] = course_name

    return user

# Helper functions (as


def update_user_status(user_email, status):
    return mongo.db.users.update_one(
        {'email': user_email, 'accountType': 'normal'},
        {'$set': {'status': status}}
    )


def get_users():
    return list(mongo.db.users.find({'accountType': 'normal'}, {'password': 0, '_id': 0}))


def block_user_from_comment(user_email):
    return mongo.db.users.update_one(
        {'email': user_email, 'accountType': 'normal'},
        {'$set': {'canComment': False}}
    )


def delete_user(email):
    return mongo.db.users.delete_one({'email': email, 'accountType': 'normal'})

# Admin Functions


def add_admin(username, email, password):
    user = get_user_json_structure(username, email, password, "admin")
    return mongo.db.users.insert_one(user)


def remove_admin(email):
    return mongo.db.users.delete_one({'email': email, 'accountType': 'admin'})


def update_admin(username, updated_fields):
    return mongo.db.users.update_one({'username': username, 'accountType': 'admin'}, {'$set': updated_fields})


def get_admins():
    return list(mongo.db.users.find({'accountType': 'admin'}, {'password': 0, '_id': 0}))


def get_admin_by_email(email):
    return mongo.db.users.find_one({'email': email, 'accountType': 'admin'}, {'_id': 0})


def get_admin_by_username(username):
    return mongo.db.users.find_one({'username': username, 'accountType': 'admin'}, {'_id': 0, 'password': 0})


# Owner Functions
def get_users_and_admins():
    return list(mongo.db.users.find({'accountType': {'$in': ['normal', 'admin']}}, {'password': 0, '_id': 0}))


def add_owner(username, email, password):
    user = get_user_json_structure(username, email, password, "owner")
    return mongo.db.users.insert_one(user)


def remove_owner(email):
    return mongo.db.users.delete_one({'email': email, 'accountType': 'owner'})


def get_owner_by_email(email):
    return mongo.db.users.find_one({'email': email, 'accountType': 'owner'}, {'_id': 0})


def get_owner_by_username(username):
    return mongo.db.users.find_one({'username': username, 'accountType': 'owner'}, {'_id': 0})


def get_owners():
    return list(mongo.db.users.find({'accountType': 'owner'}, {'password': 0, '_id': 0}))


def delete_admin(username):
    return mongo.db.users.delete_one({'username': username, 'accountType': 'admin'})


def get_All_by_email(email):
    return mongo.db.users.find_one({'email': email})


def get_All_by_username(username):
    return mongo.db.users.find_one({'email': username}, {'_id': 0})


def get_number_of_users():
    return mongo.db.users.count_documents({})


def is_user_enrolled(user_id, category_id, course_id):
    user = mongo.db.users.find_one(
        {
            '_id': user_id,
            'enrolledCourses': {'$elemMatch': {'categoryId': category_id, 'courseId': course_id}}
        }
    )
    return user is not None


def get_enrolled_course_data(current_user, category_id, course_id):
    # Iterate over the user's enrolled courses
    for course in current_user.get('enrolledCourses', []):
        if course.get('categoryId', '').strip().lower() == category_id and \
           course.get('courseId', '').strip().lower() == course_id:
            # Return the found course data
            return course

    # Return None if no course matches
    return None


def enroll_user_in_course(user_id, category_id, course_id):
    result = mongo.db.users.update_one(
        {'_id': user_id},
        {
            '$addToSet': {
                'enrolledCourses': {
                    'categoryId': category_id,
                    'courseId': course_id,
                    'currentContent': 0,
                    'maxContent': 0,
                    'currentDuration': 0
                }
            }
        }
    )
    return result


def update_user_enrolled_course_tracking(enrolled_courses, category_id, course_id, current_content, max_content, current_duration):

    for course in enrolled_courses:
        if course['categoryId'] == category_id and course['courseId'] == course_id:

            if current_content < 0:
                current_content = 0
            if current_duration < 0:
                current_duration = 0

            prev_max_content = int(course.get('maxContent', 0))
            if max_content > prev_max_content:
                course['maxContent'] = max_content

            course['currentContent'] = current_content
            course['currentDuration'] = current_duration

            return enrolled_courses

    return enrolled_courses


def update_user_enrolled_courses(user_id, enrolled_courses):
    """
    Update the user's enrolledCourses field in the database.
    """
    return mongo.db.users.update_one(
        {"_id": user_id},
        {"$set": {"enrolledCourses": enrolled_courses}}
    )


def get_users_enrolled_a_course(category_name, course_name, includeIsStat=False):

    users = list(mongo.db.users.find(
        {

            'enrolledCourses': {'$elemMatch': {'categoryName': category_name, 'courseName': course_name}}
        },
        {'_id': includeIsStat, 'password': 0}
    ))

    return users


def process_quiz_feedback(quiz, request_data):
    """
    Processes the quiz and calculates feedback and final mark.
    Returns the feedback array, final mark, and total marks.
    """
    feedback = []
    final_mark = 0
    total_marks = 0

    for question in quiz:
        question_id = question['_id']
        correct_answers = [i for i, ans in enumerate(
            question['possibleAnswers']) if ans['status']]
        user_answers = request_data.get(question_id, [])

        if not user_answers:
            feedback.append({
                "questionId": question_id,
                "isCorrect": False,
                "message": "No answer provided."
            })
            continue

        is_correct = set(user_answers) == set(correct_answers)
        total_marks += question['questionMark']
        if is_correct:
            final_mark += question['questionMark']

        feedback.append({
            "questionId": question_id,
            "isCorrect": is_correct,
            "message": "Correct answer" if is_correct else "Wrong answer",
            'usersAnswersIndexes': user_answers,
            "correctAnswersIndexes": correct_answers,
            'questionMark': question['questionMark'],
        })

    return feedback, final_mark, total_marks


def update_user_feedback(current_user, formation_id, course_id, content_id, new_feedback):
    """
    Updates the user feedback based on the new feedback received.
    If feedback for the content already exists, compares and keeps the higher score.
    Saves the feedback back into the user's enrolled course.
    """
    enrolled_courses = current_user.get('enrolledCourses', [])
    target_course = None

    # Find the course and feedback for the user
    for course in enrolled_courses:
        if course['categoryId'] == formation_id and course['courseId'] == course_id:
            target_course = course
            break

    if not target_course:
        # You can adjust error handling as needed
        raise Exception('User is not enrolled in this course')

    user_feedbacks = target_course.get('userFeedBacks', [])
    existing_feedback = None

    # Check if feedback already exists for the content
    for feedback in user_feedbacks:
        if feedback['contentId'] == content_id:
            existing_feedback = feedback
            break

    # If feedback exists, update it with the greater score
    if existing_feedback:
        old_score = existing_feedback['finalMark']
        new_score = new_feedback['finalMark']
        if new_score > old_score:
            existing_feedback.update(new_feedback)
    else:
        # If no feedback exists, create new feedback for this content
        user_feedbacks.append({
            'contentId': content_id,
            **new_feedback
        })

    # Update the user feedback array in the course
    target_course['userFeedBacks'] = user_feedbacks
    current_user['enrolledCourses'] = enrolled_courses

    return current_user


def remove_feedback_from_all_users(category_id, course_id, content_id):
    query = {
        "enrolledCourses.categoryId": category_id,
        "enrolledCourses.courseId": course_id,
        "enrolledCourses.userFeedBacks.contentId": content_id
    }

    # Use $pull to remove the specific feedback from the matching users
    update_operation = {
        "$pull": {
            "enrolledCourses.$.userFeedBacks": {"contentId": content_id}
        }
    }

    result = mongo.db.users.update_many(query, update_operation)

    return result.modified_count

# @bp.route('/addOwners', methods=['POST'])
# def add_owners():
#     user_model.add_owner("youbista","ayoubmajjid@gmail.com","MajjidDev2024")
#     user_model.add_owner("dnau","dnau@gmail.com","dnauDev2024")
#     return jsonify({})
