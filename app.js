const express = require('express');
const path = require('path');

//Init app
const app = express();

//Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//Public folder
app.use(express.static(path.join(__dirname, 'public')));

//Home route
app.get('/', function (req, res) {
    let inventory = [
        {
            name: "Tee-Shirt",
            brand: "Nike",
            price: 10
        },
        {
            name: "Hat",
            brand: "Adidas",
            price: 20
        },
        {
            name: "Shorts",
            brand: "Reebok",
            price: 15
        }
    ]
    res.render('shopping', {
        name: 'Shoes',
        inventory: inventory
    });
});

//Admin page
app.get('/inventory/add', function (res, req) {
    res.render('admin', {
        admin: 'Jordan',
        friend: 'Morgan'
    });
});


//Start server
app.listen(3000, function () {
    console.log('Server running on port 3000');
});