import bcrypt from "bcryptjs";
import { sql } from "@vercel/postgres";

const allowCors = (fn) => async (req, res) => {
    res.setHeader("Access-Control-Allow-Credentials", true);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "OPTIONS,POST");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
    );
    if (req.method === "OPTIONS") {
        res.status(200).end();
        return;
    }
    return await fn(req, res);
};

const handler = async (req, res) => {
    if (req.method === "POST") {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }

        try {
            const { rows } = await sql`SELECT * FROM users WHERE username = ${username};`;

            if (rows.length > 0) {
                const user = rows[0];

                console.log("User found:", user);  // Log the user details (avoid logging password in production)

                const isValidPassword = await bcrypt.compare(password, user.password_hash);

                if (isValidPassword) {
                    res.status(200).json({ message: "Login successful", userId: user.id });
                } else {
                    res.status(401).json({ message: "Invalid credentials" });
                }
            } else {
                res.status(401).json({ message: "Invalid credentials" });
            }
        } catch (error) {
            console.error("Error during login:", error);
            res.status(500).json({ message: "Error processing login" });
        }
    } else {
        res.status(405).send("Method not allowed");
    }
};

module.exports = allowCors(handler);
