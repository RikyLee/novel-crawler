const cheerio = require('cheerio');
const superagent = require('superagent');
require('superagent-charset')(superagent);

const BiQiGeUtil = require('../utils/BiQiGeUtil.js')
const async = require('async');

const ChapterSchema = require('../model/ChapterSchema.js');
const ContentSchema = require('../model/ContentSchema.js');


/**
 * trim字符串
 * @param {*} str 
 */
const trim = str => {
    return str.replace(/(^\s*)|(\s*$)/g, '').replace(/&nbsp;/g, '').replace(/笔趣阁.*最新章节！/g, '').replace(/^<br>$/g, '');
}


const query = async.queue((chapter, callback) => {
    fetchChapterContent(chapter, callback);
}, 2);

// assign a callback
query.drain = function () {
    console.log('all items have been processed');
    //db.close();
};

/**
 * 抓取指定章节的内容
 * @param {*} chapter 
 * @param {*} callback 
 */
const fetchChapterContent = (chapter, callback) => {

    const url = BiQiGeUtil.BaseBookUrl + '/' + chapter.book_id + '/' + chapter.content_url;

    superagent.get(url).charset('gbk').end((err, res) => {
        if (err) {
            console.log(err);
        } else {
            //使用cheerio解析html
            const $ = cheerio.load(res.text);
            //获取章节名称
            const chapter_name = $('.bookname h1').text();
            const content = trim($('#content').text());

            const chapter_content = {
                chapter_name,
                content,
                chapter_obj_id: chapter._id
            }

            const chapter_info = {
                chapter,
                chapter_content
            }

            callback(null, chapter_info);

        }
    })
}

/**
 * 更新章节抓取状态
 * @param {*} chapter 
 */
const updateChapterFlag = chapter => {
    const conditions = { name: chapter.name, book_id: chapter.book_id, book_obj_id: chapter.book_obj_id, content_url: chapter.content_url };
    const update = {
        $set: {
            chapter_flag: 1,
            update_time: new Date().getTime()
        }
    };
    const options = { upsert: true };
    ChapterSchema.update(conditions, update, options, function (error) {
        if (error) {
            console.log(error);
        }else{
            console.log('update '+chapter.name);
        }

    });
}

/**
 * 保存章节内容到数据库
 * @param {*} item 
 * 
 */
const saveContentToMongo = item => {

    const conditions = { chapter_name: item.chapter_name, chapter_obj_id: item.chapter_obj_id };
    const update = {
        $set: {
            chapter_obj_id: item.chapter_obj_id,
            chapter_name: item.chapter_name,
            content: item.content,
            update_time: new Date().getTime()
        }
    };
    const options = { upsert: true };
    ContentSchema.update(conditions, update, options, function (error) {
        if (error) {
            console.log(error);
        }else{
            console.log('save '+item.chapter_name);
        }
        
    });

}


/**
 * 查找所有未抓取内容的小说章节列表
 */
const findAllChapter = () => {

    const criteria = { "chapter_flag": 0 }; // 查询条件
    const fields = {}; // 待返回的字段，默认返回所有 如需返回指定字段如 name:1 返回name字段
    const options = {}; //分页条件 排序等等

    // let start = new Date().getTime();
    ChapterSchema.find(criteria, fields, options, function (error, result) {
        if (error) {
            console.log(error);
        } else {
            query.push(result, (err, res) => {
                if (!err) {
                    updateChapterFlag(res.chapter);
                    saveContentToMongo(res.chapter_content);
                } else {
                    console.log(err);
                }
            });

            // console.log(result.length);
            // console.log("take "+(new Date().getTime()-start)+" ms");
        }
    });
}

findAllChapter();