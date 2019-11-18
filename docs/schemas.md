# Schemas

# Node
A node is an instantiated version of a component.

## Connections
A node contains connections to other nodes:

```
"connections": [
    {
        "fromNodeId": "d2231d13-6ff1-4d71-aea8-dc21def10929",
        "fromPortId": 0,
        "toNodeId": "a80615c6-5d3f-42b2-9924-ad0128b3b192",
        "toPortId": 0
    }
],
```
fromNodeId = optional as it is already in the object tree

This gives a flatter structure which makes it easier to handle

# Component
##  In/outputs
V1
```
"outputs": [
    {
        "color": "#6BAD57",
        "description": "string"
    },
    {
        "color": "#6BAD57",
        "description": "string"
    }
    ],
"inputs": [
    {
        "color": "#6BAD57",
        "description": "request"
    }
],
```

V2

```
"ports": [
    {
        "direction": "out",
        "color": "#6BAD57",
        "description": "string"
    },
    {
        "direction": "out",
        "color": "#6BAD57",
        "description": "string"
    },
    {
        "direction": "in",
        "color": "#6BAD57",
        "description": "request"
    }
],
```