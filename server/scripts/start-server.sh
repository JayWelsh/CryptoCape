source ~/.bashrc
npm i
cd ./server && tsc
cd ../
npm run build
pm2 stop cryptocape-server
pm2 delete cryptocape-server
pm2 start ./dist/server/server.js --name cryptocape-server