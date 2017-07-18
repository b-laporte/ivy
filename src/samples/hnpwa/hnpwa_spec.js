describe('hnpwa', function() {
  it('should work', function() {
    browser.ignoreSynchronization = true;
    browser.get('http://localhost:5000/hnpwa/#test');

    expect(protractor.element.all(by.css('span.title')).count()).toEqual(30);
  });
});