/**
 * generates stats from list of vouch messages
 * @param {MongoDB.db.Collection} coll 
 * @param {String} id 
 * @returns {Object} stats
 */
exports.getStats = async (coll, id) => {
  let records = await coll.find({authorID: id});
  let stats = {
    authorID: id,
    points: 0,
    transactions: []
  };
  records.forEach((record) => {
    stats.authorName = record.authorName;
    stats.points++;
    if(stats.transactions[record.mentioned]== null)
      stats.transactions[record.mentioned] == 0;
    stats.transactions[record.mentioned]++;
  }).catch(console.error);
  return stats;
}