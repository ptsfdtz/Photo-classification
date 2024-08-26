import os
from shutil import copy2
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from tqdm import tqdm  # 需要安装 tqdm 库：pip install tqdm

def copy_file(file_path, dest_folder):
    os.makedirs(dest_folder, exist_ok=True)
    dest_path = os.path.join(dest_folder, os.path.basename(file_path))
    copy2(file_path, dest_path)

def organize_photos_by_extension_and_date(src_dir, dest_dir, max_workers=10):
    tasks = []
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        all_files = []
        for root, dirs, files in os.walk(src_dir):
            for file in files:
                all_files.append((root, file))

        with tqdm(total=len(all_files), desc="正在复制文件") as pbar:
            for root, file in all_files:
                file_ext = file.split('.')[-1].lower()
                if not file_ext:
                    pbar.update(1)
                    continue  # 如果没有文件后缀，跳过这个文件

                file_path = os.path.join(root, file)
                file_mod_time = os.path.getmtime(file_path)
                date_folder = datetime.fromtimestamp(file_mod_time).strftime('%Y-%m-%d')

                dest_folder = os.path.join(dest_dir, file_ext, date_folder)
                tasks.append(executor.submit(copy_file, file_path, dest_folder))

                pbar.update(1)

        for task in tasks:
            task.result()

if __name__ == "__main__":
    src_directory = "images\input_folder"  # 替换为你的源目录路径
    dest_directory = "images\output_folder"  # 替换为你的目标目录路径
    organize_photos_by_extension_and_date(src_directory, dest_directory, max_workers=20)