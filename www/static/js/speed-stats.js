/**
 * Created by Mikhail on 18.11.2015.
 */

var speedStats = (function () {
    var logStack = [];

    $(function () {
        if (window.lsfController && typeof performance !== 'undefined') {
            log('DOM Ready');
            pageLoad();
        }
    });

    function sendStats(stats) {
        if (!window.lsfController) {
            return;
        }

        $.post('/stats/timings', $.extend({controller: window.lsfController}, stats));
    }

    function pageLoad() {
        if (!performance.timing.domComplete) {
            setTimeout(pageLoad, 100);
        } else {
            if (typeof window.performance.mark === 'undefined'
                || typeof window.performance.measure === 'undefined'
                || window.performance.getEntriesByName('spt_mrk_DOM Ready').length == 0) {
                return;
            }

            window.performance.measure('spt_stat_dom_ready', 'responseEnd', 'spt_mrk_DOM Ready');
            window.performance.measure('spt_stat_dom_complete', 'spt_mrk_DOM Ready', 'domComplete');
            var domReady = window.performance.getEntriesByName('spt_stat_dom_ready');
            var domComplete = window.performance.getEntriesByName('spt_stat_dom_complete');

            if (!domReady.length || !domComplete.length) {
                return;
            }

            var responseLoad = parseInt(performance.timing.responseEnd - performance.timing.responseStart);
            if (responseLoad > 1000000) {
                responseLoad = 200;
            }
            sendStats({
                response_wait: parseInt(performance.timing.responseStart - performance.timing.requestStart),
                response_load: responseLoad,
                dom_ready: parseInt(domReady[0].duration),
                dom_complete: parseInt(domComplete[0].duration)
            });
        }
    }

    function send(name, start) {
        stats = {};
        stats[name] = parseInt(window.performance.now() - start);
        sendStats(stats);
    }

    function log(name) {
        if(typeof window.performance.mark !== 'undefined') {
            window.performance.mark('spt_mrk_' + name);
        }
        if(typeof window.performance.measure !== 'undefined') {
            window.performance.measure('spt_msr_' + name, 'requestStart', 'spt_mrk_' + name);
        }
        var measure = window.performance.getEntriesByName('spt_msr_' + name);
        if(measure.length > 0) {
            logStack.push({name: name, time: measure[0].duration});
        }
    }

    function print() {
        var fullList = logStack;
        fullList.push({name: 'Start', time: 0});
        fullList.push({name: 'Loaded', time: performance.timing.responseEnd - performance.timing.requestStart});
        fullList.push({name: 'DOM Loading', time: performance.timing.domLoading - performance.timing.requestStart});
        fullList.push({name: 'DOM Interactive', time: performance.timing.domInteractive - performance.timing.requestStart});
        fullList.push({name: 'DOM complete', time: performance.timing.domComplete - performance.timing.requestStart});
        fullList.sort(function (a, b) {
            return a.time < b.time ? -1 : (a.time > b.time ? 1 : 0);
        });
        var formattedList = [];
        for (var i = 0; i < fullList.length; ++i) {
            var time = (fullList[i].time / 1000).toFixed(3);
            formattedList.push(time + 's - ' + fullList[i].name);
        }
        window.console.info(formattedList.join('\n'));
    }

    if (typeof window.performance !== 'undefined') {
        return {
            now: function () {
                return window.performance.now();
            },
            log: log,
            send: send,
            print: print
        };
    } else {
        return {
            now: function () {
            },
            log: function () {
            },
            send: function () {
            },
            print: function () {
                window.console.info('Performance service not supported');
            }
        }
    }
})();
