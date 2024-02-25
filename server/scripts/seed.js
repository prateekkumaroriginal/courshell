const mongoose = require('mongoose');
const Category = require('../db/Category');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_CONNECTION_STRING, {dbName: "Courses"}).then(()=>{
    console.log("DB connected");
}).catch((error)=>{
    console.log(error);
})

const main = async () => {
    try {
        const category = await Category.create([
            { name: "Computer Science" },
            { name: "Development" },
            { name: "Music" },
            { name: "Fitness" },
            { name: "Art" },
            { name: "Cooking" },
            { name: "Travel" },
            { name: "Photography" },
            { name: "Engineering" },
            { name: "Finance" }
        ])
        if (category){
            console.log("Success");
        } else{
            console.log("Fail");
        }
    } catch (error) {
        console.log(error);
    }
}

main()