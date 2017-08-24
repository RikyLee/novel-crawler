const express = require('express');
const app = express();
const BiQiGeUtil = require('./utils/BiQiGeUtil.js')
const async = require('async');
const fetchBook = require('./job/BookJob.js');
const BookSchema = require('./model/BookSchema.js');

// const bookType = type => {
//     if (type.indexOf('连载') !== -1) {
//         return '连载';
//     } else if (type.indexOf('完本') !== -1) {
//         return '完本';
//     }
// }


const saveBookToMongo = book_list => {
     book_list.map((item,index)=>{
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


async.mapLimit(BiQiGeUtil.TypeList, 5, (type, callback) => {
    fetchBook(type, callback);
}, (err, res) => {
    if (!err) {
       
        let book_list = [];
        res.map(item => {
            book_list = [...book_list, ...item];
        })
        console.log("去重之前:"+book_list.length);
        var hash = {};
        book_list = book_list.reduce(function (item, next) {
            hash[next.name] ? '' : hash[next.name] = true && item.push(next);
            return item
        }, [])
        console.log("去重之后:"+book_list.length);
        //response.send(book_list);
        saveBookToMongo(book_list);
    }
})


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



app.listen('3000', function () {
    console.log('server listening on 3000');
})