from flask import request
from werkzeug.utils import secure_filename
import shutil
import moviepy.editor as mp
import os
import re

CATEGORIES_DIR = os.path.join(os.getcwd(), 'data', 'categories')


def sanitize_filename(filename):
    # Replace problematic characters with underscores
    return re.sub(r'[\/:*?"<>|]', '_', filename)


def create_category_dir(category_name):
    sanitized_category_name = sanitize_filename(category_name)
    dir_path = os.path.join(CATEGORIES_DIR, sanitized_category_name)

    # If the directory exists, clear its contents
    if os.path.exists(dir_path):
        shutil.rmtree(dir_path)

    # Create the directory (it will be empty if it already existed)
    os.makedirs(dir_path, exist_ok=True)


def save_category_thumbnail(category_name, thumbnail_file=None):
    sanitized_category_name = sanitize_filename(category_name)
    thumbnail_dir = os.path.join(CATEGORIES_DIR, sanitized_category_name)

    if thumbnail_file:
        thumbnail_filename = f"{sanitized_category_name}_thumbnail.jpg"
        thumbnail_path = os.path.join(thumbnail_dir, thumbnail_filename)
        thumbnail_file.save(thumbnail_path)
    else:
        default_thumbnail_path = os.path.join(
            CATEGORIES_DIR, 'default_category_thumbnail.jpg')
        thumbnail_path = os.path.join(
            thumbnail_dir, f"{sanitized_category_name}_thumbnail.jpg")
        shutil.copy(default_thumbnail_path, thumbnail_path)


def save_category_intro_video(category_name, video_file):
    sanitized_category_name = sanitize_filename(category_name)
    video_dir = os.path.join(CATEGORIES_DIR, sanitized_category_name)

    if not os.path.exists(video_dir):
        os.makedirs(video_dir)

    video_filename = f"{sanitized_category_name}_introVideo.mp4"
    video_path = os.path.join(video_dir, video_filename)

    # Save the file content using a context manager
    with open(video_path, 'wb') as f:
        f.write(video_file.read())
        # Ensure all data is flushed to the disk
        f.flush()
        os.fsync(f.fileno())

    # Close the incoming video file explicitly
    video_file.close()


def delete_category_intro_video(category_name): 
    sanitized_category_name = sanitize_filename(category_name)
    video_dir = os.path.join(CATEGORIES_DIR, sanitized_category_name)

    video_filename = f"{sanitized_category_name}_introVideo.mp4"
    video_path = os.path.join(video_dir, video_filename)

    try:
        # Check if the video file exists before attempting to delete
        if os.path.exists(video_path):
            # Explicitly ensure that the file isn't locked or used by any process
            os.remove(video_path)
    except OSError as e:
        # Handle the exception if the file is in use or cannot be deleted
        print(f"Error while deleting file: {e}")
        raise

def update_category_dir(old_category_name, new_category_name):
    old_sanitized_name = sanitize_filename(old_category_name)
    new_sanitized_name = sanitize_filename(new_category_name)
    old_path = os.path.join(CATEGORIES_DIR, old_sanitized_name)
    new_path = os.path.join(CATEGORIES_DIR, new_sanitized_name)
    if os.path.exists(old_path):

        shutil.move(old_path, new_path)
        # Update the thumbnail
        old_thumbnail_path = os.path.join(
            new_path, f'{old_sanitized_name}_thumbnail.jpg')
        new_thumbnail_path = os.path.join(
            new_path, f'{new_sanitized_name}_thumbnail.jpg')

        if os.path.exists(old_thumbnail_path):
            shutil.move(old_thumbnail_path, new_thumbnail_path)
        
        # Update the introVideo
        old_intro_video_path = os.path.join(
            new_path, f'{old_sanitized_name}_introVideo.mp4')
        new_intro_video_path = os.path.join(
            new_path, f'{new_sanitized_name}_introVideo.mp4')

        if os.path.exists(old_intro_video_path):
            shutil.move(old_intro_video_path, new_intro_video_path)


def update_category_thumbnail( category_name):

    sanitized_category_name = sanitize_filename(category_name)

    path = os.path.join(CATEGORIES_DIR, sanitized_category_name)
    if os.path.exists(path):
        # Update the thumbnail
        old_thumbnail_path = os.path.join(path, f'{sanitized_category_name}_thumbnail.jpg')
        new_thumbnail_path = os.path.join(path, f'{sanitized_category_name}_thumbnail.jpg')

        if os.path.exists(old_thumbnail_path):
            shutil.move(old_thumbnail_path, new_thumbnail_path)
        
def delete_category_dir(category_name):
    sanitized_category_name = sanitize_filename(category_name)
    dir_path = os.path.join(CATEGORIES_DIR, sanitized_category_name)
    if os.path.exists(dir_path):
        shutil.rmtree(dir_path)


def create_course_dir(category_name, course_name):
    sanitized_category_name = sanitize_filename(category_name)
    sanitized_course_name = sanitize_filename(course_name)
    course_dir_path = os.path.join(
        CATEGORIES_DIR, sanitized_category_name, sanitized_course_name)
    videos_dir_path = os.path.join(course_dir_path, "videos")

    # If the course directory exists, clear its contents
    if os.path.exists(course_dir_path):
        shutil.rmtree(course_dir_path)

    # Create the course and videos directories
    os.makedirs(course_dir_path, exist_ok=True)
    os.makedirs(videos_dir_path, exist_ok=True)


