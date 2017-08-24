const mongoose = require('../utils/MongoDBUtil.js');

/**
 * name  名称
 * author 作者
 * image 图片url
 * word_count 字数
 * type 小说类型
 * intro 简介
 * status 状态
 */
let collection = 'book_list';
let BookSchema = new mongoose.Schema({
    name: { type: String },
    book_id: { type: Number },
    author: { type: String },
    image: { type: String ,default:''},
    word_count: { type: Number ,default:0},
    type: { type: String },
    intro: { type: String ,default:''},
    status: { type: String ,default:''},
    update_time: { type: Number }
},{ collection: collection,versionKey:false});


 module.exports = mongoose.model(collection,BookSchema);

 