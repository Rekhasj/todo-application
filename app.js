const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());

let db = null;
const dbPath = path.join(__dirname, "todoApplication.db");

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Running Server at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB error:${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();
//API 1
app.get("/todos/", async (request, response) => {
  const { search_q = "", priority, satus = "", status } = request.query;
  let getTodoQuery = "";
  switch (true) {
    case priority !== undefined && status !== undefined:
      getTodoQuery = `SELECT * FROM todo
    where todo LIKE "%${search_q}%" 
    and status = '${status}'
    and priority= '${priority}';`;
      break;
    case status !== undefined:
      getTodoQuery = `SELECT * FROM todo
    where todo LIKE "%${search_q}%" 
    and status = '${status}';`;
      break;
    case priority !== undefined:
      getTodoQuery = `SELECT * FROM todo
    where todo LIKE "%${search_q}%" 
    and priority= '${priority}';`;
      break;
    default:
      getTodoQuery = `SELECT * FROM todo
    where todo LIKE "%${search_q}%";`;
      break;
  }
  const todoArray = await db.all(getTodoQuery);
  response.send(todoArray);
});
//API 3
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const addTodoQuery = `INSERT INTO 
    todo(id,todo,priority,status)
    VALUES(${id},'${todo}','${priority}','${status}');`;
  const dbResponse = await db.run(addTodoQuery);
  response.send("Todo Successfully Added");
});
//API 2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
    SELECT * FROM todo
    WHERE id = ${todoId};`;
  const todo = await db.get(getTodoQuery);
  response.send(todo);
});

//API 4
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { todo, status, priority } = request.body;
  let updateTodoQuery = "";
  let result = "";
  switch (true) {
    case status !== undefined:
      updateTodoQuery = `
    UPDATE todo 
    SET status ='${status}'
    WHERE id=${todoId};`;
      result = "Status";
      break;
    case priority !== undefined:
      updateTodoQuery = `
    UPDATE todo 
    SET priority = '${priority}'
    WHERE id=${todoId};`;
      result = "Priority";
      break;
    case todo !== undefined:
      updateTodoQuery = `
    UPDATE todo 
    SET todo ='${todo}'
    WHERE id=${todoId};`;
      result = "Todo";
      break;
  }
  await db.run(updateTodoQuery);
  response.send(`${result} Updated`);
});
//API 5
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `DELETE FROM todo
   WHERE id=${todoId} ;`;
  await db.run(deleteQuery);
  response.send("Todo Deleted");
});
module.exports = app;
