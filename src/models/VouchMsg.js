exports.saveVouch = async(coll, msgid, authorID, authorName, mentioned, content) => {
    await coll.insertOne({
        _id: msgid,
        authorID: authorID,
        authorName: authorName,
        mentioned: mentioned,
        content: content
    }).catch(console.error);
}

exports.getAll = async(coll) => {
    return await coll.findMany().catch(console.error);
}

exports.deleteAll = async(coll) => {
    return await coll.deleteMany().catch(console.error);
}

exports.deleteOne = async(coll, msgid) => {
    return await coll.deleteOne({
        _id: msgid
    }).catch(console.error);
}

exports.updateOne = async(coll, msgid, data) => {
    return await coll.updateOne({
        _id: msgid
    },
    { $set: data},
    { upsert: true}).catch(console.error);
}