const cheerio = require('cheerio');
const superagent = require('superagent');
require('superagent-charset')(superagent);

const BiQiGeUtil = require('../utils/BiQiGeUtil.js')
const async = require('async');
const { db } = require('../utils/MongoDBUtil.js');

const BookSchema = require('../model/BookSchema.js');

const ChapterSchema = require('../model/ChapterSchema.js');

/**
 * 匹配小说状态
 * @param {*} context 
 */
const novelStatus = context => {
    const regex = /连载中/g;

    let match = context.match(regex);

    if (match != null && match.length > 0) {
        return '连载'
    } else {
        return '完结'
    }

}

/**
 * 更新指定书籍相关字段
 * @param {*} book 
 */
const updateBook = book => {

    var conditions = { name: book.name, book_id: book.book_id, author: book.author };
    var update = { $set: { update_time: new Date().getTime(), status: book.status, intro: book.intro, word_count: book.word_count, image: book.image, book_flag: 1 } };
    var options = { upsert: true };
    BookSchema.update(conditions, update, options, function (error) {
        if (error) {
            console.log(error);
        } 
    });
}



//将Unicode转汉字
const reconvert = str => {
    str = str.replace(/(&#x)(\w{1,4});/gi, function ($0) {
        return String.fromCharCode(parseInt(escape($0).replace(/(%26%23x)(\w{1,4})(%3B)/g, "$2"), 16));
    });
    return str
}

const trim = str => {
    return str.replace(/(^\s*)|(\s*$)/g, '').replace(/&nbsp;/g, '')
}


/**
 * 抓取指定书籍的详细信息以及目录
 * @param {*} book 
 * @param {*} callback 
 */
const fetchBookChapter = (book, callback) => {
    let chapter_list = [];
    const url = BiQiGeUtil.BaseBookUrl + '/' + book.book_id;
    superagent.get(url).charset('gbk').end((err, res) => {
        if (err) {
            console.log(err);
        } else {
            //使用cheerio解析html
            const $ = cheerio.load(res.text);
            //获取小说状态
            const book_status = novelStatus(reconvert($('head').html()));

            book.status = book_status;
            //获取小说字数
            const word_count_str = $('#info p').eq(2).text();
            const regex = /[0-9]+/g;
            let match = word_count_str.match(regex);
            if (match && match.length > 0) {
                book.word_count = match[match.length - 1];
            }
            //获取小说封面
            const book_image = $('#fmimg img').attr('src');
            book.image = book_image;
            //获取小说简介
            const intro = trim($('#intro').text());
            book.intro = intro;

            //获取小说章节目录

            const chapter_tag_list = $('#list a');
            chapter_tag_list.each(function (item) {
                let n_item = $(this);
                const chapter_name = n_item.text();
                const chapter_content_url = n_item.attr('href');
                let chapter_item = {
                    name: chapter_name,
                    content_url: chapter_content_url
                };
                chapter_list.push(chapter_item);
            })

            let book_info = {
                book,
                chapter_list
            };
            callback(null, book_info);
        }
    })
}





/**
 * 保存章节信息
 * @param {*} item 
 * @param {*} index 
 */
const saveBookChapterToMongo = (item, index, book_obj_id, book_id) => {

    var conditions = { name: item.name, book_id: book_id, book_obj_id: book_obj_id };
    var update = {
        $set: {
            book_obj_id: book_obj_id,
            book_id: book_id,
            name: item.name,
            chapter_num_ch: item.name,
            chapter_num: index,
            content_url: item.content_url,
            chapter_flag: 0,
            update_time: new Date().getTime()
        }
    };
    var options = { upsert: true };

    ChapterSchema.update(conditions, update, options, function (error) {
        if (error) {
            console.log(error);
        } 
    });
}


/**
 * 查询指定书籍的最新章节信息并更新章节目录
 * @param {*} book_obj_id 
 */
const findLatestChapter = (book_obj_id, book_id, chapter_list) => {
    console.log("chapter_list:"+chapter_list.length);
    var criteria = {}; // 查询条件
    var fields = {}; // 待返回的字段
    var options = { skip: 0, limit: 1 };  //分页条件 排序等等
    ChapterSchema.find(criteria, fields, options, function (error, result) {
        if (error) {
            console.log(error);
        } else {
            console.log(result.length);
            //大于数据库中的的章节才保存
            if (result && result.length > 0) {
                const chapter_latest = result[0];
                chapter_list.map((item, index) => {
                    if (index > chapter_latest.chapter_num) {
                        saveBookChapterToMongo(item, index, book_obj_id, book_id);
                    }
                })
            } else {
                chapter_list.map((item, index) => {
                    saveBookChapterToMongo(item, index, book_obj_id, book_id);
                })
            }
            console.log('finish chapter!')
        }
    });
}


const query = async.queue((book, callback) => {
    fetchBookChapter(book, callback);
}, 2);

// assign a callback
query.drain = function () {
    console.log('all items have been processed');
    //db.close();
};


const findAllBook = () => {

    var criteria = { "status": { $ne: "完结" } }; // 查询条件
    var fields = {}; // 待返回的字段，默认返回所有 如需返回指定字段如 name:1 返回name字段
    var options = {}; //分页条件 排序等等

    BookSchema.find(criteria, fields, options, function (error, result) {
        if (error) {
            console.log(error);
        } else {
            query.push(result, (err, res) => {
                if (!err) {
                    const book_result = res.book;
                    if (!book_result.book_flag) {
                        updateBook(book_result);
                    }
                    findLatestChapter(book_result._id, book_result.book_id, res.chapter_list);
                } else {
                    console.log(err);
                }
            });

        }
    });
}

findAllBook();

