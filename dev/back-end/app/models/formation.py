from app.file_utils import sanitize_filename
from app.models.user import get_enrolled_course_data
from flask import request
from app import mongo
from bson.objectid import ObjectId
import datetime


def add_formation(category_name, description, isIntroVideo=""):
    server_ip = request.host.split(':')[0]
    server_port = request.host.split(':')[1] if ':' in request.host else '80'
    thumbnail_link = f"http://{server_ip}:{server_port}/formations/{
        category_name}/thumbnails"
    introVideoLink = ""

    formation = {
        'categoryName': category_name,
        'createdDate': datetime.datetime.utcnow(),
        'description': description,
        'thumbnail': thumbnail_link,
        'courses': []
    }
    result = mongo.db.formations.insert_one(formation)
    # Remove the MongoDB ID from the returned dictionary
    formation.pop('_id', None)
    return formation

# def get_formations():
#     return list(mongo.db.formations.find())


def get_formations():
    pipeline = [
        {
            '$project': {
                '_id': 0,
                'categoryName': 1,
                'createdDate': 1,
                'description': 1,
                'thumbnail': 1,
                'numberOfVideos': {
                    '$sum': {
                        '$map': {
                            'input': '$courses',
                            'as': 'course',
                            'in': {
                                '$size': '$$course.courseContent'
                            }
                        }
                    }
                },
                'totalLikes': {
                    '$sum': {
                        '$map': {
                            'input': '$courses',
                            'as': 'course',
                            'in': {
                                '$sum': {
                                    '$ifNull': [
                                        {
                                            '$sum': {
                                                '$map': {
                                                    'input': '$$course.courseContent',
                                                    'as': 'content',
                                                    'in': '$$content.nbrOfLikes'
                                                }
                                            }
                                        },
                                        0
                                    ]
                                }
                            }
                        }
                    }
                },
                'averageReview': {
                    '$avg': {
                        '$map': {
                            'input': '$courses',
                            'as': 'course',
                            'in': {
                                '$ifNull': [
                                    {
                                        '$convert': {
                                            'input': '$$course.review',
                                            'to': 'double',
                                            'onError': 0
                                        }
                                    },
                                    0
                                ]
                            }
                        }
                    }
                }
            }
        },
        {
            '$project': {
                'categoryName': 1,
                'createdDate': 1,
                'description': 1,
                'thumbnail': 1,
                'videos': {
                    'numberOfVideos': '$numberOfVideos',
                    'totalLikes': '$totalLikes',
                    'averageReview': {
                        '$cond': {
                            'if': {'$eq': ['$numberOfVideos', 0]},
                            'then': 0,
                            'else': {
                                '$ifNull': ['$averageReview', 0]
                            }
                        }
                    }
                }
            }
        }
    ]
    return list(mongo.db.formations.aggregate(pipeline))


def get_formation_by_category(category_name):
    # Find the formation by category name
    formation = mongo.db.formations.find_one(
        {'categoryName': category_name},
        {'_id': 0, 'courses.courseContent': 0}
    )

    # If the formation exists, add the numberOfVideos to each course
    if formation and 'courses' in formation:
        for course in formation['courses']:
            course_content = mongo.db.formations.find_one(
                {'categoryName': category_name,
                    'courses.courseName': course['courseName']},
                {'_id': 0, 'courses.$': 1}
            )

    return formation


def get_formation_by_category_with_id(category_name):
    # Find the formation by category name
    formation = mongo.db.formations.find_one(
        {'categoryName': category_name},
        {'courses.courseContent': 0}
    )
    return formation


