const express =require("express")
const path=require("path")
const body_parser=require("body-parser")
const ejs =require("ejs")
const session= require("express-session")
const router=require("./Routes/pages")
const fileupload=require("express-fileupload")
const flash=require("connect-flash");
const app=express()
app.use(body_parser.json())
app.use(body_parser.urlencoded({extended:false}))
app.use(flash())
const sess_time=1000 * 60 * 60 * 2
sess_secret="ssh! quiet, its a \secret"
sess_name="sid"

const sess=app.use(session({
    name:sess_name,
    resave:false,
    saveUninitialized:false,
    secret:sess_secret,
    cookie:{
    maxAge:sess_time,
    sameSite:true
    }
}))

app.set("view engine","ejs")
app.set("views",path.join(__dirname,"views"))
app.use(express.static(path.join(__dirname,"static_css",)))
app.use(fileupload({
    useTempFiles:true,
    tempFileDir:path.join(__dirname,"/static_css/upload/")
}))

const  redirectUser=(req,res,next)=>{
    if(!req.session.Id ){
        req.flash("errors","Session Over Please Log In")
        res.redirect("/user/login")
    }
    else{
        next()
}}
const  redirectResident=(req,res,next)=>{
    if(!req.session.Id ){
        req.flash("errors","Session Over Please Log In")
        res.redirect("/resident/login")
    }
    else{
        next()
}}
let redirectHome=(req,res,next)=>{
      if(!req.session.userId ){
          req.flash("errors","Session Over Please Log In")
            res.redirect("/user/login")
    }
    else{
        next()
}
}
let redirectPost=(req,res,next)=>{
      if(!req.session.userId ){
        //   res.statusCode(403)
          res.send("Please Log In")   
    }
    else{
        next()
}
}
let redirectResidentPost=(req,res,next)=>{
      if(!req.session.Id ){
        //   res.statusCode(403)
          res.send("Please Log In")   
    }
    else{
        next()
}
}
app.use((req, res, next)=> {
  res.locals.user = req.session.user;
  next();
});

        app.post("/admin/verify",router)
        app.post("/resident/add/deposit",redirectResidentPost,router)
        app.post("/tenant/verify",router)
        app.get("/home/dashboard",redirectUser,router)
        app.get("/get/users",router)
        app.get('/resident/qrcodes',router)

        app.get("/resident/add/occupant",redirectResident,(req,res)=>{
res.render("home/resident/add_occupants")
        })
        app.post("/tenant/add/occupants",redirectResidentPost,router)
        app.get("/resident/occupants",redirectResident,router)
        app.post("/shuttle/update/profile",router)
        app.get("/user/shuttle/update",redirectUser,router)
        app.get("/users/:role/:status",router)
        app.post("/admin/user/confirmed/:id",redirectPost,router)
        app.post("/admin/status/payment/:id",redirectPost,router)
         app.post("/admin/user/status/payment/:id",redirectPost,router)
        app.get("/admin/payment/shuttle/rejected",redirectHome,(req,res)=>{
            res.render("home/admin/shuttle_rejected.ejs")
        })
        app.get("/revenue/payment/download",router)
        app.get("/admin/list/business",router)
        app.get("/admin/resident/occupants",redirectHome,router)
         app.get("/admin/business/management",redirectHome,(req,res)=>{
             res.render("home/admin/business_management.ejs")
         })
         app.get("/admin/resident/payment/:drive",router)
        app.get("/admin/user/deposit/:role",router)
        app.get("/dashboard",(req,res)=>{
res.render("home/resident/dashboard_copy.ejs")
        })
        app.get("/admin/deposit/shuttle",redirectHome,(req,res)=>{
            res.render("home/admin/pending_shuttle.ejs")
        })


        app.get("/admin/add/domestic/staff",redirectHome,(req,res)=>{
            res.render("home/admin/add_dom_staff.ejs")
        })

        app.post("/admin/add/staff",router)
        app.get("/resident/download/paid",router)
        app.use("/logout",router)
        app.get("/admin/list/resident/active",router)
        app.get("/admin/list/resident/inactive",router)

        app.get("/admin/active/resident",redirectHome,(req,res)=>{
            res.render("home/admin/resident_active")
        })
        app.get("/resident/p/change",redirectResident,(req,res)=>{
            res.render("home/resident/pass_change.ejs")
        })
        app.delete("/resident/delete/occupant/:id",redirectResidentPost,router)
        app.post("/resident/change/p/",redirectResident,router)
        app.get("/api/user",router)
        app.get("/admin/inactive/resident",redirectHome,(req,res)=>{
   res.render("home/admin/resident_inactive")
        })
        app.get("/apartment/drives/:drive",router)
        app.get("/dashboard",router)
        app.post("/tenant/register/domestic",router)
        app.get("/resident/dashboard",redirectResident,router)
        app.post("/tenant/register/",router)

        app.get("/admin/resident/add/payment",redirectHome,(req,res)=>{
                res.render("home/admin/add_payment_resident.ejs")
                        })
        app.get("/admin/shuttle/add/payment",redirectHome,(req,res)=>{
                res.render("home/admin/add_payment_shuttle.ejs")
                        })
        app.get("/user/logout",router)
        app.get("/resident/logout",router)
        app.get("/api/users/:role",router)
        app.get("/forget/password",(req,res)=>{
            req.flash("errors","Please Contact Admin To Change Password")
            res.redirect("/user/login")
        })
         app.get("/resident/forget/password",(req,res)=>{
            req.flash("errors","Please Contact Admin To Change Password")
            res.redirect("/resident/login")
        })
        app.get("/u/password/change/",redirectUser,router)
        app.post("/u/change/password",redirectPost,router)
        app.get("/api/business/:role/:driveNo",router)
        app.get("/admin/business/add/payment",redirectHome,(req,res)=>{
        res.render("home/admin/add_payment_corner.ejs")
                })

        app.post("/admin/add/apartment",redirectPost,router)
        app.get("/admin/add/payment",redirectHome,(req,res)=>{
        res.render("home/admin/add_payment.ejs")
                })
        app.get("/admin/residents",redirectHome,(req,res)=>{
        res.render("home/admin/tenant_list.ejs")
                })
        app.get("/admin/view/revenue",redirectHome,(req,res)=>{
        res.render("home/admin/revenue_list.ejs")
        })
        app.get("/admin/resident/rejected",redirectHome,(req,res)=>{
            res.render("home/admin/resident_rejected.ejs")
        })
        app.get("/admin/resident/confirmed",redirectHome,(req,res)=>{
            res.render("home/admin/resident_confirmed.ejs")
        })
        app.get("/admin/users",router)
        app.post("/verify/staff",router)
        app.get("/apartments/:driveNo",router)
        app.get("/admin/profile",redirectUser,router)
        app.get("/residents/:drive",router)
        app.get("/admin/list/resident",router)
        app.get("/admin/payment/resident/confirmed",router)
        app.post("/admin/confirm/deposit/:id",redirectPost,router)
        app.get("/admin/payment/resident/paid",router)
        app.get("/admin/resident/pending",redirectHome,(req,res)=>{
            res.render("home/admin/pending_resident.ejs")
        })
        app.get("/admin/deposit/resident",router)
        app.get("/admin/payment/resident/rejected",router)
        app.get("/admin/edit/house/:id",redirectUser,router)
        app.post("/admin/update/house/:id",redirectPost,router)

        app.post("/admin/deactivate/user/:id",redirectPost,router)

        app.get("/resident/edit/domestic/:id",router)
        app.get("/business/edit/staff/:id",redirectHome,router)
        app.get("/shuttle/edit/driver/:id",router)

        app.get("/resident/view/deposit",router)
        app.get("/resident/update/domestic/:id",router)
        app.get("/business/update/staff/:id",redirectHome,router)
        app.get("/shuttle/update/driver/:id",router)
        app.post("/admin/add/shuttle",router)
        app.get("/admin/edit/shuttle/:id",router)
        app.get("/admin/edit/business/:id",router)
        app.get("/admin/add/shuttle/owner",redirectHome,(req,res)=>{
        res.render("home/admin/add_shuttle.ejs")
                })

        app.post("/admin/add/business",redirectPost,router)

        app.get("/admin/add/business/owner",redirectHome,(req,res)=>{
            res.render("home/admin/add_business.ejs")
        })
        app.get("/admin/confirmed/business",redirectHome,(req,res)=>{
res.render("home/admin/business_confirmed.ejs")
        })
        app.post("/admin/user/confirm/deposit/:id",redirectPost,router)
        app.get("/admin/business/paid",router)
         app.get("/admin/rejected/business",redirectHome,(req,res)=>{
res.render("home/admin/business_rejected.ejs")
        })
           app.get("/admin/pending/business",redirectHome,(req,res)=>{
            res.render("home/admin/pending_business.ejs")
        })
        app.get("/admin/houses",router)
        app.get("/admin/shuttle",redirectUser,router)
        app.get("/admin/shuttle/management",redirectHome,(req,res)=>{
            res.render("home/admin/shuttle_management.ejs")
        })
        app.get("/admin/shuttle/confirmed",redirectHome,(req,res)=>{
            res.render("home/admin/shuttle_confirmed.ejs")
        })
        app.get("/admin/view/resident/deposit",router)
        app.get("/admin/business/management",router)
        app.get("/admin/view/domestic/staff",redirectHome,(req,res)=>{
            res.render("home/admin/admin_dom.ejs")
        })
        app.get("/api/domestic/staff",router)
        app.get("/shuttle/add/driver",redirectHome,(req,res)=>{
            res.render("home/shutterBus/add_driver.ejs")
        })
        app.get("/resident/confirmed/search/:name",router)
        app.post("/admin/business/edit/:id",redirectPost,router)
        app.get("/admin/business/update/:id",redirectUser,router)
        app.get("/admin/apartments",redirectHome,(req,res)=>{
            res.render("home/admin/house_management.ejs")
        })

    app.get("/residents/search/:name",router)
        app.get("/admin/payment/business/paid",router)
       app.get("/admin/revenue/payment",router)
       app.get("/admin/list/outstanding",router)
       app.get("/admin/revenue/paid/user",redirectHome,(req,res)=>{
           res.render("home/admin/revenue_paid.ejs")
       })
       app.get("/admin/revenue/paid",router)
       app.get("/admin/outstanding",redirectHome,(req,res)=>{
           res.render("home/admin/outstanding.ejs")
       })
       app.post("/admin/make/payment",redirectPost,router)
        app.get("/admin/resident/update/:id",redirectUser,router)
        app.post("/resident/make/payment",router)
        app.post("/user/make/payment",redirectPost,router)
        app.post("/admin/resident/edit/:id",redirectPost,router)
        app.post("/admin/add/user",redirectPost,router)
        app.post("/fake",router)
        app.get("/api/driver",router)
        app.get("/admin/drivers",redirectHome,(req,res)=>{
            res.render("home/admin/view_driver.ejs")
        })
        app.post("/admin/user/edit/:id",redirectPost,router)
        app.get("/resident/dashboard/view/domestic",router)
        app.get("/admin/update/:id",redirectUser,router)
        app.get("/apartment/edit/:id",router)
        app.post("/user/update/",redirectPost,router)
        app.post("/shuttle/register/driver",router)
        app.post("/user/add/deposit",router)
        app.get("/admin/shuttle/drivers",router)
        app.get("/admin/business/staffs",router)
        app.get("/business/view/staff",router)
        app.get("/business/user/add",redirectHome,(req,res)=>{
            res.render("home/business_owner/add_staff")
        })
        app.get("/business/search/:name",router)
        app.get("/admin/shuttle/update/:id",router)
        app.get("/sw.js",(req,res)=>{

           
            res.header("Content-Type","text/javascript")
            res.setHeader("Content-Type","text/javascript")
            res.type(".js")
            res.sendFile(__dirname+"/sw.js")
            
        })
        app.get("/domestic/search/:name",router)
        app.get("/admin/download/business",router)
        app.get("/profile/edit",redirectResident,router)
        app.post("/resident/update/profile",redirectResident,router)
        app.get("/shuttle/manager/home",router)
        app.get("/user/shuttle/management",router)
        app.post("/revenue/type",redirectUser,router)
        app.get("/user/shuttle/drivers",router)
        app.get("/add/deposit",redirectHome,(req,res)=>{
            res.render("home/shutterBus/shutter_deposit.ejs")
        })
        app.get("/business/manager/home",router)
        app.get("/user/business/management",router)
        app.get("/user/business/staff",router)
        app.get("/admin/resident/report",router)
        app.post("/resident/report",router)


        app.get("/shuttle/add/deposit",redirectHome,(req,res)=>{
            res.render("home/shutterBus/shutter_deposit.ejs")
        })

     
        app.get("/shuttle/home",router)
        app.get("/shuttle/view/driver",router)
        app.get("/business/add/deposit",redirectHome,(req,res)=>{
            res.render("home/business_owner/business_deposit")
        })
        app.get("/upload/file",router)
        app.get("/admin/users/:role/:status",router)
        app.get("/shuttle/view/deposit",redirectHome,router)
        app.get("/business/view/deposit",redirectHome,router)
        app.get("/business/home",redirectHome,router)
        app.get("/user/login",(req,res)=>{

        res.render("home/login.ejs",{
            errors:req.flash("errors")
        })
            })
            app.get("/admin/verify",redirectHome,(req,res)=>{
                res.render("home/checkDomId.ejs")
                    })
        app.get("/shuttle/home",router)
      
        app.get("/admin/add/users",redirectHome,(req,res)=>{
        res.render("home/admin/add_user.ejs")
            })
        app.get("/admin/view/users",redirectHome,(req,res)=>{
            res.render("home/admin/user_list.ejs")
        })
        app.get("/admin/view/users/edit",redirectHome,(req,res)=>{
                res.render("home/admin/edit_user.ejs")
            })
        app.get("/resident/make/deposit",redirectResident,(req,res)=>{
            res.render("home/resident/resident_deposit.ejs")
        })
        app.get("/resident/list/download",router)

        app.get("/delete/resident/:id",router)
        app.get("/admin/delete/user/:id",router)
        app.get("/admin/shuttle/delete/:id",router)
        app.get("/admin/business/delete/:id",router)
         app.delete("/resident/delete/domestic/:id",router)
        app.get("/resident/login",(req,res)=>{
        res.render("home/login_tenant.ejs",{
            errors:req.flash("errors")
        })
            })
      
        app.get("/error",(req,res)=>{
                res.statusCode=404
                res.render("error.ejs")
            })
       
       app.get("/resident/dashboard/add",redirectResident,(req,res)=>{
                res.render("home/resident/add_dom_staff.ejs")
            })
        app.get("/admin/houses/add",(req,res)=>{
            res.render("home/admin/apartment.ejs")
            })
        
        app.get("/admin/add/tenant",redirectHome,(req,res)=>{ 
            res.render("home/admin/add_tenant.ejs")
        })

        //handling error
        app.use((req,res,next)=>{
        let err=new Error("Page not found")
        err.status=404;
        next(err)
        })
        app.use((err,req,res,next)=>{
        res.status(err.status || 500)
        res.send(err.message)
        })
            
        const port=process.env.PORT || 8080;
        app.listen(port,(err)=>{
            console.log(`http://localhost:${port} `)
        })
        module.exports=app
