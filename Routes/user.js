const connection=require("../core/connection")
const bcrypt=require("bcryptjs")
const csvtojson=require("csvtojson")
const file=require("express-fileupload")
const path=require("path")
const fs = require('fs');
const {v4 : uuidv4} = require('uuid')
const Json2csvParser = require('json2csv').Parser;

  const newId = uuidv4()

exports.delete_resident=(req,res)=>{
 let {id} =req.params
 let sql="delete from tenant where telId=?"
  connection.query(sql,[id],(err,result)=>{
      if (err) throw err
      else  res.redirect("/admin/residents")
      }) 
}
exports.fake=(req,res)=>{
   res.send("user Made")
}
exports.user_list=(req,res)=>{
   let sql=`Select user.fullname,user.image,user.telephone,role,username,status,userId  
from user where role Not in ("ShuttleOwner","BusinessOwner")
`
   connection.query(sql,(err,result)=>{
      res.send({
        result })
     
   })
}
 exports.update_resident=(req,res)=>{
      let {id} =req.params
      let sql=`SELECT tenant.fullname,tenant.username,tenant.tenId ,tenant.telephone,tenant.status, resident_house.houseNo, resident_house.houseType,resident_house.driveNo,tenant.status,tenant.email
      FROM tenant INNER JOIN resident_house ON tenant.tenId=resident_house.telId where tenId=?`

         connection.query(sql,[id],(err,result)=>{
         if (err) throw err
         else  
         res.render("home/admin/resident_edit.ejs",{body:result})
           }) 
 }
exports.update_user=(req,res)=>{   
         let {id} =req.params    
         let userId=req.session.userId 
let sql=`SELECT * FROM user where userId=${id}`
let profile=`select fullname,role from user where userId=${userId}`  

         connection.query(sql,(err,result)=>{
            connection.query(profile,(err,profile)=>{
         if (err) throw err
         else  
         console.log(result)
         res.render("home/admin/edit_user.ejs",{body:result,profile:profile})
           }) 
             }) 
 }

exports.edit_business_admin=(req,res)=>{
   let {id} =req.params
   let sql=`select user.userId, user.fullname,user.username, user.telephone, user.status,user.email, business_meta.shop_name, business_meta.driveNo
 from business_meta inner join  user
on user.userId=business_meta.userId where user.userId=${id}`
 connection.query(sql,(err,result)=>{
         if (err) throw err
         else  
         res.render("home/admin/edit_business.ejs",{body:result})
           }) 
}

exports.edit_user=(req,res)=>{
      let {id} =req.params
      
      let body=req.body
       let body_roles=JSON.stringify(body.role.trim())
      let telephone=JSON.stringify(body.telephone.trim());
      let username= JSON.stringify(body.username.trim());      
      let fullname=JSON.stringify( body.name.trim());
      let password=JSON.stringify(bcrypt.hashSync(body.password,14))
      let email=body.email;
      let status=JSON.stringify(body.status)
      let role=body.role.trim()
      let is_ResidentManger=0;
      let is_SuperAdmin=0;
      let is_ShuttleManager=0;
      let is_CornerShopManger=0;
      let is_RevenueManger=0;
      let roles=role.split(",")
        
         if(role.includes("Resident Manager")){
is_ResidentManger=1
         }
          if(role.includes("Shuttle Bus Manager")){
is_ShuttleManager=1

         }
         if(role.includes("Corner Shop Manager")){
is_CornerShopManger=1

         }
           if(role.includes("Revenue Manager")){
is_RevenueManger=1

         }
           if(role.includes("Super Admin")){
is_SuperAdmin=1

         }




  if(JSON.stringify(req.body.password)==""){
 let sql=`update user set username=${username},telephone=${telephone},role=${body_roles},fullname=${fullname},status=${status}
 ,is_SuperAdmin=${is_SuperAdmin},is_ResidentManager=${is_ResidentManger},is_RevenueManager=${is_RevenueManger},is_ShuttleManager=${is_ShuttleManager},is_CornerShopManager=${is_CornerShopManger}
 where userId=?`
   connection.query(sql,[id],(err,result)=>{

   if (err) throw err
   else res.send("User Has Been Updated Successfully") 
  })
}
else {
 let sql=`update user set username=${username},telephone=${telephone},role=${body_roles},fullname=${fullname},status=${status}
 ,password=${password},is_SuperAdmin=${is_SuperAdmin},is_ResidentManager=${is_ResidentManger},is_RevenueManager=${is_RevenueManger},is_ShuttleManager=${is_ShuttleManager},is_CornerShopManager=${is_CornerShopManger}
 where userId=?`
   connection.query(sql,[id
],(err,result)=>{
  if (err) throw err
   // else  res.redirect("/admin/list/tenant")
   else res.send("User Has Been Updated Successfully")
  })  
}
}

exports.resident_password=(req,res)=>{
  let tenId=req.session.Id 
  let body=req.body
  let password=JSON.stringify(bcrypt.hashSync(body.password,14))
  let sql=`update tenant set password=${password} where tenId=${tenId}`

  connection.query(sql,(err,response)=>{
     res.send("Password Updated Successfully")
  }
  )
}

exports.edit_shuttle_admin=(req,res)=>{
    let {id} =req.params
   let sql=`select user.userId, user.fullname,user.username, user.telephone, user.status,user.email, shuttle_meta.no_bus
 from shuttle_meta inner join  user
on user.userId=shuttle_meta.userId where user.userId=${id}`
 connection.query(sql,[id],(err,result)=>{
         if (err) throw err
         else  
         res.render("home/admin/edit_shuttle.ejs",{body:result})
           }) 
}
exports.edit_user_user=(req,res)=>{
     let id=req.session.userId
      let body=req.body
      let username= body.username;
      let telephone=body.telephone;
      let fullname= body.name;

    
 if(req.files == undefined || null){
   let sql="update user set username=?,telephone=?,fullname=? where userId=?"
  
   connection.query(sql,[username,telephone,fullname,id
],(err,result)=>{
   if (err) throw err
   else res.send("Your Profile Has Been Updated Successfully")
  }) 
 }
   else if(req.files){
    
     let image=req.files.image
    let img_name=newId
    let img=JSON.stringify(newId)
      let uploadDir=path.join(path.dirname(__dirname),"static_css/upload",img_name)

      if(image.mimetype=="image/jpeg" || image.mimetype=="image/png"){
         image.mv(uploadDir,function(err) {                           
                     if (err){
                     console.log(err)
                        return res.status(500).send(err);
                     }
 let sql="update user set username=?,telephone=?,fullname=?,image=? where userId=?"
  
   connection.query(sql,[username,telephone,fullname,img,id
],(err,result)=>{
   if (err) throw err
   else res.send("Profile Updated Successfully")
  }) 

                  }
         )}
               }
            }
exports.update_business=(req,res)=>{
      let id =req.params.id
      let body=req.body
      let username= body.username;
      let shop_name= body.shop_name;
      let telephone=body.telephone;
      let fullname= body.name;
      let no_shop= body.no_shop;
      let status=body.status
      
if(req.body.password === ""){
 let sql="update user set username=?,telephone=?,fullname=?,status=? where userId=?"
   let sql1=`update business_meta set shop_name=?,no_shops=? where userId=${id}`
  
   connection.query(sql,[username,telephone,
fullname,status,id
],(err,result)=>{
   if (err) throw err
   connection.query(sql1,[shop_name,no_shop],(err,result)=>{

   if (err) throw err
   else res.send("User Has Been Updated Successfully")
  }) 
  })
}
else {
   let password=bcrypt.hashSync(body.password.trim(),14)
 let sql="update user set username=?,telephone=?,password=?,fullname=?,status=? where userId=?"
   let sql1=`update business_meta set shop_name=?,no_shops=? where userId=${id}`
  
   connection.query(sql,[username,telephone,password,
fullname,status,id
],(err,result)=>{
   if (err) throw err
   connection.query(sql1,[shop_name,no_shop],(err,result)=>{

   if (err) throw err
   // else  res.redirect("/admin/list/tenant")
   else res.send("User Has Been Updated Successfully")
  }) 
  })  
}
  
}

exports.shuttle=(req,res)=>{
      let {id} =req.params
      let body=req.body
      let username= body.name;
      let no_bus= body.no_bus;
      let telephone=body.telephone;
      let fullname= body.name;
      let password=bcrypt.hashSync(body.telephone,14)
      let status=body.status
      

if(body.password==""){
 let sql="update user set username=?,telephone=?,fullname=?,status=? where userId=?"
   let sql1=`update shuttle_meta set no_bus=? where userTd=${id}`
  
   connection.query(sql,[username,telephone,
fullname,status,id
],(err,result)=>{
   connection.query(sql1,[no_bus],(err,result)=>{

   if (err) throw err
   else res.send("User Has Been Updated Successfully")
  }) 
  })
}
else {
 let sql="update user set username=?,telephone=?,password=?,fullname=?,status=? where userId=?"
   let sql1=`update shuttle_meta set no_bus=? where userId=${userId}`
  
   connection.query(sql,[username,telephone,password,
fullname,status,id
],(err,result)=>{
   connection.query(sql1,[no_bus],(err,result)=>{

   if (err) throw err
   // else  res.redirect("/admin/list/tenant")
   else res.send("User Has Been Updated Successfully")
  }) 
  })  
}
  
}


exports.get_dom_staff=(req,res)=>{
      telId = req.session.Id;
   let sql0="SELECT * FROM `tenant` WHERE `tenId`='"+telId+"'";
 let sql=`select * from domestic_staff where telId=?`
 connection.query(sql,[telId],(err,result)=>{
    connection.query(sql0,[telId],(err,contact)=>{
    res.render("home/resident/view_dom.ejs",{body:result,profile:contact})
    })
 })
}

 exports.edit_resident=(req,res)=>{

      let {id} =req.params
      let body=req.body
     
      

  let username= body.username.trim();
      let houseNo=body.houseNo.trim();
      let telephone=body.telephone.trim();
      let fullname= body.name.trim();
      let driveNo=body.driveNo.trim()
      let status=body.status.trim()
      
        
if(req.body.password === ""){
   console.log(req.body.password)
  let sql="update tenant set username=?,telephone=?,fullname=?, status=? where tenId=?"
   let sql1="update resident_house set driveNo=?,houseNo=? where telId=?"
   connection.query(sql,[username,telephone,
fullname,status,id

],(err,result)=>{
    connection.query(sql1,[driveNo,houseNo,id],(err,result)=>{

    })
   if (err) throw err
   // else  res.redirect("/admin/list/tenant")
   else res.send("Resident Updated Successfully")
  }) 
   }
  else {
     let username= JSON.stringify(body.username.trim());
      let houseNo=body.houseNo.trim();
      let telephone=JSON.stringify(body.telephone.trim());
      let fullname= JSON.stringify(body.name.trim());
      let driveNo=body.driveNo.trim()
      let status=JSON.stringify(body.status.trim())
        let password=JSON.stringify(bcrypt.hashSync(body.password.trim(),14))
   let sql=`update tenant set username=${username},telephone=${telephone},password=${password},fullname=${fullname}, status=${status} where tenId=?`

   let sql1="update resident_house set driveNo=?,houseNo=? where telId=?"
     
connection.query(sql,[id],(err,result)=>{
  connection.query(sql1,[driveNo,houseNo,id],(err,result)=>{

    })
   if (err) throw err
   else res.send("Resident Updated Successfully")
  }) 
  }

}

