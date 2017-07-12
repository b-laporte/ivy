let target = 'spec';
const targetArg = process.argv[3];
if (targetArg && targetArg === '--perf') {
  target = 'perf';
}
const specs = 'src/samples/**/*_' + target + '.js';

exports.config = {
  directConnect: true,

  capabilities: {
    browserName: 'chrome',
    chromeOptions: {
      //Important for benchpress to get timeline data from the browser
      'args': ['--js-flags=--expose-gc'],
      'perfLoggingPrefs': {
        'traceCategories': 'v8,blink.console,devtools.timeline'
      },
      'binary': '/Applications/Google\ Chrome\ Canary.app/Contents/MacOS/Google\ Chrome\ Canary'
    },
    loggingPrefs: {
      performance: 'ALL'
    }
  },

  specs: [specs],
  framework: 'jasmine2',

  onPrepare: function() {
    beforeEach(function() {
      browser.ignoreSynchronization = false;
    });
  },

  // restart browser between tests
  // so that the browser does not keep
  // optimizations
  restartBrowserBetweenTests: target === 'perf',

  beforeLaunch: function () {
  },

  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000
  }
};