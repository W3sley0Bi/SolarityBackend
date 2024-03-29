const config = require("../../../config");
const { db } = require("../../modules/DBConnection");
const { pythonClac } = require("../pythonBackend/pythonBackendCalc");
const { syncWeather } = require("../pythonBackend/pythonBackendCalc");
const { fetchDBReport_toShow } = require("../report/report");
// super user //////////////////////////////////////////

//test user list api for super user
async function workers(req, res, next) {
  try {
    if (req.user[0].role_fk == 1) {
      db.query(`SELECT role_fk,idUser FROM user`, (err, result, fields) => {
        if (result.length === 0)
          return res.status(401).json({ message: `No token found` });
        return res.status(200).json(result);
      });
    } else {
      return res.status(403).json({ message: "Access Denied" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
    next(err);
  }
}

// basic //////////////////////////////////////////

async function createProject(req, res, next) {
  try {
    db.query(
      `INSERT INTO projects (name, duration, assigned_user_id) VALUES (?,?,?)`,
      [req.body.projectName, req.body.projectDuration, req.body.uid],
      (err, result, fields) => {
        if (err) throw err;
        res.status(200).json({ message: "project Created" });
      }
    );
  } catch (err) {
    res.status(400).json({ message: err.message });
    next(err);
  }
}

async function opendUserFolder(req, res, next) {
  try {
    db.query(
      ` SELECT projects.*, COALESCE(counttbl.count, 0) AS count
      FROM projects
      LEFT JOIN (
        SELECT project_id, COUNT(*) AS count
        FROM field_product
        GROUP BY project_id
      ) AS counttbl ON counttbl.project_id = projects.idProject
      WHERE assigned_user_id = '${req.params.Uid}' AND status='0'`,
      (err, result, fields) => {
        if (err) throw err;
        res.json(result);
      }
    );
  } catch (err) {
    res.status(400).json({ message: err.message });
    next(err);
  }
}
async function closedUserFolder(req, res, next) {
  try {
    db.query(
      `SELECT * FROM projects WHERE assigned_user_id = '${req.params.Uid}' AND status='2' `,
      (err, result, fields) => {
        if (err) throw err;
        res.json(result);
      }
    );
  } catch (err) {
    res.status(400).json({ message: err.message });
    next(err);
  }
}
async function userFolder(req, res, next) {
  try {
    db.query(
      ` SELECT projects.*, COALESCE(counttbl.count, 0) AS count
      FROM projects
      LEFT JOIN (
        SELECT project_id, COUNT(*) AS count
        FROM field_product
        GROUP BY project_id
      ) AS counttbl ON counttbl.project_id = projects.idProject
      WHERE assigned_user_id = '${req.params.Uid}'
      ORDER BY projects.status`,
      (err, result, fields) => {
        if (err) throw err;
        res.json(result);
      }
    );
  } catch (err) {
    res.status(400).json({ message: err.message });
    next(err);
  }
}
async function inProgressUserFolder(req, res, next) {
  try {
    db.query(
      `SELECT * FROM projects WHERE assigned_user_id = '${req.params.Uid}' AND status='1' `,
      (err, result, fields) => {
        if (err) throw err;
        res.json(result);
      }
    );
  } catch (err) {
    res.status(400).json({ message: err.message });
    next(err);
  }
}

async function userDateForUpdate(req, res, next) {
  try {
    db.query(
      `SELECT * FROM projects WHERE assigned_user_id = '${req.params.Uid}' AND idProject = '${req.params.Content}' `,
      (err, result, fields) => {
        if (err) throw err;
        res.json(result[0]);
      }
    );
  } catch (err) {
    res.status(400).json({ message: err.message });
    next(err);
  }
}

async function getProjectContent(req, res, next) {
  //this is the list of the products
  try {
    db.query(
      `SELECT * FROM field_product WHERE project_id = '${req.params.Content}' `,
      (err, result, fields) => {
        if (err) throw err;
        res.status(200).json({ result });
      }
    );
  } catch (err) {
    res.status(400).json({ message: err.message });
    next(err);
  }
}

//define python fun

async function startCalculations(req, res, next){
  // porjectID: req.body.id
  // project duration: req.body.duration
  // project forcedCalc : req.body.forcedCalc
  try {
    db.query(
      `UPDATE projects SET status='1' WHERE idProject = '${req.body.id}' `,
      (err, result, fields) => {
        if (err) throw err;
        if (req.body.forcedCalc == true) {pythonClac(req.body.id,req.body.duration)}
        if(req.body.forcedCalc == false) {}
        
        res.status(200).json({ message: "Calculations started" });
      }
    );
  } catch (err) {
    res.status(400).json({ message: err.message });
    next(err);
  }
}


async function forceSync(req, res, next){
  // porjectID: req.body.id
  // project duration: req.body.duration
  // project forcedCalc : req.body.forcedCalc
  try {
    syncWeather(req.body.uid)
    res.status(200).json({ message: "Weather Sync Done" })
    ;
  } catch (err) {
    res.status(400).json({ message: err.message });
    next(err);
  }
}



async function updatedProject(req, res, next) {
  try {
    db.query(
      `UPDATE projects SET name='${req.body.projectName}', duration='${req.body.projectDuration}' WHERE idProject = '${req.body.idProject}' `,
      (err, result, fields) => {
        if (err) throw err;
        res.status(200).json({ message: "project Updated" });
      }
    );
  } catch (err) {
    res.status(400).json({ message: err.message });
    next(err);
  }
}

// TO DO
// async function addProjectContentElement(req, res, next){

// }

async function deleteProjectContentElement(req, res, next) {
  db.query(
    `DELETE FROM field_product WHERE project_id='${req.body.project_id}' AND field_product_id='${req.body.field_product_id}'`,
    (err, result, fields) => {
      if (err) throw err;
    }
  );

  res.json({ status: 200, message: "Prrodotto removed from the project" });
}

// Company //////////////////////////////////////////

//READ PRODUCT LIST
async function companyDash(req, res, next) {
  try {
    db.query(
      `SELECT * FROM company_product WHERE provider_id = '${req.params.Uid}'`,
      (err, result, fields) => {
        if (err) throw err;
        res.status(200).json(result);
      }
    );
  } catch (err) {
    res.status(400).json({ message: err.message });
    next(err);
  }
}

//READ ALL PRODUCTS
async function getAllProducts(req, res, next) {
  try {
    db.query(
      `SELECT name, product_id FROM company_product`,
      (err, result, fields) => {
        if (err) throw err;
        res.status(200).json(result);
      }
    );
  } catch (err) {
    res.status(400).json({ message: err.message });
    next(err);
  }
}

// CREATE PRODUCT
async function createProduct(req, res, next) {
  try {
    db.query(
      `INSERT INTO company_product (name, peakpower, provider_id, temp_coff, system_loss, area, nominal_temp) VALUES (?,?,?,?,?,?,?)`,
      [
        req.body.productName,
        req.body.productPeakPower,
        req.body.uid,
        req.body.tempCoff,
        req.body.systemLoss,
        req.body.area,
        req.body.nomTemp,
      ],
      (err, result, fields) => {
        if (err) throw err;
        res.status(200).json({ message: "Product Created" });
      }
    );
  } catch (err) {
    res.status(400).json({ message: err.message });
    next(err);
  }
}

// ADD PRODUCT TO PROJECT
async function addProduct(req, res, next) {
  try {
    db.query(
      `INSERT INTO field_product (project_id, lon, lat, utc_offset, tilt, orientation, company_product_id) VALUES (?,?,?,?,?,?,?)`,
      [
        req.params.Content,
        req.body.lon,
        req.body.lat,
        req.body.utc_offset,
        req.body.tilt,
        req.body.orientation,
        req.body.company_product_id,
      ],
      (err, result, fields) => {
        if (err) throw err;
        res
          .status(200)
          .json({
            message: "Product Added,".concat(result.insertId.toString()),
          });
      }
    );
  } catch (err) {
    res.status(400).json({ message: err.message });
    next(err);
  }
}

// UPDATE PRODUCT

async function updatedProduct(req, res, next) {
  try {
    db.query(
      `UPDATE field_product SET lon=${req.body.lon}, lat=${req.body.lat}, tilt=${req.body.tilt}, utc_offset=${req.body.utc_offset}, orientation='${req.body.orientation}', company_product_id=${req.body.company_product_id} WHERE field_product_id = ${req.body.field_product_id} AND project_id=${req.params.Content}`,
      (err, result, fields) => {
        if (err) throw err;
        res.status(200).json({ message: "Product Updated" });
      }
    );
  } catch (err) {
    res.status(400).json({ message: err.message });
    next(err);
  }
}

async function getReport(req, res, next) {
  try {
    data = await fetchDBReport_toShow(req.params.pid)
    res.status(200).json({ content: data})
  } catch (err) {
    res.status(400).json({ message: err.message });
    next(err);
  }
}

async function getProductContent(req, res, next) {
  try {
    console.log(req.body)
    db.query(
      `SELECT * FROM company_product WHERE provider_id='${req.params.Uid}' AND product_id='${req.params.Content}'`,
      (err, result, fields) => {
        console.log(result)
        if (err) throw err;
        res.status(200).json(result);
      }
    );
  } catch (err) {
    res.status(400).json({ message: err.message });
    next(err);
  }
}

async function modifyCompanyData(req, res, next) {

  const keys = Object.keys(req.body);
//   console.log(req.body)
// console.log(typeof req.body.data)
  try {

    db.query(
      `UPDATE company_product SET ${keys[0]}='${req.body.data}' WHERE product_id=${req.body.product_id}`,
      (err, result, fields) => {
        if (err) throw err;
        res.status(200).json({ message: "Product Updated" });
      }
    );
  } catch (err) {
    res.status(400).json({ message: err.message });
    next(err);
  }
}




module.exports = {
  workers,
  createProject,
  userFolder,
  getProjectContent,
  companyDash,
  createProduct,
  getAllProducts,
  addProduct,
  updatedProduct,
  deleteProjectContentElement,
  updatedProject,
  userDateForUpdate,
  closedUserFolder,
  opendUserFolder,
  inProgressUserFolder,
  startCalculations,
  getReport,
  forceSync,
  getProductContent,
  modifyCompanyData
};