exports.update_resident_profile=(req,res)=>{
     let id = req.session.Id
      let body=req.body
      let username= body.username.trim();
      let telephone=body.telephone.trim();
      let fullname= body.name.trim();
 
 if(req.files){
    
     let image=req.files.image
      let img_name=newId
   
      let sql="update tenant set username=?,telephone=?,fullname=?,image=? where tenId=?"
      let uploadDir=path.join(path.dirname(__dirname),"static_css/upload",img_name)

      if(image.mimetype=="image/jpeg" || image.mimetype=="image/png"){
         image.mv(uploadDir,function(err) {                           
                     if (err){
                     console.log(err)
                        return res.status(500).send(err);
                     }
                     connection.query(sql,[username,telephone,
                     fullname,
                     img_name,id

                     ],(err,result)=>{
                        if (err) throw err
                        else res.send("Resident Updated Successfully")
                     }
                     )
                        });
      
   }
  }
else if(!req.files){
let sql="update tenant set username=?,telephone=?,fullname=? where tenId=?"
connection.query(sql,
[username,telephone,
fullname,
id

],(err,result)=>{
   if (err) throw err
   else res.send("Resident Updated Successfully")
}
)
}





}
exports.delete_occupant=(req,res)=>{
     let {id}=req.params
   let sql=`delete from occupants where id=?`
   connection.query(sql,[id],(err,result)=>{

res.send("Occupant Has Been Removed Successfully")
   })
}
exports.add_tenant=(req,res)=>{
     let post  = req.body;
       let username= post.name;
       let houseNo=post.houseNo;
       let telephone=post.telephone;
       let fullname= post.name;
       let driveNo=post.driveNo
       let Uid=makeId()
       let password=bcrypt.hashSync(post.telephone,14)
       let status="Active"
       const sql = "INSERT INTO tenant(fullname,username,telephone,password,status,unique_id) VALUES ('" + fullname + "','" + username + "','" + telephone + "','" + password + "','" + status + "','" + Uid + "')";
       const sql1="Update resident_house set telId=? where houseNo=? and driveNo=?"
 
   let insertSql=  connection.query(sql)
   let query=()=>{
   return new Promise((resolve,reject)=>{
   let err=false
   if(!err){
   resolve(insertSql)

      }
   else {reject()}
            })
   }
   async function payment(){
   const user=await query()
   return user }
   payment().then((user)=>{
   connection.query(sql1,[user.insertId,houseNo,driveNo],(err,result)=>{
      
   res.send("Resident Have Been Added Successfully ")
   })
   })
    }
exports.occupant_list=(req,res)=>{
let userId=req.session.userId
   let profile=`select user.fullname,role from user where userId=${userId}`;
     let sql=`SELECT tenant.fullname as resident,tenant.telephone as resident_telephone, 
   resident_house.houseNo, resident_house.houseType,resident_house.driveNo,occupants.fullname as occupant,occupants.unique_id 
,occupants.telephone,occupants.gender
  FROM tenant INNER JOIN resident_house ON tenant.tenId=resident_house.telId
 INNER JOIN occupants ON occupants.telId=tenant.tenId`
   connection.query(sql,(err,result)=>{
      connection.query(profile,(err,profile)=>{
         if(err) throw err
   res.render("home/admin/occupants",{body:result,profile})
   })    
   })

}
exports.resident_list=(req,res)=>{
   let userId=req.session.userId
   let profile=`select user.fullname,role from user where userId=${userId}`;
     let sql=`SELECT tenant.fullname,tenant.tenId ,tenant.image ,tenant.telephone,tenant.unique_id, resident_house.houseNo, resident_house.houseType,resident_house.driveNo,tenant.status
      FROM tenant INNER JOIN resident_house ON tenant.tenId=resident_house.telId`
   connection.query(sql,(err,result)=>{
      connection.query(profile,(err,profile)=>{
         if(err) throw err
   res.send({result,profile})
   })    
   })
  }
  exports.whi=(req,res)=>{
    let userId=req.session.userId
    let profile=`select user.fullname,role from user where userId=${userId}`;
    connection.query(profile,(err,profile)=>{
res.send(profile)
    }) 
  }
  exports.resident_inactive=(req,res)=>{
        let userId=req.session.userId
        let status="InActive"
   let profile=`select user.fullname,role from user where userId=${userId}`;
     let sql=`SELECT tenant.fullname,tenant.tenId ,tenant.image ,tenant.telephone, resident_house.houseNo, resident_house.houseType,resident_house.driveNo,tenant.status
      FROM tenant INNER JOIN resident_house ON tenant.tenId=resident_house.telId where tenant.status="InActive"`
   connection.query(sql,(err,result)=>{
      connection.query(profile,(err,profile)=>{
         if(err) throw err
   res.send({result,profile})
   })    
   })
  }
exports.resident_active=(req,res)=>{
        let userId=req.session.userId
        let status="Active"
   let profile=`select user.fullname,role from user where userId=${userId}`;
     let sql=`SELECT tenant.fullname,tenant.tenId ,tenant.image ,tenant.telephone, resident_house.houseNo, resident_house.houseType,resident_house.driveNo,tenant.status
      FROM tenant INNER JOIN resident_house ON tenant.tenId=resident_house.telId where tenant.status="Active"`
   connection.query(sql,(err,result)=>{
      if(err) throw err
      connection.query(profile,(err,profile)=>{
         if(err) throw err
   res.send({result,profile})
   })    
   })
  }
exports.house_list=(req,res)=>{
   
   let sql=`SELECT tenant.fullname ,tenant.telephone,resident_house.id ,
   resident_house.houseNo,resident_house.telId, resident_house.houseType,resident_house.amount,
   resident_house.driveNo,tenant.status,tenant.email
      FROM tenant right JOIN resident_house ON tenant.tenId=resident_house.telId`
   connection.query(sql,(err,result)=>{ 
   res.send(result)
   })

}
// exports.import_data=(req,res)=>{
//      let u_password="08059282539"
//    let password=JSON.stringify(bcrypt.hashSync(u_password,14))
//     const sql = `update user set password=${password} where userId=37`;
//       connection.query(sql, function(err, result) {
//             console.log(err)
//       })
// }
exports.import_data=(req,res)=>{
// let amount
csvtojson().fromFile(path.resolve(__dirname,"../static_css/data","data2.csv")).then(source=>{
   for(let i=0 ;i<source.length;i++){
    console.log(source[i])
//    let driveNo=JSON.stringify(source[i]['DRIVE'])
//    let apartment_type=JSON.stringify(source[i]['HSE TYPE'])
    let fullname=JSON.stringify(source[i]['FULLNAME'])
    let username=fullname
//    let houseNo=JSON.stringify(source[i]['HOUSE NO'])
   let telephone=JSON.stringify(source[i]['TELEPHONE'])
   let shop_name=JSON.stringify(source[i]['SHOP NAME'])
//    let username_input=`Drive ${source[i]['DRIVE']} ${source[i]['HOUSE NO']}`
//    let username=JSON.stringify(username_input)
   let Password_input='Password123'
   let Password=JSON.stringify(bcrypt.hashSync(Password_input,14))
//       //       console.log(source[i])
// //       let fullname=JSON.stringify(source[i]['Fullname'])
// //       let Bal_2012=JSON.stringify(source[i]['BAL 2012/13'])
// //       let Bal_2014=JSON.stringify(source[i]['BAL IN 2014/15'])
// //       let Bal_2016=JSON.stringify(source[i]['BAL IN 2016/17'])
// //       let Bal_2018=JSON.stringify(source[i]['BAL IN 2018'])
// //       let Bal_2019=JSON.stringify(source[i]['BAL IN 2019'])
// //       let amount_due_2020=JSON.stringify(source[i]['AMOUNT DUE 2020'])
// //       let amount_paid_2020=JSON.stringify(source[i]['AMOUNT PAID 2020'])
// //       let amount_2020_bal=JSON.stringify(source[i]['2020 BAL PAYMENT'])
//    let sql=`INSERT INTO user(fullname,username,telephone,password,status) 
// VALUES (${fullname} ,${username}, ${telephone} ,${Password},"Active")`

 let sql1=`insert into business_meta(shop_name,userId) values(${shop_name},?)`
 const sql = `INSERT INTO user(fullname,username,role,telephone,password,status) VALUES (${fullname},${username},"BusinessOwner",${telephone},${Password},"Active")`;
//       let insertSql=  connection.query(sql)
//          let query=()=>{
//          return new Promise((resolve,reject)=>{
//          let err=false
//          if(!err){
//          resolve(insertSql)

//             }
//          else {reject()}
//                   })
//          }
//          async function payment(){
//          const user=await query()
//          return user }
//          payment().then((user)=>{
//          connection.query(sql1,[user.insertId],(err,result)=>{
//             if (err) throw err
        
//          })
//          })

// let house_sql=`update resident_house set telId=? where houseType=${apartment_type} && driveNo=${driveNo} && houseNo=${houseNo}`
 let insertSql=  connection.query(sql)
   let query=()=>{
   return new Promise((resolve,reject)=>{
   let err=false
   if(!err){
   resolve(insertSql)

      }
   else {reject()}
            })
   }
   async function payment(){
   const user=await query()
   return user }
   payment().then((user)=>{
   connection.query(sql1,[user.insertId],(err,result)=>{
      if (err) throw err
 
   })
   })
  
   }})}

       

// //        if(source[i]['HSE TYPE'].includes("2BEDROOM")){
// //          amount=67000
// //             let sql=`INSERT INTO resident_house(driveNo,houseNo,houseType,amount) VALUES (${driveNo }, ${houseNo} ,${apartment_type},${amount })`;
// //        connection.query(sql,(err,result)=>{
// //       if (err) throw err
// //       console.log(result)
   

// // })
// //          }
// //        else if(source[i]['HSE TYPE'].includes ("3BEDROOM")){
// //             amount=70500   
// //             let sql=`INSERT INTO resident_house(driveNo,houseNo,houseType,amount) VALUES (${driveNo }, ${houseNo} ,${apartment_type},${amount })`;
// //         connection.query(sql,(err,result)=>{
// //       if (err) throw err
// //       console.log(result)
  

// // })
// //          }
// //                else if(source[i]['HSE TYPE'].includes ("3 BEDROOM")){
// //             amount=70500   
// //             let sql=`INSERT INTO resident_house(driveNo,houseNo,houseType,amount) VALUES (${driveNo }, ${houseNo} ,${apartment_type},${amount })`;
// //         connection.query(sql,(err,result)=>{
// //       if (err) throw err
// //       console.log(result)
  

// // })
// //          }
// //               else if(source[i]['HSE TYPE'].includes ("2 BEDROOM")){
// //             amount=67000   
// //             let sql=`INSERT INTO resident_house(driveNo,houseNo,houseType,amount) VALUES (${driveNo }, ${houseNo} ,${apartment_type},${amount })`;
// //         connection.query(sql,(err,result)=>{
// //       if (err) throw err
// //       console.log(result)
  

// // })
// //          }
// //               else if(source[i]['HSE TYPE'].includes ("4 BEDROOM")){
// //             amount=74500   
// //             let sql=`INSERT INTO resident_house(driveNo,houseNo,houseType,amount) VALUES (${driveNo }, ${houseNo} ,${apartment_type},${amount })`;
// //         connection.query(sql,(err,result)=>{
// //       if (err) throw err
// //       console.log(result)
  

// // })
// //          }
// //         else if(source[i]['HSE TYPE'].includes("4BEDROOM") ){
// //          amount=74500
// //             let sql=`INSERT INTO resident_house(driveNo,houseNo,houseType,amount) VALUES (${driveNo }, ${houseNo} ,${apartment_type},${amount })`;
// //         connection.query(sql,(err,result)=>{
// //       if (err) throw err
// //       console.log(result)
   

// // })
// //          }
// //            else if(source[i]['HSE TYPE'].includes("5BEDROOM") ){
// //          amount=82000
// //             let sql=`INSERT INTO resident_house(driveNo,houseNo,houseType,amount) VALUES (${driveNo }, ${houseNo} ,${apartment_type},${amount })`;
// //         connection.query(sql,(err,result)=>{
// //       if (err) throw err
// //       console.log(result)
   

// // })
// //          }
// //              else if(source[i]['HSE TYPE'].includes("5 BEDROOM") ){
// //          amount=82000
// //             let sql=`INSERT INTO resident_house(driveNo,houseNo,houseType,amount) VALUES (${driveNo }, ${houseNo} ,${apartment_type},${amount })`;
// //         connection.query(sql,(err,result)=>{
// //       if (err) throw err
// //       console.log(result)
   

// // })
// //          }
// //             else if(source[i]['HSE TYPE'].includes("DUPLEX") ){
// //          amount=82000
// //             let sql=`INSERT INTO resident_house(driveNo,houseNo,houseType,amount) VALUES (${driveNo }, ${houseNo} ,${apartment_type},${amount })`;
// //         connection.query(sql,(err,result)=>{
// //       if (err) throw err
// //       console.log(result)
   

