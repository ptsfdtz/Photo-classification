import os
from shutil import copy2
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from tqdm import tqdm
from PIL import Image, ImageDraw, ImageFont, ExifTags

def get_photo_date(image):
    exif_data = image._getexif()
    if exif_data:
        for tag, value in exif_data.items():
            if tag in ExifTags.TAGS:
                if ExifTags.TAGS[tag] == 'DateTimeOriginal':
                    return value
    return None

def add_timestamp_watermark(image_path, font_path):
    image = Image.open(image_path)
    photo_date = get_photo_date(image)
    if not photo_date:
        return None 

    draw = ImageDraw.Draw(image)
    width, height = image.size

    # 字体大小
    font_size = int(height * 0.06)
    font = ImageFont.truetype(font_path, font_size)

    text_bbox = draw.textbbox((0, 0), photo_date, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]

    # 文字位置
    x = width * 0.90 - text_width  # 宽度调整
    y = height * 0.90 - text_height  # 高度调整

    draw.text((x, y), photo_date, font=font, fill=(255, 255, 255))
    return image

def copy_file(file_path, dest_folder):
    os.makedirs(dest_folder, exist_ok=True)
    copy2(file_path, os.path.join(dest_folder, os.path.basename(file_path)))

def process_file(file_path, dest_folder, font_path, add_watermark):
    if add_watermark:
        image = add_timestamp_watermark(file_path, font_path)
        if image:
            dest_path = os.path.join(dest_folder, os.path.basename(file_path))
            image.save(dest_path)
        else:
            copy_file(file_path, dest_folder)
    else:
        copy_file(file_path, dest_folder)

def organize_photos(src_dir, dest_dir, font_path, add_watermark=False, organize_by_date=False, max_workers=10):
    tasks = []
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        all_files = []
        for root, dirs, files in os.walk(src_dir):
            for file in files:
                all_files.append((root, file))

        with tqdm(total=len(all_files), desc="正在处理文件") as pbar:
            for root, file in all_files:
                file_ext = file.split('.')[-1].lower()
                if not file_ext:
                    pbar.update(1)
                    continue  

                file_path = os.path.join(root, file)
                if organize_by_date:
                    file_mod_time = os.path.getmtime(file_path)
                    date_folder = datetime.fromtimestamp(file_mod_time).strftime('%Y-%m-%d')
                    dest_folder = os.path.join(dest_dir, file_ext, date_folder)
                else:
                    dest_folder = dest_dir

                tasks.append(executor.submit(process_file, file_path, dest_folder, font_path, add_watermark))
                pbar.update(1)

        for task in tasks:
            task.result()

if __name__ == "__main__":
    print("Photo Organizer")

    print("=-------------------------------------------=")
    print("请确保源目录和目标目录都存在，且有读写权限。")
    print("请确保字体文件存在。")
    print("请确保源目录中没有包含中文文件名。")
    print("=-------------------------------------------=")  

    src_directory = "images/input_folder"  # 替换为你的源目录路径
    dest_directory = "images/output_folder"  # 替换为你的目标目录路径
    font_path = 'fonts/QwitcherGrypen-Bold.ttf'  # 替换为你的字体路径

    add_watermark = input("是否添加时间戳水印？(y/n): ").strip().lower() == 'y'
    organize_by_date = input("是否按文件扩展名和日期分类？(y/n): ").strip().lower() == 'y'

    organize_photos(src_directory, dest_directory, font_path, add_watermark, organize_by_date, max_workers=20)