const run = async()=>{
const Db = await mongoose.connect('mongodb://localhost:27017/testfarm', { useNewUrlParser: true })
.then(() => {
    console.log("Connection Started On MongoDb!!");
})
.catch(err => {
    console.log('Oh No Error In Connecting To Mongo');
    console.log(err);
})
}

run();

module.exports = run;