// // })
// //          }
// //            else if(source[i]['HSE TYPE'].includes("") ){
// //          amount
// //             let sql=`INSERT INTO resident_house(driveNo,houseNo,houseType,amount) VALUES (${driveNo }, ${houseNo} ,${apartment_type},${amount })`;
// //         connection.query(sql,(err,result)=>{
// //       if (err) throw err
// //       console.log(result)
   

// // })
// //          }
     
     
  

//    }
   
      
// }  
//    )}


 exports.add_dom=(req,res)=>{
      let post  = req.body;
      let department=JSON.stringify(post.department) 
      let Uuid=JSON.stringify(makeId())
      let address=JSON.stringify(post.address) 
      let jobType=JSON.stringify(post.jobType) 
       let location=JSON.stringify(post.location) 
       let telephone=JSON.stringify(post.telephone) 
       let fullname= JSON.stringify(post.fullname) 
      let status="Active"
      telId = req.session.Id;
      if(!req.files){
          const sql = `INSERT INTO domestic_staff(Uuid,telId,fullname,telephone,address,location,jobType,department,status) VALUES (${Uuid},${telId},${ fullname} , ${telephone} ,${address},${location},${jobType},${department},"Active");`
      connection.query(sql, function(err, result) {
      console.log(err)
      res.send("Domestic Staff Have Been Added Successfully")
       }); 
                        }
        else    if(req.files.image ){
if(req.files.image.mimetype=="image/jpeg" || req.files.image.mimetype=="image/png"){
   let image=req.files.image 
   let img_name=newId

      let img=JSON.stringify(newId)
      let uploadDir=path.join(path.dirname(__dirname),"static_css/upload",img_name)
         image.mv(uploadDir,function(err) {                           
                     if (err){

                        return res.status(500).send(err);
                     }
       const sql = `INSERT INTO domestic_staff(Uuid,telId,image,fullname,telephone,address,location,jobType,department,status) VALUES (${Uuid},${telId},${img},${ fullname} , ${telephone} ,${address},${location},${jobType},${department},"Active");`
      connection.query(sql, function(err, result) {

      res.send("Domestic Staff Have Been Added Successfully")
       }); 
      }
   )
}
            }         
    
 }

 exports.admin_add_dom=(req,res)=>{
   let post  = req.body;
   console.log(req.body)
   let department=JSON.stringify(post.department) 
   let Uuid=JSON.stringify(makeId())
   let address=JSON.stringify(post.address) 
   let jobType=JSON.stringify(post.jobType) 
    let location=JSON.stringify(post.location) 
    let telephone=JSON.stringify(post.telephone) 
    let fullname= JSON.stringify(post.fullname) 
   let status="Active"
   let telId = post.tenId;
       const sql = `INSERT INTO domestic_staff(Uuid,telId,fullname,telephone,address,location,jobType,department,status) VALUES (${Uuid},${telId},${ fullname} , ${telephone} ,${address},${location},${jobType},${department},"Active");`
   connection.query(sql, function(err, result) {
   console.log(err)
   res.send("Domestic Staff Have Been Added Successfully")
    }); 
   }





exports.resident_deposit_list=(req,res)=>{
   let userId=req.session.userId
   let profile=`select from user where userId=${userId}`
   let sql=`select resident_payment.fullname,resident_payment.id, resident_payment.amount, resident_payment.image, resident_payment.payee, resident_payment.receipt, resident_payment.status, DATE_FORMAT(resident_payment.deposit_date,"%W %D %M %Y") as deposit_date  ,tenant.username,tenant.telephone from tenant inner join resident_payment  on tenant.tenId=resident_payment.telId`

   connection.query(profile,(err,results)=>{
      connection.query(sql,(err,result)=>{
      res.render("home/admin/payment_items",{profile:results,body:result})
      })
   })
}
exports.resident_paid=(req,res)=>{
   let userId=req.session.userId;
   let profile=`select fullname,role from user where userId=${userId}`
   let sql=`
   SELECT resident_payment.id ,tenant.telephone,tenant.fullname as 
resident,resident_house.driveNo,resident_house.houseNo,resident_house.amount,
resident_payment.amount as amount_paid,resident_house.amount - resident_payment.amount as balance 
FROM ((tenant inner JOIN resident_payment ON tenant.tenId=resident_payment.telId)
inner JOIN resident_house ON resident_payment.telId=resident_house.telId) where resident_payment.status="Confirmed" group by resident_payment.telId ;

`
   connection.query(profile,(err,results)=>{
      connection.query(sql,(err,result)=>{
         console.log(req.session.userId)
      res.render("home/admin/resident_balance",{profile:results,body:result})
      })
   })
}

exports.shuttle_paid=(req,res)=>{
   let userId=req.session.userId
   let profile=`select fullname,role from user where userId=${userId}`
   let sql=``

   connection.query(profile,(err,results)=>{
      connection.query(sql,(err,result)=>{
      res.render("home/admin/resident_balance",{profile:results,body:result})
      })
   })
}


exports.resident_deposit_confirmed=(req,res)=>{
   let userId=req.session.userId
   let profile=`select fullname,role from user where userId=${userId}`
   let sql=`select resident_payment.id, resident_payment.amount,resident_payment.receipt_given, resident_payment.receipt_no,resident_payment.image, resident_payment.payee, 
resident_payment.receipt, resident_payment.status,resident_house.driveNo,resident_house.houseNo,
   DATE_FORMAT(resident_payment.deposit_date,"%W %D %M %Y") as deposit_date ,tenant.fullname,tenant.telephone
 from tenant inner join resident_payment  on tenant.tenId=resident_payment.telId
   join resident_house on tenant.tenId=resident_house.telId
   where 
   resident_payment.status="Confirmed"`

   connection.query(sql,(err,results)=>{
      connection.query(profile,(err,profile)=>{
      res.send({profile,results})
      })
   })
}
exports.resident_occupants=(req,res)=>{
   let userId=req.session.Id
    let sql=`SELECT  
   occupants.fullname ,occupants.image,occupants.gender,occupants.status
,occupants.telephone,occupants.id
from tenant
 INNER JOIN occupants ON occupants.telId=tenant.tenId where occupants.telId=${userId}
   `
 connection.query(sql,(err,result)=>{
       if(err) throw err
   res.render("home/resident/view_occupants",{body:result})
   })    
 
}
exports.add_occupants=(req,res)=>{
 let post  = req.body;
      
      let email=JSON.stringify(post.email) 
      let gender=JSON.stringify(post.gender) 
       let telephone=JSON.stringify(post.telephone) 
       let fullname= JSON.stringify(post.fullname) 
      let Uid=JSON.stringify(makeId())
      telId = req.session.Id;
      if(!req.files){
          const sql = `INSERT INTO occupants(telId,fullname,telephone,email,gender,unique_id) VALUES (${telId},${ fullname} , ${telephone} ,${email},${gender},${Uid});`
      connection.query(sql, (err, result)=> {
         console.log(err)
      res.send("Occupants Added Successfully")
       }); 
                        }
        else    if(req.files.image ){
if(req.files.image.mimetype=="image/jpeg" || req.files.image.mimetype=="image/png"){
   let image=req.files.image 
   let img_name=newId 
      let img=JSON.stringify(newId)
      let uploadDir=path.join(path.dirname(__dirname),"static_css/upload",img_name)
         image.mv(uploadDir,function(err) {                           
                     if (err){

                        return res.status(500).send(err);
                     }
       const sql = `INSERT INTO occupants(telId,image,fullname,telephone,email,gender,unique_id) VALUES (${telId},${img},${ fullname} , ${telephone} ,${email},${gender},${Uid});`
      connection.query(sql, function(err, result) {
      console.log(err)
      res.send("Occupants Added Successfully")
       }); 
      }
   )
}
            }       
}

exports.update_occupant=()=>{
   const sql = `select * from occupants`
   connection.query(sql, (err, result)=> {
   console.log(err)
   const sql = `update occupants set unique_id=${Uid} where id=${result.id});`
   connection.query(sql, function(err, result) {
   console.log(err)
    }); 
   res.send("Occupants Updated Successfully")
    }); 
   
   }



exports.user_status_payment=(req,res)=>{
   let id=req.params.id
   let body=req.body
   let status=JSON.stringify(body.status)
   let given=JSON.stringify(body.given)
   let ref_no=JSON.stringify(makeId())

   if(status.includes("Rejected")){
      let sql=`update payment_user set status=${status},receipt_no=null,receipt_given=${given} where id =${id}`
    connection.query(sql,[status,id],(err,result)=>{
        if (err) throw err
          res.send("Payment Have Been Rejected Successfully")
     
  }) 
}
  else if(status.includes("Confirmed")){
      let sql=`update payment_user set status=${status},receipt_no=${ref_no},receipt_given=${given} where id =${id}`
        connection.query(sql,[status,id],(err,result)=>{
        if (err) throw err
         res.send("Payment Have Been Confirmed Successfully")
     
  }) 
          
       }
  
}
exports.resident_reject_confirm=(req,res)=>{
   let id=req.params.id
   let body=req.body
   let status=JSON.stringify(body.status)
   let given=JSON.stringify(body.given)
   let ref_no=JSON.stringify(makeId())

   if(status.includes("Rejected")){
      let sql=`update resident_payment set status=${status},receipt_no=null,receipt_given=${given} where id =${id}`
    connection.query(sql,[status,id],(err,result)=>{
        if (err) throw err
          res.send("Payment Have Been Rejected Successfully")
     
  }) 
}
  else if(status.includes("Confirmed")){
      let sql=`update resident_payment set status=${status},receipt_no=${ref_no},receipt_given=${given} where id =${id}`
        connection.query(sql,[status,id],(err,result)=>{
        if (err) throw err
         res.send("Payment Have Been Confirmed Successfully")
     
  }) 
          
       }
  

   
}
exports.resident_drive_deposit=(req,res)=>{
    let userId=req.session.userId
   let profile=`select fullname,role from user where userId=${userId}`
   let driveNo=req.params.drive
   let sql=`select resident_payment.id, resident_payment.amount,resident_payment.receipt_given, resident_payment.receipt_no,resident_payment.image, resident_payment.payee, 
resident_payment.receipt, resident_payment.status,resident_house.driveNo,resident_house.houseNo,
   DATE_FORMAT(resident_payment.deposit_date,"%W %D %M %Y") as deposit_date ,tenant.fullname,tenant.telephone
 from tenant inner join resident_payment  on tenant.tenId=resident_payment.telId
   join resident_house on tenant.tenId=resident_house.telId
   where 
   resident_payment.status="Confirmed" and  driveNo=${driveNo};`
    connection.query(profile,(err,profile)=>{
      connection.query(sql,(err,results)=>{
      res.send({results,profile})
      })
   })
}
exports.resident_confirmed_search=(req,res)=>{
      let userId=req.session.userId
      let profile=`select fullname,role from user where userId=${userId}`
      let name=req.params.name
   let sql=`select resident_payment.id, resident_payment.amount, resident_payment.image, resident_payment.payee, resident_payment.receipt, resident_payment.status, resident_payment.receipt_given, resident_payment.receipt_no, DATE_FORMAT(resident_payment.deposit_date,"%W %D %M %Y") as deposit_date,tenant.fullname as username,tenant.telephone from tenant inner join resident_payment  on tenant.tenId=resident_payment.telId 
   where resident_payment.status="Confirmed" && resident_payment.receipt_no like '%${name}%'`

   connection.query(sql,(err,results)=>{
      connection.query(profile,(err,profile)=>{
      res.send({profile,results})
      })
   })
}
exports.revenue_type=(req,res)=>{
    let userId=req.session.userId
    let type=JSON.stringify(req.body.type)
    console.log(req.body)
    let profile=`select fullname,role from user where userId=${userId}`
   let sql=`select user.fullname as collected_by,revenue_payment.fullname,revenue_payment.telephone
,revenue_payment.receipt_given,revenue_payment.receipt,revenue_payment.type_payment,revenue_payment.amount_paid,
revenue_payment.image,revenue_payment.reciept, DATE_FORMAT(revenue_payment.date_recieved,"%W %D %M %Y") as date_recieved,
revenue_payment.receipt_no,revenue_payment.status,revenue_payment.outstanding,revenue_payment.telephone
 from revenue_payment inner join  user
on user.userId=revenue_payment.collected_by where revenue_payment.type_payment=${type} ` 
connection.query(sql,(err,result)=>{
      console.log(err)
   connection.query(profile,(err,profile)=>{
      console.log(err)
   res.send(result)
}  )
})
}
exports.resident_deposit_rejected=(req,res)=>{
   let userId=req.session.userId
   let profile=`select fullname,role from user where userId=${userId}`
   let sql=`select resident_payment.id, resident_payment.amount,resident_payment.receipt_given, resident_payment.receipt_no,resident_payment.image, resident_payment.payee, 
resident_payment.receipt, resident_payment.status,resident_house.driveNo,resident_house.houseNo,
   DATE_FORMAT(resident_payment.deposit_date,"%W %D %M %Y") as deposit_date ,tenant.fullname,tenant.telephone
 from tenant inner join resident_payment  on tenant.tenId=resident_payment.telId
   join resident_house on tenant.tenId=resident_house.telId
   where 
   resident_payment.status="Rejected"`
   connection.query(sql,(err,body)=>{
      connection.query(profile,(err,profile)=>{
      console.log(err)
      res.send({profile,body})
      })
   })
}

