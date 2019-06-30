#!/usr/bin/python3
# -*- coding: utf-8 -*-

import xlsxwriter
import json
import os
from googletrans import Translator
import sys
sys.path.append("..")
from mtranslate.mtranslate import translate

# translator = Translator()
# print(translator.translate('មិចញុមវាយលេខចូលហើយមិចក៏មិនអោយ', dest='zh-CN').text)

arr = [{
    'id': '1234143591',
    'name': 'PiPay'
    },
        {
    'id': '1328330562',
    'name': 'AEON Wallet'
    },
        {
    'id': '1113286385',
    'name': 'Wing Money'
    },
        {
    'id': '1162466939',
        'name': 'True Money'
}]


def translateToChinese(text):
    translator = Translator()

    try:
        return translator.translate(text, dest='zh-CN').text
    except print(0):
        return text


def main():

    for item in arr:
        appid = item['id']
        name = item['name']

        # appid = input("请输入应用id号:")
        # name = input("请输入应用名称:")

        workbook = xlsxwriter.Workbook(
            str(appid) + '/' + name + '_comments.xlsx')
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

        total = 50
        totalCount = 0
        for n in range(total):
            fileName = appid + '/' + str(n) + '.json'
            if not os.path.exists(fileName):
                continue

            with open(fileName, 'r') as file:
                result = json.load(file)
                data_feed = result['feed']
                entry = data_feed['entry']
                for i in range(len(entry)):
                    value = entry[i]
                    fixedIndex = i + 1
                    startRow = totalCount + 1
                    worksheet.write(
                        startRow, 0, value['author']['name']['label'], format)
                    worksheet.write(startRow, 1, value['title']['label'], format)
                    worksheet.write(
                        startRow, 2, translate(value['content']['label'], 'zh-CN'), format)
                        # startRow, 2,value['content']['label'], format)
                    worksheet.write(
                        startRow, 3, value['im:version']['label'], format)
                    worksheet.write(
                        startRow, 4, value['im:rating']['label'], format)
                    worksheet.write(
                        startRow, 5, value['im:rating']['label'], format)
                    totalCount = totalCount + 1

        workbook.close()


if __name__ == '__main__':
    main()
