const { mongoose } = require('../utils/MongoDBUtil.js');

let collection = 'book_chapter';
let ChapterSchema = new mongoose.Schema({
    book_obj_id: { type: String },          //对应mongo中的书本的ObjectId
    book_id: { type: Number },               //对应笔趣阁书本数字编号
    name: { type: String },                  //章节名称
    chapter_num_ch: { type: String },        //章节序号中文
    chapter_num: { type: Number },           //章节序号
    content_url: { type: String },           //对应章节内容获取的url相对地址 使用该地址获取章节内容时需拼接
    chapter_flag: { type: Number },          //章节是否抓取标识位  0 未抓取  1 已抓取 
    update_time: { type: Number }        //更新时间时间戳   
}, { collection: collection, versionKey: false });


module.exports = mongoose.model(collection, ChapterSchema);