def update_formation_by_category(old_category_name, update_fields):
    formation_thumbnail_link = ""
    formation_intro_video_link = ""
    if update_fields.get('categoryName'):
        server_ip = request.host.split(':')[0]
        server_port = request.host.split(
            ':')[1] if ':' in request.host else '80'
        new_category_name = update_fields['categoryName']
        formation_thumbnail_link = f"http://{server_ip}:{
            server_port}/formations/{new_category_name}/thumbnails"
        formation_intro_video_link = f"http://{server_ip}:{
            server_port}/formations/{new_category_name}/introVideo"

        # Update formation thumbnail
        update_fields['thumbnail'] = formation_thumbnail_link
        update_fields['introVideo'] = formation_intro_video_link

        # Update the thumbnail for each course within the formation
        update_courses_thumbnail_link(
            old_category_name, new_category_name, server_ip, server_port)

        # Update video links for each course
        update_courses_video_links(
            old_category_name, new_category_name, server_ip, server_port)

    mongo.db.formations.update_one(
        {'categoryName': old_category_name},
        {'$set': update_fields}
    )
    return {
        "thumbnail": formation_thumbnail_link,
        "introVideo": formation_intro_video_link
    }


def update_courses_thumbnail_link(old_category_name, new_category_name, server_ip, server_port):
    # Find the formation by the old category name
    formation = mongo.db.formations.find_one(
        {'categoryName': old_category_name})

    if formation:
        # Construct new thumbnail link for courses
        for course in formation.get('courses', []):
            new_thumbnail_link = f"http://{server_ip}:{server_port}/formations/{
                new_category_name}/courses/{course['courseName']}/thumbnails"

            # Update the thumbnail link in the course
            mongo.db.formations.update_one(
                {'categoryName': old_category_name,
                    'courses.courseName': course['courseName']},
                {'$set': {'courses.$.thumbnail': new_thumbnail_link}}
            )


def update_courses_video_links(old_category_name, new_category_name, server_ip, server_port):
    # Find the formation by the old category name
    formation = mongo.db.formations.find_one(
        {'categoryName': old_category_name})

    if formation:
        # Iterate through courses and update links
        for course in formation.get('courses', []):
            course_name = course.get('courseName', '')
            update_specific_course_links(
                old_category_name, new_category_name, course_name, server_ip, server_port)


def update_specific_course_links(old_category_name, new_category_name, course_name, server_ip, server_port):
    # Find the specific course by the old category name and course name
    formation = mongo.db.formations.find_one(
        {'categoryName': old_category_name, 'courses.courseName': course_name})

    if formation:
        # Iterate through course content
        for course in formation.get('courses', []):
            if course.get('courseName') == course_name:
                for content in course.get('courseContent', []):
                    video_link = content.get('videoLink', '')
                    if video_link:
                        # Construct new video link
                        new_video_link = f"http://{server_ip}:{server_port}/formations/{
                            new_category_name}/courses/{course_name}/videos/{content['title']}"

                        # Update the video link in the course content
                        mongo.db.formations.update_one(
                            {
                                'categoryName': old_category_name,
                                'courses.courseName': course_name,
                                'courses.courseContent.title': content['title']
                            },
                            {
                                '$set': {'courses.$[course].courseContent.$[content].videoLink': new_video_link}
                            },
                            array_filters=[{'course.courseName': course_name}, {
                                'content.title': content['title']}]
                        )

                    # Update thumbnail link for each content
                    new_thumbnail_link = f"http://{server_ip}:{server_port}/formations/{
                        new_category_name}/courses/{course_name}/thumbnails/{content['title']}"
                    mongo.db.formations.update_one(
                        {
                            'categoryName': old_category_name,
                            'courses.courseName': course_name,
                            'courses.courseContent.title': content['title']
                        },
                        {
                            '$set': {'courses.$[course].courseContent.$[content].thumbnail': new_thumbnail_link}
                        },
                        array_filters=[{'course.courseName': course_name}, {
                            'content.title': content['title']}]
                    )


