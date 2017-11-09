const util = require('../../util');
const runner = util.getRunner();

describe('largeTable benchmark perf', function() {
  beforeEach(() => {
    browser.ignoreSynchronization = true;
    browser.get('http://localhost:5000/benchmarks/largetable/?cols=40&rows=200');
  });

  it('should work for createOnly', function(done) {
    runner.sample({
      id: 'largeTable.iv.createOnly',
      prepare: function() {
        $('#destroyDom').click()
      },
      execute: function() {
        $('#createDom').click();
      }
    }).then(done, done.fail);
  });

  it('should work for createDestroy', (done) => {
    runner.sample({
      id: 'largeTable.iv.createDestroy',
      execute: function() {
        $('#createDom').click();
        $('#destroyDom').click();
      }
    }).then(done, done.fail);
  });

  it('should work for update', (done) => {
    runner.sample({
      id: 'largeTable.iv.update',
      execute: function() {
        $('#createDom').click();
      }
    }).then(done, done.fail);
  });

  it('should work for detectChanges', (done) => {
    runner.sample({
      id: 'largeTable.iv.detectChanges',
      prepare: function() {
        $('#createDom').click();
      },
      execute: function() {
        $('#detectChanges').click()
      }
    }).then(done, done.fail);
  });
});