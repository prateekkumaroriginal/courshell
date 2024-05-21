import { db } from './index.js';
import 'dotenv/config';

const main = async () => {
    try {
        const category = await db.category.createMany({
            data: [
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
            ]
        });

        if (category) {
            console.log("Categories Addition: Success");
        } else {
            console.log("Categories Addition: Fail");
        }
    } catch (error) {
        console.log(error);
    }
}

main()