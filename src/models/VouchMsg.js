exports.saveVouch = async(coll, msgid, authorID, authorName, mentioned, content) => {
    await coll.insertOne({
        _id: msgid,
        authorID: authorID,
        authorName: authorName,
        mentioned: mentioned,
        content: content
    }).catch(console.error);
}