const util = require('../util');
const runner = util.getRunner();

describe('flex initial display', function() {
  it('should be fast!', function(done) {
    browser.ignoreSynchronization = true;
    browser.get('http://localhost:5000/flex/index.html');
    runner.sample({
      id: 'flex.iv.initial-avail',
      prepare: function() {
        // any preparation logic, if needed (not timed)
      },
      execute: function() {
        $('#show').click();
        $('#hide').click();
      }
    }).then(done, done.fail);
  });
});