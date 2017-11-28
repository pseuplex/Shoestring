const express = require('express');
const mysql = require('mysql');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');

//Init app
const app = express();

//Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

//Public folder
app.use(express.static(path.join(__dirname, 'public')));

const connection = mysql.createConnection(
    {
        host: 'webdev.cislabs.uncw.edu',
        user: 'jha2135',
        password: 'xczcCx3bH',
        database: 'narayan3'
    }
);

connection.connect(function (err) {
    if (err) throw err;
    else {
        console.log("connected");
    }
});

global.db = connection;

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}))

//Home route
app.get('/', function (req, res) {
    var inventory = [];
    db.query('select * from inventory', function (err, data) {
        if (err) {
            console.log(err)
        } else {
            data.forEach(function (row) {
                var item = {
                    id: row.itemId,
                    name: row.itemName,
                    brand: row.brandId,
                    price: row.price
                }
                inventory.push(item);
            });
        }
        res.render('shopping', {
            name: 'Inventory',
            inventory: inventory
        });
    });

});

//Register page
app.get('/register', function (req, res) {
    res.render('register');
});

//Register post route
app.post('/register', function (req, res) {
    var post = req.body;
    var last = post.inputLastName;
    var first = post.inputFirstName;
    var email = post.inputFirstName;
    var pass = post.inputPassword;
    var user = post.inputUserName;
    var sql = `insert into users(userId, lastName, firstName, userName, userEmail, userPassword)
        values(generateUID(), '${last}', 
        '${first}', '${user}', '${email}', 
        '${pass}')`;

    db.query(sql, (err, data) => {
        if (err) throw err;
        res.redirect('/login');
    });
});



//Login page
app.get('/login', function (req, res) {
    res.render('login');
});

//Login post page
app.post('/login', function (req, res) {
    var post = req.body;
    var name = post.username;
    var pass = post.password;

    var sql = `select userId, firstName, lastName, userEmail from users
                where userName = '${name}' and userPassword = '${pass}'
                `
    db.query(sql, function (err, results) {
        if (results.length) {
            req.session.userId = results[0].userId;
            req.session.user = results[0];
            console.log(req.session.user);
            console.log(req.session.userId);
            res.redirect('/');
        } else {
            res.render('signup');
        }
    })

});

//Admin page
app.get('/admin', function (req, res) {

    var inventory = [];
    var users = [];
    var orders = [];

    // grab the data to populate the inventory array
    db.query('select * from inventory', function (err, data) {
        if (err) throw err;

        // create an object for each item in inventory
        data.forEach(function (row) {
            var item = {
                id: row.itemId,
                name: row.itemName,
                brand: row.brandId,
                price: row.price
            }
            inventory.push(item);
        });

        // grab the data to populate the users array
        db.query('select * from users', function (err2, data2) {
            if (err2) throw err2;

            //create an object for each user
            data2.forEach(function (row) {
                var item = {
                    id: row.userId,
                    first: row.firstName,
                    last: row.lastName,
                    wallet: row.wallet
                }
                users.push(item);
            });

            // grab the data to populate the orders array
            db.query('select * from purchased', function (err3, data3) {
                if (err3) throw err3;

                //create an object for each order
                data3.forEach(function (row) {
                    var item = {
                        pid: row.purchaseId,
                        iid: row.itemId,
                        qty: row.quantity,
                        pdate: row.purchaseDate,
                        ddate: row.deliveryDate
                    }
                    orders.push(item);
                });
                res.render('admin-content', {
                    admin: 'Jordan',
                    inventory: inventory,
                    users: users,
                    orders: orders
                });
            }); // purchased query end
        }); // users query end
    }); // inventory query end
}); // admin get end

app.get('/chart-data', function (req, res) {
    var sql = 'select * from barchart'

    db.query(sql, function (err, data) {
        console.log("From barchart " + data);
    })
})
//Add item route
app.get('/inventory/add', function (req, res) {
    res.render("add-item");
});