def update_course_links(category_name, course_name, new_course_name, server_ip, server_port):
    # Find the specific course by the old category name and course name
    formation = mongo.db.formations.find_one(
        {'categoryName': category_name, 'courses.courseName': course_name})

    if formation:
        # Iterate through course content
        for course in formation.get('courses', []):
            if course.get('courseName') == course_name:
                for content in course.get('courseContent', []):
                    video_link = content.get('videoLink', '')
                    if video_link:
                        # Construct new video link
                        new_video_link = f"http://{server_ip}:{server_port}/formations/{
                            category_name}/courses/{new_course_name}/videos/{content['title']}"

                        # Update the video link in the course content
                        mongo.db.formations.update_one(
                            {
                                'categoryName': category_name,
                                'courses.courseName': course_name,
                                'courses.courseContent.title': content['title']
                            },
                            {
                                '$set': {'courses.$[course].courseContent.$[content].videoLink': new_video_link}
                            },
                            array_filters=[{'course.courseName': course_name}, {
                                'content.title': content['title']}]
                        )

                    # Update thumbnail link for each content
                    new_thumbnail_link = f"http://{server_ip}:{server_port}/formations/{
                        category_name}/courses/{new_course_name}/thumbnails/{content['title']}"
                    mongo.db.formations.update_one(
                        {
                            'categoryName': category_name,
                            'courses.courseName': course_name,
                            'courses.courseContent.title': content['title']
                        },
                        {
                            '$set': {'courses.$[course].courseContent.$[content].thumbnail': new_thumbnail_link}
                        },
                        array_filters=[{'course.courseName': course_name}, {
                            'content.title': content['title']}]
                    )


def delete_formation_by_category(category_name):
    return mongo.db.formations.delete_one({'categoryName': category_name})


def get_number_of_formations():
    return mongo.db.formations.count_documents({})


def get_simple_formations():
    return mongo.db.formations.find({})


# course functions : _-------------------
def get_course_json_Structure(category_name, course_name, description):
    server_ip = request.host.split(':')[0]
    server_port = request.host.split(':')[1] if ':' in request.host else '80'
    thumbnail_link = f"http://{server_ip}:{server_port}/formations/{
        category_name}/courses/{course_name}/thumbnails"
    return {
        '_id': str(ObjectId()),
        "courseName": course_name,
        "createdDate": datetime.datetime.utcnow(),
        "description": description,
        'review': 0,
        "reviews": [],
        "comments": [],
        'numberOfLikes': 0,
        'numberOfVideos': 0,
        'numberOfUsers': 0,
        'totalRating': 0,
        'numberOfRatings': 0,

        'thumbnail': thumbnail_link,
        "courseContent": []
    }


def add_course_to_formation(category_name, course_name, course_description):
    course = get_course_json_Structure(
        category_name, course_name, course_description)
    mongo.db.formations.update_one(
        {'categoryName': category_name},
        {'$addToSet': {'courses': course}}
    )


def update_course_in_formation(category_name, course_name, data):
    # Normalize inputs
    new_course_name = data.get('courseName', '')
    new_description = data.get('description', '')

    # Build update document dynamically
    update_doc = {}
    if new_course_name:
        server_ip = request.host.split(':')[0]
        server_port = request.host.split(
            ':')[1] if ':' in request.host else '80'
        thumbnail_link = f"http://{server_ip}:{server_port}/formations/{
            category_name}/courses/{new_course_name}/thumbnails"
        update_doc['courses.$.courseName'] = new_course_name
        update_doc['courses.$.thumbnail'] = thumbnail_link
        update_course_links(category_name, course_name,
                            new_course_name, server_ip, server_port)
    if new_description:
        update_doc['courses.$.description'] = new_description

    # Perform the update operation
    mongo.db.formations.update_one(
        {'categoryName': category_name, 'courses.courseName': course_name},
        {'$set': update_doc}
    )


def remove_course_from_formation(category_name, course_name):
    return mongo.db.formations.update_one(
        {'categoryName': category_name},
        {'$pull': {'courses': {'courseName': course_name}}}
    )


def get_course_from_formation_by_name(category_name, course_name):
    formation = mongo.db.formations.find_one(
        {'categoryName': category_name, 'courses.courseName': course_name})

    if formation:
        course = next((c for c in formation.get('courses', [])
                      if c['courseName'] == course_name), None)

        if course:
            # Calculate the number of videos in the course
            number_of_videos = len(course.get('courseContent', []))
            # Add the numberOfVideos attribute to the course data
            course['numberOfVideos'] = number_of_videos
            return course

    return None


