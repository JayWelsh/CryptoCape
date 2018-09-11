source ~/.bashrc
npm i
pm2 stop cryptocape-client
pm2 delete cryptocape-client
pm2 start ./client/scripts/start.js --name cryptocape-client