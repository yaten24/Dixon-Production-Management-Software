require("dotenv").config();

const app = require("./app");
const db = require("./config/db");

const PORT = process.env.PORT || 5000;

async function startServer() {

    try {

        await db.query("SELECT 1");

        console.log("MySQL Connected");

        app.listen(PORT, () => {

            console.log(`Server Running On ${PORT}`);

        });

    } catch (error) {

        console.log(error);

    }

}

startServer();