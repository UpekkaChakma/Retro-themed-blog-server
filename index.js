const express = require('express');
const cors = require('cors');
require('dotenv').config();
const {MongoClient, ObjectId } = require('mongodb');
const app = express();
app.use(cors());
app.use(express.json());

const port = 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ijulk.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const gamesCollection = client.db( `${process.env.DB_NAME}`).collection("games");
  const ordersCollection = client.db( `${process.env.DB_NAME}` ).collection("orders");

  console.log("database connected successfully");

//<<<<<<<<<<<<<<<<<<<<<<< user part >>>>>>>>>>>>>>>>>>>>>>>


//=====================find order list by email=====================
  app.get('/userTotalOrderedLists/:email', (req, res) => {
    const email = req.params.email;
    ordersCollection.find({email: email}).sort({$natural:-1})
    .toArray((err, items) => {
      res.send(items)
    })
})

//================== order a single game ========================
  app.post('/addOrder', (req, res) => {
    const newOrder = req.body;
    ordersCollection.insertOne(newOrder)
    .then(() => {
        res.send({status: 'Success Ordered', code: 200});
    })
  });

//<=================== find a single game by id =====================>
  app.get('/findGame/:id', (req, res) => {
    const id = ObjectId(req.params.id);
    gamesCollection.find({ _id: id })
    .toArray((err, items) => {
      res.send(items)
    })
  })

//<=========== Shared Api(ADMIN + USER)======= get all games list ==============> 
  app.get('/games', (req, res) => {
    gamesCollection.find()
      .toArray((err, items) => {
        res.send(items)
      })
  })


//<<<<<<<<<<<<<<<<<<<<< admin part >>>>>>>>>>>>>>>>>>>>>>


//<======================= add a game =======================>
  app.post('/addGame', (req, res) => {
    const newGame = req.body;
    gamesCollection.insertOne(newGame)
      .then(result => {
        console.log('inserted count', result.insertedCount);
        res.send({status: 'success', code: 200});
      })
  })


//<=================== delete a game by id ========================>
  app.delete('/deleteGame/:id', (req, res) => {
    const id = ObjectId(req.params.id);
    gamesCollection.deleteOne({ _id: id })
      .then(documents => res.send({status: 'Successfully Delete', code: 200}));
  })


});

app.listen( process.env.PORT || port)