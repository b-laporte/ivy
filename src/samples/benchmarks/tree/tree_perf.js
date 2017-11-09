const util = require('../../util');
const runner = util.getRunner();

describe('tree benchmark perf', function() {
  beforeEach(() => {
    browser.ignoreSynchronization = true;
    browser.get('http://localhost:5000/benchmarks/tree/?depth=11');
  });

  it('should work for createOnly', function(done) {
    runner.sample({
      id: 'tree.iv.createOnly',
      prepare: function() {
        // weird order, but the same as in Angular's benchmarks
        $('#destroyDom').click();
      },
      execute: function() {
        $('#createDom').click()
      }
    }).then(done, done.fail);
  });

  it('should work for createDestroy', (done) => {
    runner.sample({
      id: 'tree.iv.createDestroy',
      execute: function() {
        $('#createDom').click();
        $('#destroyDom').click();
      }
    }).then(done, done.fail);
  });

  it('should work for update', (done) => {
    runner.sample({
      id: 'tree.iv.update',
      execute: function() {
        $('#createDom').click();
      }
    }).then(done, done.fail);
  });

  it('should work for detectChanges', (done) => {
    runner.sample({
      id: 'tree.iv.detectChanges',
      prepare: function() {
        $('#createDom').click();
      },
      execute: function() {
        $('#detectChanges').click()
      }
    }).then(done, done.fail);
  });
});