app.post('/inventory/add', (req, res) => {
    console.log(res.params)
    let sql = `insert into inventory values (generateItemId(),
        '${req.body.name}', 
        ${req.body.price}, 
        '${req.body.dept}',
        '${req.body.brand}')`

    db.query(sql, (err, data) => {
        if (err) throw err
        res.redirect('/admin');
    });

});


//Edit item route
app.get('/inventory/edit/:id', function (req, res) {
    var item;
    let sql = `select * from inventory where itemId = '${req.params.id}'`
    db.query(sql, (err, data) => {
        if (err) throw err
        res.render("edit-item", {
            title: "Edit Item",
            item: data[0]
        });
    });
});

//Update item route
app.post('/inventory/edit/:id', (req, res) => {

    let sql = `update inventory 
                set itemName = '${req.body.name}', 
                brandId = '${req.body.brand}', 
                departmentId = '${req.body.dept}',
                price = ${req.body.price} where itemId = '${req.params.id}'`

    db.query(sql, (err, data) => {
        if (err) throw err
        res.redirect('/admin');
    })
});

//Delete item route
app.get('/inventory/delete/:id', (req, res) => {

    let sql = `delete from inventory where itemId = '${req.params.id}'`

    db.query(sql, (err, data) => {
        if (err) throw err
        console.log("Deleted item: " + req.params.id);
        res.redirect('/admin')
    })
});

//Add user route
app.get('/user/add', function (req, res) {
    res.render("add-user");
});

//Add post user route
app.post('/user/add', (req, res) => {
    console.log(res.params)
    let sql = `insert into users values (generateUID(),
        '${req.body.first}', 
        '${req.body.last}',
        '${req.body.email}',
        generateUID(), 
        ${req.body.wallet})`

    db.query(sql, (err, data) => {
        if (err) throw err
        res.redirect('/admin');
    });
})

//Edit user route
app.get('/user/edit/:id', (req, res) => {

    var user;
    let sql = `select * from users where userId = ${req.params.id}`
    db.query(sql, (err, data) => {
        if (err) throw err;
        res.render("edit-user", {
            title: "Edit User",
            user: data[0]
        });
    })
});

//Update user route
app.post('/user/edit/:id', (req, res) => {

    var sql = `update users 
    set firstName = '${req.body.first}', 
    lastName = '${req.body.last}', 
    wallet = ${req.body.wallet} where userId = '${req.params.id}'`

    db.query(sql, (err, data) => {
        if (err) throw err
        res.redirect('/admin');
    });
});

//Delete User Route
app.get('/user/delete/:id', (req, res) => {

    let sql = `delete from users where userId = '${req.params.id}'`

    db.query(sql, (err, data) => {
        if (err) throw err
        console.log("Deleted user: " + req.params.id);
        res.redirect('/admin')
    });
});

//Edit order route
app.get('/order/edit/:id', function (req, res) {
    var order;

    let sql = `select * from purchased where purchaseId = ${req.params.id}`
    db.query(sql, (err, data) => {
        if (err) throw err
        console.log(data[0])
        res.render('edit-order', {
            order: data[0]
        })
    });
});

//Update post order route
app.post('/order/edit/:id', function (req, res) {
    var sql = `update purchased 
    set qty = '${req.body.qty}', 
    purchaseDate = '${req.body.pdate}', 
    deliveryDate = ${req.body.ddate} where purchaseId = ${req.params.id}`;

    console.log(req.body);

    db.query(sql, (err, data) => {
        if (err) throw err
        res.redirect('/admin');
    });
});

//Delete order
app.get('/order/delete/:id', (req, res) => {

    let sql = `delete from purchased where purchaseId = '${req.params.id}'`

    db.query(sql, (err, data) => {
        if (err) throw err
        console.log("Deleted order: " + req.params.id);
        res.redirect('/admin')
    });
});

//Start server
app.listen(3000, function () {
    console.log('Server running on port 3000');
});
