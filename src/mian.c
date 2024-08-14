#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <dirent.h>
#include "photo_classifier.h"

// 检查文件后缀名
const char *get_file_extension(const char *filename)
{
    const char *ext = strrchr(filename, '.');
    return (ext && ext != filename) ? ext + 1 : "";
}

// 根据后缀名分类文件
void classify_photos(const char *directory_path)
{
    DIR *dir = opendir(directory_path);
    if (dir == NULL)
    {
        perror("无法打开目录");
        return;
    }

    struct dirent *entry;
    while ((entry = readdir(dir)) != NULL)
    {
        if (entry->d_type == DT_REG)
        {
            const char *ext = get_file_extension(entry->d_name);
            printf("文件：%s， 后缀名：%s\n", entry->d_name, ext);
            // 可以根据后缀名将文件移动到不同的目录或其他处理
        }
    }

    closedir(dir);
}

int main(int argc, char **argv)
{
    if (argc != 2)
    {
        printf("用法：%s <目录路径>\n", argv[0]);
        return -1;
    }

    classify_photos(argv[1]);
    return 0;
}
