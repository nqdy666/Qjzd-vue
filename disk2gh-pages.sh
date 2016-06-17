#!/usr/bin/env bash

#参数判断
if [ -z "$1" ]
then
    echo "请输入git commit message"
    exit
fi

# 切换到gh-pages分支
git checkout gh-pages
if [ $? -ne 0 ]
then
    exit
fi

# 准备删除的文件
del_file_arr=(
    '*.*.js'
    '*.*.js.map'
    '*.*.css'
    '*.*.css.map'
    'favicon.ico'
    'index.html'
    'images'
)

# 遍历gh-pages中旧的web服务相关文件
for del_file in ${del_file_arr[@]}
do
     find ./ -maxdepth 1 -name "$del_file" -exec git rm -r {} \;
done

# 把dist目录下的文件拷贝过来
cp -vr ./dist/* ./

# 添加新文件到git暂存区
for add_file in `ls -a ./dist`
do
    if [ x"$add_file" != x"." -a x"$add_file" != x".." ]
    then
        git add -v "./$add_file"
    fi
done

# 提交
git commit -m $1
if [ $? -ne 0 ]
then
    exit
fi

# push to github
git push origin gh-pages
if [ $? -ne 0 ]
then
    exit
fi

exit
