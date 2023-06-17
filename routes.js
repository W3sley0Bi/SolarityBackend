const express = require('express');
const router = express.Router();
const auth = require('./src/api/auth/auth');
const user = require('./src/api/user/user');
const form = require('./src/api/formHandler/fillPDF')
const passport = require('passport');
const {deleteProject} = require('./src/api/delete/deleteFunctions')

// passport.authenticate('jwt', { session: false }),


// Auth //////////////////////////////////////////////
router.post('/registration', async (req,res,next) =>{    
   await auth.registration(req,res,next)
});

router.get(`getPools`, async (req,res,next)=>{
  await auth.getPools(req,res,next);
});

router.post('/login', async (req,res,next) =>{    
    await auth.login(req,res,next);
});

router.post('/deleteProfile', async (req,res,next) =>{    
    await auth.deleteProfile(req,res,next);
});

router.post('/updateProfile', async (req,res,next) =>{    
    await auth.updateProfile(req,res,next);
});

router.post('/showProfile', async (req,res,next) =>{    
    await auth.showProfile(req,res,next);
});

//api not tested
router.post('/updateToPremium', async (req,res,next) =>{    
    await auth.updateToPremium(req,res,next);
});





// Users /////////////////////////////////////////////
router.get('/workers', passport.authenticate('jwt', { session: false }), async (req,res,next) =>{    
    await user.workers(req,res,next);
});

router.post('/:Uid/createProject', passport.authenticate('jwt', { session: false }),async(req, res, next)=>{
    await user.createProject(req,res,next);
})

router.get('/userFolder/:Uid', passport.authenticate('jwt', { session: false }), async (req,res,next)=>{
    await user.userFolder(req,res,next);
})

//get porject content [FolderContent].js Page
router.get(`/userFolder/:Uid/:ProjectContent`, passport.authenticate('jwt', { session: false }),async (req,res,next)=>{
	await user.getProjectContent(req,res,next);
});


router.post(`/formSign`, passport.authenticate('jwt', { session: false }),async (req,res,next)=>{
	await form.fillPDF(req,res,next);
    
});

router.post(`/deleteFile`, passport.authenticate('jwt', { session: false }),async (req,res,next)=>{
    await deleteFile(req,res,next);

    
});

router.post(`/deleteProject`, passport.authenticate('jwt', { session: false }),async (req,res,next)=>{
	await deleteProject(req,res,next);
    
});

// router.delete(`/deleteUser`, passport.authenticate('jwt', { session: false }),async (req,res,next)=>{
// 	await form.DeleteUser(req,res,next);
    
// });

// Company ///////////////////////////////////////

router.get('/companyFolder/:Uid', passport.authenticate('jwt', { session: false }), async (req,res,next)=>{
    await user.companyDash(req,res,next);
})







module.exports = router;



