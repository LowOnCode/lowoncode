## LowOnCode Servers
W.I.P.

## Heroku
1. Use the following button to create an instance on heroku.
<a href="https://heroku.com/deploy?template=https://github.com/lowoncode/runtime"> <br>
    <img src="https://www.herokucdn.com/deploy/button.svg" alt="Deploy">
  </a>

2. Add the config variable `DESIGN` and point it to the design endpoint e.g. 
`https://designs.lowoncode.com/hello/latest.json`

3. Heroku will reboot and you runtime will be live

(Optional) Local development (& fix heroku's empty repo)
4. Run `heroku git:clone -a <YOUR-APP-NAME>`

5. Run `git remote add origin https://github.com/LowOnCode/lowoncode-heroku.git`

6. Pull from the remote origin `git pull origin master`

7. Run `npm i`