def increment_number_of_users(category_name, course_name):
    result = mongo.db.formations.update_one(
        {'categoryName': category_name, 'courses.courseName': course_name},
        # Increment numberOfUsers instead of enrollmentCount
        {'$inc': {'courses.$.numberOfUsers': 1}}
    )
    return result


def get_course_content_by_title(category_name, course_name, title):
    formation = mongo.db.formations.find_one(
        {'categoryName': category_name, 'courses.courseName': course_name})
    if formation:
        course = next((c for c in formation.get('courses', [])
                      if c['courseName'] == course_name), None)
        if course:
            return next((content for content in course.get('courseContent', []) if content['title'] == title), None)
    return None


def create_course_content_object(category_name, course_name, title, video_info, description):
    server_ip = request.host.split(':')[0]
    server_port = request.host.split(':')[1] if ':' in request.host else '80'
    video_link = f"http://{server_ip}:{server_port}/formations/{
        category_name}/courses/{course_name}/videos/{title}"
    thumbnail_link = f"http://{server_ip}:{server_port}/formations/{
        category_name}/courses/{course_name}/thumbnails/{title}"

    course_content = {
        '_id': str(ObjectId()),
        'videoLink': video_link,
        'thumbnail': thumbnail_link,
        'addedDate': datetime.datetime.utcnow().isoformat(),
        'duration': video_info['duration'],
        'nbrOfLikes': 0,
        'title': title,
        'description': description
    }
    return course_content


def create_course_content(category_name, course_name, course_content):
    new_title_name = course_content.get('title', '')

    if new_title_name:
        server_ip = request.host.split(':')[0]
        server_port = request.host.split(
            ':')[1] if ':' in request.host else '80'
        video_link = f"http://{server_ip}:{server_port}/formations/{
            category_name}/courses/{course_name}/videos/{new_title_name}"
        thumbnail_link = f"http://{server_ip}:{server_port}/formations/{
            category_name}/courses/{course_name}/thumbnails/{new_title_name}"
        course_content['videoLink'] = video_link
        course_content['thumbnail'] = thumbnail_link

    result = mongo.db.formations.update_one(
        {'categoryName': category_name, 'courses.courseName': course_name},
        {
            '$addToSet': {'courses.$.courseContent': course_content},
            '$inc': {'courses.$.numberOfVideos': 1}
        }
    )
    return result


def update_course_content_in_db(category_name, course_name, old_title, updated_content):
    # Create the base query to match the course content by title
    query = {
        'categoryName': category_name,
        'courses.courseName': course_name,
        'courses.courseContent.title': old_title
    }

    # Prepare the dictionary for the $set operation
    update_fields = {}

    # If the title is being updated, construct new video and thumbnail links
    if 'title' in updated_content and updated_content['title']:
        new_title_name = updated_content['title'].strip()
        server_ip = request.host.split(':')[0]
        server_port = request.host.split(
            ':')[1] if ':' in request.host else '80'
        video_link = f"http://{server_ip}:{server_port}/formations/{
            category_name}/courses/{course_name}/videos/{new_title_name}"
        thumbnail_link = f"http://{server_ip}:{server_port}/formations/{
            category_name}/courses/{course_name}/thumbnails/{new_title_name}"

        # Update title, video link, and thumbnail link
        update_fields['courses.$[].courseContent.$[content].title'] = new_title_name
        update_fields['courses.$[].courseContent.$[content].videoLink'] = video_link
        update_fields['courses.$[].courseContent.$[content].thumbnail'] = thumbnail_link

    # Iterate over the provided fields in updated_content and add them to the update query
    for key, value in updated_content.items():
        if key != 'title':  # Skip title as it is handled separately above
            update_fields[f'courses.$[].courseContent.$[content].{
                key}'] = value

    # Update only the fields that are provided : 2
    if update_fields:
        result = mongo.db.formations.update_one(
            query,
            {'$set': update_fields},
            array_filters=[{'content.title': old_title}]
        )
        return result
    else:
        # No fields to update

        return None


