from app import mongo
from bson.objectid import ObjectId


def add_course(course_name, category_name, created_date, course_content):
    course = {
        'courseName': course_name,
        'categoryName': category_name,
        'createdDate': created_date,
        'courseContent': course_content,
        'comments': [],
        'reviews': []
    }
    return mongo.db.courses.insert_one(course)


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
    resource_data['_id'] =str(ObjectId())

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
        raise ValueError("Failed to add the new resource to the course content.")
    return {"message": "Resource added successfully", "resource": resource_data}




def update_resource_in_course(category_name, course_name, content_title, resource_id, update_data):
    # Prepare the update object
    update_fields = {}
    allowed_fields = ['title', 'description', 'link']
    for key, value in update_data.items():
        if key in allowed_fields:
            update_fields[f'courses.$[course].courseContent.$[content].resources.$[resource].{key}'] = value

    if not update_fields:
        raise ValueError("No valid fields to update")

    result = mongo.db.formations.update_one(
        {
            'categoryName': category_name,
            'courses.courseName': course_name,
            'courses.courseContent.title': content_title,
            'courses.courseContent.resources._id': ObjectId(resource_id)
        },
        {'$set': update_fields},
        array_filters=[
            {"course.courseName": course_name},
            {"content.title": content_title},
            {"resource._id": ObjectId(resource_id)}
        ]
    )

    if result.matched_count == 0:
        raise ValueError("Resource not found")
    if result.modified_count == 0:
        return {"message": "No changes were made to the resource"}
    
    return {"message": "Resource updated successfully"}
def delete_resource_from_course(category_name, course_name, content_title, resource_id):
    result = mongo.db.formations.update_one(
        {
            'categoryName': category_name,
            'courses.courseName': course_name,
            'courses.courseContent.title': content_title
        },
        {
            '$pull': {
                'courses.$[course].courseContent.$[content].resources': {
                    '_id': ObjectId(resource_id)
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