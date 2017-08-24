const BaseUrl = 'http://www.biqiuge.com';

const BaseBookUrl = BaseUrl + '/book'

const TypeList = [
    {
        name: '玄幻',
        url: BaseUrl + '/xuanhuanxiaoshuo'
    },
    {
        name: '修真',
        url: BaseUrl + '/xiuzhenxiaoshuo'
    },
    {
        name: '都市',
        url: BaseUrl + '/dushixiaoshuo'
    },
    {
        name: '穿越',
        url: BaseUrl + '/chuanyuexiaoshuo'
    },
    {
        name: '网游',
        url: BaseUrl + '/wangyouxiaoshuo'
    },
    {
        name: '科幻',
        url: BaseUrl + '/kehuanxiaoshuo'
    }
];

module.exports = { BaseUrl, BaseBookUrl, TypeList };