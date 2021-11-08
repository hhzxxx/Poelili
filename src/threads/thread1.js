const schedule = require('node-schedule');//定时器


let cancelTimer = schedule.scheduleJob('10 * * * * *', () => {
    console.log("thread1")
});