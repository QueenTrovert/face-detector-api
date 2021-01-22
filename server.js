import express, { response } from 'express';
import bcrypt from 'bcrypt';
import cors from 'cors';
import knex from 'knex';

const db = knex({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        user: 'postgres',
        password: '1234567890',
        database: 'face_recognition'
    }
});

const saltRounds = 10;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());



app.get('/', (req, res) => {
    res.send("<h1>testtest");

})

app.get('/profile/:id', (req, res) => {
    const { id } = req.params;

    db.select('*').from('users').where({ id })
        .then((user) => {
            if (user.length)
                res.json(user[0]);
            else
                res.status(404).json('Not Found')
        })
        .catch(err => res.status(404).json('Error getting user'))

})

app.put('/image', (req, res) => {
    const { id } = req.body;
    db('users')
        .where('id', '=', id)
        .increment('entries', 1)
        .returning('entries')
        .then((entries) => {
            res.json(entries[0])
        })
        .catch((err) => res.status(400).json('Unable to get entries'))
})


app.post('/register', (req, res) => {
    const { email, name, password } = req.body;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(password, salt);
    db.transaction(trx => {
        trx.insert({
            hash: hash,
            email: email
        })
            .into('login')
            .returning('email')
            .then(loginEmail => {
                return trx('users')
                    .returning('*')
                    .insert({
                        name: name,
                        email: loginEmail[0],
                        joined: new Date()
                    })
                    .then(user => {
                        res.json(user[0]);
                    })

            })
            .then(trx.commit)
            .catch(trx.rollback)
    })
        .catch(err => res.status(400).json('Unable to register'))

})


app.post('/signin', (req, res) => {
    db.select('email', 'hash').from('login')
    .where('email', '=', req.body.email)
    .then(data => {
        bcrypt.compare(req.body.password, data[0].hash).then(function(result) {
            if(result)
                res.json('SUCCESS');
            else
                res.json('Wrong email/password');
        });
    })
    .catch(err => res.status(404).send('Wrong email/password'));
  
})

const PORT = process.env.PORT;

app.listen(PORT || 3000, () => {
    console.log(`Port running on port ${PORT}`);
});
console.log(PORT);