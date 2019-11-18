# Monitor
The monitor is used to connect the `instance` to the User Interface a.k.a. the Designer App.

The monitor can optionally be enabled in the bootstrap.

The monitor will be availible at the `/_system` path. For e.g. if you are running locally on port 5000 you can check the following url: http://localhost:5000/_system.

The [coresplash] component is used to create a minimal html page with basic information about the server. It shows all the running `designs` that consist of `nodes` and `components`.

The monitor provides a REST server at `<domain>/_system` and a Websocket server at `<domain>/_system/ws`.

# Authentication
We are still working on this functionality.


