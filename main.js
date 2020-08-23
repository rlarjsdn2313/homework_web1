const express = require("express"); // express 모둘을 import한다.
const app = express(); // app이라는 객체를 만든다.
const cookieParser = require("cookie-parser"); // cookie-parser를 import 한다.
const bodyParser = require("body-parser"); // body-parser을 import 한다.
const login = require("./lib/login.js"); // login모듈을 import 한다.
const url = require("url"); // url을 분석하기 위해서
const fs = require("fs"); // 파일을 읽기 위해서
const sanitizeHtml = require("sanitize-html");
const path = require("path"); // 파일을 분석하기 위해서
const template = require("./lib/template.js");

app.use(bodyParser()); // bodyParser을 사용한다고 한다.
app.use(cookieParser()); // cookieParser을 사용한다고 한다.
app.set("view engine", "ejs"); // ejs파일을 보여준다고 한다.

// name은 사용자의 이름을 담을 쿠키
// check은 로그인 확인 정보를 담을 쿠키

app.get("/", function (req, res) {
  res.clearCookie("name"); // name이라는 쿠키를 삭제한다.
  res.clearCookie("check"); // check이라는 쿠키를 삭제한다.
  res.render("login.ejs"); // login.ejs파일을 보여준다.
});

app.post("/", function (req, res) {
  // '/login_process로 암호화한 input값를 준다.
  res.redirect(`/login_process/?id=${login.encrypt(req.body.id)}`);
});

// '/login_process'으로 get데이터를 받는다.
app.get("/login_process", function (req, res) {
  var _url = req.url; // 현재 접속한 url을 가져온다.
  var queryData = url.parse(_url, true).query; // 쿼리 데이터를 분석해서 가져온다.
  var pass = login.decrypt(queryData.id); // 쿼리 아이디를 복호화한다.
  var result = login.compare(pass); // login의 compare 함수로 멤버를 비교한다.

  // 그리고 결과에 따라 쿠키값을 생성한다.
  if (result != "false") {
    res.cookie("check", "true");
    res.cookie("name", result);
    // '/main' 경로로 이동한다.
    res.redirect("/main");
  } else {
    res.cookie("name", "wrong");
    res.cookie("check", "false");
    res.redirect("/main");
  }
});

app.get("/main", function (req, res) {
  //보안 코드...
  if (req.cookies.check == "false" || req.cookies.check == undefined) {
    res.redirect("/");
  } else {
    var article_list = []; // 글 목록 배열을 만든다.
    var i = 0; // while문을 위한 변수를 생성한다.
    var article = ""; //글을 담을 변수를 작성
    var html = ""; // 최종적으로 보여줄 html변수를 만든다.

    // data변수에 있는 파일, 디렉토리 배열을 가져온다.
    article_list = fs.readdirSync("data");
    article_list.splice(article_list.indexOf("comment"), 1); // comment 폴더는 글이 아니기 때문에 리스트에서 지운다.
    article_list = article_list.sort(function (a, b) {
      // 배열 정렬
      return a - b;
    });

    i = article_list.length - 1; //글의 갯수 - 1
    while (0 <= i) {
      article = fs.readFileSync(`data/${article_list[i]}`, "utf8"); //글을 읽어온다.
      comment = fs.readFileSync(`data/comment/${article_list[i]}`, "utf8");
      html =
        html + // 보여줄 코드를 작성
        `
      <center>
      <style>
        ::-webkit-scrollbar {
          width:10px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #555;
        }

        .comment {
          width: 430px;
          height: 30px;
          outline: none;
          border-radius: 6px;
          border: 2px solid #aaa;
          padding: 8px;
          box-sizing: border-box;
          transition: 0.2s;
        }
  
        .comment:focus {
          border-color: dodgerblue;
          box-shadow: 0 0 8px 0 dodgerblue;
        }

        .go {
          height: 32px;
          border: none;
          background-color: #B2FF76;
          margin: 2px;
          border: none;
          color: black;
          text-align: center;
          text-decoration: none;
          font-size: 16px;
          display: inline-block;
          cursor: pointer;
          -webkit-transition-duration: 0.4s;
          transition-duration: 0.4s;
          border-radius: 10px;
          font-weight: bold;
        }
        .go:hover {
          background-color: dodgerblue;
          color: white;
          box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.2),
            0 6px 20px 0 rgba(0, 0, 0, 0.19);
        }
      
        .check {
          height: 32px;
          border: none;
          background-color: #B2FF76;
          margin: 2px;
          border: none;
          color: black;
          text-align: center;
          text-decoration: none;
          font-size: 16px;
          display: inline-block;
          cursor: pointer;
          -webkit-transition-duration: 0.4s;
          transition-duration: 0.4s;
          border-radius: 10px;
          font-weight: bold;
        }

        .check:hover {
          background-color: dodgerblue;
          color: white;
          box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.2),
            0 6px 20px 0 rgba(0, 0, 0, 0.19);
        }
      </style>
      <div align="left" style="overflow-y: scroll; width: 500px;
      height: 500px; border-radius: 1px; background-color: #FFFFFF
      ">
      ${article}
      <br><br><br><br><br><br><br>
      <input class="check" type="button" onclick="page()" value="자세히"></input>
      <br><br><br><br><br>
      ${comment}
      </div>
      <br>
      <form action="/comment_process" method="POST"">
        <input type="text" autocomplete="off" class="comment" name="comment" placeholder="댓글을 입력하세요.">
        <input type="hidden" name="post" value=${article_list[i]}>
        <input type="submit" value="등록" class="go">
      </form>
        <script>
          function page() {
            location.href = "/page/${article_list[i]}"
          } 
        </script>
      </center>
      <br><br><br><br><br>
      `;
      i = i - 1;
    }
    res.render("main.ejs", { description: html }); // ejs 파일에 html을 전달하고 렌더링
  }
});

