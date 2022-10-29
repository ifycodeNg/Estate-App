//service worker
self.addEventListener('install',(evt)=>{
    console.log("service worker installed")
})
//activate
self.addEventListener("activate",evt=>{
    console.log("service worker activated")
})
self.addEventListener('fetch',(evt)=>{
    console.log("fetch event",evt)
})