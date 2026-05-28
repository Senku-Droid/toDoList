import express from 'express'
const app = express()
const port = 3000

// on utilise le moteur de template ejs
app.set("view engine", "ejs")

// mes assets et mon style sont dans le dossier public
app.use(express.static('public'))

app.get('/', (req, res) => {
    const user = {
        nom: "El Azhar",
        prenom: "Ayoub",
    }
    res.render("home", { "user": user })
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})