def delete_course_content_in_db(category_name, course_name, title):
    result = mongo.db.formations.update_one(
        {'categoryName': category_name, 'courses.courseName': course_name},
        {
            '$pull': {'courses.$.courseContent': {'title': title}},
            '$inc': {'courses.$.numberOfVideos': -1}
        }
    )
    return result


def get_course_contents_in_db(category_name, course_name, title):
    return mongo.db.formations.find_one(
        {
            'categoryName': category_name,
            'courses.courseName': course_name,
            'courses.courseContent.title': title
        },
        {
            'courses.$': 1  # Project only the matching course
        }
    )


def get_course_content_in_db(current_user, category_name, course_name, title):
    # Check if the user is admin or the owner of the course
    user_type = current_user.get('accountType')

    # Fetch the enrolled course for the user
    enrolled_course = get_enrolled_course_data(
        current_user, category_name, course_name)

    if not enrolled_course and current_user['accountType'] not in ['admin', 'owner']:
        return {'error': 'User is not enrolled in this course'}, 403

    # Query to find the course and the content by title
    course = get_course_contents_in_db(category_name, course_name, title)

    if not course or 'courses' not in course:
        return {'error': 'Course not found'}, 404

    # Extract the courseContent array
    course_content = course['courses'][0].get('courseContent', [])

    # Find the index of the content by its title
    target_content = None
    target_index = None
    for idx, content in enumerate(course_content):
        if content.get('title') == title:
            target_content = content
            target_index = idx
            break

    if not target_content:
        return {'error': 'Content not found'}, 404

    # Check user type

    if user_type == 'admin' or user_type == 'owner':  # Admin or owner can access any content
        return target_content
    else:
        # Non-admin/owner: check if the content index is less than or equal to maxContent
        max_content = enrolled_course.get('maxContent', 0)
        if target_index is not None and target_index <= max_content:
            return target_content
        else:
            return {'error': 'Access denied: You have not unlocked this content yet'}, 403


def increment_content_likes(category_name, course_name, content_title):

    return mongo.db.formations.update_one(
        {'categoryName': category_name, 'courses.courseName': course_name,
            'courses.courseContent.title': content_title},
        {'$inc': {'courses.$.courseContent.$[content].nbrOfLikes': 1}},
        array_filters=[{'content.title': content_title}]
    )


def increment_course_likes(category_name, course_name):
    return mongo.db.formations.update_one(
        {'categoryName': category_name, 'courses.courseName': course_name},
        {'$inc': {'courses.$.numberOfLikes': 1}}
    )


# comments :


def get_comment_json(message, course_name, current_user):
    """
    Creates a JSON structure for the comment.
    """
    return {
        '_id': str(ObjectId()),
        'userProfile': current_user['profileImg'],
        'username': current_user['username'],
        'message': message,
        'courseName': course_name,
        'createdDate': datetime.datetime.utcnow(),
        'usersPullUpList': [],
        'nbrPullUp': 0,


        'replyList': [],
        'isReply': False,


    }


def get_reply_comment_json(message, course_name, current_user):
    """
    Creates a JSON structure for the comment.
    """
    return {
        '_id': str(ObjectId()),
        'userProfile': current_user['profileImg'],
        'username': current_user['username'],
        'message': message,
        'courseName': course_name,
        'createdDate': datetime.datetime.utcnow(),
        'isReply': True,
        'nbrPullUp': 0,
        'usersPullUpList': [],

    }


def add_comment_to_course_by_name(category_name, course_name, comment_message, current_user):

    comment_json = get_comment_json(
        comment_message, course_name, current_user)

    # Add the comment to the course inside the 'courses' array in the correct formation
    mongo.db.formations.update_one(
        {'categoryName': category_name, 'courses.courseName': course_name},
        # Add to the comments array in the specified course
        {'$addToSet': {'courses.$.comments': comment_json}}
    )
    return comment_json