exports.resident_deposit_pending=(req,res)=>{
   let userId=req.session.userId
   let profile=`select fullname,role from user where userId=${userId}`
   let sql=`select resident_payment.id, resident_payment.amount, resident_payment.image, resident_payment.payee, 
resident_payment.receipt, resident_payment.status,resident_house.driveNo,resident_house.houseNo,
   DATE_FORMAT(resident_payment.deposit_date,"%W %D %M %Y") as deposit_date ,tenant.fullname,tenant.telephone
 from tenant inner join resident_payment  on tenant.tenId=resident_payment.telId
   join resident_house on tenant.tenId=resident_house.telId
   where 
   resident_payment.status="pending"`

   connection.query(profile,(err,profile)=>{
      connection.query(sql,(err,result)=>{
      res.send({result,profile})
      })
   })
}

exports.accept_user_payment=(req,res)=>{
   let {id} =req.params
  let sql="update payment_user set status=? where id=?"
   connection.query(sql,[status,id],(err,result)=>{
  console.log(result)
        if (err) throw err
       if(status=="Rejected"){
          res.send("Payment Have Been Rejected Successfully Reload Page !!!")
       }
       else if(status=="Confirmed"){
       res.send("Payment Have Been Confirmed Successfully Reload Page !!!")    
       }
  

   
  }) 

}
exports.shuttle_deposit_pending=(req,res)=>{
   let userId=req.session.userId
   let role=JSON.stringify(req.params.role)
   let profile=`select fullname,role from user where userId=${userId}`
   let sql=`select payment_user.id, payment_user.amount, payment_user.image, payment_user.payee, payment_user.receipt, payment_user.status, DATE_FORMAT(payment_user.deposit_date,"%W %D %M %Y") as deposit_date ,user.fullname,user.telephone from user inner join payment_user  on user.userId=payment_user.userId where payment_user.status="pending" && user.role=${role}
`

   connection.query(profile,(err,user_profile)=>{
      connection.query(sql,(err,body)=>{
      res.send({user_profile,body})
      })
   })
}

exports.user_deposit_status=(req,res)=>{
   let userId=req.session.userId
   let role=JSON.stringify(req.params.role)
   let status=JSON.stringify(req.params.status)
   let profile=`select fullname,role from user where userId=${userId}`
   let sql=`select payment_user.id,payment_user.receipt_given, payment_user.receipt_no,payment_user.amount, payment_user.image, payment_user.payee, payment_user.receipt, payment_user.status, DATE_FORMAT(payment_user.deposit_date,"%W %D %M %Y") as deposit_date ,user.fullname,user.telephone from user inner join payment_user  on user.userId=payment_user.userId where payment_user.status=${status} && user.role=${role}
`

   connection.query(profile,(err,user_profile)=>{
      connection.query(sql,(err,body)=>{
      res.send({user_profile,body})
      })
   })
}

exports.shuttle_accept_payment=(req,res)=>{
   let {id} =req.params
   let body=req.body
   let status=JSON.stringify(body.status)
   let given=JSON.stringify(body.given)
  let sql="update payment_user set status=?,receipt_given=? where id=?"
  connection.query(sql,[status,given,id],(err,result)=>{
  console.log(result)
      if (err) throw err
       if(status.includes("Rejected")){
          res.send("Payment Have Been Rejected Successfully Reload Page !!!")
       }
       else if(status.includes("Confirmed")){
       res.send("Payment Have Been Confirmed Successfully Reload Page !!!")    
       }
  

   
  }) 
}


exports.add_deposit=(req,res)=>{
       let post  = req.body;
       let payee=JSON.stringify(post.payee);
       let amount=JSON.stringify(post.amount);
       let receipt=JSON.stringify(post.receipt);

       let telId=req.session.Id

      if(!req.files){

         const sql = `INSERT INTO resident_payment(payee,telId,amount,receipt) VALUES (${payee},${telId} ,${amount},${receipt})`;
         connection.query(sql, (err, result)=>{
            res.send("Payment Recorded Successfully Please Contact Admin")
            }); 
                        }
                     
    else if(req.files.image.mimetype=="image/jpeg" || req.files.image.mimetype=="image/png"){ 
     let image=req.files.image
      let img_name=JSON.stringify(newId)
      let img=JSON.stringify(newId)
      let uploadDir=path.join(path.dirname(__dirname),"static_css/upload",img_name)
    
         image.mv(uploadDir,(err)=> {                           
                     if (err){
                     console.log(err)
                        return res.status(500).send(err);

                     }
      const sql = `INSERT INTO resident_payment(payee,telId,amount,receipt,image) VALUES (${payee},${telId} ,${amount},${receipt},${img})`;
         connection.query(sql, (err, result)=>{
            console.log(err)
            res.send("Payment Recorded Successfully Please Contact Admin")
            }); 
                        });
      }
     

      }   

function makeId(){
   let result="" 
  let character="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"+new Date().getFullYear()
  let karaterLength=character.length 
  for(let i=0;i<5;i++){
    result+=character.charAt(Math.random()* karaterLength)}
    console.log(result+new Date().getFullYear())   
    return result+=`${new Date().getFullYear()}` + new Date().getMilliseconds() 
  }

exports.u_password=(req,res)=>{
   let userId=req.session.userId
   console.log(req.body.password)
   let u_password=req.body.password
   let password=JSON.stringify(bcrypt.hashSync(u_password,14))
    const sql = `update user set password=${password} where userId=${userId}`;
         connection.query(sql, function(err, result) {
            console.log(err)
             req.session.destroy((err)=>{
      if(err){
         console.log(err);
      }else{
       
        
         res.send("Password Updated Successfully please Login ")
         
      }
   });
            

            }); 
}


exports.residents=(req,res)=>{
   let driveNo=req.params.drive
    const sql = `SELECT tenant.fullname,tenant.tenId ,tenant.image,tenant.unique_id ,tenant.telephone, resident_house.houseNo, resident_house.houseType,resident_house.driveNo,tenant.status
      FROM tenant INNER JOIN resident_house ON tenant.tenId=resident_house.telId  where driveNo=${driveNo}  `;
         connection.query(sql, function(err, result) {
            res.send({result})
            });  
}
exports.residents_search=(req,res)=>{
   let name=req.params.name
    const sql = `SELECT tenant.fullname,tenant.tenId ,tenant.image ,tenant.telephone, resident_house.houseNo, resident_house.houseType,resident_house.driveNo,tenant.status
      FROM tenant INNER JOIN resident_house ON tenant.tenId=resident_house.telId  where tenant.fullname like '%${name}%' ORDER BY  resident_house.houseNo  ASC` ;
         connection.query(sql,(err, result)=>{
            console.log(err)
            res.send({result})
            });  
}
exports.apartments=(req,res)=>{
   let drive=req.params.driveNo
    const sql = `SELECT telId,driveNo,houseNo,houseType from resident_house 
    where resident_house.driveNo=${drive}`;
         connection.query(sql, (err, result) =>{
            console.log(err)
            res.send(result)
            });  
}
exports.apartments_search=(req,res)=>{
   let drive=req.params.drive
    const sql = `SELECT tenant.fullname ,tenant.telephone,resident_house.id ,resident_house.houseNo,resident_house.telId, resident_house.houseType,resident_house.amount,resident_house.driveNo,tenant.status,tenant.email
      FROM tenant right JOIN resident_house ON 
      tenant.tenId=resident_house.telId where resident_house.driveNo=${drive}`;
         connection.query(sql, (err, result) =>{
            console.log(err)
            res.send(result)
            });  
}

exports.apartments_edit=(req,res)=>{
   let id=req.params.id
    const sql = `SELECT driveNo,houseNo,houseType from resident_house where resident_house.id=${id}`;
         connection.query(sql, (err, result)=> {
            console.log(err)
            res.render("home/admin/edit_apartment.ejs",{body:result})
            });  
}


exports.make_payment_resident=(req,res)=>{
       let post  = req.body;
       let payee=JSON.stringify(post.payee);
      let resident=JSON.stringify(post.resident);
       let amount=JSON.stringify(post.amount);
       let receipt=JSON.stringify(post.receipt);
      let receipt_given=JSON.stringify(post.given)
      let receipt_no=JSON.stringify(makeId())
      let status=JSON.stringify("Confirmed");
      let image=req.files.image
      let img_name=image.name
    


       if(req.files == undefined || null){
      const sql = `INSERT INTO resident_payment(payee,telId,amount,receipt,status,receipt_no,receipt_given) VALUES (${payee},${resident} ,${amount},${receipt},${status},${receipt_no},${receipt_given})`;
         connection.query(sql, function(err, result) {
            console.log(err)
            res.send("Payment Confirmed Successfully")
            }); 
      }
     
   
    else if(req.files){
     let image=req.files.image
      let img_name=newId
      let img=JSON.stringify(newId)
      let uploadDir=path.join(path.dirname(__dirname),"static_css/upload",img_name)

      if(image.mimetype=="image/jpeg" || image.mimetype=="image/png"){
         image.mv(uploadDir,function(err) {                           
                     if (err){
                     console.log(err)
                        return res.status(500).send(err);
                     }
      const sql =`INSERT INTO resident_payment(payee,telId,amount,receipt,status,receipt_no,receipt_given,image) VALUES (${payee},${resident} ,${amount},${receipt},${status},${receipt_no},${receipt_given},${img})`
         connection.query(sql, function(err, result) {
            console.log(err)
            res.send("Payment Recorded Successfully")
            }); 
                        });
      
   }
  }
}

