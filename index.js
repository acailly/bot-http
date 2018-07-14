const http = require("http");
const url = require("url");
const fs = require("fs");

module.exports = function(vorpal) {
  vorpal
    .command("http [port]")
    .description("Receive commands on HTTP")
    .action(function(args, callback) {
      const port = args.port || 80;

      let capturedConsoleOutput = "";
      var server = http.createServer(function(request, res) {
        const queryData = url.parse(request.url, true).query;

        if (queryData.command) {
          const command = queryData.command;
          console.log("[http] Requested", command);
          vorpal.exec(command, result => {
            let body = capturedConsoleOutput;
            if (result) {
              body += "\n" + result;
            }
            capturedConsoleOutput = "";
            answer(body, res);
          });
        } else {
          const indexPage = fs.readFileSync(__dirname + "/index.html");
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(indexPage, "utf-8");
        }
      });
      server.listen(port);
      console.log("Server is running on port", port);

      vorpal.pipe(stdout => {
        capturedConsoleOutput += stdout;
        return stdout;
      });

      callback();
    });
};

function answer(body, res) {
  const content_length = body.length;
  res.writeHead(200, {
    "Content-Length": content_length,
    "Content-Type": "text/plain"
  });
  res.end(body);
}
