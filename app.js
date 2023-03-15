// const http = require('http');
const express = require('express');
const app = express();
const router = express.Router();
const cors = require("cors");
const bodyParser = require("body-parser");
const chatsRoutes = require("./routes/chatRoutes.js");

// swagger UI Document
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'The Chat System Documentation',
        version: '1.0.0',
      },
      server: [{
        url: "http://localhost:3000/api/",
      }]
    },
    apis: ['./controllers/*.js'], // files containing annotations as above
  };
const specs = swaggerJsdoc(options);
app.set('view engine', 'ejs');
app.use(express.json());
app.use(bodyParser.json());
// app.use(cors);
// router.use(bodyParser.urlencoded({extended: false}));

app.use("/api", chatsRoutes.routes);
app.use("/chat", (req, res, next) => {
    res.render('main');
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.listen(process.env.PORT || 3000, () => {
    console.log('Server Up.')
})