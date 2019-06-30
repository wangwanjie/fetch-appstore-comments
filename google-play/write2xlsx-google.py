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
    'bundle_id': 'com.pipay.app.android',
    'name': 'PiPay'
# },
#     {
    # 'bundle_id': 'com.aeon_cambodia.rielpay',
    # 'name': 'AEON Wallet'
# },
#     {
    # 'bundle_id': 'com.wingmoney.wingpay',
    # 'name': 'Wing Money'
# },
#     {
    # 'bundle_id': 'th.co.truemoney.wallet',
    # 'name': 'True Money'
}]

def translateToChinese(text):
    translator = Translator()

    try:
        return translator.translate(text, dest='zh-CN').text
    except print(0):
        return text


def main():

    for item in arr:
        bundle_id = item['bundle_id']
        name = item['name']

    # appid = input("请输入应用id号:")
    # appName = input("请输入应用名称:")

        workbook = xlsxwriter.Workbook(
            bundle_id + '/' + name + '_comments.xlsx')
        worksheet = workbook.add_worksheet()
        format = workbook.add_format()
        format.set_border(1)
        format.set_border(1)
        format_title = workbook.add_format()
        format_title.set_border(1)
        format_title.set_bg_color('#cccccc')
        format_title.set_align('left')
        format_title.set_bold()
        title = ['作者', '标题', '评论内容', '日期', '评分', '头像']

        # 设置单元格宽度
        worksheet.set_column(0, 0, 30)
        worksheet.set_column(1, 1, 30)
        worksheet.set_column(2, 2, 100)
        worksheet.set_column(3, 3, 20)
        worksheet.set_column(4, 4, 10)
        worksheet.set_column(5, 5, 120)

        worksheet.write_row('A1', title, format_title)

        total = 50
        totalCount = 0
        for n in range(total):
            fileName = bundle_id + '/' + str(n) + '.json'
            if not os.path.exists(fileName):
                continue

            with open(fileName, 'r') as file:
                result = json.load(file)
                entry = result
                for i in range(len(entry)):
                    value = entry[i]
                    fixedIndex = i + 1
                    startRow = totalCount + 1
                    worksheet.write(
                        startRow, 0, value['userName'], format)
                    worksheet.write(
                        startRow, 1, value['title'], format)
                    worksheet.write(
                        startRow, 2, translate(value['text'], 'zh-CN'), format)
                    worksheet.write(
                        startRow, 3, value['date'], format)
                    worksheet.write(
                        startRow, 4, value['score'], format)
                    worksheet.write(
                        startRow, 5, value['userImage'], format)
                    totalCount = totalCount + 1

        workbook.close()

if __name__ == '__main__':
    main()
