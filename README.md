## 爬虫思路
---
1. 爬取网站为[笔趣阁](http://www.biqiuge.com/),有如下分类[玄幻](http://www.biqiuge.com/xuanhuanxiaoshuo/),[修真](http://www.biqiuge.com/xiuzhenxiaoshuo/),[都市](http://www.biqiuge.com/dushixiaoshuo/),[穿越](http://www.biqiuge.com/chuanyuexiaoshuo/),[网游](http://www.biqiuge.com/wangyouxiaoshuo/),[科幻](http://www.biqiuge.com/kehuanxiaoshuo/)

2. 每个分类有热门推荐、更新列表、排行榜

3. 设计五张表分别为 书名表，书名-章节列表，书名-章节-内容表

* 书名表(book_list)结构如下
``` 
{
    _id:{type:ObjectId},                 //id
    name: { type: String },              //小说名称
    book_id: { type: Number },           //对应的笔趣阁id
    author: { type: String },            //作者
    image: { type: String },             //图片url
    word_count: { type: Number },        //字数
    type: { type: String },              //小说分类
    intro: { type: String },             //小说简介
    status: { type: String },            //小说状态 连载/完本
    update_time: { type: Number }        //更新时间时间戳
}
```

* 书名-章节列表(book_chapter)结构如下

```
{
    _id:{type:ObjectId},                 //id
    book_obj_id:{type:String} ,          //对应mongo中的书本的ObjectId
    name:{type:String},                  //章节名称
    chapter_num_ch:{type:String},        //章节序号中文
    chapter_num:{type:Number},           //章节序号
    content_url:{type:String},           //对应章节内容获取的url相对地址 使用该地址获取章节内容时需拼接
    update_time: { type: Number }        //更新时间时间戳
}
```


* 书名-章节-内容表(book_chapter_content)结构如下

```
{
    _id:{type:ObjectId},                 //id
    book_chapter_obj_id:{type:String},   //对应mongo中的书本章节的ObjectId
    content:{type:String},               //对应章节内容获
    update_time: { type: Number }        //更新时间时间戳
}
```

4. 书名更新规则，各类别页面获取所有小说信息，存入数据库

5. 章节更新规则，根据书名ID获取所有章节列表逆序反向遍历，与数据库中最新更新的章节名称对比，存在则退出遍历，反之抓取相应章节内容，并存入数据库

6. 数据库使用mongDB，爬虫语言使用nodeJS

