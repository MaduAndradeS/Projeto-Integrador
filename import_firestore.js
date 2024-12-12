const admin = require("firebase-admin");
const fs = require("fs");

// Inicialize o Firebase Admin
const serviceAccount = require("./path/to/serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Importar tabela 'users'
async function importUsers() {
    const users = JSON.parse(fs.readFileSync("users.json", "utf8"));
    const batch = db.batch();

    users.forEach((user) => {
        const docRef = db.collection("users").doc(user.id.toString()); // Use o ID como chave
        batch.set(docRef, user);
    });

    await batch.commit();
    console.log("Tabela 'users' importada com sucesso!");
}

// Importar tabela 'comments'
async function importComments() {
    const comments = JSON.parse(fs.readFileSync("comments.json", "utf8"));
    const batch = db.batch();

    comments.forEach((comment) => {
        const docRef = db.collection("comments").doc(comment.id.toString()); // Use o ID como chave
        batch.set(docRef, comment);
    });

    await batch.commit();
    console.log("Tabela 'comments' importada com sucesso!");
}

// Executar importação
async function importData() {
    await importUsers();
    await importComments();
}

importData();
