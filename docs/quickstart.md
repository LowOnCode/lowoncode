# Quick start

## Prerequisite
- nodejs

## From the command line
The quickest way to start an instance is to use the lowoncode command line tool.
You can install it globally like:
```
npm i -g https://github.com/LowOnCode/lowoncode.git
```

Then run
```
lowoncode -m -p 5000 design.json
```


For convenient you can create a `package.json` file to have easy access to your command line scripts.
```json
{
  "name": "yourinstancename",
  "version": "1.0.0",
  "description": "",
  "scripts": {
    "start": "lowoncode -m -s -p 5001 design.json",
    "dev": "DEBUG=info,log,event,warn npx nodemon --exec npm start"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "@lowoncode/std": "git+https://github.com/LowOnCode/std.git"
  }
}
```
Notice the `@lowoncode/std` dependency. This will install some basic components to use in the designer.

## From code
First install a local instance by running the following commands:
```
git clone https://github.com/LowOnCode/lowoncode-heroku.git
cd lowoncode-heroku
npm i
```

Then start the server with:
```
npm start
```
or for development with:
```
npm run dev
```

or to start at a different port use:
```
PORT=5001 npm start
```

Visit the server at: http://localhost:5000. 

Or check the internals at: http://localhost:5000/_system


## For development 
If you want to do development on the runtime, then we suggest to use `npm link` like:
```
git clone https://github.com/LowOnCode/lowoncode.git
cd lowoncode
npm link
```