def save_course_thumbnail(category_name, course_name, thumbnail_file=None):
    sanitized_category_name = sanitize_filename(category_name)
    sanitized_course_name = sanitize_filename(course_name)
    thumbnail_dir = os.path.join(
        CATEGORIES_DIR, sanitized_category_name, sanitized_course_name)

    if thumbnail_file:
        thumbnail_filename = f"{sanitized_course_name}_thumbnail.jpg"
        thumbnail_path = os.path.join(thumbnail_dir, thumbnail_filename)
        thumbnail_file.save(thumbnail_path)
    else:
        default_thumbnail_path = os.path.join(
            CATEGORIES_DIR, 'default_category_thumbnail.jpg')
        thumbnail_path = os.path.join(
            thumbnail_dir, f"{sanitized_course_name}_thumbnail.jpg")
        shutil.copy(default_thumbnail_path, thumbnail_path)


def update_course_dir(category_name, old_course_name, new_course_name):
    sanitized_category_name = sanitize_filename(category_name)
    old_sanitized_course_name = sanitize_filename(old_course_name)
    new_sanitized_course_name = sanitize_filename(new_course_name)
    old_path = os.path.join(
        CATEGORIES_DIR, sanitized_category_name, old_sanitized_course_name)
    new_path = os.path.join(
        CATEGORIES_DIR, sanitized_category_name, new_sanitized_course_name)

    if os.path.exists(old_path):
        os.rename(old_path, new_path)

        # Update the thumbnail
        old_thumbnail_path = os.path.join(
            new_path, f'{old_sanitized_course_name}_thumbnail.jpg')

        new_thumbnail_path = os.path.join(
            new_path, f'{new_sanitized_course_name}_thumbnail.jpg')

        if os.path.exists(old_thumbnail_path):
            os.rename(old_thumbnail_path, new_thumbnail_path)


def update_course_content_dir(category_name, course_name, old_title, new_title):
    sanitized_category_name = sanitize_filename(category_name)
    sanitized_course_name = sanitize_filename(course_name)
    old_sanitized_title = sanitize_filename(old_title)
    new_sanitized_title = sanitize_filename(new_title)

    old_path = os.path.join(
        CATEGORIES_DIR, sanitized_category_name, sanitized_course_name, 'videos', old_sanitized_title)
    new_path = os.path.join(
        CATEGORIES_DIR, sanitized_category_name, sanitized_course_name, 'videos', new_sanitized_title)

    if os.path.exists(old_path):
        os.rename(old_path, new_path)

        # Update the thumbnail
        old_thumbnail_path = os.path.join(
            new_path, f'{old_sanitized_title}_thumbnail.jpg')
        new_thumbnail_path = os.path.join(
            new_path, f'{new_sanitized_title}_thumbnail.jpg')

        if os.path.exists(old_thumbnail_path):
            shutil.move(old_thumbnail_path, new_thumbnail_path)

        # Update the thumbnail
        old_video_path = os.path.join(
            new_path, f'{old_sanitized_title}_video.mp4')
        new_video_path = os.path.join(
            new_path, f'{new_sanitized_title}_video.mp4')

        if os.path.exists(old_video_path):
            shutil.move(old_video_path, new_video_path)


def delete_course_dir(category_name, course_name):
    sanitized_category_name = sanitize_filename(category_name)
    sanitized_course_name = sanitize_filename(course_name)
    dir_path = os.path.join(
        CATEGORIES_DIR, sanitized_category_name, sanitized_course_name)
    if os.path.exists(dir_path):
        shutil.rmtree(dir_path)


def save_video(category_name, course_name, title, video_file):
    sanitized_title = sanitize_filename(title)
    course_dir = os.path.join(
        CATEGORIES_DIR, category_name, course_name, 'videos', sanitized_title)
    os.makedirs(course_dir, exist_ok=True)

    video_filename = f"{sanitized_title}_video.mp4"
    video_path = os.path.join(course_dir, video_filename)
    video_file.save(video_path)

  # Calculate video duration
    duration = 0
    try:
        with mp.VideoFileClip(video_path) as video:
            duration =int(video.duration)  # Duration in seconds
    except Exception as e:
        print(f"Error processing video: {e}")
        raise

    return duration


def save_thumbnail(category_name, course_name, title, thumbnail_file=None):
    sanitized_title = sanitize_filename(title)
    thumbnail_dir = os.path.join(CATEGORIES_DIR, category_name, course_name, 'videos', sanitized_title)

    if thumbnail_file:
        thumbnail_filename = f"{sanitized_title}_thumbnail.jpg"
        thumbnail_path = os.path.join(thumbnail_dir, thumbnail_filename)
        thumbnail_file.save(thumbnail_path)
    else:
        default_thumbnail_path = os.path.join(
            CATEGORIES_DIR, 'default_thumbnail.jpg')
        thumbnail_path = os.path.join(
            thumbnail_dir, f"{sanitized_title}_thumbnail.jpg")
        shutil.copy(default_thumbnail_path, thumbnail_path)


def save_video_and_thumbnail(category_name, course_name, title, video_file, thumbnail_file=None):
    duration = save_video(category_name, course_name, title, video_file)
    save_thumbnail(category_name, course_name, title, thumbnail_file)

    return {
        'duration': duration,
    }


def get_intro_video_link(category_name):
    server_ip = request.host.split(':')[0]
    server_port = request.host.split(':')[1] if ':' in request.host else '80'
    video_link = f"http://{server_ip}:{server_port}/formations/{
        category_name}/introVideo"
    return video_link
