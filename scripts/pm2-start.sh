npm i
pm2 stop cryptocape
pm2 delete cryptocape
pm2 start scripts/start.js --name cryptocape