exports.make_payment=(req,res)=>{
    let post  = req.body;
       let name=JSON.stringify(post.name);
      let outstanding=JSON.stringify(post.outstanding);
       let telephone=JSON.stringify(post.telephone);
        let option=JSON.stringify(post.option);
       let amount=JSON.stringify(post.amount);
       let receipt=JSON.stringify(post.receipt);
      let receipt_given=JSON.stringify(post.given)
      let receipt_no=JSON.stringify(makeId())
      let status=JSON.stringify("Confirmed") ;
      let collected_by=req.session.userId
      if(req.files == undefined || null){
      const sql = `INSERT INTO revenue_payment(fullname,outstanding,collected_by,telephone,amount_paid,receipt_no,receipt,status,receipt_given,type_payment) VALUES (${name},${outstanding},${collected_by} ,${telephone},${amount},${receipt_no},${receipt},${status},${receipt_given},${option})`;
         connection.query(sql, function(err, result) {
            console.log(err)
            res.send("Payment Confirmed Successfully")
            }); 
      }
     
   
   else if(req.files){
     let image=req.files.image
      let img_name=newId
      let img=JSON.stringify(newId)
      let uploadDir=path.join(path.dirname(__dirname),"static_css/upload",img_name)

      if(image.mimetype=="image/jpeg" || image.mimetype=="image/png"){
         image.mv(uploadDir,function(err) {                           
                     if (err){
                     console.log(err)
                        return res.status(500).send(err);
                     }
       const sql = `INSERT INTO revenue_payment(fullname,outstanding,collected_by,telephone,amount_paid,receipt_no,receipt,status,receipt_given,type_payment,image) VALUES (${name},${outstanding},${collected_by} ,${telephone},${amount},${receipt_no},${receipt},${status},${receipt_given},${option},${img})`;
         connection.query(sql, function(err, result) {
            console.log(err)
            res.send("Payment Confirmed Successfully")
            }); 
                        });
      
   }
}
}
exports.make_payment_user=(req,res)=>{
       let post  = req.body;
       let payee=JSON.stringify(post.payee);
      let user=JSON.stringify(post.user);
       let amount=JSON.stringify(post.amount);
       let receipt=JSON.stringify(post.receipt);
      let receipt_given=JSON.stringify(post.given)
      let receipt_no=JSON.stringify(makeId())
      let status=JSON.stringify("Confirmed") ;


      if(req.files == undefined || null){
      const sql = `INSERT INTO payment_user(payee,userId,amount,receipt,status,receipt_no,receipt_given) VALUES (${payee},${user} ,${amount},${receipt},${status},${receipt_no},${receipt_given})`;
         connection.query(sql, function(err, result) {
            console.log(err)
            res.send("Payment Recorded Successfully")
            }); 
      }
     
   
   else if(req.files){
    
     let image=req.files.image
      let img_name=newId
      let img=JSON.stringify(newId)
      let uploadDir=path.join(path.dirname(__dirname),"static_css/upload",img_name)

      if(image.mimetype=="image/jpeg" || image.mimetype=="image/png"){
         image.mv(uploadDir,function(err) {                           
                     if (err){
                     console.log(err)
                        return res.status(500).send(err);
                     }
      const sql =`INSERT INTO payment_user(payee,userId,amount,receipt,status,receipt_no,receipt_given,image) VALUES (${payee},${user} ,${amount},${receipt},${status},${receipt_no},${receipt_given},${img})`
         connection.query(sql, function(err, result) {
            console.log(err)
            res.send("Payment Recorded Successfully")
            }); 
                        });
      
   }
}   
  
}
exports.accept_payment_resident=(req,res)=>{
      let {id} =req.params
      let body=req.body
      let status=JSON.stringify(body.status)
      let receipt_given=JSON.stringify(body.given)
      let receipt=JSON.stringify(makeId())
      console.log(receipt)
      let sql=`update resident_payment set status=${status},receipt_given=${receipt_given},receipt_no=${receipt} where id=${id}`
      let rejected_sql=`update resident_payment set status=${status}  where id=${id}`
      if(status.includes(`Confirmed`) ){
      connection.query(sql,(err,result)=>{
         console.log(result)
         console.log(err)
         if (err) throw err
         console.log("confirmed")
         res.send("Payment Have Been Confirmed Successfully ")   
      })
      }

  else  if(status.includes("Rejected")){ 
     connection.query(rejected_sql,(err,result)=>{
  console.log(result)
   console.log("rejected")
        if (err) throw err
      
           console.log("rejected")
          res.send("Payment Have Been Rejected Successfully ")
       } 
  ) 
}
}
exports.accept_payment_user=(req,res)=>{
      let {id} =req.params
      let body=req.body
      let status=JSON.stringify(body.status)
      let receipt_given=JSON.stringify(body.given)
      let receipt=JSON.stringify(makeId())
      console.log(receipt)
      let sql=`update payment_user set status=${status},receipt_given=${receipt_given},receipt_no=${receipt} where id=${id}`
      let rejected_sql=`update payment_user set status=${status}  where id=${id}`
      if(status.includes(`Confirmed`) ){
      connection.query(sql,(err,result)=>{
         console.log(result)
         console.log(err)
         if (err) throw err
         console.log("confirmed")
         res.send("Payment Have Been Confirmed Successfully ")   
      })
      }

  else  if(status.includes("Rejected")){ 
     connection.query(rejected_sql,(err,result)=>{
  console.log(result)
   console.log("rejected")
        if (err) throw err
      
           console.log("rejected")
          res.send("Payment Have Been Rejected Successfully ")
       } 
  ) 
}
}
exports.login =(req,res) => {
   const  name  =  req.body.name;
   const  password  = req.body.password;
   let  fullname=JSON.stringify(name)

      let sql=`select * from user where username=${fullname}`
      let myquery= connection.query(sql)
      let query=()=>{
         return new Promise((resolve,reject)=>{
            let err=false
            if(!err){
            resolve(myquery)
            }
            else {reject()}
         })
      }
    async function examples(){
      const user=await query()
      return user }

examples().then((user)=>{
   if(user == undefined){
        req.flash("errors","Invalid Crediential")
   }
 else{
   bcrypt.compare(password, user[0].password, (err, results) => {
        
    
        if (results === false) {
        req.flash("errors","Invalid Crediential ")

         res.redirect("/user/login")  
       }
       else{ 
         if (user[0].status == "InActive") {
           
         req.flash("errors","User Has Been Deactivated By Admin Please Contact Admin")
           res.redirect("/user/login")
           
         }
         if(user[0].status =="Active"){
        req.session.user = user[0]
        req.session.Id = user[0].username
        req.session.userId=user[0].userId
if(user[0].is_CornerShopManager || user[0].is_Security|| user[0].is_ResidentManager || user[0].is_RevenueManager ||
   user[0].is_ShuttleManager || user[0].is_SuperAdmin ) {

           res.redirect("/home/dashboard")
         }
         else if (["ShuttleOwner"].includes(user[0].role.split(",")[0])) {
           res.redirect("/shuttle/home")
         }
         else if (["BusinessOwner"].includes(user[0].role.split(",")[0])) {
           res.redirect("/business/home")
         }}
}})
 }}
).catch((error)=>{
   console.log(error)
req.flash("errors","Invalid Credentials")
res.redirect("/user/login")
})
}
 exports.add_user=(req,res)=>{
      let post  = req.body;
       let fullname=JSON.stringify( post.name.trim());
       let password=JSON.stringify(bcrypt.hashSync(post.telephone,14).trim())
       let body_roles=JSON.stringify(post.role.trim())
      let roles=post.role.trim()
       let email=JSON.stringify(post.email.trim())
       let telephone=JSON.stringify(post.telephone.trim());
       let username= JSON.stringify(post.name.trim());
      let role=roles.split(",")
      telId = req.session.userId;

      let is_ResidentManger=0;
      let is_SuperAdmin=0;
      let is_ShuttleManager=0;
      let is_CornerShopManger=0;
      let is_RevenueManger=0;
      let is_Security=0;

        
         if(role.includes("Resident Manager")){
is_ResidentManger=1
         }
          if(role.includes("Shuttle Bus Manager")){
is_ShuttleManager=1

         }
         if(role.includes("Corner Shop Manager")){
is_CornerShopManger=1

         }
           if(role.includes("Revenue Manager")){
is_RevenueManger=1

         }
           if(role.includes("Super Admin")){
is_SuperAdmin=1

         }
         if(role.includes("Security")){
            is_Security=1
            
                     }
       const sql = `INSERT INTO user(fullname,username,email,telephone,password,is_SuperAdmin,is_ResidentManager,is_RevenueManager,is_ShuttleManager,is_CornerShopManager,is_Security,status,role) VALUES ( ${fullname},${username},${email},${telephone},${password},${is_SuperAdmin},${is_ResidentManger},${is_RevenueManger},${is_ShuttleManager},${is_CornerShopManger},${is_Security},"Active",${body_roles})`;
      connection.query(sql, (err, result)=> {
      console.log(err)
      res.send("User Have Been Added Successfully")
       }); 

 }
 exports.fetch_users=(req,res)=>{
    let sql=`select * from user`
    connection.query(sql,(err,result)=>{
     for(let i=0;i<result.length;i++){
        let role=result[i].roles.split(",")
      
     if(["SuperAdmin","ShuttleOwnerManger","BusinessOwnerManager",
"Revenue Manager"
,"Resident Manager"].includes(result[i].roles.split(",")[0]
)){
   console.log("SuperAdmin")
}

     }
       res.send("result[0].roles")
    })
 }
exports.get_users=(req,res)=>{
   let role=JSON.stringify(req.params.role) 
    const sql = `SELECT user.fullname,user.userId
FROM User  where user.role=${role}`;
         connection.query(sql, function(err, result) {
            console.log(err)
            res.send(result)
            });  
}

exports.get_business_drive=(req,res)=>{
    let role=JSON.stringify(req.params.role) 
     let driveNo=JSON.stringify(req.params.driveNo) 
     let userId=req.session.userId
     let profile=`select fullname,role from user where userId=${userId}`
    const sql = `select user.userId, user.fullname
 from business_meta inner join  user
on user.userId=business_meta.userId where user.role="BusinessOwner" && business_meta.driveNo=${driveNo}`;
         connection.query(sql, (err, result) =>{
         connection.query(profile, (err, profile) =>{
            console.log(err)
            res.send({result,profile})
            })
         })
}
 exports.add_shuttle_user=(req,res)=>{
     let post  = req.body;
       let fullname= post.fullname;
       let no_bus=JSON.stringify(post.no_bus);
       let password=bcrypt.hashSync(post.telephone,14)   
       let telephone=post.telephone;
       let role="ShuttleOwner"
       let username= post.fullname;
       let Uid=JSON.stringify(makeId())
       let status="Active"
      let sql1=`insert into shuttle_meta(no_bus,unique_id,userId) values(${no_bus},${Uid},?)`
       const sql = "INSERT INTO user(fullname,username,role,telephone,password,status) VALUES ('" + fullname + "','" + username + "','"+role+ "','"+telephone+ "','"+password+"','" + status + "')";
      let insertSql=  connection.query(sql)
         let query=()=>{
         return new Promise((resolve,reject)=>{
         let err=false
         if(!err){
         resolve(insertSql)

            }
         else {reject()}
                  })
         }
         async function payment(){
         const user=await query()
         return user }
         payment().then((user)=>{
         connection.query(sql1,[user.insertId],(err,result)=>{
            if (err) throw err
         res.send("Shuttle Bus User Have Been Added Successfully ")
         })
         })
 }

exports.add_business_user=(req,res)=>{
      let post  = req.body;
       let fullname= post.name;
       let shop_name=JSON.stringify(post.shop_name);
        let driveNo=JSON.stringify(post.driveNo);
       let password=bcrypt.hashSync(post.telephone,14)   
       let telephone=post.telephone;
       let Uid=JSON.stringify(makeId())
       let role="BusinessOwner"
       let username= post.name;
       let no_shop= JSON.stringify(post.no_shop);
      let status="Active"
      telId = req.session.Id;
      let sql1=`insert into business_meta(shop_name,driveNo,no_shop,userId,unique_id) values(${shop_name},${driveNo},${no_shop},?,${Uid})`
       const sql = "INSERT INTO user(fullname,username,role,telephone,password,status) VALUES ('" + fullname + "','" + username + "','"+role+ "','"+telephone+ "','"+password+"','" + status + "')";
      let insertSql=  connection.query(sql)
         let query=()=>{
         return new Promise((resolve,reject)=>{
         let err=false
         if(!err){
         resolve(insertSql)

            }
         else {reject()}
                  })
         }
         async function payment(){
         const user=await query()
         return user }
         payment().then((user)=>{
         connection.query(sql1,[user.insertId],(err,result)=>{
            if (err) throw err
         res.send("Corner Shop User Have Been Added Successfully ")
         })
         })

 }



 exports.tenant_login =(req,res) => {
   const  email  =  req.body.username;
   const  password  =  req.body.password
   let  inputEmail=JSON.stringify(email)

   let sql=`select tenId,fullname,username,password,status from tenant where username=${inputEmail}`
   let myquery=  connection.query(sql)
   let query=()=>{
         return new Promise((resolve,reject)=>{
            let err=false
            if(!err){
            resolve(myquery)
            }
            else {reject()}
         })
      }
    async function examples(){
      const user=await query()
      return user }

examples().then((user)=>{
   if(user == undefined){
      req.flash("errors","User Doesn`t Exist Please Contact Admin")
      res.redirect("/resident/login") 
   }
 else{
   bcrypt.compare(password, user[0].password, (err, results) => {
     if(err) throw err
      if (results === false) {
          req.flash("errors","Password Incorrect Please Contact Admin")
         res.redirect("/resident/login")  
       }
       else if(results === true){
      
          
          if(user[0].status =="InActive"){
            
           req.flash("errors","Resident Has Been Deactivated By Admin Please Contact Admin")
          res.redirect("/resident/login")  
       }
      else if(user[0].status =="Active")  {
          console.log("Logged In")
          req.session.Id = user[0].tenId
         res.redirect("/resident/dashboard")
      }
       }
      
      } )
}}).catch((error)=>{
   console.log(error)
req.flash("errors","Error Encountered Please Check Username")
res.redirect("/resident/login")
})
 }

 exports.resident_home = (req, res)=>  {
   const user =  req.session.user,
   userId = req.session.Id;
         
          let sql=`SELECT tenant.fullname,tenant.image ,tenant.telephone, resident_house.houseNo, resident_house.houseType,resident_house.driveNo,tenant.status,tenant.email
FROM tenant
INNER JOIN resident_house ON tenant.tenId=resident_house.telId
where tenant.tenId=${userId}
`
let payment=`SELECT  
 resident_house.amount
 ,resident_payment.amount as amount_paid, resident_house.amount - resident_payment.amount  as 
 total_due_bal
FROM ((tenant inner JOIN resident_house ON tenant.tenId=resident_house.telId)
 inner JOIN resident_payment ON tenant.tenId=resident_payment.telId) where resident_payment.status="Confirmed" 
 and tenant.tenId=${userId} group by resident_payment.telId ;`
let deposit=`select * from resident_payment where telId=${userId} limit 4`
     connection.query(sql, function(err, results){
        connection.query(deposit,(err,deposit)=>{
            connection.query(payment,(err,paid)=>{
               if(results == null){
                  if (err) throw err
                  console.log(err)
                  res.redirect("/resident/login");
                  
               }	
               console.log(results)
              res.render('home/resident/tenant_dashboard.ejs', {data:results,payment:deposit,paid:paid})	 
            },
            )
         })
         })
};

