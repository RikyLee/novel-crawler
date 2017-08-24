const cheerio = require('cheerio');
const superagent = require('superagent');
require('superagent-charset')(superagent);

const BiQiGeUtil = require('./utils/BiQiGeUtil.js')
const async = require('async');
const BookSchema = require('./model/BookSchema.js');

/**
 * type 抓取小说类型名称以及url
 * 
 */
const fetchBook = (type, callback) => {
    //superagent 获取网页内容 编码格式为gbk
    let book_list = [];
    superagent.get(type.url).charset('gbk').end((err, res) => {

        //使用cheerio解析html
        const $ = cheerio.load(res.text);
        //解析节点1
        const itemList = $('#hotcontent .item');
        itemList.each(function (item) {
            let n_item = $(this);
            let name = n_item.find('.image a').attr('title');
            let book_url = n_item.find('.image a').attr('href');
            const regex = /[0-9]+/g;
            let match = book_url.match(regex);
            let book_id;
            if (match && match.length > 0) {
                book_id = match[0];
            }
            let author = n_item.find('span').text();
            let book = {
                name,
                author,
                book_id,
                type: type.name,
                update_time: new Date().getTime()
            }
            book_list.push(book);

        });
        //解析节点1
        const itemList2 = $('#newscontent  li');
        itemList2.each(function (item) {
            let n_item = $(this);
            let name = n_item.find('.s2 a').attr('title');
            let book_url = n_item.find('.s2 a').attr('href');
            const regex = /[0-9]+/g;
            let match = book_url.match(regex);
            let book_id;
            if (match && match.length > 0) {
                book_id = match[0];
            }
            let author = n_item.find('.s4').text() ? n_item.find('.s4').text() : n_item.find('.s5').text();
            let book = {
                name,
                author,
                book_id,
                type: type.name,
                update_time: new Date().getTime()
            }

            book_list.push(book);

        });

        callback(null, book_list);
    })
}

// const bookType = type => {
//     if (type.indexOf('连载') !== -1) {
//         return '连载';
//     } else if (type.indexOf('完本') !== -1) {
//         return '完本';
//     }
// }


const saveBookToMongo = book_list => {
    book_list.map((item, index) => {
        const book = new BookSchema({
            name: item.name,
            book_id: item.book_id,
            author: item.author,
            type: item.type,
            update_time: item.update_time
        });
        book.save();
    })
    console.log(book_list.length, 'finsh save');
}





const BookList = () => {
    async.mapLimit(BiQiGeUtil.TypeList, 5, (type, callback) => {
        fetchBook(type, callback);
    }, (err, res) => {
        if (!err) {

            let book_list = [];
            res.map(item => {
                book_list = [...book_list, ...item];
            })
            console.log("去重之前:" + book_list.length);
            var hash = {};
            book_list = book_list.reduce(function (item, next) {
                hash[next.name] ? '' : hash[next.name] = true && item.push(next);
                return item
            }, [])
            console.log("去重之后:" + book_list.length);
            //response.send(book_list);
            saveBookToMongo(book_list);
        }
    })

}

// app.get("/", (req, response) => {
//     async.mapLimit(BiQiGeUtil.TypeList, 5, (type, callback) => {
//         fetchBook(type, callback);
//     }, (err, res) => {
//         if (!err) {

//             let book_list = [];
//             res.map(item => {
//                 book_list = [...book_list, ...item];
//             })
//             var hash = {};
//             book_list = book_list.reduce(function (item, next) {
//                 hash[next.name] ? '' : hash[next.name] = true && item.push(next);
//                 return item
//             }, [])

//             response.send(book_list);
//             //saveBookToMongo(book_list);
//         }
//     })

// })


module.exports = BookList;