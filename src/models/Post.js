const fs = require('fs');
const fileName = '../json/post.json';
const osFile = './src/json/post.json';
let { post } = require(fileName);

exports.savePostToFile = () => {
    let dataStr = { "post": post }
    fs.writeFile(osFile, JSON.stringify(dataStr), function writeJSON(err) {
        if (err) return console.log(err);
    });
}

exports.new = (postID, newListID, authorID, type, have, want) => {
    post[postID]= {
        newListID: newListID,
        authorID: authorID,
        type: type,
        have: have,
        want: want,
        sold: false,
        soldToID: "",
        soldDate: ""
    };
    this.savePostToFile();
}

exports.edit = (postID, have, want) => {
    post[postID].have = have;
    post[postID].want = want;
    this.savePostToFile();
}

exports.markSold = (postID, soldToID, soldDate) => {
    post[postID].soldToID = soldToID;
    post[postID].soldDate = soldDate;
    this.savePostToFile();
}

exports.delete = (id) => {
    post[postID] == null;
    this.savePostToFile();
}