const express = require("express");

const app = express();

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    
    next();
});

app.use("/api/posts", (req, res, next) => {
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
        message: "Posts retrieved successfully",
        posts: posts
    });
});

module.exports = app;
