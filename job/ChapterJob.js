const cheerio = require('cheerio');
const superagent = require('superagent');
require('superagent-charset')(superagent);

const BiQiGeUtil = require('../utils/BiQiGeUtil.js')
const async = require('async');
const BookSchema = require('../model/BookSchema.js');

const ChapterSchema = require('../model/ChapterSchema.js');

/**
 * 查找数据库中所有状态不为完本的书
 */
const findAllBook = () => {

    var criteria = { "status": { $ne: "完本" } }; // 查询条件
    var fields = {}; // 待返回的字段，默认返回所有 如需返回指定字段如 name:1 返回name字段
    var options = {}; //分页条件 排序等等

    BookSchema.find(criteria, fields, options, function (error, result) {
        if (error) {
            console.log(error);
        } else {
            console.log(result);

            bookChapter(result);
        }
    });
}

/**
 * 查询指定书籍的最新章节信息
 * @param {*} book_obj_id 
 */
const findLatestChapter = book_obj_id => {
    var criteria = {}; // 查询条件
    var fields = {}; // 待返回的字段
    var options = { skip: 0, limit: 1 };  //分页条件 排序等等

    ChapterSchema.find(criteria, fields, options, function (error, result) {
        if (error) {
            console.log(error);
        } else {
            console.log(result);
            //bookChapter(result);
        }
    });
}

/**
 * 保存章节信息
 * @param {*} item 
 * @param {*} index 
 */
const saveBookChapterToMongo = (item,index) => {
    const chapter = new ChapterSchema({
        book_obj_id:item.book_obj_id,
        name: item.name,
        chapter_num_ch: item.chapter_num_ch,
        chapter_num: index,
        content_url: item.content_url,
        update_time: item.update_time
    });
    chapter.save();
}



/**
 * 更新指定书籍相关字段
 * @param {*} book 
 */
const updateBook = book => {

    var conditions = { name: book.name, book_id: book.book_id, author: book.author };
    var update = { $set: { update_time: new Date().getTime, status: book.status, intro: book.intro, word_count: book.word_count, image: book.image } };
    var options = { upsert: true };
    BookSchema.update(conditions, update, options, function (error) {
        if (error) {
            console.log(error);
        } else {
            console.log('update ok!');
        }
    });


}


/**
 * 抓取指定书籍的详细信息以及目录
 * @param {*} book 
 * @param {*} callback 
 */
const fetchBookChapter = (book, callback) => {

    let chapter_list = [{
        name: 'aa',
        chapter: 11
    }, {
        name: 'bb',
        chapter: 22
    }];
    const url = BiQiGeUtil.BaseBookUrl + '/' + book.book_id;
    superagent.get(url).charset('gbk').end((err, res) => {
        //使用cheerio解析html
        const $ = cheerio.load(res.text);

        let book_info = {
            book,
            chapter_list
        };

        callback(null, book_info);
    })
}

/**
 * 抓取所有书籍的信息
 * @param {*} book_list 
 */
const bookChapter = book_list => {
    async.mapLimit(book_list, 5, (book, callback) => {
        fetchBookChapter(book, callback);
    }, (err, res) => {
        if (!err) {
            console.log(res);
        }
    })
}

findAllBook();