exports.domestic_staff=(req,res)=>{
    let userId=req.session.userId
   let profile=`select user.fullname,role from user where userId=${userId}`;
   let sql=`SELECT  domestic_staff.fullname,domestic_staff.image,domestic_staff.Uuid,domestic_staff.telephone,domestic_staff.address,domestic_staff.location,domestic_staff.jobType,domestic_staff.department,domestic_staff.status,tenant.fullname as employer,resident_house.driveNo,resident_house.houseNo
FROM ((tenant inner JOIN domestic_staff ON tenant.tenId=domestic_staff.telId)
inner JOIN resident_house ON domestic_staff.telId=resident_house.telId);`
connection.query(sql, function(err, results){
   connection.query(profile, function(err, profile){
                res.send({data:results,profile})	
               }	
             
            )
})

}
      
exports.add_apartment=(req,res)=>{
   let post  =req.body;
       let houseNo=JSON.stringify(post.houseNo);
       let driveNo=JSON.stringify( post.driveNo);
       let apartment_type=JSON.stringify(post.houseType);
       let amount
       apartment_type=apartment_type.toLocaleUpperCase()
       console.log(apartment_type)
       try {
         if(apartment_type.includes('2 BEDROOM')){
            amount=67000
          }
          else if(apartment_type.includes ("3 BEDROOM")){
               amount=70000
          }
          else if(apartment_type.includes("4 BEDROOM duplex") || apartment_type.includes("5 BEDROOM duplex")){
            amount=82000
          }
          console.log(amount)
          let sql=`INSERT INTO resident_house(driveNo,houseNo,houseType,amount) VALUES (${driveNo }, ${houseNo} ,${apartment_type},${amount })`;
      connection.query(sql,(err,result)=>{
        console.log(err)
      res.send("Apartment Added Successfully")
   })
       } catch (error) {
         console.log(error)
         return res.send("Error Encountered")
       }
       
} 

exports.download_business_paid=(req,res)=>{
   let sql=`SELECT payment_user.id ,user.telephone,user.fullname as 
user,business_meta.shop_name,business_meta.amount,coalesce(payment_user.bal_2018,0) as bal_2018
,payment_user.amount as amount_paid,
coalesce(payment_user.bal_2016,0) as bal_2016 ,coalesce(payment_user.bal_2017,0) as bal_2017,coalesce(payment_user.bal_2019,0) as bal_2019,coalesce(payment_user.bal_2020,0) as bal_2020,
coalesce( payment_user.bal_2014_15,0)as bal_2014_15,coalesce(payment_user.bal_2012_13,0) as bal_2012_13,
sum(coalesce(payment_user.bal_2018,0)+coalesce( payment_user.bal_2016,0)+
coalesce(payment_user.bal_2017,0) +coalesce(payment_user.bal_2019,0) +coalesce(payment_user.bal_2020,0) +
coalesce( payment_user.bal_2014_15,0)+coalesce(payment_user.bal_2012_13,0) 
) + business_meta.amount - payment_user.amount  as total_due_bal,sum(business_meta.amount )- payment_user.amount as balance 
FROM ((user inner JOIN payment_user ON user.userId=payment_user.userId)
inner JOIN business_meta ON user.userId=business_meta.userId) where payment_user.status="Confirmed" group by user.userId ;

`
connection.query(sql,(err,result)=>{
const resident = JSON.parse(JSON.stringify(result));
         const csvFields = [ 'fullname', 'telephone', 'driveNo','houseNo','houseType'];
         const json2csvParser = new Json2csvParser({ csvFields });
         const csv = json2csvParser.parse(resident);
         res.setHeader("Content-Type", "text/csv");
         res.setHeader("Content-Disposition", "attachment; filename=corner shop owners who paid.csv");
         res.status(200).end(csv);
})
}

exports.download_resident_paid=(req,res)=>{
   let sql=` SELECT resident_payment.id ,tenant.telephone,tenant.fullname as 
resident,resident_house.driveNo,resident_house.houseNo,resident_house.amount,
resident_payment.amount as amount_paid,resident_house.amount - resident_payment.amount as balance 
FROM ((tenant inner JOIN resident_payment ON tenant.tenId=resident_payment.telId)
inner JOIN resident_house ON resident_payment.telId=resident_house.telId) where resident_payment.status="Confirmed" group by resident_payment.telId ;

`
connection.query(sql,(err,result)=>{
const resident = JSON.parse(JSON.stringify(result));
         const csvFields = [ 'fullname', 'telephone', 'driveNo','houseNo','houseType'];
         const json2csvParser = new Json2csvParser({ csvFields });
         const csv = json2csvParser.parse(resident);
         res.setHeader("Content-Type", "text/csv");
         res.setHeader("Content-Disposition", "attachment; filename=resident_paid.csv");
         res.status(200).end(csv);
})
 
}  
exports.download_business=(req,res)=>{
   let sql=`select user.fullname, user.telephone, user.status,user.email, business_meta.shop_name
 from business_meta inner join  user
on user.userId=business_meta.userId where user.role="BusinessOwner"`
   connection.query(sql,(err,result)=>{
      const resident = JSON.parse(JSON.stringify(result));
         const csvFields = [ 'fullname', 'telephone', 'driveNo','houseNo','houseType'];
         const json2csvParser = new Json2csvParser({ csvFields });
         const csv = json2csvParser.parse(resident);
         res.setHeader("Content-Type", "text/csv");
         res.setHeader("Content-Disposition", "attachment; filename=corner shop users.csv");
         res.status(200).end(csv);
   })
}
exports.profile=(req,res)=>{
  const user =  req.session.user,
 userId = JSON.stringify(req.session.Id);

	let sql=`SELECT * FROM user WHERE username=${userId}`; 
     connection.query(sql,(err,result)=>{
        res.render("home/admin/profile.ejs",{profile:result})
     })
}
exports.fetch_user=(req,res)=>{
const user =  req.session.user,
 userId = JSON.stringify(req.session.Id);

	let sql=`SELECT * FROM user WHERE username=${userId}`; 
     connection.query(sql,(err,result)=>{
        res.render("home/admin/password_change.ejs",{profile:result})
     })
}
exports.dashboard = (req, res, next)=>  {
const user =  req.session.user,
userId = JSON.stringify(req.session.Id);
let total_paid=`select sum(resident_payment.amount) as amount from resident_payment where status="Confirmed"`
	let sql=`SELECT * FROM user WHERE username=${userId}`; 
   let pending_resident=`select resident_payment.id, resident_payment.amount,resident_payment.receipt_given, resident_payment.receipt_no,resident_payment.image, resident_payment.payee, 
resident_payment.receipt, resident_payment.status,resident_house.driveNo,resident_house.houseNo,
   DATE_FORMAT(resident_payment.deposit_date,"%W %D %M %Y") as deposit_date ,tenant.fullname,tenant.telephone
 from tenant inner join resident_payment  on tenant.tenId=resident_payment.telId
   join resident_house on tenant.tenId=resident_house.telId
   where 
   resident_payment.status="Pending"`
   let active_resident=`SELECT count(*) as active
      FROM tenant INNER JOIN resident_house ON tenant.tenId=resident_house.telId  where tenant.status="Active"`
  let inactive_resident=`SELECT count(*) as in_active
      FROM tenant INNER JOIN resident_house ON tenant.tenId=resident_house.telId  where tenant.status="InActive"  ` 
   let users=`select count(*) as users from user as users where role not in ("ShuttleOwner","BusinessOwner")`
   
   let shuttle_users=`select count(*) as shuttle_users from user where role="ShuttleOwner"`
   let corner_users=`select count(*) as corner_users from user where role ="BusinessOwner"`
   
   let domestic=`select count(*) as domestic_staff from domestic_staff as domestic_staff`
   let pending_shuttle=`
select payment_user.id, payment_user.amount, 
   payment_user.payee
   ,user.fullname,user.telephone from user inner join payment_user  
   on user.userId=payment_user.userId where payment_user.status="pending" && user.role="ShuttleOwner"
`
let pending_business=`
select payment_user.id, payment_user.amount, 
   payment_user.payee
   ,user.fullname,user.telephone from user inner join payment_user  
   on user.userId=payment_user.userId where payment_user.status="pending" && user.role="BusinessOwner"
`
   connection.query(sql,(err,result)=>{
   connection.query(active_resident,(err,active_resident)=>{
   connection.query(inactive_resident,(err,inactive_resident)=>{
         connection.query(users,(err,users)=>{
             connection.query(shuttle_users,(err,shuttle_users)=>{
                             connection.query(total_paid,(err,total_paid)=>{
                 connection.query(corner_users,(err,corner_users)=>{
          connection.query(domestic,(err,domestic)=>{  
           connection.query(pending_shuttle,(err,result_shuttle)=>{
                connection.query(pending_business,(err,result_business)=>{
                connection.query(pending_resident,(err,result_resident)=>{
      res.render("home/admin/dashboard.ejs",{users:users,domestic:domestic,inactive:inactive_resident
         ,active:active_resident,
         profile:result,resident:result_resident,shuttle:result_shuttle,corner_users:corner_users,business:result_business,shuttle_users:shuttle_users,amount_resident:total_paid})
   })
})
})
})
})
})
             })  
})
      })
   })

}
      )
};

exports.logout=(req, res) =>{
   req.session.destroy((err)=>{
      if(err){
         console.log(err);
      }else{
       
        
          res.redirect('/user/login');
      }
   });
 
 };
 exports.resident_logout=(req, res) =>{
   req.session.destroy((err)=>{
      if(err){
         console.log(err);
      }else{   
         
          res.redirect('/resident/login');
      }
   });
 
 };
