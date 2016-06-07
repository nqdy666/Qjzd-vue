"use strict"

import utils from  './libs/utils'


/**格式化时间
 *  @param {string} time 需要格式化的时间
 *  @param {bool} friendly 是否是fromNow
 */
exports.getLastTimeStr = (time, friendly) => {
    if (friendly) {
        return utils.MillisecondToDate(new Date() - new Date(time));
    } else {
        return utils.fmtDate(new Date(time),'yyyy-MM-dd hh:mm');
    }
}

/** 获取文字标签
 *  @param {string} tab Tab分类
 *  @param {bool} good 是否是精华帖
 *  @param {bool} top 是否是置顶帖
 */
exports.getTabStr = (tab, good, top) => {
    let str = "";
    if (top) {
        str = "置顶";
    } else if (good) {
        str = "精华";
    } else {
        switch (tab) {
            case "share":
                str = "分享";
                break;
            case "coder":
                str = "码农";
                break;
            case "shoot":
                str = "摄影";
                break;
            case "bike":
                str = "单车";
            case "talk":
                str = "聊聊";
                break;
            case "love":
                str = "爱情";
                break;
            default:
                str = "暂无";
                break;
        }
    }
    return str;
}

/** 获取标签样式
 *  @param {string} tab Tab分类
 *  @param {bool} good 是否是精华帖
 *  @param {bool} top 是否是置顶帖
 */
exports.getTabClassName = (tab, good, top) => {
    let className = '';

    if (top) {
        className = "top";
    } else if (good) {
        className = "good";
    } else {
        switch (tab) {
            case "share":
                className = "share";
                break;
            case "coder":
                className = "coder";
                break;
            case "shoot":
                className = "shoot";
                break;
            case "bike":
                className = "bike";
            case "talk":
                className = "talk";
                break;
            case "love":
                className = "love";
                break;
            default:
                className = "default";
                break;
        }
    }
    return className;
}

/** 获取title文字
 *  @param {string} tab Tab分类
 */
exports.getTitleStr = tab => {
    let str = "";
    switch (tab) {
        case "share":
            str = "分享";
            break;
        case "coder":
            str = "码农";
            break;
        case "shoot":
            str = "摄影";
            break;
        case "bike":
            str = "单车";
        case "talk":
            str = "聊聊";
            break;
        case "love":
            str = "爱情";
            break;
        case "good":
            str = "精华";
            break;
        default:
            str = "全部";
            break;
    }
    return str;
}
