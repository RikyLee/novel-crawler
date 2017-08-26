const { mongoose } = require('../utils/MongoDBUtil.js');

/**
 * name  名称
 * author 作者
 * image 图片url
 * word_count 字数
 * type 小说类型
 * intro 简介
 * status 状态
 * book_flag 信息更新标识 0 未更新 1 已更新
 * update_time 更新时间
 */
let collection = 'book_list';
let BookSchema = new mongoose.Schema({
    name: { type: String },
    book_id: { type: Number },
    author: { type: String },
    image: { type: String },
    word_count: { type: Number },
    type: { type: String },
    intro: { type: String },
    status: { type: String },
    book_flag:{type:Number},
    update_time: { type: Number }
}, { collection: collection, versionKey: false });


module.exports = mongoose.model(collection, BookSchema);

