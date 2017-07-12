const util = require('../../util');
const runner = util.getRunner();

beforeEach(() => {
  browser.ignoreSynchronization = true;
  browser.get('http://localhost:5000/benchmarks/tree/?depth=11');
});

describe('tree benchmark perf', function() {
  it('should work for createOnly', function(done) {
    runner.sample({
      id: 'tree.iv.createOnly',
      prepare: function() {
        // weird order, but the same as in Angular's benchmarks
        $('#createDom').click();
      },
      execute: function() {
        $('#destroyDom').click()
      }
    }).then(done, done.fail);
  });

  it('should work for createDestroy', (done) => {
    runner.sample({
      id: 'tree.iv.createDestroy',
      execute: function() {
        // weird order, but the same as in Angular's benchmarks
        $('#destroyDom').click();
        $('#createDom').click();
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
        $('#detectChanges').click();
      },
      execute: function() {
        $('#destroyDom').click()
      }
    }).then(done, done.fail);
  });
});