describe('TodoMVC', function() {
  it('should work', function() {
    browser.ignoreSynchronization = true;
    browser.get('http://localhost:5000/todomvc/index.html');

    expect(protractor.element.all(by.css('.view')).count()).toEqual(0);

    $('.new-todo').sendKeys('foo').sendKeys(protractor.Key.ENTER);
    expect(protractor.element.all(by.css('.view')).count()).toEqual(1);
  });
});