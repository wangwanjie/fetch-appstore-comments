#!/usr/bin/python3
# -*- coding: utf-8 -*-

import xlsxwriter
import json
import os


def main():

    appid = input("请输入应用id号:")
    appName = input("请输入应用名称:")

    workbook = xlsxwriter.Workbook(appid + '/' + appName + '_comments.xlsx')
    worksheet = workbook.add_worksheet()
    format = workbook.add_format()
    format.set_border(1)
    format.set_border(1)
    format_title = workbook.add_format()
    format_title.set_border(1)
    format_title.set_bg_color('#cccccc')
    format_title.set_align('left')
    format_title.set_bold()
    title = ['作者', '标题', '评论内容', '版本', '评级', '投票']

    # 设置单元格宽度
    worksheet.set_column(0, 0, 30)
    worksheet.set_column(1, 1, 40)
    worksheet.set_column(2, 2, 100)
    worksheet.set_column(3, 3, 10)
    worksheet.set_column(4, 4, 10)
    worksheet.set_column(5, 5, 10)

    worksheet.write_row('A1', title, format_title)

    total = 10

    for n in range(total):
        fileName = appid + '/' + str(n+1) + '.json'
        if not os.path.exists(fileName):
            continue

        with open(fileName, 'r') as file:
            result = json.load(file)
            data_feed = result['feed']
            entry = data_feed['entry']
            for i in range(len(entry)):
                value = entry[i]
                fixedIndex = i + 1
                startRow = 50 * n + fixedIndex
                worksheet.write(
                    startRow, 0, value['author']['name']['label'], format)
                worksheet.write(startRow, 1, value['title']['label'], format)
                worksheet.write(startRow, 2, value['content']['label'], format)
                worksheet.write(
                    startRow, 3, value['im:version']['label'], format)
                worksheet.write(
                    startRow, 4, value['im:rating']['label'], format)
                worksheet.write(
                    startRow, 5, value['im:rating']['label'], format)

    workbook.close()


if __name__ == '__main__':
    main()
