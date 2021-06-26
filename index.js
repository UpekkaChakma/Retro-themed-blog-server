const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
app.use(cors());
app.use(express.json());

const port = 5000;

app.get('/', (req, res) => {
  res.send('Hello World!')
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ijulk.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const postsCollection = client.db(`${process.env.DB_NAME}`).collection("posts");

  console.log("database connected successfully");

  //<<<<<<<<<<<<<<<<<<<<<<< user part >>>>>>>>>>>>>>>>>>>>>>>




  //<=================== find a single game by id =====================>
  app.get('/findPost/:id', (req, res) => {
    const id = ObjectId(req.params.id);
    postsCollection.find({ _id: id })
      .toArray((err, items) => {
        res.send(items)
      })
  })

  //<=========== Shared Api(ADMIN + USER)======= get all games list ==============> 
  app.get('/posts', (req, res) => {
    postsCollection.find()
      .toArray((err, items) => {
        res.send(items)
      })
  })


  //<<<<<<<<<<<<<<<<<<<<< admin part >>>>>>>>>>>>>>>>>>>>>>


  //<======================= add a post =======================>
  app.post('/admin/addpost', (req, res) => {
    const newPost = req.body;
    postsCollection.insertOne(newPost)
      .then(result => {
        console.log('inserted count', result.insertedCount);
        res.send({ status: 'success', code: 200 });
      })
  })


  //<=================== delete a game by id ========================>
  app.delete('/admin/deletePost/:id', (req, res) => {
    const id = ObjectId(req.params.id);
    postsCollection.deleteOne({ _id: id })
      .then(documents => res.send({ status: 'Successfully Delete', code: 200 }));
  })


});

app.listen(process.env.PORT || port)