describe('Benchmarks - LargeTable', function() {
  it('should work', function() {
    browser.ignoreSynchronization = true;
    browser.get('http://localhost:5000/benchmarks/largetable/index.html');

    $('#createDom').click();
    expect($('#root').getText()).toContain('0/0');
    $('#createDom').click();
    expect($('#root').getText()).toContain('A/A');
    $('#destroyDom').click();
    expect($('#root').getText()).toEqual('');
  });
});