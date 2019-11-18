# Http
A node is an instantiated version of a component.

## Problem
You want to create an HTTP endpoint that responds to GET requests with some static content, such as an HTML page or CSS stylesheet.

## Solution
Use the HTTP In node to listen for requests, a Template node to include the static content, and an HTTP Response node to reply to the request.

# Example
TODO

# Flow
```json
[{"id":"59ff2a1.fa600d4","type":"http in","z":"3045204d.cfbae","name":"","url":"/hello","method":"get","swaggerDoc":"","x":100,"y":80,"wires":[["54c1e70d.ab3e18"]]},{"id":"54c1e70d.ab3e18","type":"template","z":"3045204d.cfbae","name":"page","field":"payload","fieldType":"msg","format":"handlebars","syntax":"mustache","template":"<html>\n    <head></head>\n    <body>\n        <h1>Hello World!</h1>\n    </body>\n</html>","x":250,"y":80,"wires":[["266c286f.d993d8"]]},{"id":"266c286f.d993d8","type":"http response","z":"3045204d.cfbae","name":"","x":390,"y":80,"wires":[]}]
```

# Discussion
The `HTTP In` and `HTTP Response` pair of nodes are the starting point for all HTTP endpoints you create.

Any flow that starts with an HTTP In node must have a path to an HTTP Response node otherwise requests will eventually timeout.

The HTTP Response node uses the payload property of messages it receives as the body of the response. Other properties can be used to further customize the response - they are covered in other recipes.

The Template node provides a convenient way to embed a body of content into a flow. It may be desirable to maintain such static content outside of the flow.
