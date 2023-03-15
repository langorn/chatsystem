const redis = require("redis");
const { REDIS_PASSWORD } = require("../config");
// use websocket to sent broadcast message.
const { WebSocketServer } = require('ws')
const sockserver = new WebSocketServer({port: 808})

const EventEmitter = require("events")
const eventEmitter = new EventEmitter()

// setup redis server
const client = redis.createClient({
    password: REDIS_PASSWORD,
    socket: {
        host: REDIS_SERVER,
        port: REDIS_PORT
    }
});

init = async() => {
    await client.connect();
}

init();

client.on('error', err => console.log('Redis Client Error', err));


const addPostRedis = async(username, room_name, msg) => {

    let timeData = new Date();
    let currentTime = timeData.toTimeString();
    let message = `${currentTime} ${username}: ${msg}`;

    // use a list to store chat history
    let result = await client.lPush(room_name, message);
    client.lTrim(room_name, 0, 9);

    // use sorted list to store top5 player
    let roomRank = room_name + "-rank";
    await client.zIncrBy(roomRank, 1, username)

    // each time user update, broadcast to all user.
    updateWebsocket(room_name);
    return result;
}

const updateWebsocket = async (room_name) => {
    let last10 = await getLast10MessageRedis(room_name);
    let top5 = await getTop5RankRedis(room_name);
    // sent websocket realtime update to frontend
    // sent realtime update to websocket
    let top5Data = { type: "ranking" };
    top5Data.data = top5;
    eventEmitter.emit("top5", JSON.stringify(top5Data));

    let last10Data = { type: "chatHistory" };
    last10Data.data = last10
    eventEmitter.emit("last10Msg", JSON.stringify(last10Data));

}

const getLast10MessageRedis = async(room_name) => {
    return await client.lRange(room_name, 0, 9);
}

const getTop5RankRedis = async(room_name) => {
    let result = [];
    // get the top5 result from redis
    let roomRank = `${room_name}-rank`;
    let topRank = await client.zRange(roomRank, -5, -1);

    // retrieve the score of top5 player
    for (let i = topRank.length; i >= 0; i--) {
        if (topRank && topRank[i]) {
            let rank = await client.zmScore(roomRank, topRank[i]);
            result.push({player:topRank[i], score:rank[0]});
        }
    } 
    return result;
}

sockserver.on('connection', ws => {
    console.log('Client Connected!')
    ws.send('Connection Established')
    ws.on('close', () => console.log('Client Disconnected!'))
    ws.on('message', data => {

      try {
        message = JSON.parse(data);
      } catch (e) {
        sendError(ws, 'Wrong format');
        return;
      }
  
      if (message && message.type == "retrieveChatHistory") {
        updateWebsocket(message.name);
      } else {
        sockserver.clients.forEach(client => {
            console.log(`message: ${data}`)
            client.send(`${data}`)
          })
      }

    })
    ws.onerror = function () {
      console.log('websocket error')
    }

    eventEmitter.on("last10Msg", async (data)=> {
        ws.send(data);
    })
    
    eventEmitter.on("top5", async  (data)=>{
        ws.send(data)
    })
})


module.exports = { addPostRedis , getLast10MessageRedis, getTop5RankRedis }
