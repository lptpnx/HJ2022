const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const ejs = require('ejs')
const mysql = require('mysql')
const crypto = require('crypto')
const session = require('express-session');
const DynamoDBStore = require('connect-dynamodb')({session});

var DynamoDBStoreOptions = {
    table: "db-session", //保存先のテーブル名　デフォルトは"sessions"
    hashKey: "session-id", //ハッシュキー　デフォルトは"id"
    prefix: "session",    //ハッシュキーに付与するプレフィックス デフォルトは"sess"
    AWSConfigJSON: {
        region: 'us-east-1',
        correctClockSkew: true,
        httpOptions: {
            secureProtocol: 'TLSv1_method',
            ciphers: "ALL"
        },
    },
};

app.use(session({
    store: new DynamoDBStore(DynamoDBStoreOptions),
    name:'session-name',
    secret: 'session-secret-key',
    resave: false,
    saveUninitialized: false,
}));


const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'mydb'
});

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}));

connection.connect((err) => {
  // DBへの接続に失敗した場合の処理
  if (err) throw err
})
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  if(req.session.username){
    return res.render("top.ejs",{name:req.session.username});
  }else{
    return res.render('login.ejs',{err:""});
  }
});


app.post("/top", (req,res)=>{
  
  id =  req.body.login_id;
  pass =  req.body.login_pass;
  
  if(id === "" && pass === "") {
    return res.render('login.ejs',{err:'入力を確認してください'});
  }
  
  pass = crypto.createHash('sha256').update(req.body.login_pass).digest('hex')
    
connection.query('SELECT * FROM user', (err, results, fields) => {
  if (err) {
    // エラー処理
    throw err
  };

   for (i = 0; i < results.length; i++) {
    if(id===results[i].user_id){
      if (pass===results[i].password){
        req.session.username = results[i].name;
        return res.render('top.ejs', {name:results[i].name})
      }else{
        return res.render('login.ejs',{err:'パスワードが正しくありません。'});
      }
    }
   }
   return res.render('login.ejs',{err:'IDもしくはパスワードが正しくありません。'});
});
})

app.listen(3000, () => {
  console.log('start')
})