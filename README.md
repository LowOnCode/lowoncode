# Introduction
LowOnCode is the open source NodeJs runtime for running LowOnCode designs. The designer application let's create, monitor and improve designs that can be run with this runtime . The design first methology makes development a breeze, deployments unbreakable and monitoring comes out of the box.
( https://lowoncode.com/designer )

## Documentation
https://lowoncode.github.io/lowoncode/docs/#/

## Usage (CLI)
```
Usage: lowoncode [options]

Options:
  -v, --version                  outputs the version
  <file>                         design file (default: "./design.json")
  -p, --port <port>              set port (default: 5000)
  -m, --monitor                  enables monitor
  -s, --strict                   enable strict modus, quit the process on faults
  -c, --components <components>  specify components directory (default: "./components")
  -h, --help                     output usage information
```

## Roadmap

Here's a rough roadmap of things to come (not in any specific order):
- [x] Monitor
- [x] Basic runtime: loading components, create nodes from component, let nodes interact with each other
- [x] CLI
- [ ] (perhaps) Move koa to a component, and remove as dependency
- [ ] CLI: Strict modus 
- [ ] CLI: Remote designs
- [x] Component sets
- [ ] Design schema validator (https://jsonschema.net/)
- [ ] Component schema validator (https://jsonschema.net/)
- [ ] REPL
- [ ] Make all logging availible to monitor service (pubsub)
- [x] Log levels e.g. `LOG_LEVEL=verbose node index.js`
- [ ] Better Continuation-Local system, move to Message class ( e.g. https://github.com/othiym23/node-continuation-local-storage )
- [ ] Validator: Prevent duplicate components name
- [ ] Validator: filename should be same as id ?
