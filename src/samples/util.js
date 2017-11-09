const benchpress = require('@angular/benchpress');
exports.getRunner = () => new benchpress.Runner([
  //use protractor as Webdriver client
  benchpress.SeleniumWebDriverAdapter.PROTRACTOR_PROVIDERS,
  //use RegressionSlopeValidator to validate samples
  {provide: benchpress.Validator, useExisting: benchpress.RegressionSlopeValidator},
  //use 10 samples to calculate slope regression
  {provide: benchpress.RegressionSlopeValidator.SAMPLE_SIZE, useValue: 20},
  //use the script metric to calculate slope regression
  {provide: benchpress.RegressionSlopeValidator.METRIC, useValue: 'scriptTime'},
  {provide: benchpress.Options.FORCE_GC, useValue: false}
]);