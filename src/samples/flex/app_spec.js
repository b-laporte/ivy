describe('flex', function() {
  it('should work', function() {
    browser.ignoreSynchronization = true;
    browser.get('http://localhost:5000/flex/index.html');

    $('#show').click();
    expect(protractor.element.all(by.css('div.fare')).count()).toEqual(200);
    $('#hide').click();
    expect(protractor.element.all(by.css('div.fare')).count()).toEqual(0);
  });
});