exports.shuttle_home = (req, res)=>  {
   const user =  req.session.user,
   userId = req.session.userId;
         
   let profile=`SELECT user.fullname ,user.telephone,user.email
            FROM user
            where user.userId=${userId}
            `
   let payment=`SELECT  
shuttle_meta.amount
,payment_user.amount as amount_paid,
sum(coalesce(payment_user.bal_2018,0)+coalesce( payment_user.bal_2016,0)+
coalesce(payment_user.bal_2017,0) +coalesce(payment_user.bal_2019,0) +coalesce(payment_user.bal_2020,0) +
coalesce( payment_user.bal_2014_15,0)+coalesce(payment_user.bal_2012_13,0) 
) + shuttle_meta.amount - payment_user.amount  as total_due_bal,shuttle_meta.amount - payment_user.amount as balance 
FROM ((user inner JOIN payment_user ON user.userId=payment_user.userId)
inner JOIN shuttle_meta ON payment_user.userId=shuttle_meta.userId) where payment_user.status="Confirmed" and user.userId=${userId} group by payment_user.userId ;
`
   let sql=`select * from payment_user where userId=${userId} limit 4`
     connection.query(profile, function(err, results){
        connection.query(payment, function(err, payment){
             connection.query(sql, function(err, result){
               if(userId == null){
                  res.redirect("/user/login");
                  return;
               }	
               console.log(payment)
              res.render('home/shutterBus/shutterOwnerDashboard.ejs', {data:results,payment:result,body:payment})	 
            },
            )
         })
      })
};
exports.business_home = (req, res)=>  {
   userId = req.session.Id;
   let id=req.session.userId
   let username=JSON.stringify(userId)
   let profile=`SELECT user.fullname ,user.telephone,user.email
            FROM user
            where user.username=${username}

            `
   let account=`SELECT  
business_meta.amount as amount
,payment_user.amount as amount_paid,
 business_meta.amount - payment_user.amount  as total_due_bal
FROM ((user inner JOIN payment_user ON user.userId=payment_user.userId)
inner JOIN business_meta ON payment_user.userId=business_meta.userId) 
where payment_user.status="Confirmed" and user.UserId=${id} group by payment_user.userId ;
;
`
   let payment=`select * from payment_user where userId=${id} limit 4`
     connection.query(profile, function(err, results){
             connection.query(payment, function(err, result){
                             connection.query(account, (err, account)=>{
        console.log(err)
               if(userId == null){
                  res.redirect("/user/login");
                  return;
               }	
              res.render('home/business_owner/business_dashboard.ejs', {data:results,payment:result,body:account})	 
            }
            )
         })
         })
};
exports.add_driver=(req,res)=>{
      let post  = req.body;
      let telId=JSON.stringify(req.session.userId)
      let address=JSON.stringify(post.address);
     
      let location=JSON.stringify(post.location);
      let telephone=JSON.stringify(post.telephone);
      let fullname= JSON.stringify(post.fullname); 
      let vehicle_no=JSON.stringify(post.vehicle_no);
      let vehicle_type=JSON.stringify( post.vehicle_type);      
     

       const sql = `INSERT INTO shuttle_drivers(owner_id,fullname,telephone,address,location,vehicle_no,vehicle_type) VALUES (${telId} ,${fullname} ,${telephone},${address},${location},${vehicle_no},${vehicle_type})`
      connection.query(sql, function(err, result) {
      console.log(err)
      res.send("Driver Have Been Added Successfully")
       });
}
exports.shuttle_deposit= (req,res)=>{
    let post  = req.body;
       let payee=JSON.stringify(post.payee);
      let user=req.session.userId
       let amount=JSON.stringify(post.amount);
       let receipt=JSON.stringify(post.receipt);

      if(req.files == undefined || null){
      const sql = `INSERT INTO payment_user(payee,userId,amount,receipt) VALUES (${payee},${user} ,${amount},${receipt})`;
         connection.query(sql, function(err, result) {
            console.log(err)
            res.send("Payment Recorded Successfully")
            }); 
      }
     
   
   else if(req.files){
    
     let image=req.files.image
      let img_name=newId
      let img=JSON.stringify(newId)
      let uploadDir=path.join(path.dirname(__dirname),"static_css/upload",img_name)

      if(image.mimetype=="image/jpeg" || image.mimetype=="image/png"){
         image.mv(uploadDir,function(err) {                           
                     if (err){
                     console.log(err)
                        return res.status(500).send(err);
                     }
      const sql =`INSERT INTO payment_user(payee,userId,amount,receipt,image) VALUES (${payee},${user} ,${amount},${receipt},${img})`
         connection.query(sql, function(err, result) {
            console.log(err)
            res.send("Payment Recorded Successfully")
            }); 
                        });
      
   }
}   
}
exports.edit_domestic=(req,res)=>{
       let {id} =req.params
let sql=`SELECT * from domestic_staff where DomId=${id}`
         connection.query(sql,(err,result)=>{
         if (err) throw err
         else  
         res.render("home/resident/staff_edit.ejs",{body:result})
           }) 
}
exports.edit_driver=(req,res)=>{
  let {id} =req.params
let sql=`SELECT * from shuttle_drivers where owner_id=${id}`
         connection.query(sql,[id],(err,result)=>{
         if (err) throw err
         else  
         res.render("home/shutterBus/staff_edit.ejs",{body:result})
           }) 
}
exports.edit_business=(req,res)=>{
  let {id} =req.params
let sql=`SELECT * from business_staff where id=?`
         connection.query(sql,[id],(err,result)=>{
         if (err) throw err
         else  
         res.render("home/business_owner/staff_edit.ejs",{body:result})
           }) 
}
exports.domestic_update=(req,res)=>{
   let id =req.params.id
      let body=req.body
      let telephone=body.telephone;
      let fullname= body.name;
      let location=body.location
      let address=body.address
      let jobType=body.jobType
      let department=body.department

   let sql="update domestic_staff set fullname=?,telephone=?,address=?,location=?,department=?,jobType=? where DomId=?"
  
   connection.query(sql,[fullname,telephone,
address,location,
department,jobType,id
],(err,result)=>{
   if (err) throw err
   // else  res.redirect("/admin/list/tenant")
   else res.send("Staff Has Been Updated Successfully")
  }) 
}
exports.business_update=(req,res)=>{
   let {id} =req.params
      let body=req.body
      let jobType= body.jobType;
      let telephone=body.telephone;
      let address=body.address;
      let fullname= body.name;
      let email=body.email;
      let status=body.status
      let location=body.location


   let sql="update business_staff set fullname=?,telephone=?,email=?, status=?,jobType=?,address=?,location=? where staff_id=?"
  
   connection.query(sql,[fullname,telephone,
fullname,
email,
status,jobType,address,location,id
],(err,result)=>{
   if (err) throw err
   // else  res.redirect("/admin/list/tenant")
   else res.send("Staff Have Been Updated Successfully")
  }) 
}
exports.shuttle_update=(req,res)=>{
   let id=req.params.id
   let body=req.body
      let telephone=body.telephone;
      let address=body.address;
      let fullname= body.name;
      let vehicle_type=body.vehicle_type;
      let vehicle_no=body.vehicle_no


   let sql="update shuttle_staff set fullname=?,telephone=?,address=?,vehicle_type=?,vehicle_no=?,location=? where id=?"
  
   connection.query(sql,[fullname,telephone
      ,address,vehicle_type,vehicle_no,id
],(err,result)=>{
   if (err) throw err
   else res.send("Driver Have Been Updated Successfully")
  }) 
}
exports.domestic_search=(req,res)=>{
   let name=JSON.stringify(req.params.name)
   let user=req.session.userId
   let profile=`select user.fullname,role from user where userId=${user}`;
 
    let sql=`SELECT  domestic_staff.fullname,domestic_staff.image,domestic_staff.Uuid,domestic_staff.telephone,domestic_staff.address,domestic_staff.location,domestic_staff.jobType,domestic_staff.department,domestic_staff.status,tenant.fullname as employer,resident_house.driveNo,resident_house.houseNo
FROM ((tenant inner JOIN domestic_staff ON tenant.tenId=domestic_staff.telId)
inner JOIN resident_house ON domestic_staff.telId=resident_house.telId) where domestic_staff.fullname=${name}
`
connection.query(sql, function(err, results){
   connection.query(profile, function(err, profile){
                res.send({data:results,profile})	
               }	
             
            )
})
  
}
exports.revenue_list=(req,res)=>{
let userId=req.session.userId
let profile=`select user.fullname,role from user where userId=${userId}`;
let sql=` select user.fullname as collected_by,revenue_payment.fullname,revenue_payment.telephone,revenue_payment.receipt_given,revenue_payment.receipt,revenue_payment.type_payment,revenue_payment.amount_paid,revenue_payment.image,revenue_payment.reciept, DATE_FORMAT(revenue_payment.date_recieved,"%W %D %M %Y") as date_recieved,revenue_payment.receipt_no,revenue_payment.status,revenue_payment.outstanding,revenue_payment.telephone
 from revenue_payment inner join  user
on user.userId=revenue_payment.collected_by ` 
connection.query(sql,(err,result)=>{
   connection.query(profile,(err,profile)=>{
   res.send(result)
}  )
})
}

exports.revenue_outstanding=(req,res)=>{
   let sql=` select user.fullname as collected_by,revenue_payment.fullname,revenue_payment.telephone,revenue_payment.receipt_given,revenue_payment.receipt,revenue_payment.type_payment,revenue_payment.amount_paid,revenue_payment.image,revenue_payment.reciept, DATE_FORMAT(revenue_payment.date_recieved,"%W %D %M %Y") as date_recieved,revenue_payment.receipt_no,revenue_payment.status,revenue_payment.outstanding,revenue_payment.telephone
 from revenue_payment inner join  user
on user.userId=revenue_payment.collected_by where revenue_payment.outstanding > 0 `

connection.query(sql,(err,body)=>{
   res.send(body)
})
}

exports.revenue_paid=(req,res)=>{
   let sql=` select user.fullname as collected_by,revenue_payment.fullname,revenue_payment.telephone,revenue_payment.receipt_given,revenue_payment.receipt,revenue_payment.type_payment,revenue_payment.amount_paid,revenue_payment.image,revenue_payment.reciept, DATE_FORMAT(revenue_payment.date_recieved,"%W %D %M %Y") as date_recieved,revenue_payment.receipt_no,revenue_payment.status,revenue_payment.outstanding
 from revenue_payment inner join  user
on user.userId=revenue_payment.collected_by where revenue_payment.outstanding < 0 `

connection.query(sql,(err,body)=>{
   res.send(body)
})
}

exports.update_shuttle_user=(req,res)=>{
     let id=req.session.userId
      let body=req.body
      let username= JSON.stringify(body.username.trim());
      let telephone=JSON.stringify(body.telephone.trim());
      let fullname= JSON.stringify(body.name.trim());
  

 
        
if(req.body.password === ""){
   console.log(req.body.password)
  let sql="update user set username=?,telephone=?,fullname=? where userId=?"
   connection.query(sql,[username,telephone,
fullname,id

],(err,result)=>{
   
   if (err) throw err
   else res.send("User Updated Successfully")
  }) 
   }
  else {
        let password=JSON.stringify(bcrypt.hashSync(body.password.trim(),14))
   let sql=`update user set username=${username},telephone=${telephone},password=${password},fullname=${fullname} where userId=?`

     
connection.query(sql,[id],(err,result)=>{
   if (err) throw err
   else res.send("User Updated Successfully")
  }) 
  }
}
exports.user_shuttle=(req,res)=>{
let id=req.session.userId
let sql=`select user.userId, user.fullname,user.username, user.telephone, user.status,user.email, shuttle_meta.no_bus
 from shuttle_meta inner join  user
on user.userId=shuttle_meta.userId where user.userId=${id}`

connection.query(sql,(err,result)=>{
   if (err) throw err
   res.render("home/shutterBus/shuttle_profile",{body:result})
})

}
exports.revenue_download=(req,res)=>{
      let sql=`select user.fullname as collected_by,
      revenue_payment.fullname,revenue_payment.telephone,revenue_payment.receipt_given,
      revenue_payment.receipt,revenue_payment.type_payment,revenue_payment.amount_paid,revenue_payment.reciept, DATE_FORMAT(revenue_payment.date_recieved,"%W %D %M %Y") as date_recieved,revenue_payment.receipt_no,revenue_payment.status,revenue_payment.outstanding
 from revenue_payment inner join  user
on user.userId=revenue_payment.collected_by 
`
connection.query(sql,(err,result)=>{
const resident = JSON.parse(JSON.stringify(result));
         const csvFields = [ 'collected_by', 'Operator', 'receipt Issued','receipt','Payment Type','Amount Paid','Ref No','Date Recieved'];
         const json2csvParser = new Json2csvParser({ csvFields });
         const csv = json2csvParser.parse(resident);
         res.setHeader("Content-Type", "text/csv");
         res.setHeader("Content-Disposition", "attachment; filename=revenue.csv");
         res.status(200).end(csv);
})
 
}
exports.view_driver=(req,res)=>{
   let id=req.session.userId
   let sql=`SELECT shuttle_drivers.fullname,shuttle_drivers.telephone,
shuttle_drivers.address,shuttle_drivers.location,
shuttle_drivers.jobType,shuttle_drivers.vehicle_no,
shuttle_drivers.vehicle_type
FROM shuttle_drivers
inner JOIN user ON user.UserId=shuttle_drivers.owner_id where shuttle_drivers.owner_id =${id}
;` 
   connection.query(sql,(err, results)=>{
                res.render("home/shutterBus/shutter_drivers.ejs",{body:results})	
               })
        

}

