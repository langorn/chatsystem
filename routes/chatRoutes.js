const express = require("express");

const {
    addChatMessage,
    getChatMessage,
    getTop5Rank
} = require("../controllers/chatsController.js");

const router = express.Router();

router.post("/chatroom/:name/message", addChatMessage);
router.get("/chatroom/:name/messages", getChatMessage);
router.get("/chatroom/:name/top5", getTop5Rank);

module.exports = {
    routes: router
}