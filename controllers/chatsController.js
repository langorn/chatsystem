/**
 * @swagger
 * components:
 *   schemas:
 *     Chats:
 *       type: object
 *       required:
 *         - username
 *         - message
 *       properties:
 *         username:
 *           type: string
 *           description: The current user want to sent message
 *         msg:
 *           type: string
 *           description: The chat message
 *     
 */
/**
 * @swagger
 * tags:
 *   name: Chat API
 *   description: The Chat System API
 * /api/chatroom/{name}/messages:
 *   get:
 *     summary: Lists all the message in this chatroom
 *     tags: [Chats]
 *     parameters:
 *     - in: path
 *       name: name
 *       schema:
 *         type: string
 *         required: true
 *         description: The Chatroom Name
 *     responses:
 *       200:
 *         description: The list of the chat messages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 * /api/chatroom/{name}/message:
 *   post:
 *     summary: Create a new chat message
 *     tags: [Chats]
*     parameters:
 *     - in: path
 *       name: name
 *       schema:
 *         type: string
 *         required: true
 *         description: The Chatroom Name
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Chats'
 *     responses:
 *       200:
 *         description: The created messages.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chats'
 *       500:
 *         description: Internal Server Error
 * /api/chatroom/{name}/top5:
 *   get:
 *     summary: Get the top5 rank of players
 *     tags: [Chats]
 *     parameters:
 *       - in: path
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: The Chatroom Name
 *     responses:
 *       200:
 *         description: The top5 player result response by name
 *         contens:
 *           application/json:
 *       404:
 *         description: The top5 player result was not found
 */
 

// 1. A player can join a given chat room and send a message.
// 2. If the chat room does not exist, create it and add the message to it.
// 3. A player can see the latest 10 messages that he or the other party has sent to the chat room.
// 4. A user can see a ranking of the top 5 users with the highest score.
// 5. The score is measured by the maximum number of sent messages.
const { addPostRedis , getLast10MessageRedis, getTop5RankRedis} = require("../services/redis_server.js");

const addChatMessage = async(req, res, next) => {
    let username = req.body.username;
    let room_name = req.params.name;
    let msg = req.body.msg;

    if ( !username || !room_name || !msg ) {
        res.status(401).json( { message: "Failed", data: "Missing Parameter!" } );
    }

    await addPostRedis(username, room_name, msg);
    res.status(201).json( { message: "Success Update", data: msg });
}   

const getChatMessage = async (req, res, next) => {
    let room_name = req.params.name;

    if ( !room_name ) {
        res.status(401).json({ message: "Failed", data: "Missing Parameter - Room Name" });
    }

    let msg = await getLast10MessageRedis(room_name);
    res.status(201).json( { message: "Success", data: msg });
}

const getTop5Rank = async (req, res, next) => {
    let room_name = req.params.name;
    let msg = await getTop5RankRedis(room_name);
    res.status(201).json( { message: "Success", data: msg });
}

 module.exports = {
    addChatMessage,
    getChatMessage,
    getTop5Rank
 }