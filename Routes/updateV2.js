const qr=require("qrcode")

const connection=require("../core/connection")
function makeId(){
    let result="" 
   let character="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"+new Date().getFullYear()
   let karaterLength=character.length 
   for(let i=0;i<5;i++){
     result+=character.charAt(Math.random()* karaterLength)}
     console.log(result+new Date().getFullYear())   
     return result+=`${new Date().getFullYear()}` + new Date().getMilliseconds() 
   }
function makeId_resident(){
    let result="" 
   let character="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"+new Date().getFullYear()
   let karaterLength=character.length 
   for(let i=0;i<6;i++){
     result+=character.charAt(Math.random()* karaterLength)}
     console.log(result+new Date().getFullYear())   
     return result+=`${new Date().getFullYear()}` + new Date().getMilliseconds() 
   }
function makeId_occupant(){
    let result="" 
   let character="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"+new Date().getFullYear()
   let karaterLength=character.length 
   for(let i=0;i<8;i++){
     result+=character.charAt(Math.random()* karaterLength)}
     console.log(result+new Date().getFullYear())   
     return result+=`${new Date().getFullYear()}` + new Date().getMilliseconds() 
   }
exports.update_occupant=(req,res)=>{
     const WritesqlStatement = `update occupants set unique_id=? where id=?;`
     const ReadsqlStatement = `select * from occupants`
    let ReadSql=  connection.query(WritesqlStatement)
       let query=()=>{
       return new Promise((resolve,reject)=>{
       let err=false
       if(!err){
       resolve(ReadSql)
  
          }
       else {reject()}
                })
       }
       async function updateQuery(){
       const user=await query()
       return user }
       updateQuery().then((user)=>{
         for (let i = 0; i < user.length; i++) {
             let Uid = makeId_occupant()
             connection.query(ReadsqlStatement,[Uid,user[i].id],(err,result)=>{
                 if (err) throw err
              
              })
             
         }
        
      
       })
       res.send("Occupants Updated Successfully ")
    }

exports.update_business_id=(req,res)=>{
        let WritesqlStatement=`update business_meta set unique_id=? where id=?`
        const ReadsqlStatement = `select * from business_meta`;
       let ReadSql=  connection.query(ReadsqlStatement)
          let query=()=>{
          return new Promise((resolve,reject)=>{
          let err=false
          if(!err){
          resolve(ReadSql)
     
             }
          else {reject()}
                   })
          }
          async function updateQuery(){
          const user=await query()
          return user }
          updateQuery().then((user)=>{
            for (let i = 0; i < user.length; i++) {
                let Uid = makeId()
                connection.query(WritesqlStatement,[Uid,user[i].id],(err,result)=>{
                    if (err) throw err
                 
                 })
                
            }
     }
    
          )
          res.send("Corner shop Updated successfully")
        }
exports.update_resident_id=(req,res)=>{
    let WritesqlStatement=`update tenant set unique_id=? where tenId=? `
    const ReadsqlStatement = "select * from tenant";
   let ReadSql=  connection.query(ReadsqlStatement)
      let query=()=>{
      return new Promise((resolve,reject)=>{
      let err=false
      if(!err){
      resolve(ReadSql)
 
         }
      else {reject()}
               })
      }
      async function updateQuery(){
      const user=await query()
      return user }
      updateQuery().then((user)=>{
        for (let i = 0; i < user.length; i++) {
            let Uid = makeId_resident()
            connection.query(WritesqlStatement,[Uid,user[i].tenId],(err,result)=>{
                if (err) throw err
             
             })
            
        }
       
     
      })
      res.send("Residence Updated Successfully ")
}
 
exports.createQrcode=(req,res)=>{
   const ReadsqlStatement = `select * from domestic_staff`
   let ReadSql=  connection.query(ReadsqlStatement)
      let query=()=>{
      return new Promise((resolve,reject)=>{
      let err=false
      if(!err){
      resolve(ReadSql)
 
         }
      else {reject()}
               })
      }
      async function updateQuery(){
      const user=await query()
      return user }
      updateQuery().then((user)=>{
         let QrArray=[]
         let QrObj = {}
         for (let i = 0; i < user.length; i++) {
         
            url=`https://ppema.org/verify/resident/qrcode/${user[i].DomId}`
            let code=qr.toFile(`QRCODE/${user[i].fullname}${user[i].DomId}.png`,url,(err)=>{
               
            })
           
          
            
         }
         res.send("QR Code complete");
         
        })}
        
exports.checkUniqueId=(req,res)=>{
   if(!req.body.uniqueId){
      res.status(500).send("Invalid Ref Number")
         }
         else{
            let uniqueId=req.body.uniqueId+'%'
            const ReadsqlStatement = `select * from domestic_staff where Uuid like ?`;
            connection.query(ReadsqlStatement,uniqueId,(err,result)=>{
             if (err) {
                  res.status(500).send("Error occured")}
               else   if(result.length === 0){
                     res.status(500).send("Details not found")
                  }
                  else{res.status(201).send(result)}
            
            })
         }
}

   
