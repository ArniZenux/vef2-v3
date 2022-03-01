# Vefforritun 2, 2021, verkefni 3, sýnilausn

[Verkefnalýsing](https://github.com/vefforritun/vef2-2021-v3).

[Vídeó yfirferð á sýnilausn](https://youtu.be/hVhlxcxZ-Oc).

Keyrt með:

```bash
npm install
createdb vef2-2021-v3
# setja rétt DATABASE_URL í .env
node ./src/setup.js # eða npm run setup
npm run dev
```

Uppsetning á heroku, gefið að appið sé til undir nafninu <APP> og þú sért loggedin á heroku cli:

```bash
heroku git:remote -a <APP>
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
heroku run npm run setup
```