def update_comment_message(category_name, course_name, comment_id, new_message):
    return mongo.db.formations.update_one(
        {'categoryName': category_name, 'courses.courseName': course_name,
            'courses.comments._id': comment_id},
        {'$set': {
            'courses.$[course].comments.$[comment].message': new_message}},
        array_filters=[{'course.courseName': course_name},
                       {'comment._id': comment_id}]
    )


def pull_up_comment(category_name, course_name, comment_id, current_user):
    return mongo.db.formations.update_one(
        {'categoryName': category_name, 'courses.courseName': course_name,
            'courses.comments._id': comment_id},
        {'$inc': {
            'courses.$[course].comments.$[comment].nbrPullUp': 1
        },
            '$addToSet': {
            'courses.$[course].comments.$[comment].usersPullUpList': current_user['username']
        }
        },
        array_filters=[{'course.courseName': course_name},
                       {'comment._id': comment_id}]
    )


def pull_down_comment(category_name, course_name, comment_id, current_user):
    return mongo.db.formations.update_one(
        {'categoryName': category_name, 'courses.courseName': course_name,
            'courses.comments._id': comment_id},
        {'$inc': {
            'courses.$[course].comments.$[comment].nbrPullUp': -1
        },
            '$pull': {
            'courses.$[course].comments.$[comment].usersPullUpList': current_user['username']
        }
        },
        array_filters=[{'course.courseName': course_name},
                       {'comment._id': comment_id}]
    )


def delete_comment_from_course_by_name(category_name, course_name, comment_id):
    return mongo.db.formations.update_one(
        {'categoryName': category_name, 'courses.courseName': course_name},
        {'$pull': {'courses.$.comments': {'_id': comment_id}}}
    )


def add_comment_replay_to_course_by_name(category_name, course_name, comment_message, current_user, comment_id):
    comment_json = get_reply_comment_json(
        comment_message, course_name, current_user)

    # Add the comment to the course inside the 'courses' array in the correct formation
    mongo.db.formations.update_one(
        {'categoryName': category_name, 'courses.courseName': course_name,
            'courses.comments._id': comment_id},
        {
            '$addToSet': {
                'courses.$[course].comments.$[comment].replyList': comment_json}
        },
        array_filters=[{'course.courseName': course_name},
                       {'comment._id': comment_id}]
    )

    return comment_json


def get_reply_comment_by_id(category_name, course_name, root_comment_id, comment_id):
    formation = mongo.db.formations.find_one(
        {'categoryName': category_name, 'courses.courseName': course_name,
            'courses.comments._id': root_comment_id},
        {'courses.$': 1}
    )
    print(formation)

    if formation and formation.get('courses'):
        course = formation['courses'][0]
        root_comment = next((c for c in course.get(
            'comments', []) if str(c['_id']) == root_comment_id), None)
        if root_comment:
            reply_comment = next((r for r in root_comment.get(
                'replyList', []) if str(r['_id']) == comment_id), None)
            return reply_comment
    return None


def pull_up_reply_comment(category_name, course_name, root_comment_id, comment_id, current_user):
    return mongo.db.formations.update_one(
        {'categoryName': category_name, 'courses.courseName': course_name,
         'courses.comments._id': root_comment_id, 'courses.comments.replyList._id': comment_id},
        {'$inc': {
            'courses.$[course].comments.$[rootComment].replyList.$[reply].nbrPullUp': 1
        },
            '$addToSet': {
            'courses.$[course].comments.$[rootComment].replyList.$[reply].usersPullUpList': current_user['username']
        }},
        array_filters=[
            {'course.courseName': course_name},
            {'rootComment._id': root_comment_id},
            {'reply._id': comment_id}
        ]
    )


def pull_down_reply_comment(category_name, course_name, root_comment_id, comment_id, current_user):
    return mongo.db.formations.update_one(
        {'categoryName': category_name, 'courses.courseName': course_name,
         'courses.comments._id': root_comment_id, 'courses.comments.replyList._id': comment_id},
        {'$inc': {
            'courses.$[course].comments.$[rootComment].replyList.$[reply].nbrPullUp': -1
        },
            '$pull': {
            'courses.$[course].comments.$[rootComment].replyList.$[reply].usersPullUpList': current_user['username']
        }},
        array_filters=[
            {'course.courseName': course_name},
            {'rootComment._id': root_comment_id},
            {'reply._id': comment_id}
        ]
    )


