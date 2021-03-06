const express = require('express');
const router = express.Router();
const path = require('path');
const pg = require('../API/JavaScript/libpgdatabase');
const auth = require('../API/JavaScript/libauth');
const libREST = require('../API/JavaScript/librest');
const pathHTML = path.join(__dirname, "../API/HTML");
const pathSQL = path.join(__dirname, "../DATA/tblUser/");
const fs = require('fs');
const insertAll = fs.readFileSync(pathSQL + 'insertAll.sql', 'utf8');
const selectAll = fs.readFileSync(pathSQL + 'selectAll.sql', 'utf8');
const selectByUserID = fs.readFileSync(pathSQL + 'selectByUserID.sql', 'utf8');
const updateUserName = fs.readFileSync(pathSQL + 'updateUserName.sql', 'utf8');
const updatePassword = fs.readFileSync(pathSQL + 'updatePassword.sql', 'utf8');
const deleteAll = fs.readFileSync(pathSQL + 'deleteAll.sql', 'utf8');
const selectAllSharedToDoList = fs.readFileSync(pathSQL + 'selectAllSharedToDoList.sql', 'utf8');
const insertSharedToDoList = fs.readFileSync(pathSQL + 'insertSharedToDoList.sql', 'utf8');
const deleteSharedToDoList = fs.readFileSync(pathSQL + 'deleteSharedToDoList.sql', 'utf8');


/* GET users listing. */
router.get('/', async function (req, res) {
  if (auth.isAuth(req.query.token)) {
    res.sendFile(pathHTML + "/user.html");
  } else {
    res.redirect('/');
  }
});

//Lager nye sql-data
router.post('/create', async function (req, res) {
  const params = [req.body.fdUserName, req.body.fdPassword];
  const result = await pg.insert(insertAll, params);
  if (result.err !== undefined) {
    console.log(result.err.stack);
    if (result.err.message.includes("tblUser_unique")) {
      result.err = undefined;
      result.rows = "User name is not unique";
    }else {
      res.status(500).end();
      return;
    }
  }
  res.status(200).json(result.rows).end();
});

//Lager ny liste abonent sql-data
router.post('/createsharedtodolist', async function (req, res, next) {
  libREST.post(
    async function () {
      const params = [
        parseInt(req.body.fdSharedUserID),
        parseInt(req.body.fdToDoListID),
        parseInt(req.body.fdUserID),
        req.body.fdCaption
      ];
      return await pg.insert(insertSharedToDoList, params);
    }, req, res, next
  ).then();
});

//Henter sql-data
router.post('/read', async function (req, res, next) {
  libREST.post(
    async function () {
      if (req.body.fdUserID === undefined) {
        return await pg.select(selectAll);
      } else {
        const params = [req.body.fdUserID];
        return await pg.select(selectByUserID, params);
      }
    }, req, res, next
  ).then();
});


//Henter sql-data
router.post('/readsharedtodolist', async function (req, res, next) {
  libREST.post(
    async function () {
      const params = [parseInt(req.body.fdUserID)];
      return await pg.select(selectAllSharedToDoList, params);
    }, req, res, next
  ).then();
});

//Oppdaterer sql-data
router.post('/updateusername', async function (req, res, next) {
  req.body.fdUserID = parseInt(req.body.fdUserID);
  libREST.post(
    async function () {
      const params = [
        req.body.fdUserID,
        req.body.fdUserName
      ];
      const result = await pg.update(updateUserName, params);
      if (result.err !== undefined) {
        if (result.err.message.includes("tblUser_unique")) {
          result.err = undefined;
          result.rows = "User name is not unique";
        }
      }
      return result;
    }, req, res, next
  ).then();
});

//Oppdaterer sql-data
router.post('/updatepassword', async function (req, res, next) {
  req.body.fdUserID = parseInt(req.body.fdUserID);
  libREST.post(
    async function () {
      const params = [
        req.body.fdUserID,
        req.body.fdPassword
      ];
      return await pg.update(updatePassword, params);
    }, req, res, next
  ).then();
});

//Sletter sql-data
router.post('/delete', async function (req, res, next) {
  req.body.fdUserID = parseInt(req.body.fdUserID);
  libREST.post(
    async function () {
      const params = [
        req.body.fdUserID
      ];

      let result = null;
      const sqlCommands = deleteAll.split(";");
      for (let index = 0; index < sqlCommands.length; index++) {
        console.log(sqlCommands[index]);
        result = await pg.delete(sqlCommands[index], params);
        if (result.err !== undefined) {
          break;
        }
      }
      return result;
    }, req, res, next
  ).then();
});

//Sletter liste abonent
router.post('/deletesharedtodolist', async function (req, res, next) {
  libREST.post(
    async function () {
      const params = [
        parseInt(req.body.fdSharedUserID),
        parseInt(req.body.fdToDoListID),
        parseInt(req.body.fdUserID)
      ];
      return await pg.insert(deleteSharedToDoList, params);
    }, req, res, next
  ).then();
});

module.exports = router;