exports.view_drivers=(req,res)=>{
let id=req.session.userId
let sql=`SELECT shuttle_drivers.fullname,shuttle_drivers.telephone,
shuttle_drivers.address,shuttle_drivers.location,
shuttle_drivers.jobType,shuttle_drivers.vehicle_no,
shuttle_drivers.vehicle_type,
user.fullname as employer,user.telephone as tele_employer
FROM shuttle_drivers
inner JOIN user ON user.UserId=shuttle_drivers.owner_id
;`
let profile=`select fullname,role from user where userId=${id}`
connection.query(profile,function(err, result){
   connection.query(sql,function(err, results){
   console.log(results)
                res.send({data:results,profile:result})	
               })
            })

}

exports.view_business=(req,res)=>{
   userId = req.session.Id;
   let username=JSON.stringify(userId)
     let sql=`Select * from business_staff where userId=?`
  let profile=`SELECT user.fullname ,user.telephone,user.email
            FROM user
            where user.username=${username}
            `
connection.query(profile,[userId],function(err, results){
   connection.query(sql,[userId],function(err, result){
   console.log(results)
                res.render('home/business_owner/view_staff.ejs', {body:result,profile:results})	
               }	
             
            )
            })

}

exports.business_paid=(req,res)=>{
  let userId=req.session.userId;
   let profile=`select from user where userId=${userId}`
  let sql=`SELECT user.telephone,user.fullname as 
user,business_meta.shop_name,business_meta.amount
,payment_user.amount as amount_paid, business_meta.amount - payment_user.amount  as balanced
FROM ((user inner JOIN payment_user ON user.userId=payment_user.userId)
inner JOIN business_meta ON user.userId=business_meta.userId) where payment_user.status="Confirmed" group by user.userId ;

`
   connection.query(profile,(err,profile)=>{
      connection.query(sql,(err,body)=>{
      res.render("home/admin/business_balance.ejs",{profile:profile,body:body})
      })
   })




}
exports.business_search=(req,res)=>{
   let userId=req.session.userId
   let name=req.params.name
   let profile=`select fullname,role from user where userId=${userId}`
let sql=`select user.userId, user.fullname, user.telephone, user.status, business_meta.shop_name,business_meta.driveNo
 from business_meta inner join  user
on user.userId=business_meta.userId where user.role="BusinessOwner" && user.fullname like '%${name}%'`
connection.query(sql,(err,result)=>{
connection.query(profile,(err,profile)=>{
   res.send({result,profile})
})
})
}
exports.get_business=(req,res)=>{
   let userId=req.session.userId
   let profile=`select fullname,role from user where userId=${userId}`
let sql=`select user.userId, user.fullname, user.telephone, user.status, business_meta.shop_name,business_meta.unique_id,business_meta.driveNo
 from business_meta inner join  user
on user.userId=business_meta.userId where user.role="BusinessOwner"`
connection.query(sql,(err,result)=>{
connection.query(profile,(err,profile)=>{
   res.send({result,profile})
})
})
}

exports.get_shuttle=(req,res)=>{
let sql=`select user.userId, user.fullname,user.username, user.telephone, user.status,user.email, shuttle_meta.no_bus,shuttle_meta.unique_id
 from shuttle_meta inner join  user
on user.userId=shuttle_meta.userId where user.role="ShuttleOwner"`
let id=req.session.userId
let profile=`select fullname,role from user where userId=${id}`
connection.query(sql,(err,result)=>{
connection.query(profile,(err,profile)=>{
   if (err) throw err
   res.send({body:result,profile})
})
})
}

exports.get_shuttle_manager=(req,res)=>{
   let ShutterOwner="ShuttleOwner"
let sql=`Select * from user where role=${ShutterOwner}`
connection.query(sql,(err,result)=>{
   if (err) throw err
   res.render("home/admin_shuttle/shuttle_management.ejs",{body:result})
})
}

exports.admin_drivers=(req,res)=>{
 let sql=`SELECT  shuttle_drivers.fullname,shuttle_drivers.telephone,shuttle_drivers.vehicle_no,shuttle_drivers.vehicle_type,shuttle_drivers.address,shuttle_drivers.location,shuttle_drivers.jobType,user.fullname as employee
FROM user inner JOIN shuttle_drivers ON user.userId=shuttle_drivers.owner_id
;`
connection.query(sql, function(err, results){
   console.log(results)
                res.render('home/admin/shuttle_drivers.ejs', {body:results})	
               }	
             
            )
}
exports.shuttle_manager_drivers=(req,res)=>{
   let sql=`SELECT  shuttle_drivers.fullname,shuttle_drivers.telephone,shuttle_drivers.address,shuttle_drivers.location,shuttle_drivers.jobType,shuttle_drivers.status,user.fullname as employee
FROM user inner JOIN shuttle_drivers ON user.userId=shuttle_drivers.owner_id)
;`
connection.query(sql, function(err, results){
   console.log(results)
                res.render('home/admin_shuttle/shuttle_drivers.ejs', {body:results})	
               }	
             
            )
}
exports.admin_staff=(req,res)=>{
let sql=`SELECT  staff.fullname,staff.telephone,staff.address,staff.location,staff.jobType,staff.status,business_owner.fullname as employee
FROM business_owner inner JOIN staff ON user.userId=staff.owner_id)
;`
connection.query(sql, function(err, results){
   console.log(results)
                res.render('home/admin/business_staff.ejs', {body:results})	
               }	
             
            )
}
exports.get_shuttle_deposit=(req,res)=>{
  let id=req.session.userId
   let sql=`select amount,payee,receipt,status,receipt_no ,DATE_FORMAT(payment_user.deposit_date,"%W %D %M %Y") as deposit_date from payment_user where userId=${id}`
   let profile=`select * from user where userId=${id}`
connection.query(profile,(err,result)=>{
   connection.query(sql,(err,results)=>{   
      res.render("home/shutterBus/shuttle_view_deposit.ejs",{profile:result,body:results})
      
   })
 })
}
exports.get_business_deposit=(req,res)=>{
   let id=req.session.userId
   let sql=
`select amount,payee,receipt,status,receipt_no ,DATE_FORMAT(payment_user.deposit_date,"%W %D %M %Y") as deposit_date from payment_user where userId=${id}`
   let profile=`select * from user where userId=${id}`
connection.query(profile,(err,result)=>{
   connection.query(sql,(err,results)=>{   
      res.render("home/business_owner/view_deposit.ejs",{profile:result,body:results})
      
   })
 })
}
exports.resident_get_deposit=(req,res)=>{
   let id=req.session.Id
   console.log(id) 
   let profile=`select * from tenant where tenId=${id}`
   let sql="select payee,amount,receipt,receipt_no,DATE_FORMAT(resident_payment.deposit_date,'%W %D %M %Y') as deposit_date,status from resident_payment where telId=?"
   connection.query(profile,(err,results)=>{
      connection.query(sql,[id],(err,result)=>{
         console.log(err)
         console.log(result)
  res.render("home/resident/view_deposit.ejs",{profile:results,body:result})
      })
    
   })
}
exports.get_profile=(req,res)=>{
let telId=req.session.Id
let sql=`select * from tenant where tenId=${telId}`
connection.query(sql,(err,body)=>{
   res.render("home/resident/profile_edit.ejs",{body:body})
})
}

exports.shuttle_manager=(req,res)=>{
  const user =  req.session.user,
   userId =JSON.stringify(req.session.Id);
         
   let sql=`SELECT user.fullname ,user.telephone,user.email
            FROM user
            where user.username=${userId}
            `
   let shuttle_owner=`select * from user where role ="ShuttleOwner"`
     connection.query(sql, function(err, results){
        connection.query(shuttle_owner, function(err, result){
               if(userId == null){
                  res.redirect("/user/login");
                  return;
               }	
               console.log(results)
              res.render('home/admin_shuttle/dashboard.ejs', {data:results,body:result})	 
            },
            )
         })
}
exports.business_manager=(req,res)=>{
     const user =  req.session.user,
   userId = JSON.stringify(req.session.Id);
         
   let sql=`SELECT user.fullname ,user.telephone,tenant.email
            FROM user
            where user.username=${userId}
            `
     connection.query(sql, function(err, results){
               if(userId == null){
                  res.redirect("/user/login");
                  return;
               }	
               console.log(results)
              res.render('home/admin_business/dashboard.ejs', {data:results})	 
            },
            )
}
exports.business_management=(req,res)=>{

}
exports.business_management_staff=(req,res)=>{
   
}

exports.shuttle_management=(req,res)=>{

}
exports.shuttle_management_driver=(req,res)=>{
   
}
exports.admin_report=(req,res)=>{

}

exports.resident_download=(req,res)=>{
let sql=`SELECT tenant.fullname ,tenant.telephone, resident_house.houseNo, resident_house.houseType,resident_house.driveNo,tenant.status,tenant.email
      FROM tenant INNER JOIN resident_house ON tenant.tenId=resident_house.telId`
      connection.query(sql,(err,result)=>{
         const resident = JSON.parse(JSON.stringify(result));
         const csvFields = [ 'fullname', 'telephone', 'driveNo','houseNo','houseType'];
         const json2csvParser = new Json2csvParser({ csvFields });
         const csv = json2csvParser.parse(resident);

         res.setHeader("Content-Type", "text/csv");
         res.setHeader("Content-Disposition", "attachment; filename=resident.csv");
         res.status(200).end(csv);
      })
}


exports.deactivate_user=(req,res)=>{
   let{id}=req.params
   let action=req.body.action
   console.log("hello word")
      let sql="update user set status=? where userId=?"
      connection.query(sql,[action,id],(err,result)=>{
res.send("In Active")
      })
}
exports.edit_house=(req,res)=>{
    let {id} =req.params
let sql=`SELECT resident_house.driveNo,resident_house.id,resident_house.houseNo ,resident_house.houseType,resident_house.id
      FROM resident_house`

         connection.query(sql,[id],(err,result)=>{
         if (err) throw err
         else  
         res.render("home/admin/edit_apartment.ejs",{body:result})
           }) 
}
exports.update_house=(req,res)=>{
    let {id} =req.params
    let body=req.body
      let houseNo=JSON.stringify(body.houseNo);
      let driveNo=JSON.stringify(body.driveNo)
      let houseType=JSON.stringify(body.houseType)
      let amount
      if(apartment_type.includes("2 BEDROOM")){
        amount=67000
      }
      else if(apartment_type.includes ("3 BEDROOM")){
           amount=70000
      }
      else if(apartment_type.includes("4 BEDROOM") || apartment_type.includes("5 bed duplex")){
        amount=82000
      }
      else if(apartment_type.includes("DUPLEX") || apartment_type.includes("5 bed duplex")){
         amount=82000
       }
    
   let sql1=`update resident_house set driveNo=${driveNo},houseNo=${houseNo},houseType=${houseType},${amount} where id=${id}`

    connection.query(sql1,(err,result)=>{
 if (err) throw err

   else res.send("Apartment Have Been Updated Successfully")
    })
   }

exports.delete_domestic=(req,res)=>{
   let {id}=req.params
   let sql=`delete from domestic_staff where DomId=${id}`
   connection.query(sql,(err,result)=>{
res.send("Domestic Staff Deleted Successfully")
   })
}
exports.delete_user=(req,res)=>{
   let {id}=req.params
   let sql=`delete from user where userId=?`
   connection.query(sql,[id],(err,result)=>{
res.redirect("/admin/view/users")
   })
}
exports.delete_user_business=(req,res)=>{
   let {id}=req.params
   let sql=`delete from user where userId=?`
   connection.query(sql,[id],(err,result)=>{
res.redirect("/admin/business/management")
   })
}
exports.delete_user_shuttle=(req,res)=>{
   let {id}=req.params
   let sql=`delete from user where userId=?`
   connection.query(sql,[id],(err,result)=>{
res.redirect("/admin/shuttle/management")
   })
}