//여기부터 새로
app.get("/page/:pageId", function (req, res) {
  if (req.cookies.check == "false" || req.cookies.check == undefined) {
    res.redirect("/");
  } else {
    var id = req.params.pageId; // :pageId를 가져온다.
    var filteredId = (id = path.parse(id).base);

    if (id == undefined) {
      // :pageId가 없을 경우 리다이렉션
      res.redirect("/");
    } else {
      try {
        var comment = fs.readFileSync(`data/comment/${filteredId}`, "utf8"); //댓글을 읽어온다.
        var article = fs.readFileSync(`data/${filteredId}`, "utf8"); // 글을 읽어오기
        res.render("page.ejs", {
          description: 

          `<center>
          <div style="
          width: 900px;
          height: 480px;
          overflow-y: scroll;
          text-align: left;
          ">` + 
          article +
          `</div>
          </center>
          `
          , // 입력창과 comment의 내용을 같이 전달한다.
          comments:
            `    
            <style>
            ::-webkit-scrollbar {
              width:10px;
            }
    
            ::-webkit-scrollbar-track {
              background: #f1f1f1;
              border-radius: 10px;
            }
    
            ::-webkit-scrollbar-thumb {
              background: #888;
              border-radius: 10px;
            }
    
            ::-webkit-scrollbar-thumb:hover {
              background: #555;
            }
            .comment {
              width: 430px;
              height: 30px;
              outline: none;
              border-radius: 6px;
              border: 2px solid #aaa;
              padding: 8px;
              box-sizing: border-box;
              transition: 0.2s;
            }
      
            .comment:focus {
              border-color: dodgerblue;
              box-shadow: 0 0 8px 0 dodgerblue;
            }
    
            .go {
              height: 32px;
              border: none;
              background-color:#B2FF76;
              margin: 2px;
              border: none;
              color: black;
              text-align: center;
              text-decoration: none;
              font-size: 16px;
              display: inline-block;
              cursor: pointer;
              -webkit-transition-duration: 0.4s;
              transition-duration: 0.4s;
              border-radius: 10px;
              font-weight: bold;
            }
            .go:hover {
              background-color: dodgerblue;
              color: white;
              box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.2),
                0 6px 20px 0 rgba(0, 0, 0, 0.19);
            }
          </style>
          <center>
          <form action="/comment_process" method="POST">
            <input type="text" autocomplete="off" class="comment" name="comment" placeholder="댓글을 입력하세요.">
            <input type="hidden" name="post" value=${filteredId}>
            <input type="submit" class="go" value="등록">
          </form>
          ` + comment + '</center>',
        }); //article 값을 준다.
      } catch {
        res.render("error.ejs"); // 에러가 있다면 에러를 보여준다.
      }
    }
  }
});

app.post("/comment_process", function (req, res) {
  var before_comment = fs.readFileSync(`data/comment/${req.body.post}`, "utf8");

  fs.writeFile(
    `data/comment/${req.body.post}`,
    `
  <br><br>
  ${req.body.comment}    <br><font size="2em">${
      req.cookies.name
    }  ${template.get_time()}</font>
  ` + before_comment,
    "utf8",
    function (error) {}
  );

  res.redirect(`/page/${req.body.post}`); // page의 포스트로 이동한다.
});

app.get("/create", function (req, res) {
  if (req.cookies.check == "false" || req.cookies.check == undefined) {
    res.redirect("/");
  } else {
    res.render("create.ejs"); //create.ejs렌더링
  }
});

app.post("/create_process", function (req, res) {
  if (req.cookies.check == "false" || req.cookies.check == undefined) {
    res.redirect("/");
  } else {
    var article_list = [];
    var title = 1;
    var i = 0;
    var description = sanitizeHtml(req.body.description); // 입력 보안을 위해서 한번 소독을 한다.

    article_list = fs.readdirSync("data"); // 파일 목록을 받아온다.
    article_list.splice(article_list.indexOf("comment"), 1); // comment 폴더는 글이 아니기 때문에 리스트에서 지운다.
    while (article_list.indexOf(String(title)) != -1) {
      title = title + 1;
    }

    fs.writeFile(`data/${title}`, description, "utf8", function (error) {
      // 파일 생성
    });
    fs.writeFile(
      `data/comment/${title}`,
      `
    <br><br><br><br><br><br>
    <font size="2em">
      글 작성일: ${template.get_time()} 작성자: ${req.cookies.name}
    </font>
    <br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>
    `,
      "utf8",
      function (error) {
        // 댓글 파일 생성
      }
    );
    res.redirect("/main"); // /main으로 리다이렉션 한다.
  }
});

app.listen(80); // 3000번 포트에서 듣는다.
