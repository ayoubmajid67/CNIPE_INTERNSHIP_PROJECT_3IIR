from app import mongo
from bson.objectid import ObjectId


# def add_course(course_name, category_name, created_date, course_content):
#     course = {
#         '_id': str(ObjectId()),
#         'courseName': course_name,
#         'categoryName': category_name,
#         'createdDate': created_date,
#         'courseContent': course_content,
#         'comments': [],
#         'reviews': []
#     }
#     return mongo.db.courses.insert_one(course)


def get_courses():
    return list(mongo.db.courses.find())


def get_course(course_id):
    return mongo.db.courses.find_one({'_id': ObjectId(course_id)})


def update_course(course_id, data):
    return mongo.db.courses.update_one({'_id': ObjectId(course_id)}, {'$set': data})


def delete_course(course_id):
    return mongo.db.courses.delete_one({'_id': ObjectId(course_id)})


def add_resource_to_course(category_name, course_name, content_title, target_content, resource_data):

    # Check for duplicate resource title
    for resource in target_content.get('resources', []):
        if resource['title'] == resource_data['title']:
            raise ValueError("Resource with this title already exists")

    # Add the new resource
    resource_data['_id'] = ObjectId()

    mongo.db.formations.update_one(
        {'categoryName': category_name, 'courses.courseName': course_name,
            'courses.courseContent.title': content_title},
        {
            '$addToSet': {'courses.$.courseContent.$.resources': resource_data},

        }
    )

    return {"message": "Resource added successfully", "resource": resource_data}


def add_resource_to_course(category_name, course_name, content_title, resource_data):
    # Generate a new resource ID
    resource_data['_id'] = str(ObjectId())

    # Update the course content by adding the new resource
    result = mongo.db.formations.update_one(
        {
            'categoryName': category_name,
            'courses.courseName': course_name,
            'courses.courseContent.title': content_title
        },
        {
            '$push': {'courses.$[course].courseContent.$[content].resources': resource_data}
        },
        array_filters=[
            {"course.courseName": course_name},
            {"content.title": content_title}
        ]
    )

    if result.modified_count == 0:
        raise ValueError(
            "Failed to add the new resource to the course content.")
    return {"message": "Resource added successfully", "resource": resource_data}


def update_resource_in_course(category_name, course_name, content_title, resource_id, update_data):
    # Prepare the update object
    update_fields = {}
    allowed_fields = ['title', 'description', 'link']
    for key, value in update_data.items():
        if key in allowed_fields:
            update_fields[f'courses.$[course].courseContent.$[content].resources.$[resource].{
                key}'] = value

    if not update_fields:
        raise ValueError("No valid fields to update")

    result = mongo.db.formations.update_one(
        {
            'categoryName': category_name,
            'courses.courseName': course_name,
            'courses.courseContent.title': content_title,
            'courses.courseContent.resources._id': resource_id
        },
        {'$set': update_fields},
        array_filters=[
            {"course.courseName": course_name},
            {"content.title": content_title},
            {"resource._id": resource_id}
        ]
    )

    if result.matched_count == 0:
        raise ValueError("Resource not found")
    if result.modified_count == 0:
        return {"message": "No changes were made to the resource"}

    return {"message": "Resource updated successfully"}


def delete_resource_from_course(category_name, course_name, content_title, resource_id):
    print(category_name, " ", course_name, "  ",
          content_title, "  ", resource_id)
    result = mongo.db.formations.update_one(
        {
            'categoryName': category_name,
            'courses.courseName': course_name,
            'courses.courseContent.title': content_title
        },
        {
            '$pull': {
                'courses.$[course].courseContent.$[content].resources': {
                    '_id': resource_id
                }
            }
        },
        array_filters=[
            {"course.courseName": course_name},
            {"content.title": content_title}
        ]
    )

    if result.modified_count == 0:
        raise ValueError("resource not found.")

    return {"message": "Resource deleted successfully"}


# started quiz sections : ----------------------------------------------


def isMultipleAnswersQuestion(question_data):
    trueAnswersCounter = 0
    for answer in question_data['possibleAnswers']:
        if (answer['status']):
            trueAnswersCounter = trueAnswersCounter + 1

    print("the number of true answers is : ", trueAnswersCounter)
    return trueAnswersCounter >= 2


def add_quiz_question_to_course(category_name, course_name, content_title, question_data):
    # Validate that at least one answer is marked as correct
    if not any(answer['status'] for answer in question_data['possibleAnswers']):
        raise ValueError("At least one answer must be marked as correct")

    question_data['isMultipleAnswers'] = isMultipleAnswersQuestion(
        question_data)

    # Add a unique ID to the question
    question_data['_id'] = str(ObjectId())

    # Update the document
    result = mongo.db.formations.update_one(
        {
            'categoryName': category_name,
            'courses.courseName': course_name,
            'courses.courseContent.title': content_title
        },
        {
            '$push': {'courses.$[course].courseContent.$[content].quiz': question_data}
        },
        array_filters=[
            {'course.courseName': course_name},
            {'content.title': content_title}
        ]
    )

    if result.modified_count == 0:
        raise ValueError(
            "Failed to add the question. Course content might not exist.")

    return {"message": "Quiz question added successfully", "question": question_data}


def delete_question_from_course(category_name, course_name, content_title, question_id):
    print(category_name, " ", course_name, "  ",
          content_title, "  ", question_id)
    result = mongo.db.formations.update_one(
        {
            'categoryName': category_name,
            'courses.courseName': course_name,
            'courses.courseContent.title': content_title
        },
        {
            '$pull': {
                'courses.$[course].courseContent.$[content].quiz': {
                    '_id': question_id
                }
            }
        },
        array_filters=[
            {"course.courseName": course_name},
            {"content.title": content_title}
        ]
    )

    if result.modified_count == 0:
        raise ValueError("Question not found.")

    return {"message": "Question deleted successfully"}


def update_quiz_question_in_course(category_name, course_name, content_title, question_id, update_data):
    # Prepare the update operation
    update_fields = {}
    if 'question' in update_data:
        update_fields['courses.$[course].courseContent.$[content].quiz.$[question].question'] = update_data['question']
    if 'possibleAnswers' in update_data:
        update_fields['courses.$[course].courseContent.$[content].quiz.$[question].possibleAnswers'] = update_data['possibleAnswers']
        update_fields['courses.$[course].courseContent.$[content].quiz.$[question].isMultipleAnswers'] = update_data['isMultipleAnswers']

    # Update the document
    result = mongo.db.formations.update_one(
        {
            'categoryName': category_name,
            'courses.courseName': course_name,
            'courses.courseContent.title': content_title,
            'courses.courseContent.quiz._id': question_id
        },
        {'$set': update_fields},
        array_filters=[
            {'course.courseName': course_name},
            {'content.title': content_title},
            {'question._id': question_id}
        ]
    )

    if result.matched_count == 0:
        raise ValueError(
            "Question not found. Make sure the category, course, content, and question ID are correct.")
    elif result.modified_count == 0:
        return {"message": "No changes were made to the question"}
    else:
        return {"message": "Quiz question updated successfully", "updated_fields": list(update_fields.keys())}
