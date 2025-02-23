const express = require('express');

const app = express();

app.get('/', (req, res) => {
    res.send('Welcome to the server!');
});

app.get('/api/posts', (req, res) => {
    const posts = [
        {
            id: "eioyaruia",
            title: "First Title",
            content: "First content on server side"
        },
        {
            id: "asfasd",
            title: "Second Title",
            content: "Second content on server side"
        }
    ];

    res.status(200).json({
        message: 'Posts retrieved successfully',
        posts: posts
    });
});

module.exports = app;
