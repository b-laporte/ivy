# IV
IV ("ivy") is a lightweight JS template engine mixing concepts from ReactJS, Angular2 and Incremental DOM.

High level presentations:
- [paradigm and mental model](https://docs.google.com/presentation/d/1Pwq-qAtUDp-234csg4LqPu7lbfd9VCxPJN9b-nbM6xs/edit#slide=id.p)
- [technical insight & code generation](https://docs.google.com/presentation/d/1Tx0kVw79GMqv1xUYqxWR_qQ9t17DkQrc5UsYhrXNFpk/edit?usp=sharing)

## Running scripts
- `yarn` to prepare your environment

### Development
- 'yarn test' to run the unit tests once
- 'yarn run dev' to run and watch the unit tests
- 'yarn run e2e' to run the integration tests once
- 'yarn run benchmarks' to run the benchmarks once

PS: once compiled, tests can also be run and debugged in visual studio code.

### Samples:
- `yarn run build-samples` to build them once
- `yarn run watch-samples` to build them with watch mode activated
Then, `yarn start` and go to [http://localhost:5000/](http://localhost:5000/)