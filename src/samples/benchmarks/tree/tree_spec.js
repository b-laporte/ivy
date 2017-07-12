describe('Benchmarks - Tree', function() {
  it('should work for createDestroy', () => {
    browser.ignoreSynchronization = true;
    browser.get('http://localhost:5000/benchmarks/tree/?depth=4');
    $('#createDom').click();
    expect($('#root').getText()).toContain('0');
    $('#destroyDom').click();
    expect($('#root').getText()).toEqual('');
  });

  it('should work for update', () => {
    browser.ignoreSynchronization = true;
    browser.get('http://localhost:5000/benchmarks/tree/?depth=4');
    $('#createDom').click();
    $('#createDom').click();
    expect($('#root').getText()).toContain('A');
  });

});