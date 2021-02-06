// ------------------ UNOS ---------------
const express = require('express');
const mysql = require('mysql');
const bodyparser = require('body-parser');
const { urlencoded } = require('body-parser');
const session = require("express-session");
const { render } = require('ejs');



//-------------- KONEKCIJA SA BAZOM ---------------------
const connection = mysql.createConnection({
    user: "root",
    host: "localhost",
    password: "",
    database: "prodavnica_kafe",
    port: "3308"
});


// ---------------- SLUZI ZA DODAVANJE NECEGA U BAZU --------------------------
/*
connection.connect(function(err) {
    if (err) throw err;
    console.log("Napravljen novi proizvod");
    var sql= "INSERT INTO korisnik (ime, prezime, broj_tel,grad, adresa, email, lozinka) VALUES ?"
    var values= [
        [
            "Mihajlo", "Stojanovic", "0612908749", "Malosiste", "MalosisteBB", "mihajlomixi@live.co.uk", "proba123"
        ]

    ]
    connection.query(sql,[values],(err,res)=>{
        if(err) throw err;
        console.log("Dodat proizvod" + res.affectedRows);
    })
}) */




var app = express();

app.set("view engine", "ejs");    //Sluzi da ne moram da pisem ekstenziju u rute

app.use(express.static('public'));
app.use('/css',express.static(__dirname + 'public/css'));
app.use('/img',express.static(__dirname + 'public/img'));
app.use('/js',express.static(__dirname + 'public/js'));

app.use(bodyparser.urlencoded({ extended: true}))
app.use(bodyparser.json())
app.use(session({
    secret:"secret",
resave: true, saveUninitialized: true }
))
app.use(function (req, res, next) {
    if(req.session.user){
    res.locals.email = req.session.user.email;
    } else{
    res.locals.email = null;
    }
    next();
})

// ------------------ KREIRAJ ----------------------------

app.get('/kreiraj', (req,res) => {

    res.render('kreiraj')
})

app.post('/kreiraj', (req,res) => {
    var sql = "INSERT INTO proizvodi (ime, opis, slika, cena) VALUES ?"
    var values = [
        [
        req.body.ime, req.body.opis, req.body.slika, req.body.cena
        ]
    ]
    connection.query(sql, [values], (err,result) => {
        if(err) throw err;
        res.redirect('meni')
    })
})


// ------------------ LOGOUT ----------------------------
app.get('/logout', (req,res) => {
    req.session.destroy();
    res.redirect('login')
})
 
// ------------------ HOME ----------------------------
app.get('/', (req,res) => {
    res.render('home')
})

// ------------------ KONTAKT ----------------------------
app.get('/kontakt', (req,res) => {
    res.render('kontakt')
})

// ------------------ MENI ----------------------------
app.get('/meni', (req,res) => {
    var mail = req.session.email;
    var sql = "SELECT * FROM proizvodi"
    connection.query(sql,(err,result) => {
        if (err)  {
            res.status(500)
            return res.end(err.message)
        } 
        res.status(200)
        res.render("meni", {proizvodi: result, mail:mail})
        return res.end();
    })
    
})

//------------------- UTISAK --------------------------------
app.get('/utisci', (req,res) => {
    
  
    var sql = "SELECT * FROM utisak"
    connection.query(sql,(err,result) => {
        if (err)  {
            res.status(500)
            return res.end(err.message)
        } 
        res.status(200)
        console.log(result)
        res.render("utisci", {utisci: result})
        return res.end();
    })
})


//--------------------- PROIZVOD BRISANJE ---------------------

app.post('/proizvod_brisanje/:id', (req,res) => {
    var id = req.params.id;
  
    var sql = "DELETE FROM proizvodi WHERE id=" + id
    connection.query(sql,(err,result, fields) => {
        if (err) throw err;
        else res.redirect('/meni');
    })
})
    
//---------------------- PROIZVOD_IZMENA --------------------
app.get('/proizvod_izmena/:id', (req,res) => {
    var id = req.params.id;
    var sql = "SELECT * FROM proizvodi WHERE id = " + id;
    var values = [
    [
        req.body.slika, req.body.ime, req.body.opis, req.body.cena
    ]
    ]
    connection.query(sql, [values], (err,result) => {
        if (err) throw err;
        res.render('proizvod_izmena', {proizvodi: result})
    })
      
})

app.post('/update/:id', (req,res) => {
    var data = {slika: req.body.slika, ime: req.body.ime, opis:req.body.opis, cena: req.body.cena };
    const id = req.body.id;
    var sql = "UPDATE proizvodi SET slika='"+req.body.slika+"', ime='"+req.body.ime+"', opis='"+req.body.opis+"', cena='"+req.body.cena+"'WHERE id="+ req.params.id;
    var query = connection.query(sql,(err,result) =>{
        if (err) throw err;
        else {
            res.redirect('/meni') }
    })
})
   



    
    
// ------------------ DETALJNIJE ----------------------------
app.get('/detaljnije/:id', (req,res) => {
    var id = req.params.id;
  
    var sql = "SELECT * FROM proizvodi WHERE id=" + id
    connection.query(sql,(err,result) => {
        if (err)  {
            res.status(500)
            return res.end(err.message)
        } 
        res.status(200)
        console.log(result)
        res.render("detaljnije", {detaljnije: result})
        return res.end();
    })
})


// ------------------ OSTAVI_UTISAK ----------------------------
app.get('/ostavi_utisak', (req,res) => {
    res.render('ostavi_utisak')
})

app.post('/ostavi_utisak', (req,res) => {
    var sql = "INSERT INTO utisak (ime, email, utisak) VALUES ?"
    var values = [
        [
        req.body.ime, req.body.email, req.body.utisak
        ]
    ]
    connection.query(sql, [values], (err,result) => {
        if(err) throw err;
        res.redirect('ostavi_utisak')
    })
})


//----------------- UTISAK_BRISANJE ------------------

app.post('/utisak_brisanje/:id', (req,res) => {
    var id = req.params.id;
  
    var sql = "DELETE FROM utisak WHERE id=" + id
    connection.query(sql,(err,result, fields) => {
        if (err) throw err;
        else res.redirect('/utisci');
    })
})




// ------------------- LOGIN ---------------------
app.get('/login', (req,res) => {
    res.render('login')
})


app.post('/login', (req,res) => {
var email = req.body.email
var lozinka = req.body.lozinka
if(email && lozinka){
    connection.query("SELECT * FROM korisnik WHERE email = ? AND lozinka = ?", [ email, lozinka], function (err, result, fill) {
        
        if(result.length>0) {
            req.session.user= {
                email: email
            }
        
           
            res.redirect('/')
        }
        else{ res.redirect('login')}
}
    )
}})


 // ------------------ BLOG ----------------------------
app.get('/blog', (req,res) => {
    res.render('blog')
})


// ------------------ REGISTRACIJA ----------------------------
app.get('/registracija', (req,res) => {

    res.render('register')
})

app.post('/registracija', (req,res) => {
    var sql = "INSERT INTO korisnik (ime, prezime, broj_tel, grad, adresa, email, lozinka) VALUES ?"
    var values = [
        [
            req.body.ime, req.body.prezime, req.body.broj_tel, req.body.grad, req.body.adresa, req.body.email, req.body.lozinka
        ]

    ]
    connection.query(sql,[values],(err,result)=>{
        if (err) throw err;
        res.redirect('login')
    })

})


var port = 3000;
app.listen(port,() => {
    console.info(`listening on port ${port}`)
});