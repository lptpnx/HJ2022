const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const ejs = require('ejs')
const mysql = require('mysql')
const crypto = require('crypto')


const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'mydb'
})

connection.connect((err) => {
  // DBへの接続に失敗した場合の処理
  if (err) throw err
})
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render('login.ejs',{err:""});
});


  app.post("/top", (req,res)=>{
    
    id =  req.body.login_id;
    pass =  req.body.login_pass;
    
    if(id === "" && pass === "") {
      res.render('login.ejs',{err:'入力を確認してください'});
    }
    
    pass = crypto.createHash('sha256').update(req.body.login_pass).digest('hex')
    
connection.query('SELECT * FROM user', (err, results, fields) => {
  if (err) {
    // エラー処理
    throw err
  }

   for (i = 0; i < results.length; i++) {
    if(id===results[i].user_id){
      if (pass===results[i].password){
        res.render('top.ejs', {name:results[i].name})
      }else{
        res.render('login.ejs',{err:'パスワードが正しくありません。'});
      }
    }
   }
   res.render('login.ejs',{err:'IDもしくはパスワードが正しくありません。'});
});
})

app.listen(3000, () => {
  console.log('start')
})