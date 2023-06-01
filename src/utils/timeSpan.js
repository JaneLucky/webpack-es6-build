import Vue from "vue";

//==============================时间方法=================================
const TimeMethod = {
  //计算时间差
  calculateDiffTime: function (startTime, endTime) {
    var startTime = new Date(Date.parse(startTime));
    var endTime = new Date(Date.parse(endTime));
    //时间差的毫秒数
    var milliseconds = endTime.getTime() - startTime.getTime();
    //计算出相差天数
    var days = Math.floor(milliseconds / (24 * 3600 * 1000));
    return days;
  },


  //获取本月的起始
  GetCurrentDateYear_Month: function (time) {
    let date = new Date(time);
    let year = date.getFullYear();
    let month = (date.getMonth() + 1) >= 10 ? (date.getMonth() + 1) : '' + (date.getMonth() + 1);
    let day = date.getDate() >= 10 ? date.getDate() : '' + date.getDate();

    let hours = date.getHours() >= 10 ? date.getHours() : '' + date.getHours();
    let minutes = date.getMinutes() >= 10 ? date.getMinutes() : '' + date.getMinutes();
    let Seconds = date.getSeconds() >= 10 ? date.getSeconds() : '' + date.getSeconds();

    return year + '年' + month + '月';
  },
  GetCurrentYearRange: function (time) {
    var date = new Date();
    if (time != null) {
      date = new Date(time);
    }
    //接下来获取到时间范围

    var nowYear = date.getFullYear(); //当前年

    var begin = nowYear + "-1";
    var end = nowYear + "-12";
    return [begin, end];
  },
  GetCurrentMonthRange: function (time) {
    var date = new Date();
    if (time != null) {
      date = new Date(time);
    }
    //接下来获取到时间范围
    var nowMonth = date.getMonth(); //当前月
    var nowYear = date.getFullYear(); //当前年
    //本月的开始时间
    var monthStartDate = new Date(nowYear, nowMonth, 1);
    //本月的结束时间
    var monthEndDate = new Date(nowYear, nowMonth + 1, 0);
    var begin = monthStartDate.getFullYear() + "-" + (monthStartDate.getMonth() + 1) + "-" + monthStartDate
      .getDate() +
      " 00:00:00";
    var end = monthEndDate.getFullYear() + "-" + (monthEndDate.getMonth() + 1) + "-" + monthEndDate.getDate() +
      " 23:59:59";
    return [begin, end];
  },
  //获取上周
  GetLastWeekRange: function (time) {
    var date = new Date();
    if (time != null) {
      date = new Date(time);
    }
    //接下来获取到时间范围
    date.setDate(date.getDate() - date.getDay() + 1 - 7);
    var begin = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " 00:00:00";
    // 本周日的日期
    date.setDate(date.getDate() + 6);
    var end = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " 23:59:59";
    return [begin, end];
  },
  //获取本周
  GetCurrentWeekRange: function (time) {
    var date = new Date();
    if (time != null) {
      date = new Date(time);
    }
    //接下来获取到时间范围
    date.setDate(date.getDate() - date.getDay() + 1);
    var begin = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " 00:00:00";
    // 本周日的日期
    date.setDate(date.getDate() + 6);
    var end = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " 23:59:59";
    return [begin, end];
  },

  GetCurrentDay: function () {
    var date = new Date();
    var begin = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
    return begin;
  },



  //获取简化为天的时间
  formatTimeDay: function (time, spliter = '-') {
    let date = new Date(time);
    let year = date.getFullYear();
    let month = (date.getMonth() + 1) >= 10 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1);
    let day = date.getDate() >= 10 ? date.getDate() : '0' + date.getDate();
    return year + spliter + month + spliter + day;
  },
  //获取简化为月的时间
  formatTimeMonth: function (time, spliter = '-') {
    let date = new Date(time);
    let year = date.getFullYear();
    let month = (date.getMonth() + 1) >= 10 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1);
    let day = date.getDate() >= 10 ? date.getDate() : '0' + date.getDate();
    return year + spliter + month;
  },
  //获取简化为年的时间
  formatTimeYear: function (time, spliter = '-') {
    let date = new Date(time);
    let year = date.getFullYear();
    let month = (date.getMonth() + 1) >= 10 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1);
    let day = date.getDate() >= 10 ? date.getDate() : '0' + date.getDate();
    return year;
  },
  //获取到标准的时间格式
  formatTimeEnd: function (time, spliter = '-') {
    let date = new Date(time);
    let year = date.getFullYear();
    let month = (date.getMonth() + 1) >= 10 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1);
    let day = date.getDate() >= 10 ? date.getDate() : '0' + date.getDate();
    return year + spliter + month + spliter + day + " 23:59:59";
  },
  formatTimeStart: function (time, spliter = '-') {
    let date = new Date(time);
    let year = date.getFullYear();
    let month = (date.getMonth() + 1) >= 10 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1);
    let day = date.getDate() >= 10 ? date.getDate() : '0' + date.getDate();
    return year + spliter + month + spliter + day;
  },
  //获取当前时间的详细时间
  formatTimeDetail: function (time, spliter = '-') {
    let date = new Date(time);
    let year = date.getFullYear();
    let month = (date.getMonth() + 1) >= 10 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1);
    let day = date.getDate() >= 10 ? date.getDate() : '0' + date.getDate();

    let hours = date.getHours() >= 10 ? date.getHours() : '0' + date.getHours();
    let minutes = date.getMinutes() >= 10 ? date.getMinutes() : '0' + date.getMinutes();
    let Seconds = date.getSeconds() >= 10 ? date.getSeconds() : '0' + date.getSeconds();

    return year + spliter + month + spliter + day + " " + hours + "时" + minutes + "分" + Seconds + "秒";
  },
  //获取当前时间的字符串
  formatTimeString: function (time, spliter = '-') {
    let date = new Date(time);
    let year = date.getFullYear();
    let month = (date.getMonth() + 1) >= 10 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1);
    let day = date.getDate() >= 10 ? date.getDate() : '0' + date.getDate();

    let hours = date.getHours() >= 10 ? date.getHours() : '0' + date.getHours();
    let minutes = date.getMinutes() >= 10 ? date.getMinutes() : '0' + date.getMinutes();
    let Seconds = date.getSeconds() >= 10 ? date.getSeconds() : '0' + date.getSeconds();

    return year + "-" + month + "-" + day +" "+ hours +":"+ minutes + ":" + Seconds;
  },
}


//==============================时间方法=================================



//==============================StringUtil=================================
const MathUtil = {
  //是否为空判断
  Round: function (value) {
    var val = (0.01 * Math.round(100 * value)).toString();
    var re = /([0-9]+\.[0-9]{2})[0-9]*/;
    return parseFloat(val.replace(re, "$1"));
  },
};

Vue.prototype.TimeMethod = TimeMethod;
Vue.prototype.MathUtil = MathUtil;
//==============================StringUtil=================================


export default {};