def delete_reply_comment_from_course_by_name(category_name, course_name, root_comment_id, comment_id):
    return mongo.db.formations.update_one(
        {'categoryName': category_name, 'courses.courseName': course_name,
            'courses.comments._id': root_comment_id},
        {'$pull': {'courses.$[course].comments.$[rootComment].replyList': {
            '_id': comment_id}}},
        array_filters=[
            {'course.courseName': course_name},
            {'rootComment._id': root_comment_id}
        ]
    )


def update_reply_comment_message(category_name, course_name, root_comment_id, comment_id, new_message):
    return mongo.db.formations.update_one(
        {'categoryName': category_name, 'courses.courseName': course_name,
         'courses.comments._id': root_comment_id, 'courses.comments.replyList._id': comment_id},
        {'$set': {
            'courses.$[course].comments.$[rootComment].replyList.$[reply].message': new_message
        }},
        array_filters=[
            {'course.courseName': course_name},
            {'rootComment._id': root_comment_id},
            {'reply._id': comment_id}
        ]
    )

# review :


def get_user_review(category_name, course_name, username):
    formation = mongo.db.formations.find_one(
        {'categoryName': category_name, 'courses.courseName': course_name},
        {'courses.$': 1}
    )
    if formation and formation.get('courses'):
        course = formation['courses'][0]
        review = next((r for r in course.get('reviews', [])
                      if r['username'] == username), None)
        return review
    return None


def update_average_rating(category_name, course_name):
    # Fetch the course to get the totalRating and numberOfRatings
    formation = mongo.db.formations.find_one(
        {'categoryName': category_name, 'courses.courseName': course_name},
        {'courses.$': 1}
    )

    if formation and formation.get('courses'):
        course = formation['courses'][0]
        total_rating = course.get('totalRating', 0)
        number_of_ratings = course.get('numberOfRatings', 0)

        # Calculate the average rating
        if number_of_ratings > 0:
            average_rating = total_rating / number_of_ratings
        else:
            average_rating = 0

        # Update the averageReview field
        mongo.db.formations.update_one(
            {'categoryName': category_name, 'courses.courseName': course_name},
            {'$set': {'courses.$.review': average_rating}}
        )
        return average_rating


def add_review_to_course(category_name, course_name, review, rating, current_user):
    review_object = {
        '_id': str(ObjectId()),
        'username': current_user['username'],
        'review': review,
        'rating': rating,
        'createdDate': datetime.datetime.utcnow(),
        'userProfile': current_user['profileImg'],
    }

    # Add the review and update totalRating and numberOfRatings
    result = mongo.db.formations.update_one(
        {'categoryName': category_name, 'courses.courseName': course_name},
        {'$addToSet': {'courses.$.reviews': review_object},
         '$inc': {'courses.$.totalRating': rating, 'courses.$.numberOfRatings': 1}}
    )

    if result.modified_count == 1:
        # Recalculate the average review
        average_rating = update_average_rating(category_name, course_name)
        return review_object, average_rating
    return None, None


def delete_user_review(category_name, course_name, username):
    review = get_user_review(category_name, course_name, username)

    if review:
        # Remove the review and update totalRating and numberOfRatings
        result = mongo.db.formations.update_one(
            {'categoryName': category_name, 'courses.courseName': course_name},
            {'$pull': {'courses.$.reviews': {'username': username}},
             '$inc': {'courses.$.totalRating': -review['rating'], 'courses.$.numberOfRatings': -1}}
        )

        if result.modified_count == 1:
            # Recalculate the average review
            average_rating = update_average_rating(category_name, course_name)
            print(average_rating)
            return result, average_rating
        else:
            result, None

    return None, None
