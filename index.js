import express from "express";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
const port = 3000;

const supabaseUrl = process.env.SUPABASE_URL?.trim();
const supabaseKey = process.env.SUPABASE_KEY?.trim();
const toDo = "toDo";

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

function renderHome(res, todos = [], message = "") {
    return res.render("home", {
        todos,
        message,
    });
}

app.get("/", async (req, res) => {
    const message = req.query.message || "";

    try {
        if (!supabase) {
            return renderHome(res, [], "Supabase non configure dans .env");
        }

        const { data: todos, error } = await supabase
            .from(toDo)
            .select("id, nom, deadline, priorite")
            .order("id", { ascending: false });

        if (error) throw error;

        return renderHome(res, todos ?? [], message);
    } catch (error) {
        return renderHome(res, [], `Erreur: ${error.message}`);
    }
});

app.get("/ajouter", (req, res) => {
    res.render("ajouter");
});

app.post("/ajouter", async (req, res) => {
    const nom = String(req.body.nom || "").trim();
    const deadline = String(req.body.deadline || "").trim();
    const priorite = String(req.body.priorite || "").trim();

    if (!nom || !priorite) {
        return res.redirect("/?message=Nom et priorite obligatoires");
    }

    if (!supabase) {
        return res.redirect("/?message=Supabase non configure dans .env");
    }

    try {
        const { error } = await supabase.from(toDo).insert([
            {
                nom,
                deadline: deadline || null,
                priorite,
            },
        ]);

        if (error) throw error;

        return res.redirect("/?message=Tache ajoutee");
    } catch (error) {
        return res.redirect(`/?message=Erreur ajout: ${error.message}`);
    }
});

app.post("/supprimer/:id", async (req, res) => {
    if (!supabase) {
        return res.redirect("/?message=Supabase non configure dans .env");
    }

    try {
        const { error } = await supabase.from(toDo).delete().eq("id", req.params.id);
        if (error) throw error;
        return res.redirect("/?message=Tache supprimee");
    } catch (error) {
        return res.redirect(`/?message=Erreur suppression: ${error.message}`);
    }
});

app.listen(port, () => {
    console.log(`Serveur demarre sur http://localhost:${port}`);
});